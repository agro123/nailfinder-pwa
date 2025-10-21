// src/pages/auth/Register.jsx
import React, { useState } from "react";
import AddressList from "./AddressList";
import AddressMap from "./AddressMap";
import { createUser } from "../../services/localDB";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    address: "",
    reference: "",
    password: "", // 👈 nuevo campo
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleRegister = () => {
    createUser(formData);
    alert("Usuario registrado con éxito ✅");
  };

  return (
    <div className="register">
      {step === 1 && (
        <div className="step1">
          <h2>Crear cuenta</h2>
          <input
            type="text"
            placeholder="Nombre y Apellido"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="tel"
            placeholder="Celular"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="">Selecciona género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button onClick={nextStep}>Continuar</button>
        </div>
      )}

      {step === 2 && (
        <AddressList
          onSelect={(address) => {
            setFormData({ ...formData, address });
            nextStep();
          }}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <AddressMap
          address={formData.address}
          onConfirm={(finalAddress) => {
            setFormData({ ...formData, address: finalAddress });
            handleRegister();
          }}
          onBack={prevStep}
        />
      )}
    </div>
  );
}
