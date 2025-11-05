import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Layers, Search, Edit, Trash2 } from 'lucide-react'
import './css/Servicios.css'

export default function ServiciosBusiness() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [companyId, setCompanyId] = useState(null)

  // 🔁 Llamar al backend al montar el componente
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        // ✅ Obtener usuario autenticado
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        const userId = authUser?.id

        // ✅ Obtener negocios del usuario
        const negocios = await fetch('http://localhost:3000/api/public/getCompanys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const neg = await negocios.json()
        const negocio = neg?.data?.negocios || []
        const company = negocio.find(c => c.user_id === userId)
        const companyIdFound = company?.company_id || company?.id
        setCompanyId(companyIdFound)

        // ✅ Obtener servicios de esa empresa
        const response = await fetch(`http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()

        if (data.success && data.data?.servicios) {
          setServicios(data.data.servicios)
        } else {
          setError(data.message || 'Error al obtener servicios')
        }
      } catch (err) {
        console.error('Error al conectar con el backend:', err)
        setError('Error de conexión con el servidor')
      } finally {
        setCargando(false)
      }
    }

    fetchServicios()
  }, [])

  // 🔍 Filtro de búsqueda
  const serviciosFiltrados = servicios.filter((s) =>
    s.title.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ➕ Crear nuevo servicio
  const handleAddServicio = () => navigate('/add_service')
  const handleAddCategoria = () => navigate('/add_categoria')

  // ✏️ Editar servicio
  const handleEdit = (servicio, companyId) => {
    navigate('/edit_service', { state: { servicio, companyId } });
  }

  // ❌ Eliminar servicio
  const handleDelete = async (servicio) => {
    if (!window.confirm(`¿Eliminar el servicio "${servicio.title}"?`)) return

    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user'))
      const userId = authUser?.id

      // Obtener el idCompany del negocio del usuario
      const negocios = await fetch('http://localhost:3000/api/public/getCompanys', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const neg = await negocios.json()
      const company = neg?.data?.negocios?.find(c => c.user_id === userId)
      const companyId = company.company_id

      const res = await fetch('http://localhost:3000/api/public/deleteServicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_company: companyId,
          id_servicio: servicio.service_id
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert('✅ Servicio eliminado correctamente')
        setServicios(prev => prev.filter(s => s.service_id !== servicio.service_id))
      } else {
        alert('❌ Error al eliminar el servicio')
      }
    } catch (err) {
      console.error('Error eliminando servicio:', err)
      alert('Error al conectar con el servidor')
    }
  }

  return (
    <div className="servicios-container">
      <h2 className="servicios-title">Lista de servicios</h2>

      {/* 🔍 Barra de búsqueda */}
      <div className="servicios-busqueda">
        <Search size={20} color="#555" />
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* 🧾 Contenido dinámico */}
      {cargando ? (
        <p>Cargando servicios...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : serviciosFiltrados.length > 0 ? (
        <div className="servicios-list">
          {serviciosFiltrados.map((servicio) => (
            <div key={servicio.service_id} className="servicio-card">
              <div className="servicio-info">
                <h3 className="servicio-nombre">{servicio.title}</h3>
                <p className="servicio-precio">
                  💰 {servicio.price.toLocaleString('es-CO')} COP
                </p>
                <p className="servicio-categoria">
                  Categoría: {servicio.category_name}
                </p>
              </div>

              {/* 🧩 Botones de acción */}
              <div className="servicio-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(servicio, companyId)}
                >
                  <Edit size={18} />
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(servicio)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="sin-resultados">No se encontraron servicios</p>
      )}

      {/* 🚀 Botones flotantes */}
      <div className="floating-buttons">
        <button className="floating-btn secondary" onClick={handleAddCategoria}>
          <Layers size={22} />
        </button>
        <button className="floating-btn primary" onClick={handleAddServicio}>
          <Plus size={24} />
        </button>
      </div>
    </div>
  )
}
