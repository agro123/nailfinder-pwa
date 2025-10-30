import React from 'react'
import './css/Clientes.css'
import { Plus } from 'lucide-react' // 👉 para el ícono (+)

const clientes = [
  { id: 1, nombre: 'Juan Pérez', telefono: '321 654 9870', foto: '/img/juan.jpg' },
  { id: 2, nombre: 'María López', telefono: '310 222 1111', foto: '/img/maria.jpg' },
  { id: 3, nombre: 'Carlos Gómez', telefono: '300 888 9999', foto: '/img/carlos.jpg' },
]

export default function Clientes() {
  const handleAddCliente = () => {
    // 👉 Aquí podrías abrir un modal o llamar al backend
    console.log('Agregar nuevo cliente')
  }

  return (
    <div className="clientes-container">
      <h2>Clientes</h2>

      <div className="clientes-lista">
        {clientes.map(c => (
          <div key={c.id} className="cliente-item">
            <img src={c.foto} alt={c.nombre} className="cliente-foto" />
            <div className="cliente-info">
              <div className="cliente-nombre">{c.nombre}</div>
              <div className="cliente-detalles">{c.telefono}</div>
            </div>
            <button className="cliente-btn">Ver perfil</button>
          </div>
        ))}
      </div>

      {/* 🚀 Botón flotante */}
      <button className="floating-add-btn" onClick={handleAddCliente}>
        <Plus size={24} />
      </button>
    </div>
  )
}
