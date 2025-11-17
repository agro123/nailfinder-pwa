import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MapComponent, { MapPicker, MapStatic } from "../../../components/Map";
import "./css/EditProfile.css";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState(null);
  const [formData, setFormData] = useState({
    companyname: "",
    companytype: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // --- ALERTAS ---
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);
  };

  // -------------------------
  // 🔥 MAPA / GEOLOCALIZACIÓN
  // -------------------------

  const [pickedLocation, setPickedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("pending");

  // Puntos de ejemplo cerca (puedes cambiarlos por negocios reales)
  const points = [
    {
      lat: 3.375,
      lng: -76.53,
      label: "Barber shop Capri 💈",
      iconColor: "#e25b7a",
    },
    {
      lat: 3.37,
      lng: -76.535,
      label: "Spa el Altar de Relax 💆‍♀️",
      iconColor: "#e25b7a",
    },
    {
      lat: 3.36,
      lng: -76.52,
      label: "Salon Beauty 💅",
      iconColor: "#e25b7a",
    },
  ];

  const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const { nearbyPoints } = useMemo(() => {
    if (!userLocation) return { nearbyPoints: points };
    const withDist = points.map((p) => ({
      ...p,
      distance: haversine(userLocation.lat, userLocation.lng, p.lat, p.lng),
    }));

    const sorted = withDist.sort((a, b) => a.distance - b.distance);
    const nearby = sorted.filter((p) => p.distance <= 5000);

    return { nearbyPoints: nearby.length ? nearby : sorted.slice(0, 5) };
  }, [points, userLocation]);

  // GEOLOCALIZACIÓN DEL NAVEGADOR
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Cuando el usuario hace click en el mapa, guardamos lat/lng en formData
  const handlePickChange = (ctx) => {
    setPickedLocation({ lat: ctx.lat, lng: ctx.lng });
    setFormData((prev) => ({
      ...prev,
      latitude: ctx.lat,
      longitude: ctx.lng,
    }));
  };

  const center = userLocation || { lat: 3.37, lng: -76.53 };

  // --------------------------
  // Obtener empresa
  // --------------------------
  useEffect(() => {
    const obtener = async () => {
      const authUser = JSON.parse(localStorage.getItem("auth_user"));
      if (!authUser) return;

      const resp = await fetch("http://localhost:3000/api/public/getCompanys");
      const data = await resp.json();

      const company = data?.data?.negocios?.find(
        (c) => c.user_id === authUser.id
      );

      if (company) {
        setCompanyData(company);
        setFormData({
          companyname: company.company_name || "",
          companytype: company.business_type || "",
          phone: company.company_phone || "",
          address: company.company_address || "",
          latitude: company.latitude || "",
          longitude: company.longitude || "",
        });

        if (company.latitude && company.longitude) {
          setPickedLocation({
            lat: Number(company.latitude),
            lng: Number(company.longitude),
          });
        }

        if (company.logo_uri) setLogoPreview(company.logo_uri);
      }
    };

    obtener();
  }, []);

  // --------------------------
  // Guardar empresa
  // --------------------------
  const handleGuardar = async () => {
    if (!formData.companyname.trim()) {
      showAlert("Debes ingresar el nombre del negocio", "warning");
      return;
    }

    const body = {
      id_company: companyData?.company_id || null,
      companyname: formData.companyname,
      companytype: formData.companytype,
      phone: formData.phone,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    const resp = await fetch(
      companyData
        ? "http://localhost:3000/api/public/editCompany"
        : "http://localhost:3000/api/public/setCompanys",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await resp.json();

    if (data.success) {
      showAlert("Datos guardados correctamente", "success");
      setTimeout(() => navigate("/settings"), 1500);
    } else {
      showAlert(data.message || "Error guardando empresa", "error");
    }
  };

  // ============================================
  // =========   RENDER DE LA PÁGINA   ==========
  // ============================================

  return (
    <div className="edit-profile-container">
      <button className="back-button" onClick={() => navigate("/settings")}>
        ← Volver
      </button>

      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <h2>{companyData ? "Editar Negocio" : "Registrar Negocio"}</h2>

      {/* Formulario */}
      <div className="form-group">
        <label>Nombre del negocio</label>
        <input
          type="text"
          name="companyname"
          value={formData.companyname}
          onChange={(e) =>
            setFormData({ ...formData, companyname: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Tipo de negocio</label>
        <input
          type="text"
          name="companytype"
          value={formData.companytype}
          onChange={(e) =>
            setFormData({ ...formData, companytype: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>

      {/* 🔥 MAPA PARA ELEGIR UBICACIÓN */}
      <h3>Ubicación del negocio</h3>
      <p>Haz click en el mapa para seleccionar latitud/longitud.</p>

      <div style={{ height: 300, borderRadius: 12, overflow: "hidden" }}>
        <MapPicker
          value={pickedLocation}
          onChange={handlePickChange}
          center={center}
          zoom={15}
          height="100%"
          width="100%"
          markerColor="#e25b7a"
        />
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Latitud</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            readOnly
          />
        </div>
        <div className="form-group">
          <label>Longitud</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            readOnly
          />
        </div>
      </div>

      <button className="save-button" onClick={handleGuardar}>
        Guardar
      </button>
    </div>
  );
}
