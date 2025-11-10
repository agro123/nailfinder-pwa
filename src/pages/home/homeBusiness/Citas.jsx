import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './css/Citas.css'

export default function Citas() {
  const { user } = useAuth()
  const [date, setDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(false)
  const [accionEnProceso, setAccionEnProceso] = useState(false)

  // 🔹 Campos de nueva cita
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')
  const [hora, setHora] = useState('')
  const [servicio, setServicio] = useState('')
  const [serviciosDisponibles, setServiciosDisponibles] = useState([])
  const [horariosDisponibles, setHorariosDisponibles] = useState([])

  const companyId = user.company?.id
  const branchId = user.mainBranch?.id
  const userId = user?.id

  // === Obtener citas (mantener tu versión actual) ===
  useEffect(() => {
    const obtenerCitas = async () => {
      setLoading(true)
      try {
        const fecha = date.toISOString().split('T')[0]
        console.log("Fecha seleccionada:", fecha)

        // Detectar si es compañía o cliente
        const branchId = user.mainBranch?.id
        const companyId = user.company?.id
        const userId = user?.id

        // Elegir endpoint según tipo de usuario
        let url = ''
        if (companyId) {
          url = `http://localhost:3000/api/private/companyAppointments?companyId=${companyId}&date=${fecha}`
        } else {
          url = `http://localhost:3000/api/private/clientAppointments?clientId=${userId}&date=${fecha}`
        }

        const res = await fetch(url)
        const data = await res.json()
        console.log("Citas recibidas:", data)

        if (data.success) {
          // Convertimos { "2025-11-06": [ ... ] } a un array plano
          const citasArray = Object.entries(data.data).flatMap(([fecha, citas]) =>
            citas
              // Filtrar por branch si es compañía
              .filter(c => !companyId || c.branchid === branchId)
              .map(c => ({
                id: c.id,
                fecha,
                hora: c.startat?.slice(0, 5) || '00:00',
                cliente: companyId
                  ? `Cliente ${c.clientid}`
                  : `Empleado ${c.employeeid}`,
                servicio: Array.isArray(c.services)
                  ? c.services.map(s => s.title).join(', ')
                  : 'Sin servicio',
                estado:
                  c.status === 1
                    ? 'pendiente'
                    : c.status === 2
                    ? 'confirmada'
                    : c.status === 98
                    ? 'cancelada'
                    : c.status === 99
                    ? 'negada'
                    : 'otro',
                tipo: 'api'
              }))
          )

          setCitas(citasArray)
        } else {
          console.error('Error al cargar citas:', data)
        }
      } catch (err) {
        console.error('Error al obtener citas:', err)
      } finally {
        setLoading(false)
      }
    }

    obtenerCitas()
  }, [date, user])

  // === Cargar servicios ===
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const negociosResp = await fetch("http://localhost:3000/api/public/getCompanys")
        const negociosData = await negociosResp.json()
        const company = negociosData?.data?.negocios?.find((c) => c.user_id === userId)
        const companyIdFound = company?.company_id || company?.id
        if (!companyIdFound) return

        const serviciosResp = await fetch(
          `http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`
        )
        const serviciosData = await serviciosResp.json()
        if (serviciosData.success && serviciosData.data?.servicios) {
          setServiciosDisponibles(serviciosData.data.servicios)
        }
      } catch (err) {
        console.error("Error al obtener servicios:", err)
      }
    }
    cargarServicios()
  }, [userId])

  // === Cargar horarios disponibles ===
  useEffect(() => {
    const cargarHorarios = async () => {
      if (!servicio || !userId || !companyId) return
      try {
        const fechaISO = date.toISOString().split('T')[0]
        const url = `http://localhost:3000/api/public/getAvailableHours?date=${fechaISO}&serviceId=${servicio}&userId=${userId}&companyId=${companyId}`
        console.log("🗓️ Solicitando disponibilidad:", url)

        const response = await fetch(url)
        const result = await response.json()
        console.log("📥 Respuesta getAvailableHours:", result)

        if (result.success) {
          const diaData = (result.data || []).find(d => d.date === fechaISO)
          setHorariosDisponibles(diaData?.availableHours || [])
        }
      } catch (err) {
        console.error("Error al cargar horarios:", err)
      }
    }
    cargarHorarios()
  }, [servicio, date, userId, companyId])

  const fechaSeleccionada = date.toISOString().split('T')[0]
  const citasDia = citas.filter(c => c.fecha === fechaSeleccionada)

  // === Cambiar estado de cita (mantener igual) ===
  const cambiarEstadoCita = async (id, nuevoEstado) => {
    setAccionEnProceso(true)
    try {
      const res = await fetch('http://localhost:3000/api/private/changeAppointmentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status: nuevoEstado }),
      })
      const data = await res.json()
      if (data.success) {
        setCitas(prev =>
          prev.map(c =>
            c.id === id
              ? {
                  ...c,
                  estado:
                    nuevoEstado === 1
                      ? 'pendiente'
                      : nuevoEstado === 2
                      ? 'confirmada'
                      : nuevoEstado === 98
                      ? 'cancelada'
                      : nuevoEstado === 99
                      ? 'negada'
                      : c.estado,
                }
              : c
          )
        )
        alert('✅ Estado de cita actualizado correctamente.')
      } else {
        alert('❌ Error al cambiar el estado de la cita.')
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('⚠️ Error de conexión con el servidor.')
    } finally {
      setAccionEnProceso(false)
    }
  }

  // === Crear nueva cita (igual que antes, solo se usa hora del selector) ===
  const crearCita = async () => {
    if (!clienteNombre || !clienteTelefono || !hora || !servicio) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    try {
      setAccionEnProceso(true)
      const body = {
        clientData: {
          name: clienteNombre,
          phone: clienteTelefono,
          email: clienteEmail || null,
        },
        employeeId: userId,
        branchId: branchId,
        date: fechaSeleccionada,
        startAt: hora,
        endAt: calcularHoraFin(hora, 60),
        services: [parseInt(servicio)],
      }

      const res = await fetch('http://localhost:3000/api/public/createAppointmentGuest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        alert('✅ Cita creada exitosamente.')
        setShowForm(false)
        setClienteNombre('')
        setClienteTelefono('')
        setClienteEmail('')
        setHora('')
        setServicio('')
        setHorariosDisponibles([])
      } else {
        alert('❌ No se pudo crear la cita.')
      }
    } catch (err) {
      console.error('Error creando cita:', err)
    } finally {
      setAccionEnProceso(false)
    }
  }

  const calcularHoraFin = (inicio, duracionMin) => {
    const [h, m] = inicio.split(':').map(Number)
    const d = new Date(0, 0, 0, h, m + duracionMin)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
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

        {loading ? (
          <p>Cargando citas...</p>
        ) : citasDia.length > 0 ? (
          citasDia.map(cita => (
            <div key={cita.id} className={`cita-card estado-${cita.estado}`}>
              <div className="cita-hora">{cita.hora}</div>
              <div className="cita-info">
                <strong>{cita.cliente}</strong>
                <p>{cita.servicio}</p>
                <span className={`estado-tag ${cita.estado}`}>{cita.estado}</span>
              </div>

              <div className="acciones">
                {cita.estado === 'pendiente' ? (
                  <>
                    <button
                      className="btn-confirmar"
                      onClick={() => cambiarEstadoCita(cita.id, 2)}
                    >
                      Confirmar
                    </button>
                    <button
                      className="btn-cancelar"
                      onClick={() => cambiarEstadoCita(cita.id, 98)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className="btn-disabled" disabled>
                    {cita.estado === 'confirmada'
                      ? 'Confirmada'
                      : cita.estado === 'cancelada'
                      ? 'Cancelada'
                      : 'Sin acción'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="sin-citas">
            <p>No hay citas para este día</p>
          </div>
        )}
      </section>

      {/* 🔹 Botón flotante moderno */}
      <button className="btn-flotante" onClick={() => setShowForm(true)}>
        + Nueva Cita
      </button>

      {/* Modal Nueva Cita */}
      {showForm && (
        <div className="overlay">
          <div className="modal-cita">
            <h3>Nueva Cita - {fechaSeleccionada}</h3>

            <label>Nombre *</label>
            <input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} />

            <label>Teléfono *</label>
            <input value={clienteTelefono} onChange={e => setClienteTelefono(e.target.value)} />

            <label>Email</label>
            <input value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} />

            <label>Servicio *</label>
            <select value={servicio} onChange={e => setServicio(e.target.value)}>
              <option value="">Selecciona un servicio</option>
              {serviciosDisponibles.map(s => (
                <option key={s.service_id} value={s.service_id}>
                  {s.title}
                </option>
              ))}
            </select>

            <label>Horario disponible *</label>
            <select value={hora} onChange={e => setHora(e.target.value)}>
              <option value="">Selecciona un horario</option>
              {horariosDisponibles.length > 0 ? (
                horariosDisponibles.map((h, i) => <option key={i}>{h}</option>)
              ) : (
                <option disabled>No hay horarios</option>
              )}
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowForm(false)} className="btn-cancelar">Cancelar</button>
              <button onClick={crearCita} className="btn-confirmar">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {accionEnProceso && (
        <div className="overlay">
          <div className="modal-cargando">
            <div className="spinner"></div>
            <p>Procesando acción, por favor espera...</p>
          </div>
        </div>
      )}
    </div>
  )
}
