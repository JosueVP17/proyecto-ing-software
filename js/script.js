// DISPLAY DE SECCIONES
const navButtons = document.querySelectorAll('nav a')
const sections = document.querySelectorAll('.section')

sections.forEach(section => section.style.display = 'none')
inicio.style.display = 'block'

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('active'))

        button.classList.add('active')

        sections.forEach(section => section.style.display = 'none')

        const sectionId = button.id.replace('Btn', '')
        const sectionToShow = document.getElementById(sectionId)
        if (sectionId == 'planes') {
            sectionToShow.style.display = 'flex'
        } else sectionToShow.style.display = 'block'
    })
})

const carritoBtn = document.getElementById('carritoBtn');
if (carritoBtn) {
    carritoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'carritocompras.html';
    });
}
// DISPLAY DE FORMULARIO DE INICIO DE SESIÓN
const signupShowBtn = document.getElementById('signupShowBtn')
const signinShowBtn = document.getElementById('signinShowBtn')
const signupForm = document.getElementById('signupForm')
const signinForm = document.getElementById('signinForm')

signupShowBtn.addEventListener('click', () => {
    signupForm.style.display = 'block'
    signinForm.style.display = 'none'
})

signinShowBtn.addEventListener('click', () => {
    signupForm.style.display = 'none'
    signinForm.style.display = 'block'
})

function abrirModal() {
    document.getElementById('modal').style.display = 'block'
}
  
function cerrarModal() {
  document.getElementById('modal').style.display = 'none'
}

/*Perfil de usuario*/

function guardarTexto() {
  const textarea = document.getElementById("autoTextarea");
  const mensaje = document.getElementById("mensaje");
  const texto = textarea.value;

  localStorage.setItem("textoGuardado", texto);

  mensaje.textContent = "Texto guardado.";
}
  window.onload = function () {
    const guardado = localStorage.getItem("textoGuardado");
    if (guardado) {
      document.getElementById("autoTextarea").value = guardado;
    }
  };
   const input = document.getElementById("username");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      input.setAttribute("readonly", true);
      input.blur(); 
    }
  });

  input.addEventListener("click", function () {
    if (input.hasAttribute("readonly")) {
      input.removeAttribute("readonly");
      input.focus();
    }
  });
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    localStorage.setItem("username", input.value);
    input.setAttribute("readonly", true);
    input.blur();
  }
});

window.addEventListener("load", () => {
  const savedName = localStorage.getItem("username");
  if (savedName) {
    input.value = savedName;
    input.setAttribute("readonly", true);
  }
});
