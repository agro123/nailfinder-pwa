// src/pages/auth/RegisterBusiness.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
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

  // Estados para errores de validación en tiempo real
  const [errores, setErrores] = useState({
    name: "",
    email: "",
    companyname: "",
    nit: "",
    password: "",
    phone: "",
    profilePhoto: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyname: "",
    nit: "",
    password: "",
    phone: "",
    address: "",
    companytype: "",
    latitude: null,
    longitude: null,
    radio: null,
    profilePhoto: null,
    profilePreview: null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // --- VALIDACIONES EN TIEMPO REAL ---
  const validarNombre = (nombre) => {
    if (!nombre.trim()) return "El nombre completo es obligatorio";
    if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres";
    if (nombre.length > 50) return "El nombre es demasiado largo";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return "Solo se permiten letras y espacios";
    return "";
  };

  const validarEmail = (email) => {
    if (!email.trim()) return "El correo electrónico es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Ingresa un correo electrónico válido";
    return "";
  };

  const validarNombreNegocio = (nombre) => {
    if (!nombre.trim()) return "El nombre del negocio es obligatorio";
    if (nombre.length < 2) return "El nombre del negocio debe tener al menos 2 caracteres";
    if (nombre.length > 100) return "El nombre del negocio es demasiado largo";
    return "";
  };

  const validarNIT = (nit) => {
    if (nit && !/^\d{5,15}$/.test(nit.replace(/\s/g, ''))) {
      return "El NIT debe contener solo números (5-15 dígitos)";
    }
    return "";
  };

  const validarPassword = (password) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 8) return "La contraseña debe tener al menos 6 caracteres";
    if (password.length > 50) return "La contraseña es demasiado larga";
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return "La contraseña debe contener mayúsculas y minúsculas";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "La contraseña debe contener al menos un número";
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      return "La contraseña debe contener al menos un símbolo (!@#$%^&* etc.)";
    }
    return "";
  };

  const validarTelefono = (telefono) => {
    if (!telefono.trim()) return "El teléfono es obligatorio";
    const telefonoRegex = /^[\d\s+\-()]{10,15}$/;
    if (!telefonoRegex.test(telefono)) return "Ingresa un número de teléfono válido";
    if (telefono.replace(/\D/g, '').length < 10) return "El teléfono debe tener al menos 10 dígitos";
    return "";
  };

  const validarLogo = (logo) => {
    if (!logo) return "El logo del negocio es obligatorio";
    return "";
  };

  // --- MANEJADORES DE CAMBIOS CON VALIDACIÓN ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrores(prev => ({
        ...prev,
        profilePhoto: "Solo se permiten archivos de imagen"
      }));
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrores(prev => ({
        ...prev,
        profilePhoto: "La imagen no debe superar los 5MB"
      }));
      return;
    }

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
      
      // Limpiar error de logo
      setErrores(prev => ({
        ...prev,
        profilePhoto: ""
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (campo, valor) => {
    // Actualizar el formulario
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Validar en tiempo real
    let error = "";
    switch (campo) {
      case 'name':
        error = validarNombre(valor);
        break;
      case 'email':
        error = validarEmail(valor);
        break;
      case 'companyname':
        error = validarNombreNegocio(valor);
        break;
      case 'nit':
        error = validarNIT(valor);
        break;
      case 'password':
        error = validarPassword(valor);
        break;
      case 'phone':
        error = validarTelefono(valor);
        break;
      default:
        break;
    }

    setErrores(prev => ({
      ...prev,
      [campo]: error
    }));
  };

  // --- VALIDACIÓN GENERAL DEL FORMULARIO ---
  const validarFormularioCompleto = () => {
    const nuevosErrores = {
      name: validarNombre(formData.name),
      email: validarEmail(formData.email),
      companyname: validarNombreNegocio(formData.companyname),
      nit: validarNIT(formData.nit),
      password: validarPassword(formData.password),
      phone: validarTelefono(formData.phone),
      profilePhoto: validarLogo(formData.profilePhoto)
    };

    setErrores(nuevosErrores);

    // Verificar si hay algún error
    const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
    
    if (hayErrores) {
      Swal.fire({
        title: "Errores en el formulario",
        text: "Por favor corrige los errores marcados en rojo antes de continuar.",
        icon: "error",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      });
      return false;
    }

    return true;
  };

  const validateStep1 = () => {
    return validarFormularioCompleto();
  };

  const handleRegister = async (dataToSend = formData) => {
    setLoading(true);
    try {
      // Construir el payload base
      const payload = {
        name: dataToSend.name,
        email: dataToSend.email.toLowerCase(),
        password: dataToSend.password,
        phone: dataToSend.phone,
        companyname: dataToSend.companyname,
        nit: dataToSend.nit || null,
        companytype: dataToSend.companytype,
        address: dataToSend.address,
        logo: dataToSend.profilePhoto || null,
        latitude: dataToSend.latitude,
        longitude: dataToSend.longitude,
      };

      // Solo agregar radio si el tipo es domicilio
      if (dataToSend.companytype === 'domicilio' && dataToSend.radio) {
        payload.radio = dataToSend.radio;
      }

      console.log("📦 Datos enviados al backend:", payload);

      const response = await fetch(
        "http://localhost:3000/api/public/signupCompany",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error en el registro de la empresa");
      }

      Swal.fire({
        title: "¡Registro exitoso! 🎉",
        text: "✅ Tu negocio ha sido registrado correctamente.",
        icon: "success",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("❌ Error de conexión o validación:", error);
      Swal.fire({
        title: "Error en el registro",
        text: "❌ No se pudo registrar el negocio. Por favor, intenta nuevamente.",
        icon: "error",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => {
    Swal.fire({
      title: "¿Cancelar registro?",
      text: "Si cancelas, perderás toda la información ingresada. ¿Estás seguro de que deseas volver al login?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar registro",
      draggable: true,
      customClass: {
        confirmButton: 'boton-alert-agenda',
        cancelButton: 'boton-alert-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  // Función para determinar la clase CSS del input basado en el error
  const getInputClassName = (campo) => {
    const baseClass = "business-input";
    if (errores[campo]) return `${baseClass} input-error`;
    if (formData[campo] && !errores[campo]) return `${baseClass} input-success`;
    return baseClass;
  };

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
            
            {/* Mensaje de error para el logo */}
            {errores.profilePhoto && (
              <div className="error-mensaje">{errores.profilePhoto}</div>
            )}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre completo *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={getInputClassName('name')}
            />
            {errores.name && <div className="error-mensaje">{errores.name}</div>}
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value.toLowerCase())}
              className={getInputClassName('email')}
            />
            {errores.email && <div className="error-mensaje">{errores.email}</div>}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre del negocio *"
              value={formData.companyname}
              onChange={(e) => handleChange('companyname', e.target.value)}
              className={getInputClassName('companyname')}
            />
            {errores.companyname && <div className="error-mensaje">{errores.companyname}</div>}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="NIT (Opcional)"
              value={formData.nit}
              onChange={(e) => handleChange('nit', e.target.value)}
              className={getInputClassName('nit')}
            />
            {errores.nit && <div className="error-mensaje">{errores.nit}</div>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña *"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={getInputClassName('password')}
            />
            {errores.password && <div className="error-mensaje">{errores.password}</div>}
          </div>

          <div className="input-group">
            <input
              type="tel"
              placeholder="Teléfono de contacto *"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={getInputClassName('phone')}
            />
            {errores.phone && <div className="error-mensaje">{errores.phone}</div>}
          </div>

          <div className="business-buttons">
            <button
              className="business-btn primary-btn"
              onClick={() => {
                if (validateStep1()) {
                  nextStep();
                }
              }}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Continuar"}
            </button>

            <button 
              className="business-btn cancel-btn" 
              onClick={cancelar}
              disabled={loading}
            >
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
                latitude: data.latitude,
                longitude: data.longitude,
              };

              // Solo agregar radius si es domicilio
              if (data.companytype === 'domicilio' && data.radio) {
                updatedData.radio = data.radio;
              }

              console.log("📍 Datos completos antes de enviar:", updatedData);
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