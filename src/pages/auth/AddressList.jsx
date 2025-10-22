import React, { useState } from "react";
import "./AddressList.css";

export default function AddressList({ onSelect, onBack }) {
  const [search, setSearch] = useState("");

  const suggestions = [
    "Cra 57A #27-64 Capri, Cali",
    "8566 Green Rd, New York",
    "3800 Poplar Dr, New York",
    "8080 Railroad St, New York",
  ];

  return (
    <div className="address-list-container">
      <div className="address-box">
        <h2>Selecciona tu dirección</h2>
        <input
          type="text"
          placeholder="Buscar dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul>
          {suggestions
            .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
            .map((s, i) => (
              <li key={i} onClick={() => onSelect(s)}>
                📍 {s}
              </li>
            ))}
        </ul>
        <button onClick={onBack}>Atrás</button>
      </div>
    </div>
  );
}
