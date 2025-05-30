import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js"
import { getFirestore} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBE-yGIWYeZe6Ys-e89zh8V3AmveJHAZD0",
        authDomain: "aurum-gym-ingsoftware.firebaseapp.com",
        projectId: "aurum-gym-ingsoftware",
        storageBucket: "aurum-gym-ingsoftware.firebasestorage.app",
        messagingSenderId: "109257586016",
        appId: "1:109257586016:web:34ed6ad8b0eb47cfb75a05"
    }

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export {auth, db}