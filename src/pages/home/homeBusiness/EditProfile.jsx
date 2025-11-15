import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './css/EditProfile.css'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados de empresa y formulario
  const [companyData, setCompanyData] = useState(null)
  const [formData, setFormData] = useState({
    companyname: '',
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

  // Estado para alertas - CORREGIDO
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

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

  // Cargar datos de la empresa
  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        if (!authUser) {
          showAlert('No hay usuario autenticado', 'error')
          return
        }

        const resp = await fetch('http://localhost:3000/api/public/getCompanys')
        const data = await resp.json()

        const company = data?.data?.negocios?.find((c) => c.user_id === authUser.id)
        if (company) {
          console.log('🏢 Empresa encontrada:', company)
          setCompanyData(company)
          setFormData({
            companyname: company.company_name || '',
            companytype: company.business_type || '',
            phone: company.company_phone || '',
            address: company.company_address || '',
            latitude: company.latitude || '',
            longitude: company.longitude || '',
          })

          if (company.logo_uri) setLogoPreview(company.logo_uri)

          // Cargar horarios
          if (company.company_id) fetchHorarios(company.company_id)
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

  // Guardar empresa - CORREGIDO CON MEJORES ALERTAS
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
        companytype: formData.companytype.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver
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

      {/* Resto del código igual... */}
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
        <label>Tipo de negocio</label>
        <input type="text" name="companytype" value={formData.companytype} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Dirección</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} />
      </div>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Latitud</label>
          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Longitud</label>
          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} />
        </div>
      </div>

      <button className="save-button" onClick={handleGuardar}>
        {companyData ? 'Guardar Cambios' : 'Crear Negocio'}
      </button>

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
              <input
                type="text"
                placeholder="Ej: Lunes, Martes..."
                value={newHorario.day}
                onChange={(e) => setNewHorario({ ...newHorario, day: e.target.value })}
                className="horario-input"
              />
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
    </div>
  )
}