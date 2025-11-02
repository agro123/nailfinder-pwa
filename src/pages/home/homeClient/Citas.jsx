import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './css/Citas.css'

export default function Citas() {
  const [date, setDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // "calendar" | "day"

  // Citas de ejemplo
  const [citas, setCitas] = useState([
    { fecha: '2025-10-31', hora: '10:00', cliente: 'Ana Torres' },
    { fecha: '2025-10-31', hora: '14:00', cliente: 'Carlos Gómez' },
    { fecha: '2025-11-01', hora: '09:30', cliente: 'Lucía Fernández' }
  ])

  // Fecha actual seleccionada (YYYY-MM-DD)
  const fechaSeleccionada = date.toISOString().split('T')[0]
  const citasDia = citas.filter(c => c.fecha === fechaSeleccionada)

  // Horas del día (de 8:00 a 20:00)
  const horas = Array.from({ length: 13 }, (_, i) => `${8 + i}:00`)

  return (
    <div className="citas-page">
      <h2>Agenda de Citas</h2>

      {/* Selector de modo de vista */}
      <div className="view-toggle">
        <button
          className={viewMode === 'calendar' ? 'active' : ''}
          onClick={() => setViewMode('calendar')}
        >
          📅 Calendario
        </button>
        <button
          className={viewMode === 'day' ? 'active' : ''}
          onClick={() => setViewMode('day')}
        >
          ⏰ Día
        </button>
      </div>

      {/* Vista de calendario */}
      {viewMode === 'calendar' && (
        <div className="calendar-container">
          <Calendar onChange={setDate} value={date} />
        </div>
      )}

      {/* Vista diaria */}
      {viewMode === 'day' && (
        <div className="day-view">
          <h3>{date.toLocaleDateString()}</h3>
          <div className="hours-grid">
            {horas.map((h, i) => {
              const cita = citasDia.find(c => c.hora === h)
              return (
                <div key={i} className={`hour-block ${cita ? 'busy' : ''}`}>
                  <span className="hour-label">{h}</span>
                  {cita ? (
                    <div className="cita">
                      <strong>{cita.cliente}</strong>
                      <small>{cita.hora}</small>
                    </div>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => alert(`Agregar cita a las ${h}`)}
                    >
                      + Agendar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
