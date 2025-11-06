import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Layers, Search, Edit, Trash2 } from 'lucide-react'
import './css/Servicios.css'

export default function ServiciosBusiness() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [servicios, setServicios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [companyId, setCompanyId] = useState(null)

  // 🔁 Cargar servicios y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        const userId = authUser?.id

        // ✅ Obtener los negocios del usuario
        const negocios = await fetch('http://localhost:3000/api/public/getCompanys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const neg = await negocios.json()
        const negocio = neg?.data?.negocios || []
        const company = negocio.find((c) => c.user_id === userId)
        const companyIdFound = company?.company_id || company?.id
        setCompanyId(companyIdFound)

        // ✅ Obtener servicios de la empresa
        const resServicios = await fetch(
          `http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )
        const data = await resServicios.json()

        if (data.success && data.data?.servicios) {
          const lista = data.data.servicios
          setServicios(lista)
          // Extraer categorías únicas
          const cats = [...new Set(lista.map((s) => s.category_name || 'Sin categoría'))]
          setCategorias(['Todas', ...cats])
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

    fetchData()
  }, [])

  // 🔍 Filtrar por texto y categoría
  const serviciosFiltrados = servicios.filter((s) => {
    const coincideTexto = s.title.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria =
      categoriaSeleccionada === 'Todas' || s.category_name === categoriaSeleccionada
    return coincideTexto && coincideCategoria
  })

  // Agrupar servicios por categoría
  const serviciosPorCategoria = serviciosFiltrados.reduce((acc, servicio) => {
    const cat = servicio.category_name || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(servicio)
    return acc
  }, {})

  // 🚀 Navegación
  const handleAddServicio = () => navigate('/add_service')
  const handleAddCategoria = () => navigate('/add_categoria')

  const handleEdit = (servicio, companyId) =>
    navigate('/edit_service', { state: { servicio, companyId } })

  // ❌ Eliminar servicio
  const handleDelete = async (servicio) => {
    if (!window.confirm(`¿Eliminar el servicio "${servicio.title}"?`)) return
    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user'))
      const userId = authUser?.id

      const negocios = await fetch('http://localhost:3000/api/public/getCompanys', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const neg = await negocios.json()
      const company = neg?.data?.negocios?.find((c) => c.user_id === userId)
      const companyId = company.company_id

      const res = await fetch('http://localhost:3000/api/public/deleteServicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_company: companyId,
          id_servicio: servicio.service_id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert('✅ Servicio eliminado correctamente')
        setServicios((prev) => prev.filter((s) => s.service_id !== servicio.service_id))
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
      <h2 className="servicios-title">Servicios por Categoría</h2>

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

      {/* 🔘 Botones de categorías */}
      <div className="categorias-filtros">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`categoria-btn ${categoriaSeleccionada === cat ? 'activa' : ''}`}
            onClick={() => setCategoriaSeleccionada(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🧾 Lista agrupada */}
      {cargando ? (
        <p>Cargando servicios...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : Object.keys(serviciosPorCategoria).length > 0 ? (
        <div className="servicios-list">
          {Object.entries(serviciosPorCategoria).map(([categoria, lista]) => (
            <div key={categoria} className="categoria-section">
              <h3 className="categoria-titulo">{categoria}</h3>
              {lista.map((servicio) => (
                <div key={servicio.service_id} className="servicio-card">
                  <div>
                    <h4 className="servicio-nombre">{servicio.title}</h4>
                    <p className="servicio-precio">
                      💰 {servicio.price.toLocaleString('es-CO')} COP
                    </p>
                  </div>
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
          ))}
        </div>
      ) : (
        <p className="sin-resultados">No se encontraron servicios</p>
      )}

      {/* 🚀 Botones flotantes (igual que tu diseño) */}
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
