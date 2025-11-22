import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/Profesionales.css";

export default function Profesionales() {
  const navigate = useNavigate();

  // Estados principales
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Servicios
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  // Empresa del usuario
  const [companyId, setCompanyId] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Alertas
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 4000);
  };
  
  const authUser = JSON.parse(localStorage.getItem("auth_user"));
  const userId = authUser?.id;

  // Estado del formulario
  const [newProfessional, setNewProfessional] = useState({
    name: "",
    email: "",
    phone: "",
    services: [],
    sede_id: authUser.mainBranch?.id,
    imgProfile: null,
  });

  // =============================
  // 🟦 CARGAR EMPRESA Y SERVICIOS
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const negociosResp = await fetch(
          "http://localhost:3000/api/public/getCompanys"
        );
        const negociosData = await negociosResp.json();

        const company = negociosData?.data?.negocios?.find(
          (c) => c.user_id === userId
        );

        const companyIdFound = company?.company_id || company?.id;
        setCompanyId(companyIdFound);

        // cargar servicios
        const serviciosResp = await fetch(
          `http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`
        );
        const serviciosData = await serviciosResp.json();

        if (serviciosData.success && serviciosData.data?.servicios) {
          const serviciosConNombre = serviciosData.data.servicios.map((s) => ({
            ...s,
            displayName:
              s.title || s.service_name || s.name || "Servicio sin nombre",
          }));

          setServicios(serviciosConNombre);

          const cats = [
            "Todas",
            ...new Set(
              serviciosConNombre.map((s) => s.category_name || "Sin categoría")
            ),
          ];
          setCategorias(cats);
        } else {
          setServicios([]);
        }
      } catch (err) {
        console.error(err);
        showAlert("Error cargando datos", "error");
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  // =============================
  // 🟦 CARGAR PROFESIONALES
  // =============================
  useEffect(() => {
    if (!companyId) return;
    fetchProfessionals();
  }, [companyId]);

  const fetchProfessionals = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/public/listProfessionals?id_company=${companyId}`
      );
      const data = await res.json();

      const list = Array.isArray(data.data?.profesionales)
        ? data.data.profesionales
        : [];

      setProfessionals(
        list.map((p) => ({
          id: p.professional_id || p.id || p.user_id,
          name: p.user_name || "Sin nombre",
          email: p.user_email || "",
          phone: p.user_phone || "",
          specialty: p.branch_description || "",
          photo: p.user_img || "/default-avatar.png",
          services: p.services || [],
        }))
      );
    } catch (err) {
      console.error(err);
      showAlert("Error cargando profesionales", "error");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 🟦 FUNCIONES DE FORMULARIO
  // =============================
  const resetForm = () => {
    setNewProfessional({
      name: "",
      email: "",
      phone: "",
      services: [],
      sede_id: 5,
      imgProfile: null,
    });

    setEditing(null);
    setShowServicesDropdown(false);
  };

  const toggleService = (id) => {
    setNewProfessional((prev) => {
      const s = prev.services.includes(id)
        ? prev.services.filter((x) => x !== id)
        : [...prev.services, id];

      return { ...prev, services: s };
    });
  };

  const removeService = (id) => {
    setNewProfessional((p) => ({
      ...p,
      services: p.services.filter((x) => x !== id),
    }));
  };

  const getServiceName = (serviceId) => {
    const s = servicios.find(
      (x) => x.service_id == serviceId || x.id == serviceId
    );
    return s?.displayName || "Servicio";
  };

  // =============================
  // 🟦 CREAR PROFESIONAL
  // =============================
  const handleCreateProfessional = async () => {
    if (!newProfessional.name || !newProfessional.email) {
      showAlert("Completa nombre y email", "warning");
      return;
    }

    if (newProfessional.services.length === 0) {
      showAlert("Debes seleccionar un servicio", "warning");
      return;
    }

    try {
      const body = {
        ...newProfessional,
        company_id: companyId,
      };

      const res = await fetch(
        "http://localhost:3000/api/private/signup-professional",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (data.success) {
        showAlert("Profesional creado", "success");
        resetForm();
        setView("list");
        fetchProfessionals();
      } else {
        showAlert(data.message || "Error creando profesional", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error de red", "error");
    }
  };

  // =============================
  // 🟦 ACTUALIZAR PROFESIONAL
  // =============================
  const handleUpdateProfessional = async () => {
    if (!editing?.id) {
      showAlert("No se encontró el ID del profesional", "error");
      return;
    }

    if (newProfessional.services.length === 0) {
      showAlert("Selecciona al menos un servicio", "warning");
      return;
    }

    try {
      // 1️⃣ ACTUALIZAR INFO DEL PROFESIONAL
      const updateInfoRes = await fetch(
        "http://localhost:3000/api/private/editInformationProfessional",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: editing.id,
            name: newProfessional.name,
            email: newProfessional.email,
            phone: newProfessional.phone,
          }),
        }
      );

      const updateInfo = await updateInfoRes.json();

      if (!updateInfo.success) {
        showAlert(updateInfo.message || "Error actualizando la información.", "error");
        return;
      }

      // 2️⃣ ELIMINAR SERVICIOS ANTERIORES
      if (Array.isArray(editing.services)) {
        for (const oldService of editing.services) {
          await fetch("http://localhost:3000/api/private/removeProfessionalService", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serviceId: oldService.id ?? oldService.serviceId,
              userId: editing.id,
            }),
          }).catch(() => {});
        }
      }

      // 3️⃣ AGREGAR NUEVOS SERVICIOS
      for (const serviceId of newProfessional.services) {
        const addRes = await fetch(
          "http://localhost:3000/api/private/addProfessionalService",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serviceId,
              userId: editing.id,
            }),
          }
        );

        const addResult = await addRes.json();

        if (!addResult.success) {
          console.warn(`⚠️ Error agregando servicio ${serviceId}`);
        }
      }

      // 4️⃣ FINALIZAR
      showAlert("Profesional actualizado correctamente", "success");
      resetForm();
      setView("list");
      fetchProfessionals();

    } catch (error) {
      console.error(error);
      showAlert("Error inesperado al actualizar profesional", "error");
    }
  };

  // =============================
  // 🟦 ELIMINAR PROFESIONAL
  // =============================
  const handleDeleteProfessional = async (id) => {
    const prof = professionals.find((p) => p.id === id);
    if (!prof) return;

    if (!window.confirm(`Eliminar a ${prof.name}?`)) return;

    try {
      const res = await fetch(
        "http://localhost:3000/api/private/deleteProfessional",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ professionalId: prof.id, userId }),
        }
      );

      const data = await res.json();

      if (data.success) {
        showAlert("Profesional eliminado", "success");
        fetchProfessionals();
        setShowSheet(false);
        resetForm();
      } else {
        showAlert(data.message || "No se pudo eliminar", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error de red", "error");
    }
  };

  // =============================
  // 🟦 FOTO
  // =============================
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setNewProfessional({
        ...newProfessional,
        imgProfile: {
          nombre: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          preview: reader.result,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const getPhotoUrl = () => {
    if (newProfessional.imgProfile?.preview)
      return newProfessional.imgProfile.preview;
    if (editing?.photo) return editing.photo;
    return null;
  };

  // =============================
  // 🟦 UI
  // =============================
  if (loading || cargando) return <div className="loading">Cargando...</div>;

  return (
    <div className="prof-container">
      {/* Volver */}
      <button className="back-button" onClick={() => navigate("/settings")}>
        <ChevronLeft size={20} />
        Volver
      </button>

      {/* Alertas */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert({ show: false })}>×</button>
        </div>
      )}

      {/* ===================
          LISTA
      =================== */}
      {view === "list" && (
        <>
          <h2>Equipo</h2>

          {professionals.length === 0 ? (
            <div className="no-professionals">No hay profesionales</div>
          ) : (
            <div className="prof-list">
              {professionals.map((p) => (
                <div
                  key={p.id}
                  className="prof-card"
                  onClick={() => {
                    setEditing(p);
                    setShowSheet(true);
                  }}
                >
                  <img src={p.photo} className="prof-card-img" />
                  <div>
                    <h4>{p.name}</h4>
                    <p>{p.specialty}</p>
                    {p.services?.length > 0 && (
                      <small>{p.services.length} servicio(s)</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="add-btn" onClick={() => setView("form")}>
            Añadir profesional <Plus size={18} />
          </button>
        </>
      )}

      {/* ===================
          FORMULARIO
      =================== */}
      {view === "form" && (
        <div className="prof-form">
          <button className="back-button" onClick={() => setView("list")}>
            <ChevronLeft size={20} />
            Volver
          </button>

          <h2>{editing ? "Editar profesional" : "Añadir colaborador"}</h2>

          {/* Foto */}
          <div className="photo-upload-section">
            <div className="photo-preview-container">
              {getPhotoUrl() ? (
                <img src={getPhotoUrl()} className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <Camera size={32} />
                  <span>Sin foto</span>
                </div>
              )}
            </div>

            <label htmlFor="photoInput" className="photo-upload-btn">
              <Camera size={16} />
              {getPhotoUrl() ? "Cambiar foto" : "Subir foto"}
            </label>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: "none" }}
            />
          </div>

          {/* Inputs */}
          <input
            type="text"
            placeholder="Nombre *"
            value={newProfessional.name}
            onChange={(e) =>
              setNewProfessional({ ...newProfessional, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email *"
            value={newProfessional.email}
            onChange={(e) =>
              setNewProfessional({ ...newProfessional, email: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={newProfessional.phone}
            onChange={(e) =>
              setNewProfessional({ ...newProfessional, phone: e.target.value })
            }
          />

          {/* Servicios */}
          <div className="services-section">
            <label>Servicios que ofrece *</label>

            <div className="selected-services">
              {newProfessional.services.map((serviceId) => (
                <div key={serviceId} className="service-tag">
                  <span>{getServiceName(serviceId)}</span>
                  <button
                    type="button"
                    onClick={() => removeService(serviceId)}
                    className="remove-service"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="services-dropdown-container">
              <button
                type="button"
                className="services-dropdown-toggle"
                onClick={() =>
                  setShowServicesDropdown(!showServicesDropdown)
                }
              >
                {newProfessional.services.length > 0
                  ? `${newProfessional.services.length} servicio(s)`
                  : "Seleccionar servicios"}
                <ChevronLeft
                  size={16}
                  className={
                    showServicesDropdown ? "dropdown-open" : "dropdown-closed"
                  }
                />
              </button>

              {showServicesDropdown && (
                <div className="services-dropdown">
                  {servicios.map((service) => (
                    <label key={service.service_id} className="service-option">
                      <input
                        type="checkbox"
                        checked={newProfessional.services.includes(
                          service.service_id
                        )}
                        onChange={() => toggleService(service.service_id)}
                      />
                      <span>{service.displayName}</span>

                      {service.category_name && (
                        <span className="service-category">
                          {service.category_name}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Guardar */}
          <button
            onClick={
              editing ? handleUpdateProfessional : handleCreateProfessional
            }
            className="save-button"
          >
            {editing ? "Actualizar profesional" : "Registrar profesional"}
          </button>
        </div>
      )}

      {/* ===================
          SHEET
      =================== */}
      {showSheet && editing && (
        <>
          <div
            className="overlay"
            onClick={() => setShowSheet(false)}
          ></div>

          <div className="bottom-sheet">
            <button
              className="edit"
              onClick={() => {
                setNewProfessional({
                  name: editing.name,
                  email: editing.email,
                  phone: editing.phone,
                  services: editing.services.map(
                    (s) => s.id || s.service_id || s
                  ),
                });
                setShowSheet(false);
                setView("form");
              }}
            >
              <Edit2 size={16} /> Editar colaborador
            </button>

            <button
              className="delete"
              onClick={() => handleDeleteProfessional(editing.id)}
            >
              <Trash2 size={16} /> Eliminar colaborador
            </button>
          </div>
        </>
      )}
    </div>
  );
}
