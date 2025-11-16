import React, { useState, useEffect } from 'react'
import './css/Clientes.css'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function Clientes() {
  const { user } = useAuth()
  const companyId = user?.company?.id

  const [busqueda, setBusqueda] = useState('')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editandoCliente, setEditandoCliente] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', phone: '', email: '', foto: '' })

  // 🔹 Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      if (!companyId) return
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:3000/api/private/company/${companyId}/customers`)
        const data = await res.json()
        if (data.success) setClientes(data.data)
        else console.error('Error cargando clientes:', data.message)
      } catch (err) {
        console.error('Error de conexión al backend:', err)
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

  // 🔹 Abrir modal para crear o editar
  const abrirModal = (cliente = null) => {
    setEditandoCliente(cliente)
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        phone: cliente.phone || '', // ⚠ mapear correctamente
        email: cliente.email || '',
        foto: cliente.foto || ''
      })
    } else {
      setFormData({ nombre: '', phone: '', email: '', foto: '' })
    }
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditandoCliente(null)
    setFormData({ nombre: '', phone: '', email: '', foto: '' })
  }

  // 🔹 Crear o actualizar cliente
  const guardarCliente = async () => {
    if (!formData.nombre || !formData.phone) {
      alert('Nombre y teléfono son obligatorios')
      return
    }

    try {
      let res, data
      if (editandoCliente) {
        // Editar
        res = await fetch(`http://localhost:3000/api/private/company/customer/${editandoCliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            phonenumber: formData.phone, // ✅ ahora sí corresponde
            email: formData.email,
            foto: formData.foto
          })
        })
        data = await res.json()
        if (data.success) {
          setClientes(prev => prev.map(c => c.id === editandoCliente.id ? data.data : c))
        }
      } else {
        // Crear
        res = await fetch(`http://localhost:3000/api/private/company/customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            phonenumber: formData.phone, // ✅ ahora sí corresponde
            email: formData.email,
            foto: formData.foto,
            companyId
          })
        })
        data = await res.json()
        if (data.success) setClientes(prev => [...prev, data.data])
      }
      cerrarModal()
    } catch (err) {
      console.error('Error guardando cliente:', err)
    }
  }

  // 🔹 Eliminar cliente
  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return
    try {
      const res = await fetch(`http://localhost:3000/api/private/company/customer/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) setClientes(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error eliminando cliente:', err)
    }
  }

  return (
    <div className="clientes-container">
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

      {/* 🧍 Lista de clientes */}
      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="clientes-lista">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map(c => (
              <div key={c.id} className="cliente-item">
                <img
                  src={c.foto || '/img/default-user.jpg'}
                  alt={c.nombre}
                  className="cliente-foto"
                />
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

      {/* 🚀 Botón flotante para crear */}
      <button className="floating-add-btn" onClick={() => abrirModal()}>
        <Plus size={24} />
      </button>

      {/* 🔹 Modal Crear/Editar */}
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

            <label>Email</label>
            <input
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />

            <label>Foto (URL)</label>
            <input
              value={formData.foto}
              onChange={e => setFormData(prev => ({ ...prev, foto: e.target.value }))}
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
