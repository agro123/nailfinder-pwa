import Swal from "sweetalert2";

const MySwal = Swal.mixin({
  didRender: () => {
    const confirmBtn = Swal.getConfirmButton();
    const cancelBtn = Swal.getCancelButton();

    if (confirmBtn) {
      confirmBtn.style.backgroundColor = "#e25b7a";
      confirmBtn.style.fontWeight = "bold";
      confirmBtn.style.color = "#FFFF";
    }

    if (cancelBtn) {
      cancelBtn.style.backgroundColor = "#6c757d";
    }
  }
});

export async function confirmPrompt(payload) {
  const result = await MySwal.fire({
    title: payload.title ?? "Confirmación",
    text: payload.message ?? "",
    icon: payload.type ?? "question",
    showCancelButton: payload.showCancelButton ?? true,
    confirmButtonText: payload.confirmButtonText ?? "Aceptar",
    cancelButtonText: payload.cancelButtonText ?? "Cancelar",
    customClass: {
      popup: "custom-swal-z"
    }
  });

  if (result.isConfirmed) {
    await payload.onConfirm?.();
  } else {
    await payload.onCancel?.();
  }

  return result;
}

export async function alertPrompt(payload) {
  const result = await MySwal.fire({
    title: payload.title ?? "Información",
    text: payload.message ?? "",
    icon: payload.type ?? "success",
    confirmButtonText: payload.confirmButtonText ?? "Aceptar",
    showCancelButton: false,
    customClass: {
      popup: "custom-swal-z"
    }
  });

  await payload.onConfirm?.();
  return result;
}
