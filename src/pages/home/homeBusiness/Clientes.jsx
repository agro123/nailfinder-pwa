import React, { useState } from 'react'
import './css/Clientes.css'
import { Plus, Search } from 'lucide-react' // 👉 íconos

const clientesData = [
  { id: 1, nombre: 'Juan Pérez', telefono: '321 654 9870', foto: '/img/juan.jpg' },
  { id: 2, nombre: 'María López', telefono: '310 222 1111', foto: '/img/maria.jpg' },
  { id: 3, nombre: 'Carlos Gómez', telefono: '300 888 9999', foto: '/img/carlos.jpg' },
  { id: 4, nombre: 'Laura Torres', telefono: '301 765 2233', foto: '/img/laura.jpg' },
]

export default function Clientes() {
  const [busqueda, setBusqueda] = useState('')
  const [clientes] = useState(clientesData)

  const handleAddCliente = () => {
    console.log('Agregar nuevo cliente')
  }

  // 🔍 Filtro de clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

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
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* 🧍 Lista de clientes */}
      <div className="clientes-lista">
        {clientesFiltrados.length > 0 ? (
          clientesFiltrados.map(c => (
            <div key={c.id} className="cliente-item">
              <img src={c.foto} alt={c.nombre} className="cliente-foto" />
              <div className="cliente-info">
                <div className="cliente-nombre">{c.nombre}</div>
                <div className="cliente-detalles">{c.telefono}</div>
              </div>
              <button className="cliente-btn">Ver perfil</button>
            </div>
          ))
        ) : (
          <div className="no-results">No se encontraron clientes</div>
        )}
      </div>

      {/* 🚀 Botón flotante */}
      <button className="floating-add-btn" onClick={handleAddCliente}>
        <Plus size={24} />
      </button>
    </div>
  )
}
