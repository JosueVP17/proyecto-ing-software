import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
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

        // DISPLAY DE TARJETAS DE INFORMACIÓN
        userCard.style.display = 'block'
        loginCard.style.display = 'none'
        document.getElementById('userEmail').textContent = user.email
    
        inicioCard.style.display = 'none'
        serviciosCard.style.display = 'block'

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
        loginCard.style.display = 'block'
    
        inicioCard.style.display = 'block'
        serviciosCard.style.display = 'none'
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