import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './css/EditProfile.css'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [companyId, setCompanyId] = useState(null)

  const [formData, setFormData] = useState({
    fullname: '',
    description: '',
    profilePhoto: null,
    gallery: [],
    schedule: {
      monday: { start: '', end: '' },
      tuesday: { start: '', end: '' },
      wednesday: { start: '', end: '' },
      thursday: { start: '', end: '' },
      friday: { start: '', end: '' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' },
    },
  })

  // Obtener companyId desde el backend según el usuario logueado
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
            fullname: company.company_name || '',
            description: company.description || '',
            profilePhoto: company.profile_photo || null,
            gallery: company.gallery || [],
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


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfilePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result }))
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = e.target.files
    if (!files) return
    const convertToBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
      })
    const images = await Promise.all(Array.from(files).map(convertToBase64))
    setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ...images] }))
  }

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], [field]: value },
      },
    }))
  }

  const handleGuardar = async () => {
    if (!companyId) {
      alert('❌ No se encontró el negocio asociado al usuario.')
      return
    }

    try {
      const payload = {
        id_company: companyId,
        fullname: formData.fullname,
        description: formData.description,
        profilePhoto: formData.profilePhoto,
        gallery: formData.gallery,
        schedule: formData.schedule,
      }

      const resp = await fetch('http://localhost:3000/api/public/editCompany', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await resp.json()
      if (data.success) {
        alert('✅ Perfil del negocio actualizado correctamente')
        navigate(-1)
      } else {
        alert(`⚠️ Error al actualizar: ${data.message || 'Desconocido'}`)
      }
    } catch (err) {
      console.error('❌ Error al actualizar perfil:', err)
      alert('❌ Error al actualizar el perfil del negocio.')
    }
  }

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil del Negocio</h2>

      <div className="form-group">
        <label>Nombre completo</label>
        <input
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Descripción personal/profesional</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Foto de perfil</label>
        <input type="file" accept="image/*" onChange={handleProfilePhoto} />
        {formData.profilePhoto && (
          <img src={formData.profilePhoto} alt="Perfil" className="banner-preview" />
        )}
      </div>

      <div className="form-group">
        <label>Galería de trabajos</label>
        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
        <div className="preview-container">
          {formData.gallery.map((img, idx) => (
            <img key={idx} src={img} alt={`gal-${idx}`} className="banner-preview" />
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Horarios de atención</label>
        {Object.keys(formData.schedule).map((day) => (
          <div key={day} className="schedule-row">
            <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
            <input
              type="time"
              value={formData.schedule[day].start}
              onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
            />
            <span>-</span>
            <input
              type="time"
              value={formData.schedule[day].end}
              onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="buttons">
        <button className="btn-guardar" onClick={handleGuardar}>Guardar cambios</button>
        <button className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
      </div>
    </div>
  )
}
