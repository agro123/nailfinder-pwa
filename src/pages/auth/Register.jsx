// src/pages/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import AddressList from "./AddressList";
import AddressMap from "./AddressMap";
import "./css/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Estados para errores de validación en tiempo real
  const [errores, setErrores] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    reference: "",
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    uppercase: false,
    symbol: false,
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

  const validarPassword = (password) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
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
    const telefonoRegex = /^[\d\s+\-()]{7,15}$/;
    if (!telefonoRegex.test(telefono)) return "Ingresa un número de teléfono válido";
    if (telefono.replace(/\D/g, '').length < 7) return "El teléfono debe tener al menos 7 dígitos";
    return "";
  };

  // --- MANEJADORES DE CAMBIOS CON VALIDACIÓN ---
  const handlePasswordChange = (value) => {
    // Actualizar el formulario
    setFormData({ ...formData, password: value });

    if (!value) {
      setPasswordRequirements({
        length: false,
        number: false,
        uppercase: false,
        symbol: false,
      });
      setErrores(prev => ({ ...prev, password: "La contraseña es obligatoria" }));
      return;
    }

    const newRequirements = {
      length: value.length < 6,
      number: !/\d/.test(value),
      uppercase: !/[A-Z]/.test(value),
      symbol: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
    };

    setPasswordRequirements(newRequirements);

    // Validar y actualizar error
    const error = validarPassword(value);
    setErrores(prev => ({ ...prev, password: error }));
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
      password: validarPassword(formData.password),
      phone: validarTelefono(formData.phone)
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

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validar todo el formulario
    if (!validarFormularioCompleto()) {
      return;
    }

    setLoading(true);

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

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error en el registro");
      }

      Swal.fire({
        title: "¡Registro exitoso! 🎉",
        text: "✅ Tu cuenta ha sido creada correctamente.",
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
        text: error.message || "❌ No se pudo crear la cuenta. Por favor, intenta nuevamente.",
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
    const baseClass = "register-input";
    if (errores[campo]) return `${baseClass} input-error`;
    if (formData[campo] && !errores[campo]) return `${baseClass} input-success`;
    return baseClass;
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

          {/* Nombre Completo */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre Completo *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={getInputClassName('name')}
              disabled={loading}
            />
            {errores.name && <div className="error-mensaje">{errores.name}</div>}
          </div>

          {/* Correo Electrónico */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo Electrónico *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value.toLowerCase())}
              className={getInputClassName('email')}
              disabled={loading}
            />
            {errores.email && <div className="error-mensaje">{errores.email}</div>}
          </div>

          {/* Contraseña */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña *"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={getInputClassName('password')}
              disabled={loading}
            />
            
            {/* Requisitos de contraseña */}
            
            
            {errores.password && <div className="error-mensaje">{errores.password}</div>}
          </div>

          {/* Teléfono */}
          <div className="input-group">
            <input
              type="tel"
              placeholder="Celular *"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={getInputClassName('phone')}
              disabled={loading}
            />
            {errores.phone && <div className="error-mensaje">{errores.phone}</div>}
          </div>

          {/* Botones */}
          <button 
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Continuar"}
          </button>
          
          <button 
            onClick={cancelar}
            disabled={loading}
          >
            Volver
          </button>
        </div>
      )}

      
    </div>
  );
}