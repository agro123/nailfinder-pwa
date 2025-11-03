import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./css/CitasUsuario.css";

export default function CitasUsuario() {

  // Lista de citas del usuario (con servicios reales)
  const [citasusuario] = useState([
    {
      id: 1,
      negocio: "NailFinder Studio 💅",
      servicio: "Manicure clásico",
      fecha: "Jueves, 20 de junio de 2024",
      hora: "10:00 AM - 11:00 AM",
      estado: "Confirmada",
    },
    {
      id: 2,
      negocio: "NailFinder Studio 💅",
      servicio: "Pedicure clásico",
      fecha: "Viernes, 21 de junio de 2024",
      hora: "02:00 PM - 03:00 PM",
      estado: "Pendiente",
    },
    {
      id: 3,
      negocio: "NailFinder Studio 💅",
      servicio: "Esmaltado en gel",
      fecha: "Sábado, 22 de junio de 2024",
      hora: "09:00 AM - 10:00 AM",
      estado: "Confirmada",
    },
    {
      id: 4,
      negocio: "NailFinder Studio 💅",
      servicio: "Uñas acrílicas",
      fecha: "Domingo, 23 de junio de 2024",
      hora: "11:00 AM - 12:00 PM",
      estado: "Pendiente",
    },
  ]);

  return (
    <div className="citasusuario-container">
      <header className="citasusuario-header">
        <h2>Mis citas</h2>
      </header>

      {citasusuario.length === 0 ? (
        <p className="no-citasusuario">No tienes citas agendadas.</p>
      ) : (
        <div className="citasusuario-list">
          {citasusuario.map((cita) => (
            <div key={cita.id} className="citasusuario-card">
              <div className="citasusuario-info">
                <h3>{cita.negocio}</h3>
                <p className="servicio">{cita.servicio}</p>
                <p className="fecha">{cita.fecha}</p>
                <p className="hora">{cita.hora}</p>
                <p
                  className={`estado ${
                    cita.estado === "Confirmada"
                      ? "confirmada"
                      : "pendiente"
                  }`}
                >
                  {cita.estado}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
