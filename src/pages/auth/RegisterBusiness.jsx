// src/pages/auth/RegisterBusiness.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressMap from "./AddressMap";
import "./css/RegisterBusiness.css";
import AddressList from "./AddressList";
import BusinessLocation from "./BusinessLocation";

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); 
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyname: "",
    nit: "",
    password: "",
    phone: "",
    address: "",
    companytype: "",
    profilePhoto: null,
    profilePreview: null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // --- MANEJO DE FOTO ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        profilePhoto: {
          nombre: file.name,
          type: file.type,
          size: file.size,
          data: reader.result.split(",")[1],
        },
        profilePreview: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.phone.trim()
    ) {
      setType("error");
      setMessage("⚠️ Completa todos los campos obligatorios.");
      setTimeout(() => setMessage(""), 2500);
      return false;
    }

    return true;
  };

  const handleRegister = async (dataToSend = formData) => {
    setLoading(true);
    try {
      console.log("📦 Datos enviados al backend:", {
        name: dataToSend.name,
        email: dataToSend.email.toLowerCase(),
        password: dataToSend.password,
        phone: dataToSend.phone,
        companyname: dataToSend.companyname,
        nit: dataToSend.nit || null,
        companytype: dataToSend.companytype,
        address: dataToSend.address,
        logo: dataToSend.profilePhoto || null,
      });

      const response = await fetch(
        "http://localhost:3000/api/public/signupCompany",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToSend.name,
            email: dataToSend.email.toLowerCase(),
            password: dataToSend.password,
            phone: dataToSend.phone,
            companyname: dataToSend.companyname,
            nit: dataToSend.nit || null,
            companytype: dataToSend.companytype,
            address: dataToSend.address,
            logo: dataToSend.profilePhoto || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error en el registro de la empresa");
      }

      setType("success");
      setMessage("✅ Registro completado con éxito.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("❌ Error de conexión o validación:", error);
      setType("error");
      setMessage("❌ No se pudo registrar el negocio.");
      setTimeout(() => setMessage(""), 2500);
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => navigate("/login");

  return (
    <div className="business-register-container">

      {step === 1 && (
        <div className="business-form step-basic">
          <img
            src="/logo.png"
            alt="Logo NailFinder"
            className="business-logo"
          />

          <h2 className="business-title">Registro de Manicurista</h2>

          {message && (
            <div className={`notification ${type === "error" ? "error" : ""}`}>
              {message}
            </div>
          )}

          {/* Logo */}
          <div className="logo-section">
            <div className="logo-preview-container">
              {formData.profilePreview ? (
                <img
                  src={formData.profilePreview}
                  alt="Logo del negocio"
                  className="logo-preview"
                />
              ) : (
                <div className="logo-placeholder">Sin logo</div>
              )}
            </div>

            <label htmlFor="logoInput" className="btn-editar-logo">
              {formData.profilePreview ? "Cambiar Logo" : "Subir Logo"}
            </label>

            <input
              id="logoInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="business-input"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value.toLowerCase(),
              })
            }
            className="business-input"
          />

          <input
            type="text"
            placeholder="Nombre del negocio"
            value={formData.companyname}
            onChange={(e) =>
              setFormData({ ...formData, companyname: e.target.value })
            }
            className="business-input"
          />

          <input
            type="text"
            placeholder="NIT"
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            className="business-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="business-input"
          />

          <input
            type="tel"
            placeholder="Teléfono de contacto"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="business-input"
          />

          <div className="business-buttons">
            <button
              className="business-btn primary-btn"
              onClick={() => {
                if (validateStep1()) {
                  nextStep();
                }
              }}
            >
              Continuar
            </button>

            <button className="business-btn cancel-btn" onClick={cancelar}>
              Volver
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="business-form step-location">
          <BusinessLocation
            onNext={(data) => {
              const updatedData = {
                ...formData,
                companytype: data.companytype,
                address: data.address,
                latitude: data.location ? data.location.lat : null,
                longitude: data.location ? data.location.lng : null,
              };

              setFormData(updatedData);
              handleRegister(updatedData);
            }}
            onBack={prevStep}
            setType={setType}
            setMessage={setMessage}
            message={message}
            type={type}
          />
        </div>
      )}
    </div>
  );
}
