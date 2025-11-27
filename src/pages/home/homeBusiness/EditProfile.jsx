import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from "lucide-react";
import MapComponent, { MapPicker, MapStatic } from '../../../components/Map'
import './css/EditProfile.css'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados de empresa y formulario
  const [companyData, setCompanyData] = useState(null)
  const [formData, setFormData] = useState({
    companyname: '',
    description: '',
    companytype: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerFiles, setBannerFiles] = useState([])

  // Estados de horarios
  const [horarios, setHorarios] = useState([])
  const [newHorario, setNewHorario] = useState({ day: '', start: '', end: '' })

  // Estado para alertas
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  // -------------------------
  // 🔥 MAPA / GEOLOCALIZACIÓN
  // -------------------------
  const [pickedLocation, setPickedLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState("pending")

  // 🔥 NUEVO: Estado para el radio de trabajo
  const [workRadius, setWorkRadius] = useState(5) // Radio en kilómetros

  // Puntos de ejemplo cerca (puedes cambiarlos por negocios reales)
  const points = [
    {
      lat: 3.375,
      lng: -76.53,
      label: "Barber shop Capri 💈",
      iconColor: "#e25b7a",
    },
    {
      lat: 3.37,
      lng: -76.535,
      label: "Spa el Altar de Relax 💆‍♀️",
      iconColor: "#e25b7a",
    },
    {
      lat: 3.36,
      lng: -76.52,
      label: "Salon Beauty 💅",
      iconColor: "#e25b7a",
    },
  ];

  const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const { nearbyPoints } = useMemo(() => {
    if (!userLocation) return { nearbyPoints: points };
    const withDist = points.map((p) => ({
      ...p,
      distance: haversine(userLocation.lat, userLocation.lng, p.lat, p.lng),
    }));

    const sorted = withDist.sort((a, b) => a.distance - b.distance);
    const nearby = sorted.filter((p) => p.distance <= 5000);

    return { nearbyPoints: nearby.length ? nearby : sorted.slice(0, 5) };
  }, [points, userLocation]);

  // GEOLOCALIZACIÓN DEL NAVEGADOR
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Cuando el usuario hace click en el mapa, guardamos lat/lng en formData
  const handlePickChange = (ctx) => {
    setPickedLocation({ lat: ctx.lat, lng: ctx.lng });
    setFormData((prev) => ({
      ...prev,
      latitude: ctx.lat,
      longitude: ctx.lng,
    }));
  };

  const center = useMemo(() => {
    // Si ya tenemos datos del negocio con ubicación, usamos esa
    if (companyData?.latitude && companyData?.longitude) {
      return {
        lat: Number(companyData.latitude),
        lng: Number(companyData.longitude)
      };
    }
    // Si el usuario ha seleccionado una ubicación en el mapa
    if (pickedLocation) {
      return pickedLocation;
    }
    // Si tenemos la ubicación del usuario
    if (userLocation) {
      return userLocation;
    }
    // Por defecto
    return { lat: 3.37, lng: -76.53 };
  }, [companyData, pickedLocation, userLocation]);

  // 🔥 NUEVO: Determinar si es un negocio de domicilio
  const isDomicilioBusiness = useMemo(() => {
    const companyType = formData.companytype?.toLowerCase() || companyData?.business_type?.toLowerCase();
    return companyType === 'domicilio' || companyType === 'a domicilio' || companyType === 'servicio a domicilio';
  }, [formData.companytype, companyData]);

  // 🔥 NUEVO: Manejar cambio del radio de trabajo
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    if (newRadius >= 1 && newRadius <= 50) {
      setWorkRadius(newRadius);
    }
  };

  // Mostrar alerta - FUNCIÓN MEJORADA
  const showAlert = (message, type = 'info') => {
    console.log(`🔔 Mostrando alerta: ${type} - ${message}`); // Para debug
    setAlert({ show: true, message, type });
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Convertir archivo a base64
  const fileToBase64 = (file, renameKey = false) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1]
        resolve({
          [renameKey ? 'name' : 'nombre']: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          preview: reader.result,
        })
      }
      reader.onerror = (error) => reject(error)
    })

  // Cargar datos de la empresa - MODIFICADO PARA USAR getCompanyById
  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        if (!authUser) {
          showAlert('No hay usuario autenticado', 'error')
          return
        }

        // Primero obtenemos la lista de empresas para encontrar el ID
        const respLista = await fetch('http://localhost:3000/api/public/getCompanys')
        const dataLista = await respLista.json()

        const company = dataLista?.data?.negocios?.find((c) => c.user_id === authUser.id)
        if (company) {
          console.log('🏢 Empresa encontrada en lista:', company)
          
          // Ahora obtenemos los datos completos usando getCompanyById
          const respCompleta = await fetch(`http://localhost:3000/api/public/getCompanyById?id=${company.company_id}`)
          const dataCompleta = await respCompleta.json()
          console.log('📋 Datos :', dataCompleta)
          if (dataCompleta.success && dataCompleta.data) {
            const companyDataCompleta = dataCompleta.data
            console.log('📋 Datos completos de la empresa:', companyDataCompleta)
            
            setCompanyData(companyDataCompleta)
            setFormData({
              companyname: companyDataCompleta.company_name || '',
              description: companyDataCompleta.company_description || '',
              companytype: companyDataCompleta.business_type || '',
              phone: companyDataCompleta.company_phone || '',
              address: companyDataCompleta.address || '',
              latitude: companyDataCompleta.latitude || '',
              longitude: companyDataCompleta.longitude || '',
            })

            // 🔥 NUEVO: Cargar radio de trabajo si existe
            if (companyDataCompleta.work_radius) {
              setWorkRadius(companyDataCompleta.work_radius);
            }

            if (companyDataCompleta.logo_uri) setLogoPreview(companyDataCompleta.logo_uri)

            // Establecer ubicación en el mapa si existe
            if (companyDataCompleta.latitude && companyDataCompleta.longitude) {
              setPickedLocation({
                lat: Number(companyDataCompleta.latitude),
                lng: Number(companyDataCompleta.longitude),
              });
            }

            // Cargar horarios
            if (companyDataCompleta.company_id) fetchHorarios(companyDataCompleta.company_id)
          } else {
            // Fallback: usar datos básicos si getCompanyById falla
            console.warn('⚠️ Falló getCompanyById, usando datos básicos')
            setCompanyData(company)
            setFormData({
              companyname: company.company_name || '',
              description: company.description || '',
              companytype: company.business_type || '',
              phone: company.company_phone || '',
              address: company.address || '',
              latitude: company.latitude || '',
              longitude: company.longitude || '',
            })
            if (company.logo_uri) setLogoPreview(company.logo_uri)
            if (company.latitude && company.longitude) {
              setPickedLocation({
                lat: Number(company.latitude),
                lng: Number(company.longitude),
              });
            }
            if (company.company_id) fetchHorarios(company.company_id)
          }
        } else {
          showAlert('No se encontró negocio registrado', 'info')
        }
      } catch (error) {
        console.error('Error obteniendo empresa:', error)
        showAlert('Error al cargar los datos del negocio', 'error')
      }
    }
    obtenerEmpresa()
  }, [])

  // Manejo de formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showAlert('Por favor selecciona un archivo de imagen válido', 'error')
        return
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('La imagen es demasiado grande. Máximo 5MB permitido.', 'error')
        return
      }
      
      setLogoFile(file)
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
      showAlert('Logo cargado correctamente', 'success')
    }
  }

  // Guardar empresa - MODIFICADO PARA INCLUIR RADIO DE TRABAJO
  const handleGuardar = async () => {
    try {
      // Validaciones básicas
      if (!formData.companyname.trim()) {
        showAlert('El nombre del negocio es requerido', 'warning')
        return
      }

      if (!formData.companytype.trim()) {
        showAlert('El tipo de negocio es requerido', 'warning')
        return
      }

      const isEdit = !!companyData?.company_id
      const body = {
        id_company: companyData?.company_id || null,
        companyname: formData.companyname.trim(),
        description: formData.description.trim(),
        companytype: formData.companytype.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        // 🔥 NUEVO: Incluir radio de trabajo solo si es negocio a domicilio
        ...(isDomicilioBusiness && { work_radius: workRadius }),
      }

      // Convertir logo a base64 si hay archivo nuevo
      if (logoFile) {
        try {
          body.logo = await fileToBase64(logoFile)
        } catch (error) {
          showAlert('Error al procesar la imagen del logo', 'error')
          return
        }
      }

      // Limpiar campos vacíos
      Object.keys(body).forEach((key) => {
        if (body[key] === null || body[key] === '' || 
            (Array.isArray(body[key]) && body[key].length === 0)) {
          delete body[key]
        }
      })

      const url = isEdit
        ? 'http://localhost:3000/api/public/editCompany'
        : 'http://localhost:3000/api/public/setCompanys'

      console.log('📤 Enviando datos:', body)
      
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await resp.json()
      console.log('📥 Respuesta del servidor:', data)
      
      if (resp.ok && data.success) {
        showAlert(
          isEdit ? 'Negocio actualizado exitosamente' : '🏗️ Negocio creado exitosamente', 
          'success'
        )
        // Navegar después de 2 segundos para que se vea la alerta
        setTimeout(() => navigate('/settings'), 2000)
      } else {
        showAlert(`❌ Error: ${data.message || 'No se pudo guardar el negocio'}`, 'error')
      }
    } catch (error) {
      console.error('Error guardando cambios:', error)
      showAlert('⚠️ Error de conexión. Intenta nuevamente.', 'error')
    }
  }

  // 🔹 HORARIOS 🔹
  const fetchHorarios = async (id_company) => {
    try {
      console.log("📡 Intentando cargar horarios para companyId:", id_company);

      const resp = await fetch(`http://localhost:3000/api/public/getCompanyHorarios?id_company=${encodeURIComponent(id_company)}`);

      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);

      const data = await resp.json();
      console.log("📥 Respuesta del backend (GET):", data);

      if (data.success && data.data.horarios?.length > 0) {
        console.log("✅ Horarios obtenidos:", data.data.horarios);
        setHorarios(data.data.horarios);
        showAlert(`Se cargaron ${data.data.horarios.length} horarios`, 'success')
      } else {
        console.warn("⚠️ No se encontraron horarios o respuesta vacía");
        setHorarios([]);
        showAlert('No hay horarios registrados', 'info')
      }
    } catch (error) {
      console.error("❌ Error cargando horarios:", error);
      setHorarios([]);
      showAlert('Error al cargar los horarios', 'error')
    }
  };

  const handleCrearHorario = async () => {
    if (!newHorario.day || !newHorario.start || !newHorario.end) {
      showAlert("Completa todos los campos del horario", "warning");
      return;
    }

    if (!companyData?.company_id) {
      showAlert("No se encontró la empresa asociada al negocio", "error");
      return;
    }

    try {
      const body = {
        id_company: companyData.company_id,
        horarios: [
          {
            dia: newHorario.day.toLowerCase(),
            hinicio: `${newHorario.start}:00`,
            hfin: `${newHorario.end}:00`,
            isopen: true,
          },
        ],
      };

      console.log("📦 Body enviado:", JSON.stringify(body, null, 2));

      const resp = await fetch("http://localhost:3000/api/public/createHorarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await resp.text();
      console.log("📥 Respuesta RAW:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ No se pudo parsear JSON");
        showAlert("Error en la respuesta del servidor", "error");
        return;
      }

      if (data.success) {
        showAlert("✅ Horario creado correctamente", "success");
        setNewHorario({ day: "", start: "", end: "" });
        // Recargar horarios
        fetchHorarios(companyData.company_id);
      } else {
        showAlert(`⚠️ ${data.message || "Error creando horario"}`, "error");
      }
    } catch (error) {
      console.error("Error creando horario:", error);
      showAlert("❌ No se pudo crear el horario", "error");
    }
  };

  const handleToggleHorario = async (horarioId) => {
    try {
      const resp = await fetch('http://localhost:3000/api/public/activeInactiveHorario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horario_id: horarioId }),
      })
      const data = await resp.json()
      if (data.success) {
        showAlert("Horario actualizado correctamente", "success")
        // Recargar horarios
        if (companyData?.company_id) {
          fetchHorarios(companyData.company_id)
        }
      } else {
        showAlert("Error al actualizar el horario", "error")
      }
    } catch (error) {
      console.error('Error activando/desactivando horario:', error)
      showAlert("Error al actualizar el horario", "error")
    }
  }

  return (
    <div className="edit-profile-container">
      {/* Flecha para volver */}
      <button className="back-button" onClick={() => navigate('/settings')}>
        <ChevronLeft size={28} strokeWidth={2} />
      </button>

      {/* Sistema de Alertas - CORREGIDO */}
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

      <h2>{companyData ? 'Editar Negocio' : 'Registrar Negocio'}</h2>

      {/* Logo */}
      <div className="logo-section">
        <div className="logo-preview-container">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo del negocio" className="logo-preview" />
          ) : (
            <div className="logo-placeholder">Sin logo</div>
          )}
        </div>

        <label htmlFor="logoInput" className="btn-editar-logo">
          {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
        </label>
        <input
          id="logoInput"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Formulario */}
      <div className="form-group">
        <label>Nombre del negocio</label>
        <input type="text" name="companyname" value={formData.companyname} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Descripcion del negocio</label>
        <textarea type="text" name="description" value={formData.description} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Tipo de negocio</label>
        <select
          name="companytype"
          value={formData.companytype}
          onChange={handleChange}
        >
          <option value="">Selecciona una opción</option>
          <option value="local">Local</option>
          <option value="domicilio">Domicilio</option>
        </select>
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Dirección</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} />
      </div>

      {/* 🔥 MAPA PARA ELEGIR UBICACIÓN */}
      <h3>Ubicación del negocio</h3>
      <p>Haz click en el mapa para seleccionar latitud/longitud.</p>

      <div style={{ height: 300, borderRadius: 12, overflow: "hidden" }}>
        <MapPicker
          value={pickedLocation}
          onChange={handlePickChange}
          center={center}
          zoom={15}
          height="100%"
          width="100%"
          markerColor="#e25b7a"
        />
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Latitud</label>
          <input type="text" name="latitude" value={formData.latitude} readOnly />
        </div>
        <div className="form-group">
          <label>Longitud</label>
          <input type="text" name="longitude" value={formData.longitude} readOnly />
        </div>
      </div>

      {/* 🔥 NUEVO: RADIO DE TRABAJO SOLO PARA DOMICILIO */}
      {isDomicilioBusiness && (
        <div className="work-radius-section">
          <h3>Radio de Trabajo</h3>
          <p>Define el área de cobertura para tus servicios a domicilio</p>
          
          <div className="form-group">
            <label>Radio de trabajo (kilómetros)</label>
            <input
              type="range"
              min="1"
              max="50"
              value={workRadius}
              onChange={handleRadiusChange}
              className="radius-slider"
            />
            <div className="radius-value">
              <span>{workRadius} km</span>
            </div>
          </div>

          {/* Mapa para visualizar el radio de trabajo */}
          <div style={{ height: 300, borderRadius: 12, overflow: "hidden", marginTop: '15px' }}>
            <MapPicker
              value={pickedLocation}
              onChange={handlePickChange}
              center={center}
              zoom={12}
              height="100%"
              width="100%"
              markerColor="#e25b7a"
              showRadius={true}
              radius={workRadius * 1000} // Convertir a metros
              radiusColor="#e25b7a33"
            />
          </div>

          <div className="radius-info">
            <p>🗺️ Tu área de cobertura se muestra en el mapa. Los clientes dentro de este radio podrán solicitarte servicios a domicilio.</p>
          </div>
        </div>
      )}

      

      {/* Horarios */}
      <div className="horarios-section">
        <h3>Horarios de Atención</h3>
        
        <div className="horarios-list">
          {horarios.length > 0 ? (
            horarios.map((h) => (
              <div key={h.id} className={`horario-item ${h.isopen ? 'active' : 'inactive'}`}>
                <div className="horario-info">
                  <span className="horario-dia">{h.weekday}</span>
                  <span className="horario-horas">{h.starthour} - {h.endhour}</span>
                  <span className={`horario-status ${h.isopen ? 'status-active' : 'status-inactive'}`}>
                    {h.isopen ? "🟢 Activo" : "🔴 Inactivo"}
                  </span>
                </div>
                <button 
                  className={`toggle-button ${h.isopen ? 'btn-inactive' : 'btn-active'}`}
                  onClick={() => handleToggleHorario(h.id)}
                >
                  {h.isopen ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))
          ) : (
            <div className="no-horarios">
              <p>No hay horarios registrados aún.</p>
            </div>
          )}
        </div>

        {/* Formulario para nuevo horario */}
        <div className="nuevo-horario">
          <h4>Agregar Nuevo Horario</h4>
          <div className="horario-form">
            <div className="form-group">
              <label>Día de la semana</label>
              <select
                name="companytype"
                value={newHorario.day}
                onChange={(e) => setNewHorario({ ...newHorario, day: e.target.value })}
              >
                <option value="">Selecciona una opción</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miercoles">Miercoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sabado">Sabado</option>
                <option value="Domingo">Domingo</option>
              </select>   
            </div>
            
            <div className="form-group">
              <label>Hora de apertura</label>
              <input
                type="time"
                value={newHorario.start}
                onChange={(e) => setNewHorario({ ...newHorario, start: e.target.value })}
                className="horario-input"
              />
            </div>
            
            <div className="form-group">
              <label>Hora de cierre</label>
              <input
                type="time"
                value={newHorario.end}
                onChange={(e) => setNewHorario({ ...newHorario, end: e.target.value })}
                className="horario-input"
              />
            </div>
            
            <div className="form-group button-container">
              <button 
                type="button" 
                className="btn-agregar-horario"
                onClick={handleCrearHorario}
              >
                Agregar Horario
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Boton para guardar los cambios */}
      <button className="save-button" onClick={handleGuardar}>
        {companyData ? 'Guardar Cambios' : 'Crear Negocio'}
      </button>
    </div>
  )
}