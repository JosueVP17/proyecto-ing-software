import { db, auth } from './firebase-config.js'
import { doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

/*Para limpiar el formulario*/
function limpiarFormulario() {
  document.querySelectorAll('input, select').forEach(el => el.value = '')
}

/*Para abrir y cerrar el formulario de personal*/
const abrirForm = document.getElementById("abrirForm")

abrirForm.addEventListener("click", function () {
  const form = document.getElementById("ventana")
  form.style.display = "flex"

  limpiarFormulario()
  cargarRespuestas()
})

const cerrarForm = document.getElementById("cerrarForm")

cerrarForm.addEventListener("click", function () {
  const form = document.getElementById("ventana")
  form.style.display = "none"
})

/*Función para cargar las respuestas del formulario*/
async function cargarRespuestas() {
  const user = auth.currentUser

  if (user) {
    try {
      const q = query(collection(db, "meta-personal"), where("correo", "==", user.email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0]
        const respuestas = docSnapshot.data()

        /*Se llenan los campos del formulario con las respuestas*/
        document.querySelector('select[name="sexo"]').value = respuestas.sexo || ''
        document.querySelector('input[name="edad"]').value = respuestas.edad || ''
        document.querySelector('input[name="masa"]').value = respuestas.masa || ''
        document.querySelector('input[name="estatura"]').value = respuestas.estatura || ''
        document.querySelector('select[name="objetivo"]').value = respuestas.objetivo || ''
        document.querySelector('select[name="frecuencia"]').value = respuestas.frecuencia || ''
        document.querySelector('select[name="experiencia"]').value = respuestas.experiencia || ''
        document.querySelector('select[name="preferencia"]').value = respuestas.preferencia || ''
        document.querySelector('select[name="habitos"]').value = respuestas.habitos || ''
        document.querySelector('select[name="tiempo_sesion"]').value = respuestas.tiempo_sesion || ''
        document.querySelector('select[name="intensidad"]').value = respuestas.intensidad || ''
        document.querySelector('select[name="lesiones"]').value = respuestas.lesiones || ''
        document.querySelector('select[name="restriccionalimentaria"]').value = respuestas.restriccionalimentaria || ''
        document.querySelector('select[name="grasa"]').value = respuestas.grasa || ''
        document.querySelector('select[name="competencia"]').value = respuestas.competencia || ''
        document.querySelector('select[name="motivacion"]').value = respuestas.motivacion || ''
        document.querySelector('select[name="salud"]').value = respuestas.salud || ''
        document.querySelector('select[name="grupo"]').value = respuestas.grupo || ''
      } else {
        console.log("No se encontraron respuestas previas.")
      }
    } catch (error) {
      console.error("Error al cargar las respuestas:", error)
    }
  } else {
    console.log("Se debe de iniciar sesión para cargar las respuestas.")
  }
}

/*Funcion para procesar y guardar los datos del formulario*/
async function procesarFormulario(event) {
  event.preventDefault();

  const respuestas = {
    sexo: document.querySelector('select[name="sexo"]').value,
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
    correo: auth.currentUser.email,
  }

  try {
    const q = query(collection(db, "meta-personal"), where("correo", "==", respuestas.correo))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await setDoc(docRef, respuestas)
      alert("Formulario actualizado exitosamente.")
    } else {
      await addDoc(collection(db, "meta-personal"), respuestas)
      alert("Formulario enviado exitosamente.")
    }

    // Cerrar el formulario y recargar la página
    document.getElementById("ventana").style.display = "none";
    location.reload();

  } catch (error) {
    console.error("Error al guardar el formulario:", error)
    alert("Hubo un error al enviar el formulario. Inténtalo de nuevo.")
  }
}

/*Para enviar el formulario*/
const enviarFormBtn = document.querySelector('.btn-enviar-form')
enviarFormBtn.addEventListener('click', procesarFormulario)
