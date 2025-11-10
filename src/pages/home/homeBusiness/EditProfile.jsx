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
        if (!authUser) return console.error('No hay usuario autenticado.')

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
        }
      } catch (error) {
        console.error('Error obteniendo empresa:', error)
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
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  // Guardar empresa
  const handleGuardar = async () => {
    try {
      const isEdit = !!companyData?.company_id
      const body = {
        id_company: companyData?.company_id || null,
        companyname: formData.companyname,
        companytype: formData.companytype,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      }

      if (logoFile) body.logo = await fileToBase64(logoFile)
      if (bannerFiles.length > 0) {
        body.bannerGalery = bannerFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: f.data,
          description: 'Imagen agregada por el usuario',
        }))
      }

      Object.keys(body).forEach((key) => {
        if (
          body[key] === null ||
          body[key] === '' ||
          (Array.isArray(body[key]) && body[key].length === 0)
        ) delete body[key]
      })

      const url = isEdit
        ? 'http://localhost:3000/api/public/editCompany'
        : 'http://localhost:3000/api/public/setCompanys'

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await resp.json()
      if (resp.ok && data.success) {
        alert(isEdit ? '✅ Cambios guardados con éxito' : '🏗️ Negocio creado')
        navigate('/settings')
      } else {
        alert('❌ Error al guardar: ' + (data.message || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error guardando cambios:', error)
      alert('⚠️ No se pudieron guardar los cambios')
    }
  }

  // 🔹 HORARIOS 🔹
  const fetchHorarios = async (id_company) => {
    try {
      console.log("📡 Intentando cargar horarios para companyId:", id_company);

      // ✅ Ahora se usa GET con query param
      const resp = await fetch(`http://localhost:3000/api/public/getCompanyHorarios?id_company=${encodeURIComponent(id_company)}`);

      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);

      const data = await resp.json();
      console.log("📥 Respuesta del backend (GET):", data);

      if (data.success && data.data.horarios?.length > 0) {
        console.log("✅ Horarios obtenidos:", data.data.horarios);
        setHorarios(data.data.horarios);
      } else {
        console.warn("⚠️ No se encontraron horarios o respuesta vacía");
        setHorarios([]);
      }
    } catch (error) {
      console.error("❌ Error cargando horarios:", error);
      setHorarios([]);
    }
  };






  const handleCrearHorario = async () => {
    if (!newHorario.day || !newHorario.start || !newHorario.end) {
      alert("Completa todos los campos del horario");
      return;
    }

    // usuario autenticado (por si se usa después)
    const authUser = JSON.parse(localStorage.getItem("auth_user"));

    console.log("🏢 companyData:", companyData);

    if (!companyData?.company_id) {
      alert("No se encontró la empresa asociada al negocio");
      return;
    }

    try {
      // 🔹 Formato correcto para el backend
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

      // 🧩 Log antes del envío
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
        return;
      }

      if (data.success) {
        alert("✅ Horario creado correctamente");
        setNewHorario({ day: "", start: "", end: "" });

        // si tu función usa branchId, puedes obtenerlo aquí si lo requieres
        if (companyData?.mainBranch?.id) {
          fetchHorarios(companyData.mainBranch.id);
        }
      } else {
        alert("⚠️ Error creando horario: " + (data.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error creando horario:", error);
      alert("❌ No se pudo crear el horario");
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
      if (data.success && companyData?.mainBranch?.id) fetchHorarios(companyData.mainBranch.id)
    } catch (error) {
      console.error('Error activando/desactivando horario:', error)
    }
  }

  return (
    <div className="edit-profile-container">
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
      <button className="save-button" onClick={() => navigate('/settings')}>
        Volver
      </button>

      {/* Horarios */}
      <h3>Horarios</h3>
      <div className="horarios-list">
        {horarios.length > 0 ? (
          horarios.map((h) => (
            <div key={h.id} className="horario-item">
              <span>
                🕒 <strong>{h.weekday}</strong>: {h.starthour} - {h.endhour} ({h.isopen ? "Activo" : "Inactivo"})
              </span>
              <button onClick={() => handleToggleHorario(h.id)}>
                {h.isopen ? "Desactivar" : "Activar"}
              </button>
            </div>
          ))
        ) : (
          <p>No hay horarios registrados aún.</p>
        )}
      </div>



      {/* Nuevo horario */}
      <h4>Agregar Horario</h4>
      <div className="form-group-inline">
        <input
          type="text"
          placeholder="Día"
          value={newHorario.day}
          onChange={(e) => setNewHorario({ ...newHorario, day: e.target.value })}
        />
        <input
          type="time"
          value={newHorario.start}
          onChange={(e) => setNewHorario({ ...newHorario, start: e.target.value })}
        />
        <input
          type="time"
          value={newHorario.end}
          onChange={(e) => setNewHorario({ ...newHorario, end: e.target.value })}
        />
        <button type="button" onClick={handleCrearHorario}>Agregar</button>
      </div>
    </div>
  )
}
