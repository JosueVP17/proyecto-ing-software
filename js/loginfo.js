import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { auth } from './firebase-config.js';

// Función de espera reutilizable
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", () => {
  // Referencias dentro del DOMContentLoaded
  const ventana = document.getElementById("ventanaLog");
  const passwordActualInput = document.getElementById("passwordActual");
  const nuevaPasswordInput = document.getElementById("nuevaPassword");
  const mensaje = document.getElementById("mensaje");

  // Mostrar ventana
  function abrirLog() {
    if (ventana) ventana.style.display = "block";
  }

  // Cerrar ventana y limpiar todo siempre
  function cerrarLog() {
    if (ventana) ventana.style.display = "none";
    limpiarCampos(true);
  }

  // Limpiar campos controladamente
  function limpiarCampos(todos = false) {
    passwordActualInput.value = "";
    if (todos) nuevaPasswordInput.value = "";
    mensaje.textContent = "";
  }

  async function guardarCambios() {
    const user = auth.currentUser;
    const passwordActual = passwordActualInput.value.trim();
    const nuevaPassword = nuevaPasswordInput.value.trim();

    if (!user) {
      mensaje.textContent = "No hay usuario autenticado.";
      return;
    }

    if (!passwordActual) {
      mensaje.textContent = "Debes ingresar tu contraseña actual.";
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordActual);
      await reauthenticateWithCredential(user, credential);

      if (nuevaPassword) {
        await updatePassword(user, nuevaPassword);
        mensaje.textContent = "Contraseña actualizada correctamente.";
        await delay(2000);
        limpiarCampos(true);
        cerrarLog();
      } else {
        mensaje.textContent = "Reautenticación correcta. No cambiaste la contraseña.";
        await delay(2000);
        mensaje.textContent = "";
      }

    } catch (error) {
      console.error(error);
      switch (error.code) {
        case "auth/invalid-credential":
          mensaje.textContent = "La contraseña actual es incorrecta.";
          passwordActualInput.value = "";
          await delay(2000);
          mensaje.textContent = "";
          break;
        case "auth/weak-password":
          mensaje.textContent = "La nueva contraseña es muy débil (mínimo 6 caracteres).";
          passwordActualInput.value = "";
          await delay(2000);
          mensaje.textContent = "";
          break;
        case "auth/requires-recent-login":
          mensaje.textContent = "Por seguridad, vuelve a iniciar sesión e intenta de nuevo.";
          passwordActualInput.value = "";
          await delay(2000);
          mensaje.textContent = "";
          break;
        default:
          mensaje.textContent = "Error desconocido: " + error.message;
          passwordActualInput.value = "";
          await delay(2000);
          mensaje.textContent = "";
      }
    }
  }

  // Eventos
  document.getElementById("logeditBtn").addEventListener("click", abrirLog);
  document.getElementById("cerrarLogBtn").addEventListener("click", cerrarLog);
  document.getElementById("guardarCambiosBtn").addEventListener("click", guardarCambios);
});

