// src/pages/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressList from "./AddressList";
import AddressMap from "./AddressMap";
import "./css/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/public/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
          <h2>Crear cuenta</h2>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value.toLowerCase() })
            }
          />

          <input
            type="tel"
            placeholder="Celular"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

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
