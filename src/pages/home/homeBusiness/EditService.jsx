import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./css/AddService.css"; 

export default function EditService() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const servicio = location.state?.servicio;
  const companyId = location.state?.companyId;

  // ✅ Inicializar campos
  const [nombre, setNombre] = useState(servicio?.title || "");
  const [descripcion, setDescripcion] = useState(servicio?.description || "");
  const [precio, setPrecio] = useState(servicio?.price || "");
  const [duracion, setDuracion] = useState(servicio?.duration || "");
  const [categoriaNueva, setCategoriaNueva] = useState(servicio?.servicecategoryid || "");
  const [guardando, setGuardando] = useState(false);

  // ⚠️ Si no hay datos (por recarga directa), avisar y volver atrás
  useEffect(() => {
    if (!servicio) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del servicio.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e25b7a'
      }).then(() => {
        navigate("/servicios");
      });
    }
  }, [servicio, navigate]);

  const handleGuardar = async () => {
    if (!nombre || !precio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e25b7a'
      });
      return;
    }

    setGuardando(true);
    const token = localStorage.getItem("auth_token");

    // 🧠 Construir payload según espera tu backend
    const payload = {
      id_company: companyId,
      id_servicio: servicio.service_id, // el ID real del servicio
      title: nombre,
      description: descripcion,
      servicecategoryidNew: categoriaNueva,
      servicecategoryidOld: servicio.servicecategoryid,
      price: Number(precio),
      duration: duracion,
      galery: [], // puedes agregar si usas imágenes
    };

    try {
      const res = await fetch("http://localhost:3000/api/public/editServicio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Servicio actualizado correctamente',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#4caf50',
          timer: 2000,
          showConfirmButton: true
        });
        navigate("/servicios");
      } else {
        console.error("Respuesta del servidor:", data);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el servicio',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#e25b7a'
        });
      }
    } catch (error) {
      console.error("Error al editar el servicio:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Error al conectar con el servidor',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e25b7a'
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e25b7a',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Seguir editando'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/servicios");
      }
    });
  };

  return (
    <div className="form-container">
      <h2>Editar servicio</h2>
      
      <div className="field tooltip-servicio">
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <span className="tooltip-servicio-text">Nombre del servicio</span>
      </div>

      <div className="field tooltip-servicio">
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <span className="tooltip-servicio-text">Descripción del servicio</span>
      </div>

      <div className="field tooltip-servicio">
        <input
          type="number"
          placeholder="Precio (COP)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
        <span className="tooltip-servicio-text">Costo del servicio en pesos colombianos</span>
      </div>

      <div className="field tooltip-servicio">
        <input
          type="text"
          placeholder="Duración (opcional)"
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
        />
        <span className="tooltip-servicio-text">Tiempo aproximado del servicio (minutos)</span>
      </div>

      {/*<input
        type="text"
        placeholder="ID categoría nueva"
        value={categoriaNueva}
        onChange={(e) => setCategoriaNueva(e.target.value)}
      />*/}

      <div className="button-group">
        <button
          className="btn-primary"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        <button className="btn-secondary" onClick={handleCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}