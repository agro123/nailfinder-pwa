import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './css/EditProfile.css'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

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
  const [bannerFiles, setBannerFiles] = useState([]) // varias imágenes

  // 🔹 Conversor a base64 sin prefijo "data:image"
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
          preview: reader.result, // para mostrar en pantalla
        })
      }
      reader.onerror = (error) => reject(error)
    })

  // 🔹 Cargar datos actuales del negocio
  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        if (!authUser) return console.error('No hay usuario autenticado.')

        const resp = await fetch('http://localhost:3000/api/public/getCompanys')
        const data = await resp.json()

        const company = data?.data?.negocios?.find(
          (c) => c.user_id === authUser.id
        )

        if (company) {
          setCompanyData(company)
          setFormData({
            companyname: company.company_name || '',
            companytype: company.business_type || '',
            phone: company.company_phone || '',
            address: company.company_address || '',
            latitude: company.latitude || '',
            longitude: company.longitude || '',
          })
        }
      } catch (error) {
        console.error('Error obteniendo empresa:', error)
      }
    }
    obtenerEmpresa()
  }, [])

  // 🔹 Manejador de cambios
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 🔹 Logo (único)
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) setLogoFile(file)
  }

  // 🔹 Agregar varias imágenes a la galería
  const handleBannerChange = async (e) => {
    const files = Array.from(e.target.files)
    const convertedFiles = await Promise.all(
      files.map((f) => fileToBase64(f, true))
    )
    setBannerFiles((prev) => [...prev, ...convertedFiles]) // 🔸 agregamos, no reemplazamos
  }

  // 🔹 Eliminar imagen de la galería
  const handleRemoveBanner = (index) => {
    setBannerFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 🔹 Guardar cambios
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

      // 🔸 Logo mantiene su estructura original
      if (logoFile) {
        body.logo = await fileToBase64(logoFile)
      }

      // 🔸 Galería usa `name`
      if (bannerFiles.length > 0) {
        body.bannerGalery = bannerFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: f.data,
          description: 'Imagen agregada por el usuario',
        }))
      }

      // 🔸 Eliminar campos vacíos
      Object.keys(body).forEach((key) => {
        if (
          body[key] === null ||
          body[key] === '' ||
          (Array.isArray(body[key]) && body[key].length === 0)
        ) {
          delete body[key]
        }
      })

      console.log('📦 Datos enviados:', body)

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
        console.error('Error al guardar cambios:', data)
        alert('❌ Error al guardar: ' + (data.message || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error guardando cambios:', error)
      alert('⚠️ No se pudieron guardar los cambios')
    }
  }

  return (
    <div className="edit-profile-container">
      <h2>{companyData ? 'Editar Negocio' : 'Registrar Negocio'}</h2>

      <div className="form-group">
        <label>Nombre del negocio</label>
        <input
          type="text"
          name="companyname"
          value={formData.companyname}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Tipo de negocio</label>
        <input
          type="text"
          name="companytype"
          value={formData.companytype}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Latitud</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Longitud</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
      </div>

      <div className="form-group">
        <label>Galería de banners</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleBannerChange}
        />

        {/* 🔹 Vista previa de las imágenes agregadas */}
        {bannerFiles.length > 0 && (
          <div className="preview-gallery">
            {bannerFiles.map((img, index) => (
              <div key={index} className="preview-item">
                <img
                  src={img.preview}
                  alt={`banner-${index}`}
                  className="preview-image"
                />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveBanner(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="save-button" onClick={handleGuardar}>
        {companyData ? 'Guardar Cambios' : 'Crear Negocio'}
      </button>
    </div>
  )
}
