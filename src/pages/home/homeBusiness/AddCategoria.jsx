import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
        const res = await fetch('http://localhost:3000/api/public/getCompanys', {
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
      alert('❌ No se encontró el ID de la empresa. Recarga la página e intenta de nuevo.')
      return
    }

    setGuardando(true)

    const payload = {
      name: nombre,
      description: descripcion,
      id_company: companyId // ✅ ahora siempre existe
    }

    try {
      const res = await fetch('http://localhost:3000/api/public/createCategoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        alert('✅ Categoría creada correctamente')
        navigate('/servicios')
      } else {
        alert('❌ Error al crear categoría')
      }
    } catch (err) {
      console.error(err)
      alert('Error al conectar con el servidor')
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
        <button onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar categoría'}
        </button>
        <button onClick={() => navigate('/servicios')}>Cancelar</button>
      </div>
    </div>
  )
}
