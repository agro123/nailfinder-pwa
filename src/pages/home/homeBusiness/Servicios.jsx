import React, { useState } from 'react'
import './css/Servicios.css'
import { Plus, Layers, Search } from 'lucide-react' // 👉 iconos (usa cualquier otro de lucide-react)

export default function ServiciosBusiness() {
  const [busqueda, setBusqueda] = useState('')

  // Lista de servicios de uñas 💅
  const servicios = [
    { id: 1, nombre: 'Manicure clásico', precio: '$15.000' },
    { id: 2, nombre: 'Pedicure clásico', precio: '$18.000' },
    { id: 3, nombre: 'Esmaltado en gel', precio: '$25.000' },
    { id: 4, nombre: 'Uñas acrílicas', precio: '$60.000' },
    { id: 5, nombre: 'Uñas en gel', precio: '$55.000' },
    { id: 6, nombre: 'Manicure francés', precio: '$22.000' },
    { id: 7, nombre: 'Decoración de uñas', precio: '$10.000' },
    { id: 8, nombre: 'Retiro de gel o acrílico', precio: '$8.000' },
  ]

  // 🔍 Filtros y handlers
  const serviciosFiltrados = servicios.filter(s =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleAddServicio = () => {
    console.log('Agregar nuevo servicio')
  }

  const handleAddCategoria = () => {
    console.log('Agregar nueva categoría')
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

      {/* 🧾 Lista de servicios */}
      <div className="servicios-list">
        {serviciosFiltrados.length > 0 ? (
          serviciosFiltrados.map((servicio) => (
            <div key={servicio.id} className="servicio-card">
              <div className="servicio-info">
                <h3 className="servicio-nombre">{servicio.nombre}</h3>
                <p className="servicio-precio">{servicio.precio}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="sin-resultados">No se encontraron servicios</p>
        )}
      </div>

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
