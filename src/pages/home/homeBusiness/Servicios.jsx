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
  const [companyId, setCompanyId] = useState(null)

  // Alertas
  const [serviciosAlert, setServiciosAlert] = useState({ show: false, message: '', type: '' })
  const showAlert = (message, type = 'info') => {
    setServiciosAlert({ show: true, message, type })
    setTimeout(() => setServiciosAlert({ show: false, message: '', type: '' }), 4000)
  }

  // === MODAL DE CONFIRMACIÓN ===
  const [confirmData, setConfirmData] = useState({
    show: false,
    servicio: null,
  })

  const openConfirm = (servicio) => {
    setConfirmData({ show: true, servicio })
  }

  const closeConfirm = () => {
    setConfirmData({ show: false, servicio: null })
  }

  const confirmDelete = async () => {
    const servicio = confirmData.servicio
    closeConfirm()

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

      showAlert('Eliminando servicio...', 'info')

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
        showAlert('Servicio eliminado correctamente', 'success')
        setServicios((prev) => prev.filter((s) => s.service_id !== servicio.service_id))
      } else {
        showAlert(`Error al eliminar el servicio: ${data.message || 'Error desconocido'}`, 'error')
      }
    } catch (err) {
      console.error('Error eliminando servicio:', err)
      showAlert('Error de conexión con el servidor', 'error')
    }
  }

  // 🔁 Carga de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'))
        const userId = authUser?.id

        const negocios = await fetch('http://localhost:3000/api/public/getCompanys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const neg = await negocios.json()
        const negocio = neg?.data?.negocios || []
        const company = negocio.find((c) => c.user_id === userId)
        const companyIdFound = company?.company_id || company?.id
        setCompanyId(companyIdFound)

        if (!companyIdFound) {
          showAlert('No se encontró negocio registrado', 'error')
          setCargando(false)
          return
        }

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

          const cats = [...new Set(lista.map((s) => s.category_name || 'Sin categoría'))]
          setCategorias(['Todas', ...cats])

          showAlert(`Se cargaron ${lista.length} servicios`, 'success')
        } else {
          showAlert(data.message || 'Error al obtener servicios', 'error')
        }
      } catch (err) {
        console.error('Error backend:', err)
        showAlert('Error de conexión con el servidor', 'error')
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  const serviciosFiltrados = servicios.filter((s) => {
    const coincideTexto = s.title.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria =
      categoriaSeleccionada === 'Todas' || s.category_name === categoriaSeleccionada
    return coincideTexto && coincideCategoria
  })

  const serviciosPorCategoria = serviciosFiltrados.reduce((acc, servicio) => {
    const cat = servicio.category_name || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(servicio)
    return acc
  }, {})

  const handleAddServicio = () => navigate('/add_service')
  const handleAddCategoria = () => navigate('/add_categoria')

  return (
    <div className="servicios-container">
      <h2 className="servicios-title">Servicios por Categoría</h2>

      {serviciosAlert.show && (
        <div className={`servicios-alert alert-${serviciosAlert.type}`}>
          <span>{serviciosAlert.message}</span>
        </div>
      )}

      <div className="servicios-busqueda">
        <Search size={20} color="#555" />
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

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

      {cargando ? (
        <p>Cargando servicios...</p>
      ) : Object.keys(serviciosPorCategoria).length > 0 ? (
        <div className="servicios-list">
          {Object.entries(serviciosPorCategoria).map(([categoria, lista]) => (
            <div key={categoria} className="categoria-section">
              <h3 className="categoria-titulo">{categoria}</h3>

              {lista.map((servicio) => (
                <div key={servicio.service_id} className="servicio-card">
                  <div>
                    <h4 className="servicio-nombreS">{servicio.title}</h4>
                    <p className="servicio-precioS">
                      {servicio.price?.toLocaleString('es-CO') || '0'} COP
                    </p>
                  </div>

                  <div className="servicio-actions">
                    <button className="btn-edit" onClick={() => navigate('/edit_service', { state: { servicio, companyId } })}>
                      <Edit size={18} />
                    </button>

                    <button className="btn-delete" onClick={() => openConfirm(servicio)}>
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

      <div className="floating-buttons">
        <button className="floating-btn secondary" onClick={handleAddCategoria}>
          <Layers size={22} />
        </button>
        <button className="floating-btn primary" onClick={handleAddServicio}>
          <Plus size={24} />
        </button>
      </div>

      {/* === MODAL === */}
      {confirmData.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>¿Eliminar servicio?</h3>
            <p>Se eliminará: <b>{confirmData.servicio?.title}</b></p>

            <div className="modal-buttons">
              <button className="modal-cancel" onClick={closeConfirm}>Cancelar</button>
              <button className="modal-confirm" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}