// src/pages/auth/RegisterBusiness.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressList from "./AddressList";
import AddressMap from "./AddressMap";
import { createUser, findUserByEmail } from "../../services/localDB";
import "./RegisterBusiness.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    nit: "",
    password: "",
    phone: "",
    profilePhoto: null, // guardamos base64 o nombre según preferencia
    profilePreview: null, // para mostrar vista previa
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
  // --- MANEJAR SELECCIÓN DE IMAGEN (opcional) ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData({ ...formData, profilePhoto: null, profilePreview: null });
      return;
    }
    // Opcional: guardar base64 en localStorage (útil para mostrar después)
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

  const handleRegister = () => {
    const userToSave = {
      name: formData.name,
      email: formData.email,
      businessName: formData.businessName,
      nit: formData.nit,
      password: formData.password,
      phone: formData.phone,
      profilePhoto: formData.profilePhoto, // base64 o null
      createdAt: new Date().toISOString(),
    };

    createUser(userToSave);
    alert("✅ Registro completado con éxito.");
    navigate("/login");
  };

  const cancelar = () => {
    navigate("/login");
  };

return (
    <div className="register-container">
      {step === 1 && (
        <div className="form-box step1">
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
            <button className="form-button" onClick={nextStep}>
              Continuar
            </button>
            <button className="form-button cancel" onClick={cancelar}>
              Volver
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
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
      )}
    </div>
  );
}
