import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

let registrandoUsuario = false;

onAuthStateChanged(auth, async(user) => {

    if(registrandoUsuario) return

    const userCard = document.getElementById('user-card')
    const loginCard = document.getElementById('login-card')
    const inicioCard = document.getElementById('inicio-card')
    const serviciosCard = document.getElementById('servicios-card')

    if (user) {
        console.log('Usuario autenticado:', user)
        document.getElementById('userEmail').textContent = user.email

        // DISPLAY DE TARJETAS DE INFORMACIÓN
        userCard.style.display = 'block'
        serviciosCard.style.display = 'block'

        inicioCard.style.display = 'none'
        loginCard.style.display = 'none'
          // Mostrar gráfica IMC
        document.getElementById('graficaIMC').style.display = 'block';

        // Guardar IMC del mes (reemplaza este número con el valor real calculado)
         const nuevoIMC = 23.4;
        guardarIMCMensual(nuevoIMC);
        crearGraficaIMC();
        

        // COMPROBAR SI EL USUARIO ES ADMIN
        const adminRef = doc(db, 'admin', user.uid)
        const adminSnap = await getDoc(adminRef)
        const addProductBtn = document.getElementById('addProductBtn')
        const inventoryBtn = document.getElementById('inventoryBtn')

        if (adminSnap.exists()) {
            addProductBtn.style.display = 'inline-block'
            inventoryBtn.style.display = 'inline-block'
            console.log('@@@ Administrador')
        } else{
            addProductBtn.style.display = 'none'
            inventoryBtn.style.display = 'none'
            console.log('@@@ Usuario')
        }
    } else {
        console.log('No hay usuario autenticado')

        // DISPLAY DE TARJETAS DE INICIO DE SESIÓN
        userCard.style.display = 'none'
        serviciosCard.style.display = 'none'

        inicioCard.style.display = 'block'
        loginCard.style.display = 'block'
    }
   
})

const signupBtn = document.getElementById('signupBtn')
const signinBtn = document.getElementById('signinBtn')

signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('emailSignup').value
    const password = document.getElementById('passwordSignup').value
    const confirmpassword = document.getElementById('confirmPasswordSignup').value
    const passwordsecurity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

    if (password != confirmpassword){
        alert('Las contraseñas no coinciden')
        return
    }

    if (!passwordsecurity.test(password)) {
    alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.')
    return
    }

    registrandoUsuario = true

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await signOut(auth) 
        
        document.getElementById('signupForm').style.display = 'none'
        document.getElementById('signinForm').style.display = 'block'
        
        alert('Usuario registrado exitosamente')
        console.log('Usuario:', userCredential.user)

        document.getElementById('emailSignup').value = ''
        document.getElementById('passwordSignup').value = ''
        document.getElementById('confirmPasswordSignup').value = ''

    } catch (error) {
        console.error('Error al registrar:', error.message)
        alert('Error al registrar: ' + error.message)
    } finally {
        registrandoUsuario = false
    }
})

// FUNCIÓN PARA INICIAR SESIÓN
signinBtn.addEventListener('click', async () => {
    const email = document.getElementById('emailSignin').value
    const password = document.getElementById('passwordSignin').value

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        alert('Inicio de sesión exitoso')
        console.log('Usuario:', userCredential.user)
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message)
        alert('Error al iniciar sesión: ' + error.message)
    }
})
function iniciarSesion() {
  // Simula login
  const loginContainer = document.getElementById("login-container");
  const graficaContainer = document.getElementById("grafica-container");
  
  loginContainer.style.display = "none";
  graficaContainer.style.display = "block";

  cargarGraficaIMC();
}
// FUNCIÓN PARA CERRAR SESIÓN
const logoutBtn = document.getElementById('logoutBtn')

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth)
        alert('Sesión cerrada exitosamente')
        console.log('El usuario ha cerrado sesión')
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message)
        alert('Error al cerrar sesión: ' + error.message)
    }
})

// CAMBIO DE CONTRASEÑA
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", () => {
  const ventana = document.getElementById("ventanaLog");
  const passwordActualInput = document.getElementById("passwordActual");
  const nuevaPasswordInput = document.getElementById("nuevaPassword");
  const mensaje = document.getElementById("mensaje");

  function abrirLog() {
    if (ventana) ventana.style.display = "block";
  }

  function cerrarLog() {
    if (ventana) ventana.style.display = "none";
    limpiarCampos(true);
  }

  function limpiarCampos(todos = false) {
    passwordActualInput.value = "";
    if (todos) nuevaPasswordInput.value = "";
    mensaje.textContent = "";
  }

  async function guardarCambios() {
    const user = auth.currentUser;
    const passwordActual = passwordActualInput.value.trim();
    const nuevaPassword = nuevaPasswordInput.value.trim();
    const passwordsecurity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!user) {
      mensaje.textContent = "No hay usuario autenticado.";
      return;
    }

    if (!passwordActual) {
      mensaje.textContent = "Debes ingresar tu contraseña actual.";
      return;
    }

    if (!nuevaPassword) {
      mensaje.textContent = "Debes ingresar una nueva contraseña.";
      return;
    }

    if (!passwordsecurity.test(nuevaPassword)) {
      mensaje.textContent = "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordActual);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, nuevaPassword);
      mensaje.textContent = "Contraseña actualizada correctamente.";
      await delay(2000);
      limpiarCampos(true);
      cerrarLog();

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

  document.getElementById("logeditBtn").addEventListener("click", abrirLog);
  document.getElementById("cerrarLogBtn").addEventListener("click", cerrarLog);
  document.getElementById("guardarCambiosBtn").addEventListener("click", guardarCambios);
});