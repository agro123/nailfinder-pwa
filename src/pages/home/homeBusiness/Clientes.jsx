import React, { useState, useEffect } from 'react'
import './css/Clientes.css'
import { Plus, Search, Edit2, Trash2, Camera, X } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function Clientes() {
  const { user } = useAuth()
  const companyId = user?.company?.id

  const [busqueda, setBusqueda] = useState('')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editandoCliente, setEditandoCliente] = useState(null)

  // === ALERTAS ===
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type })
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' })
    }, 4000)
  }

  // === FORM ===
  const [formData, setFormData] = useState({
    nombre: '',
    phone: '',
    email: '',
    foto: '',
    fotoPreview: '',
  })

  // 🔹 Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      if (!companyId) return
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:3000/api/private/company/${companyId}/customers`)
        const data = await res.json()
        if (data.success) setClientes(data.data)
        else showAlert('Error cargando clientes', 'error')
      } catch (err) {
        showAlert('Error de conexión con el servidor', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [companyId])

  // 🔹 Filtrado
  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // === Manejo de imagen ===
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const base64 = String(dataUrl).split(',')[1]

      setFormData(prev => ({
        ...prev,
        fotoPreview: dataUrl,
        foto: base64,
      }))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, foto: '', fotoPreview: '' }))
  }

  const getPhotoUrlForList = (cliente) => {
    if (cliente.foto) {
      if (cliente.foto.startsWith('http') || cliente.foto.startsWith('/')) return cliente.foto
      return `data:image/png;base64,${cliente.foto}`
    }
    return '/img/default-user.jpg'
  }

  // Abrir modal
  const abrirModal = (cliente = null) => {
    setEditandoCliente(cliente)
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        phone: cliente.phone,
        email: cliente.email || '',
        foto: cliente.foto || '',
        fotoPreview: cliente.foto ? (cliente.foto.startsWith('http') || cliente.foto.startsWith('/') 
          ? cliente.foto 
          : `data:image/png;base64,${cliente.foto}`) : ''
      })
    } else {
      setFormData({ nombre: '', phone: '', email: '', foto: '', fotoPreview: '' })
    }
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditandoCliente(null)
    setFormData({ nombre: '', phone: '', email: '', foto: '', fotoPreview: '' })
  }

  // GUARDAR CLIENTE (crear o editar)
  const guardarCliente = async () => {
    if (!formData.nombre || !formData.phone) {
      showAlert('Nombre y teléfono son obligatorios', 'error')
      return
    }

    try {
      let res, data

      if (editandoCliente) {
        res = await fetch(`http://localhost:3000/api/private/company/customer/${editandoCliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            phonenumber: formData.phone,
            email: formData.email,
            foto: formData.foto
          })
        })
        data = await res.json()

        if (data.success) {
          setClientes(prev => prev.map(c => c.id === editandoCliente.id ? data.data : c))
          showAlert('Cliente actualizado correctamente', 'success')
        } else showAlert('Error actualizando el cliente', 'error')

      } else {
        res = await fetch(`http://localhost:3000/api/private/company/customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            phonenumber: formData.phone,
            email: formData.email,
            foto: formData.foto,
            companyId
          })
        })
        data = await res.json()

        if (data.success) {
          setClientes(prev => [...prev, data.data])
          showAlert('Cliente creado exitosamente', 'success')
        } else showAlert('Error creando el cliente', 'error')
      }

      cerrarModal()

    } catch (err) {
      showAlert('Error guardando cliente', 'error')
    }
  }

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return

    try {
      const res = await fetch(`http://localhost:3000/api/private/company/customer/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setClientes(prev => prev.filter(c => c.id !== id))
        showAlert('Cliente eliminado', 'success')
      }
    } catch {
      showAlert('Error eliminando cliente', 'error')
    }
  }

  return (
    <div className="clientes-container">

      {/* === ALERTA === */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <h2>Clientes</h2>

      {/* 🔎 Barra de búsqueda */}
      <div className="search-bar">
        <Search size={20} color="#555" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* LISTA */}
      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="clientes-lista">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map(c => (
              <div key={c.id} className="cliente-item">
                <img src={getPhotoUrlForList(c)} alt={c.nombre} className="cliente-foto" />

                <div className="cliente-info">
                  <div className="cliente-nombre">{c.nombre}</div>
                  <div className="cliente-detalles">{c.phone}</div>
                  {c.email && <div className="cliente-detalles">{c.email}</div>}
                </div>

                <div className="acciones-cliente">
                  <button className="btn-editar" onClick={() => abrirModal(c)}>
                    <Edit2 size={16} /> Editar
                  </button>
                  <button className="btn-eliminar" onClick={() => eliminarCliente(c.id)}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No se encontraron clientes</div>
          )}
        </div>
      )}

      {/* Botón flotante */}
      <button className="floating-add-btn" onClick={() => abrirModal()}>
        <Plus size={24} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="overlay">
          <div className="modal-cliente">
            <h3>{editandoCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>

            <label>Nombre *</label>
            <input
              value={formData.nombre}
              onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            />

            <label>Teléfono *</label>
            <input
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />

            <label>Email *</label>
            <input
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />

            <div className="modal-actions">
              <button onClick={cerrarModal} className="btn-cancelar">Cancelar</button>
              <button onClick={guardarCliente} className="btn-confirmar">
                {editandoCliente ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
