import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/Profesionales.css";

export default function Profesionales() {
  const navigate = useNavigate();

  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  // Estado para alertas
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Mostrar alerta
  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const [newProfessional, setNewProfessional] = useState({
    name: "",
    email: "",
    phone: "",
    services: [],
    sede_id: 5,
    imgProfile: null,
  });

  const authUser = JSON.parse(localStorage.getItem("auth_user"));
  const userId = authUser?.id;

  // === CARGAR EMPRESA Y SERVICIOS ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const negociosResp = await fetch("http://localhost:3000/api/public/getCompanys");
        const negociosData = await negociosResp.json();
        const company = negociosData?.data?.negocios?.find((c) => c.user_id === userId);
        const companyIdFound = company?.company_id || company?.id;
        setCompanyId(companyIdFound);

        // Cargar servicios
        const serviciosResp = await fetch(
          `http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`
        );
        const serviciosData = await serviciosResp.json();
        
        console.log("📦 Servicios recibidos:", serviciosData);
        
        if (serviciosData.success && serviciosData.data?.servicios) {
          // Usamos title como nombre principal del servicio
          const serviciosConNombre = serviciosData.data.servicios.map(service => ({
            ...service,
            // Aseguramos que siempre tengamos un nombre válido
            displayName: service.title || service.service_name || service.name || "Servicio sin nombre"
          }));
          
          setServicios(serviciosConNombre);
          
          // Las categorías se mantienen separadas
          const cats = [
            "Todas",
            ...new Set(serviciosConNombre.map((s) => s.category_name || "Sin categoría")),
          ];
          setCategorias(cats);
          
          console.log("✅ Servicios cargados:", serviciosConNombre);
          console.log("✅ Categorías:", cats);
        } else {
          console.warn("⚠️ No se encontraron servicios");
          setServicios([]);
        }
      } catch (err) {
        console.error("Error al conectar con backend:", err);
        showAlert("Error de conexión con el servidor", "error");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // === CARGAR PROFESIONALES ===
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

      const profs = Array.isArray(data.data?.profesionales) ? data.data.profesionales : [];
      setProfessionals(
        profs.map((p) => ({
          id: p.professional_id || p.id || p.user_id,
          name: p.user_name || "Sin nombre",
          email: p.user_email || "",
          phone: p.user_phone || "",
          specialty: p.branch_description || "Sin especialidad",
          photo: p.user_img || "/default-avatar.png",
          services: p.services || [],
        }))
      );
    } catch (err) {
      console.error("Error al cargar profesionales:", err);
      showAlert("Error cargando profesionales", "error");
    } finally {
      setLoading(false);
    }
  };

  // === FUNCIÓN PARA CREAR NUEVO PROFESIONAL ===
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

  // === CORREGIDO: MANEJO DE SERVICIOS ===
  const toggleService = (serviceId) => {
    setNewProfessional(prev => {
      const currentServices = prev.services || [];
      const isSelected = currentServices.some(id => 
        id === serviceId || (typeof id === 'object' && id.id === serviceId)
      );
      
      if (isSelected) {
        // Remover servicio - comparando de diferentes maneras
        return {
          ...prev,
          services: currentServices.filter(id => {
            if (typeof id === 'object') {
              return id.id !== serviceId;
            }
            return id !== serviceId;
          })
        };
      } else {
        // Agregar servicio - siempre guardamos el ID simple
        return {
          ...prev,
          services: [...currentServices, serviceId]
        };
      }
    });
  };

  const removeService = (serviceId) => {
    setNewProfessional(prev => ({
      ...prev,
      services: prev.services.filter(id => {
        if (typeof id === 'object') {
          return id.id !== serviceId;
        }
        return id !== serviceId;
      })
    }));
  };

  // CORREGIDO: Manejar diferentes estructuras de servicios
  const getServiceName = (service) => {
    console.log("🔍 Obteniendo nombre para:", service);
    
    // Caso 1: Si es un objeto (cuando viene del profesional editado)
    if (typeof service === 'object') {
      const name = service.title || service.name || service.service_name;
      if (name) return name;
    }
    
    // Caso 2: Si es un ID numérico o string, buscar en los servicios disponibles
    if (typeof service === 'number' || typeof service === 'string') {
      const serviceFromList = servicios.find(s => 
        s.service_id == service || s.id == service
      );
      if (serviceFromList) {
        return serviceFromList.title || serviceFromList.name || serviceFromList.service_name || "Servicio sin nombre";
      }
    }
    
    // Caso 3: Si no se puede determinar
    return "Servicio no encontrado";
  };

  // CORREGIDO: Verificar si un servicio está seleccionado
  const isServiceSelected = (serviceId) => {
    return newProfessional.services.some(service => {
      if (typeof service === 'object') {
        return service.id === serviceId || service.service_id === serviceId;
      }
      return service === serviceId;
    });
  };

  // CORREGIDO: Preparar servicios para el formulario
  const prepareServicesForForm = (servicesArray) => {
    if (!servicesArray || !Array.isArray(servicesArray)) return [];
    
    return servicesArray.map(service => {
      if (typeof service === 'object') {
        return service.id || service.service_id;
      }
      return service;
    });
  };

  // === CREAR PROFESIONAL ===
  const handleCreateProfessional = async () => {
    if (!newProfessional.name || !newProfessional.email) {
      showAlert("Completa todos los campos obligatorios", "warning");
      return;
    }

    if (newProfessional.services.length === 0) {
      showAlert("Selecciona al menos un servicio", "warning");
      return;
    }

    try {
      const body = { 
        ...newProfessional, 
        company_id: companyId,
        services: newProfessional.services
      };
      
      console.log("🟨 Creando profesional:", JSON.stringify(body, null, 2));
      
      const res = await fetch("http://localhost:3000/api/private/signup-professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        showAlert("Profesional creado correctamente", "success");
        setView("list");
        resetForm();
        fetchProfessionals();
      } else {
        showAlert(data.message || "Error al crear profesional", "error");
      }
    } catch (err) {
      console.error("Error al crear profesional:", err);
      showAlert("Error de red al crear profesional", "error");
    }
  };

  // === ACTUALIZAR PROFESIONAL ===
  const handleUpdateProfessional = async () => {
    if (!editing?.id) {
      showAlert("No se encontró el ID del profesional a editar", "error");
      return;
    }

    if (newProfessional.services.length === 0) {
      showAlert("Selecciona al menos un servicio", "warning");
      return;
    }

    try {
      const body = {
        userId: editing.id,
        name: newProfessional.name,
        email: newProfessional.email,
        phone: newProfessional.phone,
        services: newProfessional.services
      };
      
      console.log("🟨 Actualizando profesional:", JSON.stringify(body, null, 2));
      
      const res = await fetch("http://localhost:3000/api/private/editInformationProfessional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("Respuesta actualización:", data);
      
      if (data.success) {
        showAlert("Profesional actualizado correctamente", "success");
        setEditing(null);
        setView("list");
        resetForm();
        fetchProfessionals();
      } else {
        showAlert(`❌ Error: ${data.message || "No se pudo actualizar"}`, "error");
      }
    } catch (error) {
      console.error("Error actualizando profesional:", error);
      showAlert("Error de red al actualizar profesional", "error");
    }
  };

  // === ELIMINAR PROFESIONAL ===
  const handleDeleteProfessional = async (id) => {
    const prof = professionals.find((p) => p.id === id);
    if (!prof) {
      showAlert("No se encontró el profesional", "error");
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar a ${prof.name}?`)) return;

    try {
      const res = await fetch("http://localhost:3000/api/private/deleteProfessional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId: prof.id, userId }),
      });

      const data = await res.json();

      if (data.success) {
        showAlert("Profesional eliminado correctamente", "success");
        fetchProfessionals();
        setShowSheet(false);
        setEditing(null);
        resetForm();
      } else {
        showAlert(`❌ Error: ${data.message || "No se pudo eliminar"}`, "error");
      }
    } catch (err) {
      console.error("Error eliminando profesional:", err);
      showAlert("Error de red al eliminar profesional", "error");
    }
  };

  // === MEJORADO: Subir imagen con mejor previsualización ===
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showAlert('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('La imagen es demasiado grande. Máximo 5MB permitido.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(",")[1];
      setNewProfessional({
        ...newProfessional,
        imgProfile: {
          nombre: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          preview: reader.result, // Guardar también la preview completa
        },
      });
      showAlert('Imagen cargada correctamente', 'success');
    };
    reader.readAsDataURL(file);
  };

  // === MANEJADORES DE NAVEGACIÓN ===
  const handleAddNewProfessional = () => {
    resetForm();
    setView("form");
  };

  const handleEditProfessional = (professional) => {
    console.log("🟨 Editando profesional:", professional);
    
    // CORREGIDO: Preparar servicios correctamente
    const preparedServices = prepareServicesForForm(professional.services);
    
    setEditing(professional);
    setNewProfessional({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      services: preparedServices,
      sede_id: 5,
      imgProfile: null,
    });
    setView("form");
    setShowSheet(false);
  };

  const handleBackToList = () => {
    setView("list");
    resetForm();
  };

  const handleCardClick = (professional) => {
    console.log("🟨 Clic en tarjeta:", professional);
    setEditing(professional);
    setNewProfessional({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      services: prepareServicesForForm(professional.services),
      sede_id: 5,
    });
    setShowSheet(true);
  };

  // Función para obtener la URL de la imagen (foto existente o preview)
  const getPhotoUrl = () => {
    if (newProfessional.imgProfile?.preview) {
      return newProfessional.imgProfile.preview;
    }
    if (editing?.photo) {
      return editing.photo;
    }
    return null;
  };

  // === UI ===
  if (loading || cargando) return <div className="loading">Cargando...</div>;

  return (
    <div className="prof-container">
      {/* Botón Volver con flecha */}
      <button className="back-button" onClick={() => navigate('/settings')}>
        <ChevronLeft size={20} />
        Volver
      </button>

      {/* Sistema de Alertas */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          <span className="alert-message">{alert.message}</span>
          <button 
            className="alert-close" 
            onClick={() => setAlert({ show: false, message: '', type: '' })}
          >
            ×
          </button>
        </div>
      )}

      {view === "list" && (
        <>
          <h2>Equipo</h2>
          
          {professionals.length === 0 ? (
            <div className="no-professionals">
              <p>No hay profesionales registrados</p>
            </div>
          ) : (
            <div className="prof-list">
              {professionals.map((p) => (
                <div
                  key={p.id}
                  className="prof-card"
                  onClick={() => handleCardClick(p)}
                >
                  <img src={p.photo} alt={p.name} className="prof-card-img" />
                  <div>
                    <h4>{p.name}</h4>
                    <p>{p.specialty}</p>
                    {p.services && p.services.length > 0 && (
                      <div className="prof-services-preview">
                        <span>{p.services.length} servicio(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="add-btn" onClick={handleAddNewProfessional}>
            Añadir profesional <Plus size={18} />
          </button>
        </>
      )}

      {/* === FORMULARIO === */}
      {view === "form" && (
        <div className="prof-form">
          <button className="back-button" onClick={handleBackToList}>
            <ChevronLeft size={20} />
            Volver
          </button>
          
          <h2>{editing ? "Editar profesional" : "Añadir colaborador"}</h2>

          {/* MEJORADO: Sección de foto con mejor diseño */}
          <div className="photo-upload-section">
            <div className="photo-preview-container">
              {getPhotoUrl() ? (
                <img src={getPhotoUrl()} alt="Preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <Camera size={32} />
                  <span>Sin foto</span>
                </div>
              )}
            </div>
            
            <label htmlFor="photoInput" className="photo-upload-btn">
              <Camera size={16} />
              {getPhotoUrl() ? 'Cambiar foto' : 'Subir foto'}
            </label>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: 'none' }}
            />
          </div>

          <input
            type="text"
            placeholder="Nombre *"
            value={newProfessional.name}
            onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email *"
            value={newProfessional.email}
            onChange={(e) => setNewProfessional({ ...newProfessional, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={newProfessional.phone}
            onChange={(e) => setNewProfessional({ ...newProfessional, phone: e.target.value })}
          />

          {/* Selector de Servicios */}
          <div className="services-section">
            <label>Servicios que ofrece *</label>
            
            {/* Servicios seleccionados */}
            <div className="selected-services">
              {newProfessional.services.map((service, index) => (
                <div key={typeof service === 'object' ? service.id || index : service} className="service-tag">
                  <span>{getServiceName(service)}</span>
                  <button 
                    type="button" 
                    onClick={() => removeService(typeof service === 'object' ? service.id : service)}
                    className="remove-service"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Dropdown de servicios */}
            <div className="services-dropdown-container">
              <button 
                type="button"
                className="services-dropdown-toggle"
                onClick={() => setShowServicesDropdown(!showServicesDropdown)}
              >
                {newProfessional.services.length > 0 
                  ? `${newProfessional.services.length} servicio(s) seleccionado(s)` 
                  : "Seleccionar servicios"}
                <ChevronLeft 
                  size={16} 
                  className={showServicesDropdown ? "dropdown-open" : "dropdown-closed"} 
                />
              </button>

              {showServicesDropdown && (
              <div className="services-dropdown">
                {servicios.map(service => (
                  <label key={service.service_id} className="service-option">
                    <input
                      type="checkbox"
                      checked={isServiceSelected(service.service_id)}
                      onChange={() => toggleService(service.service_id)}
                    />
                    <span>{service.title}</span> {/* Cambiado de service_name a title */}
                    {service.category_name && (
                      <span className="service-category">{service.category_name}</span>
                    )}
                  </label>
                ))}
                
                {servicios.length === 0 && (
                  <div className="no-services">
                    No hay servicios disponibles
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          <button
            onClick={editing ? handleUpdateProfessional : handleCreateProfessional}
            className="save-button"
          >
            {editing ? "Actualizar profesional" : "Registrar profesional"}
          </button>
        </div>
      )}

      {/* === SHEET === */}
      {showSheet && editing && (
        <>
          <div className="overlay" onClick={() => setShowSheet(false)}></div>
          <div className="bottom-sheet">
            <button
              className="edit"
              onClick={() => handleEditProfessional(editing)}
            >
              <Edit2 size={16} /> Editar colaborador
            </button>
            <button className="delete" onClick={() => handleDeleteProfessional(editing.id)}>
              <Trash2 size={16} /> Eliminar colaborador
            </button>
          </div>
        </>
      )}
    </div>
  );
}