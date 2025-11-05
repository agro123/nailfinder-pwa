import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './css/EditProfile.css'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [companyId, setCompanyId] = useState(null)
  const [formData, setFormData] = useState({
    companyname: '',
    description: '',
    profilePhoto: null,
    workGallery: [],
    schedule: {
      lunes: { open: '', close: '' },
      martes: { open: '', close: '' },
      miercoles: { open: '', close: '' },
      jueves: { open: '', close: '' },
      viernes: { open: '', close: '' },
      sabado: { open: '', close: '' },
      domingo: { open: '', close: '' },
    },
  })

  // ✅ Obtener datos del negocio según el usuario logueado
  useEffect(() => {
    const obtenerCompanyId = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        const userId = authUser?.id
        console.log('🟩 userId:', userId)

        if (!userId) return

        const resp = await fetch('http://localhost:3000/api/public/getCompanys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await resp.json()
        console.log('🟦 Respuesta de getCompanys:', data)

        const negocios = data?.data?.negocios
        if (!negocios) {
          console.warn('⚠️ No hay lista de negocios en la respuesta.')
          return
        }

        const company = negocios.find((c) => c.user_id === userId)
        console.log('🟨 company encontrado:', company)

        if (company) {
          setCompanyId(company.company_id)
          setFormData({
            companyname: company.company_name || '',
            description: company.description || '',
            profilePhoto: company.profile_photo || null,
            workGallery: company.gallery || [],
            schedule: company.schedule || formData.schedule,
          })
        } else {
          console.warn('⚠️ No se encontró negocio asociado al usuario.')
        }
      } catch (err) {
        console.error('❌ Error obteniendo companyId:', err)
      }
    }

    obtenerCompanyId()
  }, [])

  // ✅ Inputs simples
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Cambiar horario
  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], [field]: value },
      },
    }))
  }

  // ✅ Conversión base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  // ✅ Foto de perfil
  const handleProfilePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const base64 = await toBase64(file)
    setFormData((prev) => ({ ...prev, profilePhoto: base64 }))
  }

  // ✅ Galería de trabajos
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const base64Images = await Promise.all(files.map(toBase64))
    setFormData((prev) => ({
      ...prev,
      workGallery: [...prev.workGallery, ...base64Images],
    }))
  }

  // ✅ Guardar cambios
  const handleGuardar = async () => {
    console.log('🟢 Ejecutando handleGuardar...')

    if (!companyId) {
      alert('⚠️ No se ha encontrado el negocio del usuario.')
      return
    }

    try {
      const payload = {
        id_company: companyId,
        company_name: formData.companyname,
        company_description: formData.description,
        logo_uri: formData.profilePhoto,
        gallery: formData.workGallery,
        schedule: formData.schedule,
      }

      console.log('📦 Payload enviado:', payload)

      const token = localStorage.getItem('auth_token') || user?.token

      const resp = await fetch('http://localhost:3000/api/public/editCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await resp.json()
      console.log('🧩 Respuesta del backend:', data)

      if (data.success) {
        alert('✅ Perfil actualizado correctamente')
        navigate(-1)
      } else {
        alert(`⚠️ Error al actualizar: ${data.message}`)
      }
    } catch (err) {
      console.error('❌ Error al actualizar perfil:', err)
      alert('Error al actualizar el perfil del negocio.')
    }
  }

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil del Negocio</h2>

      {/* Nombre */}
      <div className="form-group">
        <label>Nombre del negocio</label>
        <input
          type="text"
          name="companyname"
          value={formData.companyname}
          onChange={handleChange}
          placeholder="Ej: Barbería El Estilo"
        />
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label>Descripción profesional</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe brevemente tu negocio y los servicios que ofreces..."
        />
      </div>

      {/* Foto de perfil */}
      <div className="form-group">
        <label>Foto de perfil</label>
        <input type="file" accept="image/*" onChange={handleProfilePhoto} />
        {formData.profilePhoto && (
          <div className="image-preview">
            <img
              src={formData.profilePhoto}
              alt="Foto de perfil"
              className="profile-preview"
            />
          </div>
        )}
      </div>

      {/* Galería */}
      <div className="form-group">
        <label>Galería de trabajos realizados</label>
        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
        <div className="preview-container">
          {formData.workGallery.length > 0 ? (
            formData.workGallery.map((img, i) => (
              <img key={i} src={img} alt={`work-${i}`} className="gallery-preview" />
            ))
          ) : (
            <p className="no-images">No hay imágenes cargadas.</p>
          )}
        </div>
      </div>

      {/* Horarios */}
      <div className="form-group schedule">
        <label>Horarios de atención</label>
        {Object.keys(formData.schedule).map((day) => (
          <div key={day} className="schedule-row">
            <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
            <input
              type="time"
              value={formData.schedule[day].open || ''}
              onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
            />
            <span>a</span>
            <input
              type="time"
              value={formData.schedule[day].close || ''}
              onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="buttons">
        <button type="button" className="btn-guardar" onClick={handleGuardar}>
          Guardar cambios
        </button>
        <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
