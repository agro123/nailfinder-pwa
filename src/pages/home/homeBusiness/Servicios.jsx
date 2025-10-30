import React from 'react'
import './css/Servicios.css'

export default function ServiciosBusiness() {
  const servicios = [
    { id: 1, nombre: 'Corte de cabello', precio: '$25.000', imagen: '/images/corte.png' },
    { id: 2, nombre: 'Manicure', precio: '$15.000', imagen: '/images/manicure.png' },
    { id: 3, nombre: 'Pedicure', precio: '$18.000', imagen: '/images/pedicure.png' },
    { id: 4, nombre: 'Masaje relajante', precio: '$35.000', imagen: '/images/masaje.png' },
    { id: 5, nombre: 'Tintura de cabello', precio: '$50.000', imagen: '/images/tintura.png' },
  ]

  return (
    <div className="servicios-container">
      <h2 className="servicios-title">Servicios Disponibles</h2>
      <div className="servicios-list">
        {servicios.map((servicio) => (
          <div key={servicio.id} className="servicio-card">
            <img src={servicio.imagen} alt={servicio.nombre} className="servicio-imagen" />
            <div className="servicio-info">
              <h3 className="servicio-nombre">{servicio.nombre}</h3>
              <p className="servicio-precio">{servicio.precio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
