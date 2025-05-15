import { db, auth } from './firebase-config.js'
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

/*Para abrir y cerrar el formulario de personal*/
const abrirForm = document.getElementById("abrirForm")

abrirForm.addEventListener("click", function () {
  const form = document.getElementById("ventana")
  form.style.display = "flex"
})

const cerrarForm = document.getElementById("cerrarForm")

cerrarForm.addEventListener("click", function () {
  const form = document.getElementById("ventana")
  form.style.display = "none"
})

/*Funcion para procesar y guardar los datos del formulario*/
async function procesarFormulario(event) {
  event.preventDefault();

  /*Se obtienen los valores del formulario*/
  const respuestas = {
    edad: document.querySelector('input[name="edad"]').value,
    masa: document.querySelector('input[name="masa"]').value,
    estatura: document.querySelector('input[name="estatura"]').value,
    objetivo: document.querySelector('select[name="objetivo"]').value,
    frecuencia: document.querySelector('select[name="frecuencia"]').value,
    experiencia: document.querySelector('select[name="experiencia"]').value,
    preferencia: document.querySelector('select[name="preferencia"]').value,
    habitos: document.querySelector('select[name="habitos"]').value,
    tiempo_sesion: document.querySelector('select[name="tiempo_sesion"]').value,
    intensidad: document.querySelector('select[name="intensidad"]').value,
    lesiones: document.querySelector('select[name="lesiones"]').value,
    restriccionalimentaria: document.querySelector('select[name="restriccionalimentaria"]').value,
    grasa: document.querySelector('select[name="grasa"]').value,
    competencia: document.querySelector('select[name="competencia"]').value,
    motivacion: document.querySelector('select[name="motivacion"]').value,
    salud: document.querySelector('select[name="salud"]').value,
    grupo: document.querySelector('select[name="grupo"]').value,
  };

  /*Se obtiene el correo del usuario autenticado*/
  const user = auth.currentUser
  if (user) {
    respuestas.correo = user.email

    try {
      //Se guardan las respuestas en la base de datos
      const docRef = await addDoc(collection(db, "meta-personal"), respuestas)

      alert("Formulario enviado exitosamente.")
      console.log("Respuestas guardadas con ID:", docRef.id)
    } catch (error) {
      console.error("Error al guardar el formulario:", error);
      alert("Hubo un error al enviar el formulario. Inténtalo de nuevo.")
    }
  } else {
    alert("Debes iniciar sesión para enviar el formulario.")
  }
}

//Para enviar el formulario
const enviarFormBtn = document.querySelector('.btn-enviar-form')
enviarFormBtn.addEventListener('click', procesarFormulario)
