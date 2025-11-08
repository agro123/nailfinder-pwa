// src/pages/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressList from "./AddressList";
import AddressMap from "./AddressMap";
import "./css/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    reference: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const [passwordRequirements, setPasswordRequirements] = useState({
  length: false,
  number: false,
  uppercase: false,
  symbol: false,
  });

    const handlePasswordChange = (value) => {
  setFormData({ ...formData, password: value });

  if (!value) {
    // Si el campo está vacío
    setPasswordRequirements({
      length: false,
      number: false,
      uppercase: false,
      symbol: false,
    });
    setErrors((prev) => ({ ...prev, password: "Por favor ingresa una contraseña" }));
    return;
  }

  const newRequirements = {
    length: value.length < 6,
    number: !/\d/.test(value),
    uppercase: !/[A-Z]/.test(value),
    symbol: !/[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  setPasswordRequirements(newRequirements);

  setErrors((prev) => ({
    ...prev,
    password: Object.values(newRequirements).some(Boolean)
      ? "La contraseña no cumple los requisitos"
      : null,
  }));
};





  const handleRegister = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Por favor ingresa tu nombre completo";
    if (!formData.email.includes("@") || !formData.email.includes(".")) newErrors.email = "Correo electrónico inválido";
    if (!formData.password) {
      newErrors.password = "Por favor ingresa una contraseña";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (Object.values(passwordRequirements).some(Boolean)) {
      newErrors.password = "La contraseña no cumple los requisitos";
    }
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Teléfono inválido (7 a 15 dígitos)";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // Si hay errores, no continuar

    try {
      const response = await fetch("http://localhost:3000/api/public/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert("❌ Error: " + (result.message || "Error desconocido"));
        return;
      }

      alert("✅ Registro exitoso");
      navigate("/login");
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  

  const cancelar = () => {
    navigate("/login");
  };

  return (
    <div className="register">
      {step === 1 && (
        <div className="step1">
          <img
            src="/logo.png"   
            alt="Logo NailFinder"
            className="register-logo"
          />
          <h2>Crea Tu Cuenta</h2>
          <input
            type="text"
            placeholder="Nombre Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <input
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
          {errors.email && <span className="error">{errors.email}</span>}
          
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
          <div className="password-requirements">
            {passwordRequirements.length && <span>• Mínimo 6 caracteres</span>}
            {passwordRequirements.number && <span>• Debe contener un número</span>}
            {passwordRequirements.uppercase && <span>• Debe contener una letra mayúscula</span>}
            {passwordRequirements.symbol && <span>• Debe contener un símbolo</span>}
          </div>
          {errors.password && <span className="error">{errors.password}</span>}  {/* <-- Esto falta */}

          <input
            type="tel"
            placeholder="Celular"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}

          <button onClick={handleRegister}>Continuar</button> {/* Cambiado de nextStep a handleRegister */}
          <button onClick={cancelar}>Volver</button>
        </div>
      )}

      {/* {step === 2 && (
        <div className="step2">
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
        <div className="step3">
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
