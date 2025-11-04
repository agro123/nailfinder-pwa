import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/AddService.css'

export default function NuevoServicioForm() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [personalSeleccionado, setPersonalSeleccionado] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [companyId, setCompanyId] = useState(null)

  const personal = ['Andrea Cuéllar', 'Juan Ruiz', 'Sofía Montenegro', 'Luis López']

  // ✅ Obtener el ID de la empresa del usuario autenticado
  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        if (!authUser) {
          console.error('No hay usuario autenticado en localStorage')
          return
        }

        const userId = authUser.id
        const resp = await fetch('http://localhost:3000/api/public/getCompanys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await resp.json()
        console.log('Negocios obtenidos:', data)

        const company = data?.data?.negocios?.find(c => c.user_id === userId)
        if (company) {
          console.log('Empresa encontrada:', company)
          setCompanyId(company.company_id || company.id)
        } else {
          console.warn('⚠️ No se encontró empresa asociada a este usuario.')
        }
      } catch (error) {
        console.error('Error obteniendo la empresa:', error)
      }
    }

    obtenerEmpresa()
  }, [])

  const togglePersonal = (p) => {
    setPersonalSeleccionado((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleContinuar = () => {
    if (paso < 3) setPaso(paso + 1)
    else handleGuardar()
  }

  const handleCancelar = () => {
    if (window.confirm('¿Seguro que deseas cancelar y volver a servicios?')) {
      navigate('/servicios')
    }
  }

  const handleGuardar = async () => {
    if (!companyId) {
      alert('❌ No se encontró el ID de la empresa. Intenta recargar la página.')
      return
    }

    setGuardando(true)
    const payload = {
      title: nombre,
      description: descripcion,
      companyid: companyId,        // ✅ ahora dinámico
      servicecategoryid: 17,       // ⚠️ puedes hacerlo dinámico si lo deseas
      price: Number(precio),
      duration: 60                 // minutos de ejemplo
    }

    const token = localStorage.getItem("auth_token")

    try {
      const res = await fetch("http://localhost:3000/api/public/createServicio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error del servidor:", errorText)
        alert("❌ Error al crear el servicio (ver consola)")
        return
      }

      const data = await res.json()
      console.log(data)

      if (data.success) {
        alert('✅ Servicio creado correctamente')
        navigate('/servicios') // ✅ volver después de guardar
      } else {
        alert('❌ Error al crear el servicio')
      }
    } catch (error) {
      console.error(error)
      alert('Error al conectar con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Nuevo servicio</h2>

      <div className="steps-indicator">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`step-dot ${paso === i ? 'active' : ''}`} />
        ))}
      </div>

      {paso === 1 && (
        <>
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Categoría (ej: Uñas, Cabello)"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Tipo de atención</option>
            <option value="En el estudio">En el estudio</option>
            <option value="A domicilio">A domicilio</option>
          </select>
          <textarea
            placeholder="Descripción del servicio"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </>
      )}

      {paso === 2 && (
        <input
          type="number"
          placeholder="Precio (ej: 25000)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
      )}

      {paso === 3 && (
        <div className="personal-container">
          <label>Selecciona el personal disponible:</label>
          {personal.map((p) => (
            <div key={p} className="personal-item">
              <input
                type="checkbox"
                checked={personalSeleccionado.includes(p)}
                onChange={() => togglePersonal(p)}
              />
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}

      <div className="button-group">
        <button
          onClick={handleContinuar}
          className="btn-primary"
          disabled={guardando}
        >
          {paso < 3 ? 'Continuar' : guardando ? 'Guardando...' : 'Guardar servicio'}
        </button>

        <button
          onClick={handleCancelar}
          className="btn-secondary"
          disabled={guardando}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
