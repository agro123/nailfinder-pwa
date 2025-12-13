import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../../constants'

export default function AddCategoria() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [companyId, setCompanyId] = useState(null)

  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        if (!authUser) return

        const userId = authUser.id
        const res = await fetch(`${API_URL}/api/public/getCompanys`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        const company = data?.data?.negocios?.find(c => c.user_id === userId)
        if (company) setCompanyId(company.company_id || company.id)
        else console.warn('⚠️ No se encontró empresa asociada al usuario.')
      } catch (err) {
        console.error('Error obteniendo empresa:', err)
      }
    }

    obtenerEmpresa()
  }, [])

  const handleGuardar = async () => {
    if (!companyId) {
      alertPrompt({
        title: "Error",
        message: `No se encontró el ID de la empresa. Recarga la página e intenta de nuevo`,
        type: "error",
      });
      return
    }

    setGuardando(true)

    const payload = {
      name: nombre,
      description: descripcion,
      id_company: companyId // ✅ ahora siempre existe
    }

    try {
      const res = await fetch('API_URL/api/public/createCategoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        alertPrompt({
          title: "OK",
          message: `Categoría creada correctamente`,
          type: "success",
        });
        navigate('/servicios')
      } else {
        alertPrompt({
          title: "Error",
          message: `No se logro crear la categoria`,
          type: "error",
        });
      }
    } catch (err) {
      console.error(err)
      alertPrompt({
        title: "Error",
        message: `No se logro establecer conexion con el servidor`,
        type: "error",
      });
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Nueva categoría</h2>
      <input
        type="text"
        placeholder="Nombre de la categoría"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <div className="button-group">
        <button
          className="btn-primary"
          onClick={handleGuardar}
          disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar categoría'}
        </button>

        <button className="btn-secondary" onClick={() => navigate('/servicios')}>Cancelar</button>
      </div>
    </div>
  )
}
