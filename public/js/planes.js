// modal-planes.js
import { auth, db } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

// Datos de los planes
const planes = {
  planDiario: {
    nombre: "Plan Diario",
    descripcion: [
      "Ideal para visitantes ocasionales",
      "Pago por entrada",
      "Acceso completo por 1 día"
    ],
    precio: "$60/día"
  },
  planBasico: {
    nombre: "Plan Básico",
    descripcion: [
      "Acceso a zonas comunes",
      "1 Clase grupal gratis a la semana",
      "Sin sesiones con entrenador personal",
      "Asesoría de instructores de piso"
    ],
    precio: "$350/mes"
  },
  planEstandar: {
    nombre: "Plan Estándar",
    descripcion: [
      "Acceso a zonas comunes",
      "5 Clases grupales gratis a la semana",
      "1 sesión mensual con entrenador",
      "Descuento en clases grupales extra"
    ],
    precio: "$450/mes"
  },
  planPremium: {
    nombre: "Plan Premium",
    descripcion: [
      "Acceso a zona VIP",
      "Clases grupales ilimitadas",
      "Sesión semanal con entrenador",
      "Plan nutricional personalizado",
      "Eventos y talleres exclusivos",
      "Cupones de descuento para la tienda"
    ],
    precio: "$700/mes"
  },
  planCorporativo: {
    nombre: "Plan Corporativo",
    descripcion: [
      "Ideal para empresas o grupos",
      "Beneficios del plan estándar",
      "Clase semanal especial para el grupo",
      "Cupones de descuento para la tienda"
    ],
    precio: "$400/mes por miembro"
  },
  planEstSen: {
    nombre: "Plan Estudiantil / Senior",
    descripcion: [
      "Beneficios del plan estándar",
      "Cupones de descuento para la tienda",
      "Entrenador de piso especializado para usuarios de este plan",
      "Acceso a eventos y talleres relacionados con este plan"
    ],
    precio: "$380/mes"
  }
};

// Abrir modal con contenido dinámico
export function abrirModal(planId) {
  const modal = document.getElementById("modalPlan");
  const plan = planes[planId];
  if (!plan) return;

  document.getElementById("modalTitulo").textContent = plan.nombre;
  const lista = document.getElementById("modalDescripcion");
  lista.innerHTML = "";
  plan.descripcion.forEach(linea => {
    const li = document.createElement("li");
    li.textContent = linea;
    lista.appendChild(li);
  });
  document.getElementById("modalPrecio").textContent = plan.precio;
  modal.dataset.planSeleccionado = planId;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const radios = document.querySelectorAll('#modalPlan .payment-option input[type="radio"]');
  radios.forEach(input => {
    input.addEventListener('change', () => {
      radios.forEach(r => r.closest('.payment-option').classList.remove('selected'));
      input.closest('.payment-option').classList.add('selected');
    });
  });
}

export function cerrarModal() {
  const modal = document.getElementById("modalPlan");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function mostrarDatosBancarios() {
  const datos = `
    <h3>Datos para transferencia bancaria</h3>
    <ul>
      <li><b>Banco:</b> BBVA</li>
      <li><b>Cuenta:</b> 1234567890</li>
      <li><b>CLABE:</b> 012345678901234567</li>
      <li><b>Beneficiario:</b> Aurum Gym</li>
    </ul>
    <p>Envía tu comprobante a: pagos@aurumgym.com</p>
    <button onclick="cerrarModal()">Cerrar</button>
  `;
  const modal = document.getElementById("modalPlan");
  modal.querySelector(".modal-content").innerHTML = datos;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Confirmar y guardar suscripción en Firestore y redirigir según método de pago
export async function confirmarSuscripcion() {
  const modal = document.getElementById("modalPlan");
  const planId = modal.dataset.planSeleccionado;
  const plan = planes[planId];

  if (!auth.currentUser) {
    alert("Debes iniciar sesión para suscribirte.");
    return;
  }

  const metodoPago = document.querySelector('input[name="payment"]:checked')?.value;

  if (!metodoPago) {
    alert("Por favor selecciona un método de pago.");
    return;
  }

  // Montos en centavos (Stripe) y en pesos (PayPal)
  const precios = {
    planDiario: 6000,
    planBasico: 35000,
    planEstandar: 45000,
    planPremium: 70000,
    planCorporativo: 40000,
    planEstSen: 38000
  };

  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().plan === plan.nombre) {
      alert(`Ya estás suscrito al ${plan.nombre}.`);
      cerrarModal();
      return;
    }

    cerrarModal();
    mostrarPlanEnPerfil(plan.nombre);

    // Redirección según método de pago
    if (metodoPago === "card") {
      // Stripe Checkout
      const amount = precios[planId]
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (data.url) {
        localStorage.setItem("planNombre", plan.nombre)
        localStorage.setItem("metodoPago", metodoPago)
        window.location.href = data.url
      } else {
        alert("Error al iniciar el pago con Stripe.");
      }
    } else if (metodoPago === "paypal") {
      // Redirección a PayPal con monto y descripción
      const amount = precios[planId]
      const res = await fetch("/create-paypal-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (data.url) {
          localStorage.setItem("planNombre", plan.nombre)
          localStorage.setItem("metodoPago", metodoPago)
          window.location.href = data.url
      } else {
          alert("Error al crear la orden de PayPal. Intenta de nuevo.")
      }      
    } else if (metodoPago === "transfer") {
      mostrarDatosBancarios();
    }

  } catch (err) {
    console.error("Error al guardar plan:", err);
    alert("Ocurrió un error al guardar tu plan.");
  }
}

// Cargar el plan actual al iniciar
export async function cargarPlanActual() {
  if (!auth.currentUser) return;

  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().plan) {
      mostrarPlanEnPerfil(userDoc.data().plan);
    }
  } catch (error) {
    console.error("Error al cargar el plan actual:", error);
  }
}

// Mostrar el plan en el perfil
export function mostrarPlanEnPerfil(planNombre) {
  const planLabel = document.getElementById("userPlan");
  if (planLabel) planLabel.textContent = planNombre;
}

// Asociar botón de confirmación al evento
document.addEventListener("DOMContentLoaded", () => {
  const botonConfirmar = document.getElementById("confirmarPago");
  if (botonConfirmar) {
    botonConfirmar.addEventListener("click", confirmarSuscripcion);
  }
});

// Detectar autenticación y cargar plan actual
onAuthStateChanged(auth, (user) => {
  if (user) {
    cargarPlanActual();
  } else {
    mostrarPlanEnPerfil("Sin suscripción");
  }
});

// Exportar funciones globalmente para uso desde HTML
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
