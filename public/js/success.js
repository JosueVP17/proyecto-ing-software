import { db } from "./firebase-config.js"
import { auth } from "./firebase-config.js"
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged(async user => {
        if (!user) return

        // Limpiar carrito si existe (compra de productos)
        const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
        const cartDocs = await getDocs(cartQuery)
        if (!cartDocs.empty) {
            const cartDocRef = cartDocs.docs[0].ref
            await updateDoc(cartDocRef, { items: [] })
        }

        // Obtener plan y método de pago de localStorage (guardados antes de redirigir)
        const planNombre = localStorage.getItem("planNombre")
        const metodoPago = localStorage.getItem("metodoPago")

        if (planNombre && metodoPago) {
            const userRef = doc(db, "users", user.uid)
            const userDoc = await getDoc(userRef)
            // Solo guardar si aún no tiene ese plan
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    plan: planNombre,
                    metodoPago: metodoPago
                }, { merge: true })
            } else if(userDoc.data().plan !== planNombre) {
                updateDoc(userRef, {plan: planNombre})
            }
            // Limpia los datos del localStorage
            localStorage.removeItem("planNombre")
            localStorage.removeItem("metodoPago")
        }
    })
})