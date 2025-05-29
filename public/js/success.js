import { db } from "./firebase-config.js"
import { auth } from "./firebase-config.js"
import { collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que el usuario esté autenticado
    auth.onAuthStateChanged(async user => {
        if (!user) return
        // Buscar el carrito del usuario
        const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
        const cartDocs = await getDocs(cartQuery)
        if (!cartDocs.empty) {
            // Eliminar los productos del carrito (deja el array vacío)
            const cartDocRef = cartDocs.docs[0].ref
            await updateDoc(cartDocRef, { items: [] })
        }
    })
})