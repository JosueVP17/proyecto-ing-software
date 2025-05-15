
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

