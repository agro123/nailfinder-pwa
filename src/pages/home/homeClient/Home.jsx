import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [servicios, setServicios] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [todasEmpresas, setTodasEmpresas] = useState([]);

  



  // Filtros


  
const filterCategory = async (categoria) => {
  const nuevaCategoria =
    categoriaSeleccionada === categoria.id ? null : categoria.id;

  console.log("📂 Filtro categoría:", nuevaCategoria, categoria.id);
  setCategoriaSeleccionada(nuevaCategoria);

  if (nuevaCategoria) {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/public/showCategorysCompany?id_company=${encodeURIComponent(nuevaCategoria)}`
      );
      if (res.data.success) {
        setEmpresas(res.data.data.negocios || []);
      }
    } catch (err) {
      console.error("Error al obtener empresas por categoría:", err);
    }
  } else {
    // Si deselecciona la categoría, recargamos todas
    setEmpresas(todasEmpresas);
  }
};





  
const fetchEmpresas = async (nuevaCategoria) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/public/getCompanys?id_category=${encodeURIComponent(nuevaCategoria)}`);
    console.log("📦 Datos recibidos del backend:", res.data);
    if (res.data.success) {
      const negocios = res.data.data.negocios || [];
      setTodasEmpresas(negocios);
      setEmpresas(negocios);
    } else {
      setError("No se pudieron cargar los negocios.");
    }
  } catch (err) {
    console.error("Error al obtener empresas:", err);
    setError("Error al conectar con el servidor.");
  } finally {
    setLoading(false);
  }
};





    useEffect(() => {
      
const fetchCategorias = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/public/showCategorias");
    console.log("🪷 Categorías recibidas:", res.data);

    if (res.data.success) {
      // Obtenemos las categorías del backend
      const categorias = res.data.data.categorias || [];

      // Creamos la categoría "General"
      const categoriaGeneral = {
        id: 0,
        name: "Todas las categorías",
        description: "",
      };

      // Agregamos "General" al inicio del arreglo
      const categoriasFinales = [categoriaGeneral, ...categorias];

      // Guardamos en el estado
      setServicios(categoriasFinales);
    }
  } catch (err) {
    console.error("Error al obtener categorías:", err);
  }
};


      fetchEmpresas(0);
      fetchCategorias();
    }, []);

  // Filtrar según búsqueda
const empresasFiltradas = empresas.filter((e) =>
  e.company_name?.toLowerCase().includes(search.toLowerCase())
);

  // Filtro por tipo de negocio

  const recomendados = empresasFiltradas.filter(
    (e) => (e.bannersgalery?.length > 0 || e.categories?.length > 0) && e.status
  );
  const locales = empresasFiltradas.filter(
    (e) => e.business_type?.toLowerCase() === "local"
  );
  const domicilios = empresasFiltradas.filter(
    (e) => e.business_type?.toLowerCase() === "domicilio"
  );
  

  const handleNavigate = (item) => {
  navigate(`/detalle/${item.company_id}`, { state: { negocio: item } });
};


const fetchEmpresasPorCategoria = async (id_company) => {
  try {
    const res = await axios.get(
      `http://localhost:3000/api/public/showCategorysCompany?id_company=${encodeURIComponent(id_company)}`
    );
    console.log("🏷️ Empresas por categoría:", res.data);

    if (res.data.success) {
      setEmpresas(res.data.data.negocios || []);
    }
  } catch (err) {
    console.error("Error al obtener empresas por categoría:", err);
  }
};

  // Render de tarjeta
  
  const renderCard = (item) => (
    <div
      key={item.company_id}
      className="recommended-card"
      onClick={() => handleNavigate(item)}
    >
      {item.logo_uri && item.logo_uri.trim() !== "" ? (
        <img
          src={item.logo_uri}
          alt={item.company_name}
          className="company-logo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.replaceWith(
              Object.assign(document.createElement("div"), {
                className: "emoji-box small",
                textContent: "🌸",
              })
            );
          }}
        />
      ) : (
        <div className="emoji-box small">🌸</div>
      )}

      <h4>{item.company_name}</h4>

      <p className="business-info">
        {item.business_type?.toLowerCase() === "local" ? (
          item.latitude && item.longitude ? (
            <>
              📍 Lat: {item.latitude}, Lng: {item.longitude}
            </>
          ) : (
            <>📍 Local disponible</>
          )
        ) : item.business_type?.toLowerCase() === "domicilio" ? (
          <>📞 {item.company_phone}</>
        ) : (
          <>🏠 {item.business_type || "Sin tipo"}</>
        )}
      </p>

      <div className="status-container">
        <span
          className={`company-status-dot ${
            item.status ? "active" : "inactive"
          }`}
        ></span>
        <span>{item.status ? "Abierto" : "Cerrado"}</span>
      </div>
    </div>
  );

  return (
    <div className="home-container">
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

      <div className="filters">
        {servicios.length > 0 ? (
          servicios.map((cat, index) => (
            <button
              key={index}
              className={`filter-btn ${categoriaSeleccionada === cat.id ? "active" : ""}`}
onClick={() => fetchEmpresas(cat.id)}

            >
              {cat.nombre || cat.name || cat.categoria}
            </button>
          ))
        ) : (
          <p className="loading-text">Cargando categorías...</p>
        )}
      </div>


      {/* Mostrar estados */}
      {loading && <p className="loading-text">Cargando negocios...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          {/* 🌟 SECCIÓN RECOMENDADOS */}
          {recomendados.length > 0 && (
            <section className="section">
              <h3 className="section-title">⭐ Recomendados</h3>
              <div className="recommended-list scrollable">
                {recomendados.map((item) => renderCard(item))}
              </div>
            </section>
          )}

          {/* 🏠 SECCIÓN LOCALES */}
          {locales.length > 0 && (
            <section className="section">
              <h3 className="section-title">🏠 Locales</h3>
              <div className="recommended-list">
                {locales.map((item) => renderCard(item))}
              </div>
            </section>
          )}

          {/* 🛵 SECCIÓN DOMICILIOS */}
          {domicilios.length > 0 && (
            <section className="section">
              <h3 className="section-title">🚗 Domicilios</h3>
              <div className="recommended-list">
                {domicilios.map((item) => renderCard(item))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
