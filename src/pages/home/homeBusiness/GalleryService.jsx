import React, { useState, useEffect } from "react";
import { ChevronLeft, Upload, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./css/GalleryService.css";
import Swal from "sweetalert2";
import { API_URL } from "../../../constants";

export default function GalleryService() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const API_BASE = API_URL + "/api/public";

  // Servicio recibido por parámetro
  const servicioInicial = location.state?.servicio;
  const company_id = location.state?.companyId;

  // Estados internos
  const [servicioData, setServicioData] = useState(servicioInicial);
  const [images, setImages] = useState(servicioInicial?.images || []);

  const showAlert = (message, type = "info") => {
    Swal.fire({
      title: message,
      icon: type,
      timer: 2000,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });
  };

  // 🔹 Subir nuevas imágenes
  const handleUpload = async () => {   
    if (selectedFiles.length === 0) {
      showAlert("Selecciona al menos una imagen", "warning");
      return;
    }
    
    if (isUploading) {
      showAlert("Espera a que termine la subida anterior", "warning");
      return;
    }

    setIsUploading(true);
    showAlert("⏳ Subiendo imágenes...", "info");

    try {
      const convertedFiles = await Promise.all(
        selectedFiles.map((f) => fileToBase64(f.file, true))
      );

      const newItems = convertedFiles.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
        data: f.data,
        description: "Imagen agregada por el usuario",
        preview: f.preview,
      }));

      const updatedGallery = [...images, ...newItems];
      //setImages(updatedGallery);

      await handleGuardar(updatedGallery);
    } catch (err) {
      console.error("❌ Error al convertir o subir imágenes:", err);
      showAlert("Error al procesar las imágenes", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // 🔹 Guardar galería en backend
  const handleGuardar = async (updatedGallery) => {
    try {
      const id_servicio = servicioInicial.service_id;

      const body = {
        id_servicio: id_servicio,
        galery: updatedGallery.map((img) => ({
          name: img.name,
          type: img.type,
          size: img.size,
          description: img.description || "Imagen agregada por el usuario",
          data: img.data,
        })),
      };

      console.log("🛰 Enviando datos a backend:", body);

      const resp = await fetch(`${API_BASE}/saveImagesService`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();
      console.log("📩 Respuesta del servidor:", data);

      if (resp.ok && data.success && data.data) {
        console.log("✅ Galería actualizada correctamente.", data.data);
        setSelectedFiles([]);
        setImages(data.data.servicio.images);
        showAlert("✅ Galería actualizada correctamente", "success");
      } else {
        showAlert(`❌ Error al actualizar galería: ${data.message || "Error desconocido"}`, "error");
      }
    } catch (err) {
      console.error("❌ Error guardando galería:", err);
      showAlert("Error de conexión al guardar la galería", "error");
    }
  };

  //Convertir archivo a Base64
  const fileToBase64 = (file, renameKey = false) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1];
        resolve({
          [renameKey ? "name" : "nombre"]: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          preview: reader.result,
        });
      };
      reader.onerror = (error) => reject(error);
  });

  // 🔹 Seleccionar nuevas imágenes
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validar cantidad de archivos
    if (files.length > 10) {
      showAlert("Máximo 10 imágenes permitidas", "warning");
      return;
    }

    // Validar tipos de archivo
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      showAlert("Solo se permiten archivos de imagen", "error");
      return;
    }

    // Validar tamaño (max 5MB por archivo)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showAlert("Algunas imágenes son demasiado grandes. Máximo 5MB por imagen", "error");
      return;
    }

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles(previews);
    showAlert(`${files.length} imagen(es) seleccionada(s)`, "success");
  };

  // 🔹 Eliminar imagen
  const handleDelete = async (index) => {
    const imageToDelete = images[index];
    if (!imageToDelete) return;

    const result = await Swal.fire({
      title: "¿Eliminar esta imagen?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E25B7A",
      cancelButtonColor: "#9dadbbff",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const resp = await fetch(`${API_BASE}/deleteImageServicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_company: company_id,
          file_id: imageToDelete.file_id,
        }),
      });

      const response = await resp.json();

      if (resp.ok && response.success) {
        console.log("Backend respondió:", response);

        // La API retorna una lista de servicios actualizada
        if (response.data?.servicios) {
          const servicios = response.data.servicios.servicios;

          // Buscar el servicio actualizado
          const updated = servicios.find(
            (s) => s.service_id === servicioData.service_id
          );

          if (updated) {
            setServicioData(updated);
            setImages(updated.images); // 🔹 Refresca galería
          }
        }

        showAlert("Imagen eliminada correctamente", "success");
      } else {
        console.error("Error backend:", response);
        showAlert("No se pudo eliminar la imagen", "error");
      }
    } catch (err) {
      console.error("Error eliminando imagen:", err);
      showAlert("Error al eliminar la imagen", "error");
    }
  };

  const handleRemoveImage = (index) => {
    // Eliminamos la URL temporal para evitar fugas de memoria
    URL.revokeObjectURL(selectedFiles[index].preview);

    // Crear una copia del array
    const updatedFiles = [...selectedFiles];

    // Remover la imagen por índice
    updatedFiles.splice(index, 1);

    // Actualizar el estado
    setSelectedFiles(updatedFiles);
  };

  // Si no hay servicio, mensaje
  if (!servicioInicial) {
    return <p>No hay datos del servicio.</p>;
  }

  return (
    <div className="gallery-container">
      
      {/* Header */}
      <div className="gallery-header">
        <button className="back-btn" onClick={() => navigate("/servicios")}>
          <ChevronLeft size={24} />
        </button>
        <h2>Galería del Servicio</h2>
      </div>

      {/* Galería existente */}
      <div className="gallery-grid">
        {images.length > 0 ? (
          images.map((img, i) => (
            <div key={i} className="gallery-item">
              <img
                src={img.preview || img.uri}
                alt={`imagen-${i}`}
                className="gallery-img"
              />
              <button className="delete-btn" onClick={() => handleDelete(i)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className="no-images-service">Aún no hay imágenes en la galería</p>
        )}
      </div>
      <div className="upload-section">
        <h3>Agregar nuevas imágenes</h3>

        <label className="upload-label">
            <Upload size={20} />
            <span>Seleccionar imágenes</span>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
        </label>

        {selectedFiles.length > 0 && (
            <div className="preview-grid">
                {selectedFiles.map((f, i) => (
                    <div key={i} className="preview-container">
                        <button className="remove-btn-service" onClick={() => handleRemoveImage(i)}>×</button>
                        <img src={f.preview} alt="preview" className="preview-img" />
                    </div>
                ))}
            </div>
        )}

        <div className="upload-actions">
            <button className="upload-btn" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "⏳ Subiendo imágenes..." : "Subir a galería"}
            </button>
        </div>
      </div>
    </div>
  );
}