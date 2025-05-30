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

inicioSigninBtn.addEventListener('click', () => {
  login.style.display = 'block'
  inicio.style.display = 'none'
  inicioBtn.classList.remove('active')
  loginBtn.classList.add('active')
})

inicioSignupBtn.addEventListener('click', () => {
  login.style.display = 'block'
  inicio.style.display = 'none'
  inicioBtn.classList.remove('active')
  loginBtn.classList.add('active')
  signupForm.style.display = 'block'
  signinForm.style.display = 'none'
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

// VENTANA EMERGENTE PARA SERVICIOS
   function abrirModalServicios(tipo) {
  const modal = document.getElementById("miModal");
  const contenidoDiv = document.getElementById("modalContenido");

  if (tipo === "rutinas") {
    contenidoDiv.innerHTML = `<h3>Rutinas de Entrenamiento</h3>
  <div id="tabs" style="margin-bottom:10px ;">
    <button style="margin-left:15px;" id="btnPeso">Ganar Peso</button>
    <button style="margin-left:15px;" id="btnMasa">Masa Muscular</button>
    <button style="margin-left:15px;" id="btnFlex">Flexibilidad</button>
    <button style="margin-left:15px;" id="btnEstres">Reducir Estrés</button>
  </div>
  <div id="contenidoRutina" style="max-height:400px; overflow-y:auto;"></div>
  <div id="btnVolver" style="margin-top:15px; display:none;">
    <button style="margin-left:15px;"onclick="volverTabs()">← Volver</button>
  </div>
`;


    // Agregar eventos una vez que los botones existen en el DOM
    document.getElementById("btnPeso").addEventListener("click", () => mostrarRutina("peso"));
    document.getElementById("btnMasa").addEventListener("click", () => mostrarRutina("masa"));
    document.getElementById("btnFlex").addEventListener("click", () => mostrarRutina("flexibilidad"));
    document.getElementById("btnEstres").addEventListener("click", () => mostrarRutina("estres"));

    mostrarRutina("peso"); // Mostrar por defecto
  } else {
    const contenido = {
      plan: "<h3>Plan Nutricional</h3><p>Una guía alimentaria basada en tus objetivos.</p>",
      imc:`<h3>Calculadora de IMC</h3>
        <p>Ingresa tu peso y estatura:</p>
        <label>Peso (kg):</label><br>
        <input type="number" id="peso" placeholder="Ej. 70" /><br><br>
        <label>Estatura (cm):</label><br>
        <input type="number" id="altura" placeholder="Ej. 170" /><br><br>
        <button style="margin-left:15px;" onclick="calcularIMC()">Calcular</button>
        <div id="resultadoIMC" style="margin-top:15px;"></div> `,
      tmb: `
        <h3>Calculadora de TMB</h3>
        <p>Ingresa tus datos para calcular tu tasa metabólica basal:</p>
        <label>Edad (años):</label><br>
        <input type="number" id="edad" placeholder="Ej. 25" /><br><br>
        <label>Sexo:</label><br>
        <select id="sexo">
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select><br><br>
        <label>Peso (kg):</label><br>
        <input type="number" id="pesoTMB" placeholder="Ej. 70" /><br><br>
        <label>Estatura (cm):</label><br>
        <input type="number" id="alturaTMB" placeholder="Ej. 170" /><br><br>
        <button style="margin-left:15px;" onclick="calcularTMB()">Calcular TMB</button>
        <div id="resultadoTMB" style="margin-top:15px;"></div>
`

    };
    contenidoDiv.innerHTML = contenido[tipo] || "<p>Contenido no disponible.</p>";
  }

  modal.style.display = "block";
}


  function mostrarRutina(objetivo) {
    const rutinas = {
      peso: `<h4>Ganar Peso (1-6 días por semana)</h4>
        <ul>
          <li><strong>1-2 días:</strong><br>
            - Sentadillas con peso corporal – 3x15<br>
            - Flexiones asistidas – 3x10<br>
            - Peso muerto con mochila – 3x10<br>
            - Zancadas – 3x12<br>
            - Abdominales – 3x15
          </li>
          <li><strong>2-4 días:</strong> Rutinas divididas en tren inferior y superior</li>
          <li><strong>4-6 días:</strong> Rutina completa por día (Push, Piernas, Movilidad, etc.)</li>
        </ul>
      `,
      masa: `
        <h4>Ganar Masa Muscular</h4>
        <ul>
          <li><strong>1-2 días:</strong> Full Body moderado con peso (goblet squat, remo, etc.)</li>
          <li><strong>2-4 días:</strong> Lunes a miércoles con rutinas divididas</li>
          <li><strong>4-6 días:</strong> Entrenamiento diario por grupo muscular</li>
        </ul>
      `,
      flexibilidad: `
        <h4>Mejorar Flexibilidad</h4>
        <ul>
          <li><strong>1-2 días:</strong> Estiramientos básicos y movilidad</li>
          <li><strong>2-4 días:</strong> Yoga suave y movilidad dinámica</li>
          <li><strong>4-6 días:</strong> Yoga avanzado, respiración, splits/backbends</li>
        </ul>
      `,
      estres: `
        <h4>Reducir Estrés</h4>
        <ul>
          <li><strong>1-2 días:</strong> Caminata consciente, respiración nasal</li>
          <li><strong>2-4 días:</strong> Movimiento suave, meditación, té relajante</li>
          <li><strong>4-6 días:</strong> Autocuidado completo diario (tai chi, journaling)</li>
        </ul>
      `
    };

  document.getElementById("tabs").style.display = "none";
  document.getElementById("btnVolver").style.display = "block";
  document.getElementById("contenidoRutina").innerHTML = rutinas[objetivo] || "<p>Rutina no disponible.</p>";
  }
  function volverTabs() {
  document.getElementById("tabs").style.display = "block";
  document.getElementById("btnVolver").style.display = "none";
  document.getElementById("contenidoRutina").innerHTML = "";
}
function calcularIMC() {
  const peso = parseFloat(document.getElementById("peso").value);
  const alturaCm = parseFloat(document.getElementById("altura").value);
  const resultadoDiv = document.getElementById("resultadoIMC");

  if (!peso || !alturaCm || peso <= 0 || alturaCm <= 0) {
    resultadoDiv.innerHTML = "<span style='color:red;'>Por favor, ingresa valores válidos.</span>";
    return;
  }

  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);
  let clasificacion = "";

  if (imc < 18.5) clasificacion = "Bajo peso";
  else if (imc < 24.9) clasificacion = "Peso normal";
  else if (imc < 29.9) clasificacion = "Sobrepeso";
  else clasificacion = "Obesidad";

  resultadoDiv.innerHTML = `
    <strong>Tu IMC es:</strong> ${imc.toFixed(1)}<br>
    <strong>Clasificación:</strong> ${clasificacion}
  `;
}
function calcularTMB() {
  const edad = parseInt(document.getElementById("edad").value);
  const sexo = document.getElementById("sexo").value;
  const peso = parseFloat(document.getElementById("pesoTMB").value);
  const altura = parseFloat(document.getElementById("alturaTMB").value);
  const resultadoDiv = document.getElementById("resultadoTMB");

  if (!edad || !peso || !altura || edad <= 0 || peso <= 0 || altura <= 0) {
    resultadoDiv.innerHTML = "<span style='color:red;'>Por favor, ingresa todos los valores correctamente.</span>";
    return;
  }

  let tmb;

  if (sexo === "masculino") {
    tmb = 10 * peso + 6.25 * altura - 5 * edad + 5;
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * edad - 161;
  }

  resultadoDiv.innerHTML = `
    <strong>Tu TMB es:</strong> ${Math.round(tmb)} calorías/día<br>
    <small>Esto es la energía que tu cuerpo gasta en reposo.</small>
  `;
}
  function cerrarModalServicios() {
  document.getElementById("miModal").style.display = "none";
}

    // También cerrar al hacer clic fuera del contenido
    window.onclick = function(event) {
      const modal = document.getElementById("miModal");
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };

    
