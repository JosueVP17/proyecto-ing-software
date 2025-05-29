import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

async function subirAImgBB(base64image) {
  const apiKey = "0c6c58c15ae632366b41fba223731428"; // usa tu API key real
  const formData = new FormData();
  formData.append("image", base64image.replace(/^data:image\/\w+;base64,/, ""));
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  const data = await res.json();
  return data.data.url;
}


document.addEventListener("DOMContentLoaded", () => {
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const imageToCrop = document.getElementById("imageToCrop");
  const cropModal = document.getElementById("cropModal");
  const cropBtn = document.getElementById("cropBtn");
  const cancelCropBtn = document.getElementById("cancelCropBtn");
  const input = document.getElementById("username");

  let cropper = null;

  avatarPreview.addEventListener("click", () => {
    avatarInput.click();
  });

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      imageToCrop.src = event.target.result;
      cropModal.style.display = "flex";
      cropModal.style.alignItems = "center";
    };
    reader.readAsDataURL(file);
  });

  imageToCrop.addEventListener("load", () => {
    if (cropper) cropper.destroy();
    cropper = new Cropper(imageToCrop, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false,
    });
  });

  cropBtn.addEventListener("click", async () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
    const croppedImage = canvas.toDataURL("image/png");
    avatarPreview.src = croppedImage;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");

      const imageUrl = await subirAImgBB(croppedImage);

      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: imageUrl, email: user.email },
        { merge: true }
      );

      console.log("Imagen subida y guardada:", imageUrl);
    } catch (err) {
      console.error("Error al subir:", err);
      alert("Error al subir imagen");
    }

    cropper.destroy();
    cropper = null;
    cropModal.style.display = "none";
  });

  cancelCropBtn.addEventListener("click", () => {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    cropModal.style.display = "none";
  });

  // 👇 Username: guardar en Firestore al presionar Enter
  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const username = input.value.trim();
      if (!username) return;

      input.setAttribute("readonly", true);
      input.blur();

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado");

        await setDoc(
          doc(db, "users", user.uid),
          { username: username },
          { merge: true }
        );

        console.log("Nombre de usuario guardado:", username);
      } catch (err) {
        console.error("Error al guardar nombre de usuario:", err);
      }
    }
  });

  // 👇 Username: habilitar edición al hacer clic
  input.addEventListener("click", () => {
    if (input.hasAttribute("readonly")) {
      input.removeAttribute("readonly");
      input.focus();
    }
  });

  // 👇 Cargar datos al iniciar sesión
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.photoURL) avatarPreview.src = data.photoURL;
          if (data.username) {
            input.value = data.username;
            input.setAttribute("readonly", true);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }
  });
});

