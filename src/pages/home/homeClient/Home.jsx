import React, { useState } from "react";
import "./css/Home.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Servicios populares (para los filtros)
  const servicios = [
    "Manicure clásico",
    "Pedicure clásico",
    "Esmaltado en gel",
    "Uñas acrílicas",
    "Uñas en gel",
    "Manicure francés",
    "Decoración de uñas",
    "Retiro de gel o acrílico",
  ];

  
  const recomendados = [
    {
      id: 1,
      name: "Barber shop Capri 💈",
      address: "Capri, Cra 77a # 5-49",
      emoji: "💈",
    },
    {
      id: 2,
      name: "Spa el Altar de Relax 💆‍♀️",
      address: "Centro Comercial Unicentro",
      emoji: "💆‍♀️",
    },
    {
      id: 3,
      name: "Salon Beauty 💅",
      address: "Valle del Lili, Jardín Plaza",
      emoji: "💅",
    },
  ];

  const handleNavigate = (id) => {
    navigate(`/detalle/${id}`);
  };

  return (
    <div className="home-container">
      {/* Header con logo y búsqueda */}
      <header className="header">
        <div className="logo">NailFinder</div>
        <input
          type="text"
          placeholder="Buscar servicios o negocios"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {/* Filtros con servicios */}
      <div className="filters">
        {servicios.map((s, index) => (
          <button key={index} className="filter-btn">
            {s}
          </button>
        ))}
      </div>


      {/* Recomendados */}
      <section className="section">
        <h3 className="section-title">Recomendado</h3>
        <div className="recommended-list">
          {recomendados.map((r) => (
            <div
              key={r.id}
              className="recommended-card"
              onClick={() => handleNavigate(r.id)}
            >
              <div className="emoji-box small">{r.emoji}</div>
              <h4>{r.name}</h4>
              <p>{r.address}</p>
            </div>
          ))}
        </div>
      </section>

      
    </div>
  );
}
