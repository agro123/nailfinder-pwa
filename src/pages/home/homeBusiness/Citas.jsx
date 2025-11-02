import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './css/Citas.css'

export default function Citas() {
  const [date, setDate] = useState(new Date())

  // Datos de ejemplo
  const citas = [
    { id: 1, fecha: '2025-10-31', hora: '8:15', cliente: 'Laura Patricia Quintero', servicio: 'Corte y cepillado' },
    { id: 2, fecha: '2025-10-31', hora: '14:00', cliente: 'Javier Montoya', servicio: 'Masaje relajante' },
    { id: 3, fecha: '2025-11-01', hora: '9:30', cliente: 'Lucía Fernández', servicio: 'Manicure' },
  ]

  // Fecha seleccionada formateada
  const fechaSeleccionada = date.toISOString().split('T')[0]
  const citasDia = citas.filter(c => c.fecha === fechaSeleccionada)

  return (
    <div className="citas-page">
      {/* Encabezado */}
      <header className="citas-header">
        <h2>Agenda</h2>
      </header>

      {/* Calendario mensual */}
      <div className="calendar-wrapper">
        <Calendar
          onChange={setDate}
          value={date}
          locale="es-ES"
          className="custom-calendar"
          tileClassName={({ date }) => {
            const fecha = date.toISOString().split('T')[0]
            return citas.some(c => c.fecha === fecha) ? 'has-cita' : null
          }}
        />
      </div>

      {/* Citas del día */}
      <section className="day-agenda">
        <h3>
          {date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </h3>

        {citasDia.length > 0 ? (
          citasDia.map(cita => (
            <div key={cita.id} className="cita-card">
              <div className="cita-hora">{cita.hora}</div>
              <div className="cita-info">
                <strong>{cita.cliente}</strong>
                <p>{cita.servicio}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-citas">
            <p>No hay citas para este día</p>
            <button className="add-btn">+ Agendar cita</button>
          </div>
        )}
      </section>

      {/* Botón flotante */}
      <button className="boton-flotante" onClick={() => alert('Nueva cita')}>
        +
      </button>
    </div>
  )
}
