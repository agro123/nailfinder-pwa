import React, { useState, useEffect } from "react";
import { ChevronLeft, Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/Gallery.css";

export default function Gallery() {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [company, setCompany] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // 🆕 estado para controlar subida

  const API_BASE = "http://localhost:3000/api/public";

  // 🔹 Convertir archivo a Base64
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

  // 🔹 Obtener negocio y galería existente
  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem("auth_user"));
        if (!authUser) return console.error("⚠️ No hay usuario autenticado.");

        const resp = await fetch(`${API_BASE}/getCompanys`);
        const data = await resp.json();

        const companyFound = data?.data?.negocios?.find(
          (c) => c.user_id === authUser.id
        );

        if (companyFound) {
          setCompany(companyFound);

          if (companyFound.bannersgalery?.length > 0) {
            console.log("📸 Galería encontrada:", companyFound.bannersgalery);

            const normalizedGallery = companyFound.bannersgalery.map((img) => ({
              idBanner:
                img.idBanner ??
                img.idbanner ??
                img.id ??
                null,
              fileId: img.idFile ?? img.fileid ?? null,
              name: img.name ?? img.originfilename ?? img.nombre ?? "sin_nombre",
              uri: img.uri ?? img.url ?? img.name ?? "",
              description: img.descripcion ?? img.description ?? "",
              data: img.data ?? null,
            }));

            setGallery(normalizedGallery);
          } else {
            setGallery([]);
          }
        } else {
          console.warn("⚠️ No se encontró empresa para este usuario.");
        }
      } catch (err) {
        console.error("❌ Error obteniendo empresa:", err);
      }
    };

    obtenerEmpresa();
  }, []);

  // 🔹 Seleccionar nuevas imágenes
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles(previews);
  };

  // 🔹 Subir nuevas imágenes
  const handleUpload = async () => {
    if (!company) return alert("⚠️ No se ha cargado el negocio.");
    if (selectedFiles.length === 0)
      return alert("Selecciona al menos una imagen.");
    if (isUploading)
      return alert("⏳ Espera a que termine la subida anterior.");

    setIsUploading(true);

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

      const updatedGallery = [...gallery, ...newItems];
      setGallery(updatedGallery);
      setSelectedFiles([]);

      await handleGuardar(updatedGallery);
    } catch (err) {
      console.error("❌ Error al convertir o subir imágenes:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // 🔹 Eliminar imagen
  const handleDelete = async (index) => {
    const imageToDelete = gallery[index];
    if (!imageToDelete) return;
    if (!window.confirm("¿Eliminar esta imagen?")) return;

    // Si la imagen no tiene idBanner (aún no guardada en DB)
    if (!imageToDelete.idBanner) {
      console.warn("⚠️ Imagen sin idBanner (nueva), eliminando localmente:", imageToDelete);
      setGallery((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      console.log("🗑 Eliminando imagen (idBanner):", imageToDelete.idBanner);

      const resp = await fetch(`${API_BASE}/deleteBannerImage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_company: company?.company_id,
          id_banner: imageToDelete.idBanner,
        }),
      });

      const data = await resp.json();

      if (resp.ok && data.success) {
        console.log("✅ Backend respondió eliminación correcta:", data);

        if (data.data?.company) {
          setCompany(data.data.company);
          const updatedFromServer = (data.data.company.bannersgalery || [])
            .filter((img) => !img.deletedAt && !img.deletedat)
            .map((img) => ({
              idBanner: img.idBanner ?? img.id ?? null,
              fileId: img.idFile ?? img.fileid ?? null,
              name: img.name ?? img.originfilename ?? "",
              uri: img.uri ?? img.url ?? img.name ?? "",
              description: img.descripcion ?? img.description ?? "",
            }));
          setGallery(updatedFromServer);
        } else {
          setGallery((prev) => prev.filter((_, i) => i !== index));
        }
      } else {
        console.error("❌ Error al eliminar banner (backend):", data);
        alert("No se pudo eliminar la imagen en el servidor.");
      }
    } catch (err) {
      console.error("❌ Error eliminando imagen:", err);
      alert("Error al eliminar la imagen.");
    }
  };

  // 🔹 Guardar galería en backend
  const handleGuardar = async (updatedGallery) => {
    try {
      if (!company?.company_id && !company?.id_company)
        return alert("⚠️ No se ha identificado el negocio correctamente.");

      const idCompany = company.id_company || company.company_id;

      const body = {
        id_company: idCompany,
        name: company.name || company.companyname || "",
        email: company.email || "",
        password: company.password || "Temp123.",
        phone: company.phone || "",
        companyname: company.companyname || company.name || "",
        nit: company.nit || null,
        companytype: company.companytype || "Local",
        address: company.address || "",
        logo: company.logo
          ? {
              nombre: company.logo.nombre || company.logo.name || "logo.png",
              type: company.logo.type || "image/png",
              size: company.logo.size || 0,
              data: company.logo.data || "",
            }
          : null,
        bannerGalery: updatedGallery.map((img) => ({
          name: img.name,
          type: img.type,
          size: img.size,
          description: img.description || "Imagen agregada por el usuario",
          data: img.data,
        })),
      };

      console.log("🛰 Enviando datos a backend:", body);

      const resp = await fetch(`${API_BASE}/editCompany`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();
      console.log("📩 Respuesta del servidor:", data);

      if (resp.ok && data.success && data.data) {
        console.log("✅ Galería actualizada correctamente.");
        setCompany(data.data);

        if (data.data.bannersgalery) {
          const imagenesActivas = data.data.bannersgalery.filter(
            (img) => !img.deletedAt && !img.deletedat
          );
          setGallery(
            imagenesActivas.map((img) => ({
              ...img,
              uri: img.uri || img.name,
            }))
          );
        }
      } else {
        alert("❌ Error al actualizar galería: " + (data.message || "Desconocido"));
      }
    } catch (err) {
      console.error("❌ Error guardando galería:", err);
    }
  };

  // 🧩 Render
  return (
    <div className="gallery-container">
      {/* Header */}
      <div className="gallery-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2>Galería del negocio</h2>
      </div>

      {/* Galería existente */}
      <div className="gallery-grid">
        {gallery.length > 0 ? (
          gallery.map((img, i) => (
            <div key={i} className="gallery-item">
              <img src={img.preview || img.uri} alt={`imagen-${i}`} className="gallery-img" />
              <button className="delete-btn" onClick={() => handleDelete(i)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className="no-images">Aún no hay imágenes en la galería</p>
        )}
      </div>

      {/* Subir nuevas imágenes */}
      <div className="upload-section">
        <h3>Agregar nuevas imágenes</h3>
        <label className="upload-label">
          <Upload size={20} /> Seleccionar imágenes
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
        </label>

        {selectedFiles.length > 0 && (
          <div className="preview-grid">
            {selectedFiles.map((f, i) => (
              <img key={i} src={f.preview} alt="preview" className="preview-img" />
            ))}
          </div>
        )}

        <button className="upload-btn" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "⏳ Subiendo imágenes..." : "Subir a galería"}
        </button>
      </div>
    </div>
  );
}
