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
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerFiles, setBannerFiles] = useState([])

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

  // 🔹 Cargar empresa y logo
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

          // ✅ Mostrar logo actual desde logo_uri si existe
          if (company.logo_uri) {
            setLogoPreview(company.logo_uri)
          }
        }
      } catch (error) {
        console.error('Error obteniendo empresa:', error)
      }
    }
    obtenerEmpresa()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 🔹 Al cambiar logo, previsualizarlo
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file)) // Vista previa inmediata
    }
  }

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

      // Si cambió logo, incluirlo como base64
      if (logoFile) {
        body.logo = await fileToBase64(logoFile)
      }

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
        ) {
          delete body[key]
        }
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

  return (
    <div className="edit-profile-container">
      <h2>{companyData ? 'Editar Negocio' : 'Registrar Negocio'}</h2>

      {/* 🔹 Logo del negocio */}
      <div className="logo-section">
        <div className="logo-preview-container">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo del negocio"
              className="logo-preview"
            />
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

      {/* 🔹 Campos de texto */}
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

      <button className="save-button" onClick={handleGuardar}>
        {companyData ? 'Guardar Cambios' : 'Crear Negocio'}
      </button>
    </div>
  )
}
