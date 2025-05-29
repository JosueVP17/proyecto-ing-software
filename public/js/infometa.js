import { db, auth } from './firebase-config.js'
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
import { cargarPlanActual } from './planes.js'

async function mostrarDatosMetaPersonal() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const q = query(collection(db, "meta-personal"), where("correo", "==", user.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const datos = querySnapshot.docs[0].data()

          // 🔽 Aquí decides dónde poner los valores usando IDs o clases
          document.getElementById("userAge").innerText = (datos.edad || '') + ' años'
          document.getElementById("userWei").innerText = (datos.masa || '') + ' kg'
          document.getElementById("userHei").innerText = (datos.estatura || '') + ' cm'
          document.getElementById("userObj").innerText = 'Deseas centrarte en ' + (datos.objetivo || '');
          document.getElementById("userDisp").innerText = 'Tienes ' + (datos.frecuencia || '')+ ' días disponibles por semana';
          document.getElementById("userExp").innerText = 'Te consideras en un nivel ' + (datos.experiencia || '');
          document.getElementById("userPref").innerText = 'Quieres que tus ejercicios sean de ' + (datos.preferencia || '');
          document.getElementById("userHab").innerText = (datos.habitos || '');
          document.getElementById("userTime").innerText = (datos.tiempo_sesion || '') + ' min por día';
          document.getElementById("userInt").innerText = 'Intentaremos darte rutinas con intensidad ' + (datos.intensidad || '');
          document.getElementById("userLim").innerText = 'Tomaremos en cuenta que ' + (datos.lesiones || '') + ' tienes alguna lesion/limitacion';
          document.getElementById("userAlim").innerText = 'Consideraremos que ' + (datos.restriccionalimentaria || '') + ' hay restricciones alimentarias';
          document.getElementById("userGra").innerText = 'Es ' + (datos.grasa || '') + ' importante perder grasa para ti';
          document.getElementById("userComp").innerText = 'Sabemos que ' + (datos.competencia || '') + ' tienes interes en competir';
          document.getElementById("userMot").innerText = 'Te encuentras ' + (datos.motivacion || '') + ' motivado';
          document.getElementById("userSalM").innerText = 'La salud mental es ' + (datos.salud || '') + ' importante para ti';
          document.getElementById("userMod").innerText ='Prefieries entrenar en' + (datos.grupo || '');

          
        } else {
          console.log("No se encontraron datos de meta-personal para este usuario.")
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error)
      }
    }
  })
}

// Ejecutar al cargar
mostrarDatosMetaPersonal()
cargarPlanActual()