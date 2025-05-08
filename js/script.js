const inicio = document.getElementById('inicio');
const login = document.getElementById('login');
const catalogo = document.getElementById('catalogo');
const planes = document.getElementById('planes');
const contacto = document.getElementById('contacto');

const inicioBtn = document.getElementById('inicioBtn');
const loginBtn = document.getElementById('loginBtn');
const catalogoBtn = document.getElementById('catalogoBtn');
const planesBtn = document.getElementById('planesBtn');
const contactoBtn = document.getElementById('contactoBtn');

const navButtons = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('active'))

        button.classList.add('active');

        sections.forEach(section => section.style.display = 'none')

        const sectionId = button.id.replace('Btn', '')
        const sectionToShow = document.getElementById(sectionId)
        if (sectionToShow) {
            sectionToShow.style.display = 'block'
        }
    })
})

sections.forEach(section => section.style.display = 'none');
inicio.style.display = 'block';