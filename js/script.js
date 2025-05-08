const inicioBtn = document.getElementById('inicioBtn')
const loginBtn = document.getElementById('loginBtn')
const catalogoBtn = document.getElementById('catalogoBtn')
const planesBtn = document.getElementById('planesBtn')
const contactoBtn = document.getElementById('contactoBtn')

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