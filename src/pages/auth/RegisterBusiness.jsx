// src/pages/auth/RegisterBusiness.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressList from "./AddressList";
import AddressMap from "./AddressMap";
import "./css/RegisterBusiness.css";

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // "success" | "error"
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyname: "",
    nit: "",
    password: "",
    phone: "",
    profilePhoto: null,
    profilePreview: null,
  });
  
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // --- MANEJAR FOTO ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        profilePhoto: reader.result, // base64
        profilePreview: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar datos mínimos
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setType("error");
        setMessage("⚠️ Completa todos los campos obligatorios.");
        setTimeout(() => setMessage(""), 2500);
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/public/signupCompany", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error en el registro de la empresa");
      }

      setType("success");
      setMessage("✅ Registro completado con éxito.");
      navigate("/login")
      setTimeout(() => {
        setMessage("");
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("❌ Error de conexión o validación:", error);
      setType("error");
      setMessage("❌ No se pudo registrar el negocio.");
      setTimeout(() => setMessage(""), 2500);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelar = () => {
    navigate("/login");
  };

  return (
    <div className="register-container">
      {step === 1 && (
        <div className="form-box step1">
          <img
            src="/logo.png"   
            alt="Logo NailFinder"
            className="registerbusiness-logo"
          />
          <h2 className="form-title">Registro de Manicurista</h2>

          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
          
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={formData.companyname}
            onChange={(e) => setFormData({ ...formData, companyname: e.target.value })}
            className="form-input"
          />

          <input
            type="text"
            placeholder="NIT"
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            className="form-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="form-input"
          />

          <input
            type="tel"
            placeholder="Teléfono de contacto"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-input"
          />

          <div className="form-section">
            <label className="form-label">Foto de perfil (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
            {formData.profilePreview && (
              <img
                src={formData.profilePreview}
                alt="preview"
                className="profile-preview"
              />
            )}
          </div>

          <div className="button-group">
            <button className="form-button" onClick={handleRegister}>
              Continuar
            </button> {/* Cambiado de nextStep a handleRegister */}
            <button className="form-button cancel" onClick={cancelar}>
              Volver
            </button>
          </div>
        </div>
      )}

      {/* {step === 2 && (
        <div className="form-box step2">
          <h2 className="form-title">Configurar negocio</h2>

          <input
            type="text"
            placeholder="Nombre del negocio"
            value={formData.businessName}
            onChange={(e) =>
              setFormData({ ...formData, businessName: e.target.value })
            }
            className="form-input"
          />

          <input
            type="text"
            placeholder="Número de NIT"
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            className="form-input"
          />

          <AddressList
            onSelect={(address) => {
              setFormData({ ...formData, address });
              nextStep();
            }}
            onBack={prevStep}
          />
        </div>
      )}

      {step === 3 && (
        <div >
          <AddressMap
            address={formData.address}
            onConfirm={(finalAddress) => {
              setFormData({ ...formData, address: finalAddress });
              handleRegister();
            }}
            onBack={prevStep}
          />
        </div>
      )} */}
    </div>
  );
}
