import { auth } from './firebase-config.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"

// Escuchar cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
    const userCard = document.getElementById('user-card')
    const loginCard = document.getElementById('login-card')
    const inicioCard = document.getElementById('inicio-card')
    const serviciosCard = document.getElementById('servicios-card')

    if (user) {
        // Usuario autenticado
        console.log('Usuario autenticado:', user);
        userCard.style.display = 'block'
        loginCard.style.display = 'none'
        document.getElementById('userEmail').textContent = user.email
    
        inicioCard.style.display = 'none'
        serviciosCard.style.display = 'block'
    } else {
        // Usuario no autenticado
        console.log('No hay usuario autenticado');
        userCard.style.display = 'none'
        loginCard.style.display = 'block'
    
        inicioCard.style.display = 'block'
        serviciosCard.style.display = 'none'
    }
})

// Seleccionar los elementos del DOM
const signupBtn = document.getElementById('signupBtn')
const signinBtn = document.getElementById('signinBtn')

// Función para registrar un nuevo usuario
signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('emailSignup').value
    const password = document.getElementById('passwordSignup').value

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        alert('Usuario registrado exitosamente')
        console.log('Usuario:', userCredential.user)
    } catch (error) {
        console.error('Error al registrar:', error.message)
        alert('Error al registrar: ' + error.message)
    }
})

// Función para iniciar sesión
signinBtn.addEventListener('click', async () => {
    const email = document.getElementById('emailSignin').value
    const password = document.getElementById('passwordSignin').value

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Inicio de sesión exitoso');
        console.log('Usuario:', userCredential.user);
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        alert('Error al iniciar sesión: ' + error.message);
    }
})

const logoutBtn = document.getElementById('logoutBtn')
// Función para cerrar sesión
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('Sesión cerrada exitosamente');
        console.log('El usuario ha cerrado sesión');
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Error al cerrar sesión: ' + error.message);
    }
})