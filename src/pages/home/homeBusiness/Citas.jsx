import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './css/Citas.css'

export default function Citas() {
  const [date, setDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)

  // Datos simulados
  const [citas, setCitas] = useState([
    { id: 1, fecha: '2025-10-31', hora: '08:15', cliente: 'Laura Patricia Quintero', servicio: 'Corte y cepillado', estado: 'pendiente', tipo: 'registrado' },
    { id: 2, fecha: '2025-10-31', hora: '14:00', cliente: 'Javier Montoya', servicio: 'Masaje relajante', estado: 'confirmada', tipo: 'registrado' },
    { id: 3, fecha: '2025-11-01', hora: '09:30', cliente: 'Lucía Fernández', servicio: 'Manicure', estado: 'cancelada', tipo: 'manual' },
  ])

  const [nuevaCita, setNuevaCita] = useState({
    cliente: '',
    telefono: '',
    email: '',
    servicio: '',
    fecha: '',
    hora: '',
    tipo: 'manual'
  })

  const fechaSeleccionada = date.toISOString().split('T')[0]
  const citasDia = citas.filter(c => c.fecha === fechaSeleccionada)

  // Confirmar cita
  const confirmarCita = id => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'confirmada' } : c))
    alert('✅ Cita confirmada. El cliente ha sido notificado.')
  }

  // Cancelar cita
  const cancelarCita = id => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'cancelada' } : c))
    alert('❌ Cita cancelada. El cliente ha sido notificado.')
  }

  // Guardar nueva cita o editar existente
  const guardarCita = e => {
    e.preventDefault()
    if (editando) {
      setCitas(prev =>
        prev.map(c =>
          c.id === editando.id ? { ...c, ...nuevaCita, id: editando.id } : c
        )
      )
      alert('✅ Cita actualizada con éxito.')
      setEditando(null)
    } else {
      const nueva = {
        id: Date.now(),
        ...nuevaCita,
        estado: 'pendiente',
      }
      setCitas(prev => [...prev, nueva])
      alert('📅 Cita registrada correctamente.')
    }
    setNuevaCita({ cliente: '', telefono: '', email: '', servicio: '', fecha: '', hora: '', tipo: 'manual' })
    setShowForm(false)
  }

  // Editar cita existente
  const editarCita = cita => {
    setNuevaCita({ ...cita })
    setEditando(cita)
    setShowForm(true)
  }

  // Eliminar cita completamente
  const eliminarCita = id => {
    if (window.confirm('¿Seguro que deseas eliminar esta cita?')) {
      setCitas(prev => prev.filter(c => c.id !== id))
      alert('🗑️ Cita eliminada correctamente.')
    }
  }

  return (
    <div className="citas-page">
      <header className="citas-header">
        <h2>Agenda</h2>
      </header>

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

      <section className="day-agenda">
        <h3>
          {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>

        {citasDia.length > 0 ? (
          citasDia.map(cita => (
            <div key={cita.id} className={`cita-card estado-${cita.estado}`}>
              <div className="cita-hora">{cita.hora}</div>
              <div className="cita-info">
                <strong>{cita.cliente}</strong>
                <p>{cita.servicio}</p>
                <span className={`estado-tag ${cita.estado}`}>{cita.estado}</span>
                {cita.tipo === 'manual' && <span className="tag-manual">Manual</span>}
              </div>

              <div className="acciones">
                {cita.estado === 'pendiente' && (
                  <button className="btn-confirmar" onClick={() => confirmarCita(cita.id)}>Confirmar</button>
                )}
                {cita.estado !== 'cancelada' && (
                  <button className="btn-cancelar" onClick={() => cancelarCita(cita.id)}>Cancelar</button>
                )}
                <button className="btn-editar" onClick={() => editarCita(cita)}>Editar</button>
                <button className="btn-eliminar" onClick={() => eliminarCita(cita.id)}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-citas">
            <p>No hay citas para este día</p>
          </div>
        )}
      </section>

      <button className="boton-flotante" onClick={() => setShowForm(true)}>+</button>

      {/* FORMULARIO DE NUEVA CITA */}
      {showForm && (
        <div className="modal-fondo">
          <div className="modal">
            <h3>{editando ? 'Editar Cita' : 'Agendar Nueva Cita'}</h3>
            <form onSubmit={guardarCita}>
              <label>Nombre del cliente</label>
              <input type="text" required value={nuevaCita.cliente} onChange={e => setNuevaCita({ ...nuevaCita, cliente: e.target.value })} />

              <label>Teléfono</label>
              <input type="text" required value={nuevaCita.telefono} onChange={e => setNuevaCita({ ...nuevaCita, telefono: e.target.value })} />

              <label>Email (opcional)</label>
              <input type="email" value={nuevaCita.email} onChange={e => setNuevaCita({ ...nuevaCita, email: e.target.value })} />

              <label>Servicio</label>
              <input type="text" required value={nuevaCita.servicio} onChange={e => setNuevaCita({ ...nuevaCita, servicio: e.target.value })} />

              <label>Fecha</label>
              <input type="date" required value={nuevaCita.fecha} onChange={e => setNuevaCita({ ...nuevaCita, fecha: e.target.value })} />

              <label>Hora</label>
              <input type="time" required value={nuevaCita.hora} onChange={e => setNuevaCita({ ...nuevaCita, hora: e.target.value })} />

              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar">{editando ? 'Actualizar' : 'Guardar'}</button>
                <button type="button" className="btn-cancelar" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
