import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext'
import "./css/AddService.css";

export default function NuevoServicioForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duration, setDuration] = useState("");  // ← NUEVO

  const [categorias, setCategorias] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  const [professionals, setProfessionals] = useState([]);
  const [personalSeleccionado, setPersonalSeleccionado] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

  const [galeria, setGaleria] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [guardando, setGuardando] = useState(false);

  const [alerta, setAlerta] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type = "info") => {
    setAlerta({ show: true, message, type });
    setTimeout(() => setAlerta({ show: false, message: "", type: "" }), 4000);
  };

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/public/showCategorias");
        const data = await res.json();
        if (data.success && data.data?.categorias) {
          setCategorias(data.data.categorias);
        }
      } catch (e) {
        console.error("Error cargando categorías", e);
      }
    };

    loadCategorias();
  }, []);

  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        if (!authUser) return;

        const userId = authUser.id;
        const resp = await fetch('http://localhost:3000/api/public/getCompanys');
        const data = await resp.json();

        const company = data?.data?.negocios?.find(c => c.user_id === userId);
        if (company) {
          setCompanyId(company.company_id || company.id);
        } else {
          showAlert("No se encontró empresa asociada al usuario", "error");
        }
      } catch (error) {
        console.error('Error obteniendo la empresa:', error)
        showAlert("Error al obtener la empresa", "error");
      }
    }

    obtenerEmpresa()
  }, []);

  useEffect(() => {
    if (companyId) fetchProfessionals();
  }, [companyId]);

  const fetchProfessionals = async () => {
    setLoadingProfessionals(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/public/listProfessionals?id_company=${companyId}`
      );
      const data = await res.json();

      const lista = Array.isArray(data.data?.profesionales)
        ? data.data.profesionales
        : [];

      const parsed = lista.map((p) => ({
        id: p.professional_id || p.id || p.user_id,
        name: p.user_name || "Sin nombre",
        specialty: p.branch_description || "General",
      }));

      setProfessionals(parsed);
    } catch (err) {
      console.error("Error al cargar profesionales:", err);
      showAlert("Error al cargar personal", "error");
    } finally {
      setLoadingProfessionals(false);
    }
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);

    setGaleria((prev) => [...prev, ...files]);

    const nuevasPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...nuevasPreviews]);
  };

  const removeImage = (index) => {
    const newPreviews = [...previews];
    const newFiles = [...galeria];

    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);

    setPreviews(newPreviews);
    setGaleria(newFiles);
  };

  const togglePersonal = (id) => {
    setPersonalSeleccionado((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          description: "Imagen enviada desde el cliente",
          data: base64
        });
      };

      reader.onerror = (err) => reject(err);
    });

  const handleGuardar = async () => {
    if (!companyId) {
      showAlert("Debe existir empresa asociada.", "error");
      return;
    }

    setGuardando(true);

    const token = localStorage.getItem("auth_token");

    const galeryBase64 = await Promise.all(
      galeria.map((file) => fileToBase64(file))
    );

    const payload = {
      title: nombre,
      description: descripcion,
      companyid: Number(companyId),
      servicecategoryid: Number(categoria),
      price: Number(precio),
      duration: Number(duration),  // ← NUEVO
      professionals: personalSeleccionado,
      galery: galeryBase64
    };

    console.log("📤 Enviando payload:", payload);

    try {
      const res = await fetch("http://localhost:3000/api/public/createServicio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("Respuesta:", data);

      if (data.success) {
        showAlert("Servicio creado correctamente 🎉", "success");
        setTimeout(() => navigate("/servicios"), 800);
      } else {
        showAlert("Error al crear servicio: " + data.message, "error");
      }
    } catch (err) {
      console.error("Error:", err);
      showAlert("No se pudo conectar al servidor", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="form-container">
      
      {alerta.show && (
        <div className={`servicios-alert alert-${alerta.type}`}>
          <span>{alerta.message}</span>
        </div>
      )}

      <h2>Nuevo servicio</h2>

      <div className="steps-indicator">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`step-dot ${paso === i ? "active" : ""}`} />
        ))}
      </div>

      {paso === 1 && (
        <>
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Selecciona una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Descripción del servicio"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </>
      )}

      {paso === 2 && (
        <div>
          <input
            type="number"
            placeholder="Precio del servicio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />

          {/* NUEVO INPUT */}
          <input
            type="number"
            placeholder="Duración del servicio (minutos)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          <div className="gallery-containerAS">
            <p className="gallery-title">Galería de imágenes</p>

            <div className="gallery-grid">
              {previews.map((src, i) => (
                <div className="gallery-item" key={i}>
                  <img src={src} alt="preview" />
                  <button
                    className="gallery-remove-btn"
                    onClick={() => removeImage(i)}
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className="gallery-upload-box">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="personal-container">
          <label>Selecciona el personal disponible:</label>

          {loadingProfessionals && <p>Cargando personal…</p>}

          {professionals.map((p) => (
            <div key={p.id} className="personal-item">
              <input
                type="checkbox"
                checked={personalSeleccionado.includes(p.id)}
                onChange={() => togglePersonal(p.id)}
              />
              <span>
                {p.name} — <b>{p.specialty}</b>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="button-group">
        <button
          onClick={() => (paso < 3 ? setPaso(paso + 1) : handleGuardar())}
          className="btn-primary"
        >
          {paso < 3 ? "Continuar" : guardando ? "Guardando..." : "Guardar servicio"}
        </button>

        <button
          className="btn-secondary"
          onClick={() => navigate("/servicios")}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
