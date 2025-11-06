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
    phone: '',
    companytype: '',
    address: '',
    latitude: '',
    longitude: '',
    bannerGalery: [],
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
        if (!negocios) return

        const company = negocios.find((c) => c.user_id === userId)
        if (company) {
          setCompanyId(company.company_id)
          setFormData((prev) => ({
            ...prev,
            companyname: company.company_name || '',
            phone: company.company_phone || '',
            description: company.company_description || '',
            companytype: company.business_type || '',
            address: company.address || '',
            latitude: company.latitude || '',
            longitude: company.longitude || '',
            bannerGalery: company.bannersgalery || [],
          }))
        }
      } catch (err) {
        console.error('❌ Error obteniendo companyId:', err)
      }
    }

    obtenerCompanyId()
  }, [])

  // ✅ Cambiar inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Conversión base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  // ✅ Subir banners a la galería
  const handleBannerUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const base64Images = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        description: `Imagen subida: ${file.name}`,
        data: await toBase64(file),
      }))
    )

    setFormData((prev) => ({
      ...prev,
      bannerGalery: [...prev.bannerGalery, ...base64Images],
    }))
  }

  // ✅ Guardar cambios
  const handleGuardar = async () => {
    if (!companyId) {
      alert('⚠️ No se ha encontrado el negocio del usuario.')
      return
    }

    try {
      const payload = {
        id_company: companyId,
        phone: formData.phone,
        companyname: formData.companyname,
        nit: null, // si no manejas el nit aún
        companytype: formData.companytype || 'local',
        latitude: Number(formData.latitude) || null,
        longitude: Number(formData.longitude) || null,
        address: formData.address,
        bannerGalery: formData.bannerGalery,
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

      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Ej: 3178751490"
        />
      </div>

      <div className="form-group">
        <label>Tipo de empresa</label>
        <input
          type="text"
          name="companytype"
          value={formData.companytype}
          onChange={handleChange}
          placeholder="Ej: local / online"
        />
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Ej: Calle 5 #10-20"
        />
      </div>

      <div className="form-group">
        <label>Latitud</label>
        <input
          type="number"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          step="any"
        />
      </div>

      <div className="form-group">
        <label>Longitud</label>
        <input
          type="number"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          step="any"
        />
      </div>

      <div className="form-group">
        <label>Galería de Banners</label>
        <input type="file" accept="image/*" multiple onChange={handleBannerUpload} />
        <div className="preview-container">
          {formData.bannerGalery.length > 0 ? (
            formData.bannerGalery.map((img, i) => (
              <div key={i} className="banner-item">
                <p>{img.name}</p>
                <img src={img.data} alt={img.name} className="gallery-preview" />
              </div>
            ))
          ) : (
            <p className="no-images">No hay imágenes cargadas.</p>
          )}
        </div>
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
