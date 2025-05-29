import { auth, db } from "./firebase-config.js"
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

/*Redirección a la página principal*/
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo img')
    if (logo) {
        logo.style.cursor = 'pointer'
        logo.addEventListener('click', () => {
            window.location.href = 'index.html#catalogo'
        })
    }
})

/*Inicia sección para el carrito de compras*/

/*Función para mostrar los productos agregados del carrito*/
const renderCartProducts = async () => {
    const user = auth.currentUser
    if (!user) {
        alert("Debes iniciar sesión para ver tu carrito.")
        return
    }

    /*Se consulta el carrito del usuario en firebase*/
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)

    /*Si no hay productos, se envia un mensaje*/
    if (cartDocs.empty || !(cartDocs.docs[0].data().items && cartDocs.docs[0].data().items.length > 0)) {
        document.querySelector('.products').innerHTML = "<h1>Tu carrito está vacío.</h1>"
        return
    }

    const cartData = cartDocs.docs[0].data()
    const items = cartData.items || []

    const productsContainer = document.querySelector('.products')
    productsContainer.innerHTML = ""

    /*Se crea un recuadro o div por cada producto en el carrito*/
    for (const item of items) {
        const productRef = doc(db, "products", item.id)
        const productSnap = await getDoc(productRef)

        if (!productSnap.exists()) continue
        const product = productSnap.data()

        const cartProduct = document.createElement("div")
        cartProduct.className = "cart-product"
        cartProduct.setAttribute("data-id", item.id)
        cartProduct.innerHTML = 
        `
            <button class="remove-btn"> x </button>
            <img src="${product.imagen}" alt="${product.nombre}" />
            <div class="item-details">
                <h4>${product.nombre}</h4>
                <h4>$${product.precio} MXN C/U</h4>
                <div class="quantity">
                    <button>-</button>
                    <span>${item.cantidad}</span>
                    <button>+</button>
                </div>
            </div>
        `
        productsContainer.appendChild(cartProduct)
    }
    /*Listeners de los botones x, - y +*/
    addQuantityListeners()
}

/*Función para mostrar el resumen del carrito*/
const renderCartSummary = async () => {
    const user = auth.currentUser
    if (!user) return

    /*Se consulta el carrito del usuario en firebase*/
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)

    /* Referencias a input y botón de cupón y a la sección de descuento*/
    const couponInput = document.getElementById('couponInput')
    const applyCouponBtn = document.getElementById('applyCouponBtn')
    const discountDiv = document.querySelector('.discount')
    const couponMessage = document.getElementById('couponMessage')

    /*Si no hay productos, se envia un mensaje*/
    if (cartDocs.empty || !(cartDocs.docs[0].data().items && cartDocs.docs[0].data().items.length > 0)) {
        document.querySelector('.cart-summary').innerHTML = "<h1>Tu carrito está vacío.</h1>"
        if (couponInput) couponInput.disabled = true
        if (applyCouponBtn) applyCouponBtn.disabled = true
        if (discountDiv) discountDiv.style.display = "none"
        if (couponMessage) couponMessage.textContent = ""
        return
    } else {
        if (couponInput) couponInput.disabled = false
        if (applyCouponBtn) applyCouponBtn.disabled = false
        if (couponInput) couponInput.disabled = false
        if (applyCouponBtn) applyCouponBtn.disabled = false
        if (discountDiv) discountDiv.style.display = "flex"
    }

    const cartData = cartDocs.docs[0].data()
    const items = cartData.items || []

    const summaryContainer = document.querySelector('.cart-summary')
    summaryContainer.innerHTML = ""

    let total = 0

    /*Se crea un recuadro o div por cada producto en el carrito*/
    for (const item of items) {
        /*Se obtienen detalles del producto desde la colección products*/
        const productRef = doc(db, "products", item.id)
        const productSnap = await getDoc(productRef)

        if (!productSnap.exists()) continue
        const product = productSnap.data()

        const subtotal = parseFloat((item.cantidad * product.precio).toFixed(2))
        total += subtotal

        /*Se crea el HTML del resumen del producto*/
        const summaryItem = document.createElement("div")
        summaryItem.className = "summary-item"
        summaryItem.setAttribute("data-id", item.id)
        summaryItem.innerHTML = 
        `
            <p>${product.nombre}<br/><small>${item.cantidad} x $${product.precio} MXN</small></p>
            <span style="display:block margin-top:4px">$${subtotal} MXN</span>
        `
        summaryContainer.appendChild(summaryItem)
    }

    /*Se desglosa el descuento*/
    let descuento = 0
    let descuentoHtml = ""
    if (appCoupon) {
        if (appCoupon.tipo === "porcentaje") {
            descuento = Math.round(total * (appCoupon.valor / 100))
            descuentoHtml = 
            `
                <div class="summary-discount">
                    <span>Descuento (${appCoupon.valor}%):</span>
                    <span>-$${descuento} MXN</span>
                </div>
            `
        } else if (appCoupon.tipo === "fijo") {
            descuento = appCoupon.valor
            descuentoHtml = 
            `
                <div class="summary-discount">
                    <span>Descuento:</span>
                    <span>-$${descuento} MXN</span>
                </div>
            `
        }
        if (descuento > total) descuento = total
    }

    const totalFinal = (total - descuento).toFixed(2)

    /*Se agrega el desglose de descuento y total final al resumen*/
    summaryContainer.innerHTML += 
    `
        ${descuentoHtml}
        <div class="summary-total-final">
            <span>Total a pagar:</span>
            <span>$${totalFinal} MXN</span>
        </div>
    `
}

/*Función para agregar listeners a los botones + y - de cada producto*/
const addQuantityListeners = () => {
    document.querySelectorAll('.cart-product').forEach(cartProduct => {
        const productId = cartProduct.getAttribute('data-id')
        const minusBtn = cartProduct.querySelector('.quantity button:first-child')
        const plusBtn = cartProduct.querySelector('.quantity button:last-child')
        const quantitySpan = cartProduct.querySelector('.quantity span')

        /*Para disminuir la cantidad*/
        minusBtn.addEventListener('click', async () => {
            let cantidad = parseInt(quantitySpan.textContent)
            if (cantidad > 1) {
                cantidad--
                await updateCartItemQuantity(productId, cantidad)
                quantitySpan.textContent = cantidad
                updateSummaryItem(productId, cantidad)
                await renderCartSummary()
            }
        })

        /*Para aumentar la cantidad*/
        plusBtn.addEventListener('click', async () => {
            let cantidad = parseInt(quantitySpan.textContent)
            cantidad++
            await updateCartItemQuantity(productId, cantidad)
            quantitySpan.textContent = cantidad
            updateSummaryItem(productId, cantidad)
            await renderCartSummary()
        })

        /*Para eliminar un producto*/
        const removeBtn = cartProduct.querySelector('.remove-btn')
        removeBtn.addEventListener('click', async () => {
            await removeCartItem(productId)
            /*Se elimina el producto y su summary del carrito*/
            cartProduct.remove()
            const summaryItem = document.querySelector(`.summary-item[data-id="${productId}"]`)
            if (summaryItem) summaryItem.remove()
            await renderCartSummary()
            await renderCartProducts()
        })
    })
}

/*Función para actualizar la cantidad del producto en Firestore*/
const updateCartItemQuantity = async (productId, newQuantity) => {
    const user = auth.currentUser
    if (!user) return

    /*Se consulta el documento del carrito del usuario*/
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)
    if (cartDocs.empty) return

    /*Se obtienen los datos actuales*/
    const cartDoc = cartDocs.docs[0]
    const cartData = cartDoc.data()
    let items = cartData.items || []

    /*Se actualiza la cantidad del producto*/
    items = items.map(item =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item
    )

    /*Se guardan los cambios en la base de datos*/
    await updateDoc(cartDoc.ref, { items })
}

/*Función para actualizar el resumen del producto en Firestore*/	
const updateSummaryItem = async (productId, cantidad) => {
    /*Se Busca el summary-item correspondiente*/
    const summaryItems = document.querySelectorAll('.summary-item')

    /*Si el data-id coincide con el producto*/
    for (const summaryItem of summaryItems) {
        if (summaryItem.getAttribute('data-id') === productId) {
            /*Se obtiene el precio unitario*/
            const productRef = doc(db, "products", productId)
            const productSnap = await getDoc(productRef)
            if (!productSnap.exists()) return
            const product = productSnap.data()
            const subtotal = cantidad * product.precio
            //*Se actualiza el resumen del producto*/
            summaryItem.innerHTML = 
            `
                <p>${product.nombre}<br/><small>${cantidad} x $${product.precio}</small></p>
                <span>$${subtotal}</span>
            `
            break
        }
    }
}

/*Funcion para eliminar producto del carrito*/
const removeCartItem = async (productId) => {
    /*Se obtiene el usuario*/
    const user = auth.currentUser
    if (!user) return

    /*Se consulta el documento de la colección del carrito del usuario*/
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)
    if (cartDocs.empty) return

    /*Se obtienen los datos del carrito*/
    const cartDoc = cartDocs.docs[0]
    const cartData = cartDoc.data()
    let items = cartData.items || []

    /*Se filtra el producto a eliminar*/
    items = items.filter(item => item.id !== productId)

    /*Se actualiza el carrito en la base de datos*/
    await updateDoc(cartDoc.ref, { items })
}

let appCoupon = null /*Para guardar el cupón a aplicar*/

/*Función para guardar el cupón en Firebase*/
const saveCoupon = async (coupon) => {
    const user = auth.currentUser
    if (!user) return
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)
    if (cartDocs.empty) return
    const cartDoc = cartDocs.docs[0]
    await updateDoc(cartDoc.ref, { coupon: coupon ? coupon : null })
}

/*Función para validar y aplicar el cupón*/
const applyCoupon = async () => {
    const input = document.getElementById('couponInput')
    const code = input.value.trim()
    const messageDiv = document.getElementById('couponMessage')
    if (!code) {
        messageDiv.textContent = "Ingresa un código de cupón."
        appCoupon = null
        renderCartSummary()
        return
    }

    /*Se busca el cupón en  la base de datos*/
    const couponsRef = collection(db, "coupons")
    const q = query(couponsRef, where("codigo", "==", code), where("activo", "==", true))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        messageDiv.textContent = "Cupón no válido o inactivo."
        appCoupon = null
        localStorage.removeItem('appliedCoupon')

        await saveCoupon('apliedCoupon')
        renderCartSummary()
        return
    }

    /*Se agarra el primer cupón válido*/
    const coupon = querySnapshot.docs[0].data()
    appCoupon = coupon
    localStorage.setItem('appliedCoupon', JSON.stringify(coupon))
    messageDiv.textContent = coupon.tipo === "porcentaje"
        ? `Cupón aplicado: ${coupon.valor}% de descuento`
        : `Cupón aplicado: $${coupon.valor} de descuento`

    await saveCoupon(coupon)
    renderCartSummary()
}

/*Listener para aplicar cupón*/
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('applyCouponBtn')
    if (btn) btn.addEventListener('click', applyCoupon)

    const couponInput = document.getElementById('couponInput')
    if (couponInput) {
        couponInput.addEventListener('input', () => {
            if (couponInput.value.trim() === "") {
                appCoupon = null
                document.getElementById('couponMessage').textContent = ""
                localStorage.removeItem('appliedCoupon')
                saveCoupon(null)
                renderCartSummary()
            }
        })
    }
})

/*Si el usuario esta autenticado, se muestran productos si es que tiene*/
auth.onAuthStateChanged(async user => {
    if (user) {
        const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
        const cartDocs = await getDocs(cartQuery)
        if (!cartDocs.empty) {
            const cartData = cartDocs.docs[0].data()
            if (cartData.coupon) {
                appCoupon = cartData.coupon
                localStorage.setItem('appliedCoupon', JSON.stringify(cartData.coupon))
                /*Se muestra mensaje y código en el input*/
                const messageDiv = document.getElementById('couponMessage')
                const couponInput = document.getElementById('couponInput')
                if (couponInput && cartData.coupon.codigo) {
                    couponInput.value = cartData.coupon.codigo
                }
                if (messageDiv) {
                    messageDiv.textContent = cartData.coupon.tipo === "porcentaje"
                        ? `Cupón aplicado: ${cartData.coupon.valor}% de descuento`
                        : `Cupón aplicado: $${cartData.coupon.valor} de descuento`
                }
            } else {
                appCoupon = null
                localStorage.removeItem('appliedCoupon')
                /*Se limpia el input si no hay cupón*/
                const couponInput = document.getElementById('couponInput')
                if (couponInput) couponInput.value = ""
            }
        }
        renderCartProducts()
        renderCartSummary()
    }
})

/*Finaliza sección para el carrito de compras*/

/*Inicia sección para el proceso de pago*/

/*Para seleccionar el método de pago*/
document.querySelectorAll('.payment-option input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected')
        })
        radio.closest('.payment-option').classList.add('selected')
    })
})

/*Para seleccionar la opción de pago*/
document.querySelectorAll('.shipping-option input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.shipping-option').forEach(option => {
            option.classList.remove('selected')
        })
        radio.closest('.shipping-option').classList.add('selected')
    })
})

/*Para mostra el resumen del carrito en el proceso de pago*/
let descuento = 0, subtotalConDescuento = 0, impuesto = 0, envio = 0, total = 0
const renderCartSummaryProcesoPago = async (envioGuardado = null) => {
    const user = auth.currentUser
    if (!user) return

    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)

    const summaryContainer = document.querySelector('#container-proceso-pago .cart-summary')
    if (!summaryContainer) return
    summaryContainer.innerHTML = ""

    if (cartDocs.empty || !(cartDocs.docs[0].data().items && cartDocs.docs[0].data().items.length > 0)) {
        summaryContainer.innerHTML = "<h1>Tu carrito está vacío.</h1>"
        return
    }

    const cartData = cartDocs.docs[0].data()
    const items = cartData.items || []

    let subtotal = 0

    for (const item of items) {
        const productRef = doc(db, "products", item.id)
        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) continue
        const product = productSnap.data()
        const itemSubtotal = product.precio * item.cantidad
        subtotal += itemSubtotal

        const summaryItem = document.createElement("div")
        summaryItem.className = "summary-item"
        summaryItem.setAttribute("data-id", item.id)
        summaryItem.innerHTML = 
        `
        <p>${product.nombre}<br/><small>${item.cantidad} x $${product.precio}</small></p>
        <span style="display:block margin-top:4px">$${itemSubtotal.toFixed(2)}</span>
        `
        summaryContainer.appendChild(summaryItem)
    }

    /*Se aplica descuento si hay cupón*/
    if (appCoupon) {
        if (appCoupon.tipo === "porcentaje") {
            descuento = subtotal * (appCoupon.valor / 100)
        } else if (appCoupon.tipo === "fijo") {
            descuento = appCoupon.valor
        }
        if (descuento > subtotal) descuento = subtotal
    }
    subtotalConDescuento = subtotal - descuento

    /*Cálculo de impuestos y envío*/
    impuesto = subtotalConDescuento * 0.04; /*4% de impuesto*/
    envio = 180; /*Default DHL*/
    let metodoEnvio = envioGuardado
    if (!metodoEnvio) {
        const shippingSelected = document.querySelector('#container-proceso-pago input[name="shipping"]:checked')
        metodoEnvio = shippingSelected ? shippingSelected.value : "dhl"
    }
    if (metodoEnvio === "dhl") envio = 180
    else if (metodoEnvio === "estafeta") envio = 120
    else if (metodoEnvio === "fedex") envio = 200

    const total = subtotalConDescuento + impuesto + envio

    /*Se agrega el desglose al final del resumen*/
    summaryContainer.innerHTML += 
    `
    ${descuento > 0 ? `<div class="summary-row summary-item-2"><span>Descuento:</span><span>-$${descuento.toFixed(2)} MXN</span></div>` : ""}
    <div class="summary-row summary-item-2"><span>Subtotal:</span><span>$${subtotalConDescuento.toFixed(2)} MXN</span></div>
    <div class="summary-row summary-item-2"><span>Impuesto:</span><span>$${impuesto.toFixed(2)} MXN</span></div>
    <div class="summary-row summary-item-2"><span>Envío:</span><span>$${envio.toFixed(2)} MXN</span></div>
    <div class="summary-row total summary-item-2"><span>TOTAL:</span><span>$${total.toFixed(2)} MXN</span></div>
    `
}

/*Para cambiar en las diferentes secciones*/
document.addEventListener('DOMContentLoaded', () => {
    const carrito = document.getElementById('container-carrito')
    const procesoPago = document.getElementById('container-proceso-pago')
    const btnProcesoPago = document.getElementById('proceso-pago-btn')
    const btnEdit = document.getElementById('edit-btn')
    const btnContinue = document.getElementById('continue-btn')
    const btnReview = document.getElementById('review-btn')

    /*Se muestra proceso de pago y se oculta el carrito*/
    btnProcesoPago?.addEventListener('click', () => {
        carrito.style.display = 'none'
        procesoPago.style.display = 'grid'
        NavActive(1)
        renderCartSummaryProcesoPago()
        cargarDatosProcesoPago()
    })

    /*Se vuelve al carrito desde proceso de pago*/
    btnEdit?.addEventListener('click', (e) => {
        e.preventDefault()
        procesoPago.style.display = 'none'
        carrito.style.display = 'flex'
        NavActive(0)
    })

    /*Para redirigir al catálogo (index.html)*/
    btnContinue?.addEventListener('click', (e) => {
        e.preventDefault()
        window.location.href = 'index.html#catalogo'
    })

    btnReview?.addEventListener('click', (e) => {
    })

    NavActive(0)
})

/*Función para cambiar la clase active en el nav-pay*/
const NavActive = async (stepIndex) => {
    const navSpans = document.querySelectorAll('.nav-pay span')
    navSpans.forEach((span, idx) => {
        if (idx === stepIndex) {
            span.classList.add('active')
        } else {
            span.classList.remove('active')
        }
    })
}

/*Función para guardas los datos del proceso de pago*/
const SDProcesoPago = async (event) => {
    if (event) event.preventDefault()

    const user = auth.currentUser

    /*Se obtienen los valores del formulario*/
    const respuestas = {
        email: user.email,
        telefono: document.querySelector('.form-input[placeholder="Tu telefono"]')?.value || "",
        nombre: document.querySelector('.form-input[placeholder="Tu nombre"]')?.value || "",
        apellido: document.querySelector('.form-input[placeholder="Tu apellido"]')?.value || "",
        direccion: document.querySelector('.form-input[placeholder="Calle, número, colonia"]')?.value || "",
        cp: document.querySelector('.form-input[placeholder="12345"]')?.value || "",
        ciudad: document.querySelector('.form-input[placeholder="Ciudad"]')?.value || "",
        estado: document.querySelector('.form-input[placeholder="Estado"]')?.value || "",
        pais: document.querySelector('.form-input[value="México"]')?.value || "",
        municipio: document.querySelector('.form-input[placeholder="Municipio"]')?.value || "",
        metodoPago: document.querySelector('input[name="payment"]:checked')?.value || "",
        metodoEnvio: document.querySelector('input[name="shipping"]:checked')?.value || "",
        usuarioUid: user.uid,
        fecha: Timestamp.now()
    }

    /*Se validan de campos obligatorios*/
    for (const key in respuestas) {
        if (respuestas[key] === "" && key !== "pais" !=="email") {
            alert("Por favor, completa todos los campos obligatorios.")
            return
        }
    }

    try {
        /*Obtener los productos del carrito*/
        const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
        const cartDocs = await getDocs(cartQuery)
        if (cartDocs.empty) {
            alert("Tu carrito está vacío.")
            return
        }
        const cartData = cartDocs.docs[0].data()
        respuestas.items = cartData.items || []

        /* Buscar si ya existe una documento para el usuario*/
        const q = query(collection(db, "procpago"), where("email", "==", respuestas.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            /*Si ya existe, se actualiza el documento*/
            const docRef = querySnapshot.docs[0].ref
            await setDoc(docRef, respuestas)
            alert("Datos de proceso de pago actualizados exitosamente.")
            await renderCartSummaryProcesoPago(respuestas.metodoEnvio)
        } else {
            /*Si no existe, se crea uno nuevo*/
            await addDoc(collection(db, "procpago"), respuestas)
            alert("Datos de proceso de pago guardados exitosamente.")
            await renderCartSummaryProcesoPago(respuestas.metodoEnvio)
        }
    } catch (error) {
        console.error("Error al guardar los datos del proceso de pago:", error)
        alert("Hubo un error al guardar los datos. Inténtalo de nuevo.")
    }
}

// Asigna el evento al botón después de mostrar la sección de proceso de pago
document.addEventListener('DOMContentLoaded', () => {
    const btnGuardar = document.getElementById('sd-btn')
    if (btnGuardar) {
        btnGuardar.addEventListener('click', SDProcesoPago)
    }
})

/*Para usar la función de guardar datos del proceso de pago*/
// Cargar datos guardados del proceso de pago al formulario
async function cargarDatosProcesoPago() {
    const user = auth.currentUser
    if (!user) return

    // Buscar documento en la colección procpago
    const q = query(collection(db, "procpago"), where("email", "==", user.email))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return

    const datos = querySnapshot.docs[0].data()

    // Cargar los valores en los inputs del formulario
    document.querySelector('.form-input[placeholder="Tu telefono"]').value = datos.telefono || ""
    document.querySelector('.form-input[placeholder="Tu nombre"]').value = datos.nombre || ""
    document.querySelector('.form-input[placeholder="Tu apellido"]').value = datos.apellido || ""
    document.querySelector('.form-input[placeholder="Calle, número, colonia"]').value = datos.direccion || ""
    document.querySelector('.form-input[placeholder="12345"]').value = datos.cp || ""
    document.querySelector('.form-input[placeholder="Ciudad"]').value = datos.ciudad || ""
    document.querySelector('.form-input[placeholder="Estado"]').value = datos.estado || ""
    document.querySelector('.form-input[value="México"]').value = datos.pais || "México"
    document.querySelector('.form-input[placeholder="Municipio"]').value = datos.municipio || ""

    // Seleccionar método de pago
    if (datos.metodoPago) {
        const pagoRadio = document.querySelector(`input[name="payment"][value="${datos.metodoPago}"]`)
        pagoRadio.checked = true
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected')
        })
        pagoRadio.closest('.payment-option').classList.add('selected')
    }

    // Seleccionar método de envío
    if (datos.metodoEnvio) {
        const envioRadio = document.querySelector(`input[name="shipping"][value="${datos.metodoEnvio}"]`)
        envioRadio.checked = true
        document.querySelectorAll('.shipping-option').forEach(option => {
            option.classList.remove('selected')
        })
        envioRadio.closest('.shipping-option').classList.add('selected')
    }
}

/*Finaliza sección para el proceso de pago*/

/*Inicia sección para finalizar el pago*/
// Mostrar sección de revisión del pedido
const containerCarrito = document.getElementById('container-carrito')
const containerProcesoPago = document.getElementById('container-proceso-pago')
const containerRevision = document.getElementById('container-revision')
const btnReview = document.getElementById('review-btn')
const btnVolverPago = document.getElementById('volver-pago-btn')

// Navegación: Proceso de Pago -> Revisión del Pedido
btnReview?.addEventListener('click', async () => {
    containerProcesoPago.style.display = 'none'
    containerRevision.style.display = 'flex'
    NavActive(2)
    await renderRevisionSummary()
    renderRevisionPayment()
})

// Navegación: Revisión del Pedido -> Proceso de Pago
btnVolverPago?.addEventListener('click', () => {
    containerRevision.style.display = 'none'
    containerProcesoPago.style.display = 'grid'
    NavActive(1)
})

// Renderiza el resumen del pedido en la revisión
async function renderRevisionSummary() {
    const user = auth.currentUser
    if (!user) return
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)
    const summaryDiv = document.getElementById('revision-summary')
    summaryDiv.innerHTML = ""

    if (cartDocs.empty || !(cartDocs.docs[0].data().items && cartDocs.docs[0].data().items.length > 0)) {
        summaryDiv.innerHTML = "<h3>Tu carrito está vacío.</h3>"
        return
    }

    const cartData = cartDocs.docs[0].data()
    const items = cartData.items || []
    for (const item of items) {
        const productRef = doc(db, "products", item.id)
        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) continue
        const product = productSnap.data()
        const subtotal = parseFloat((item.cantidad * product.precio).toFixed(2))
        summaryDiv.innerHTML += `
            <div class="summary-item">
                <p>${product.nombre} (${item.cantidad} x $${product.precio})</p>
                <span>$${subtotal} MXN</span>
            </div>
        `
    }
    
    summaryDiv.innerHTML += `
        ${descuento > 0 ? `<div class="summary-row"><span>Descuento:</span><span>-$${descuento.toFixed(2)} MXN</span></div>` : ""}
        <div class="summary-row"><span>Subtotal:</span><span>$${subtotalConDescuento.toFixed(2)} MXN</span></div>
        <div class="summary-row"><span>Impuesto:</span><span>$${impuesto.toFixed(2)} MXN</span></div>
        <div class="summary-row"><span>Envío:</span><span>$${envio.toFixed(2)} MXN</span></div>
        <div class="summary-row total"><span>TOTAL:</span><span id="payment-total">$${total.toFixed(2)} MXN</span></div>
    `
}

// Renderiza el botón de pago según método seleccionado
const renderRevisionPayment = async() => {
    const confirmarPagoBtn = document.getElementById('confirmar-pago-btn')
    const metodoPago = document.querySelector('input[name="payment"]:checked')?.value || "card"
    confirmarPagoBtn.innerHTML = ""

    if (metodoPago === "card") {
        confirmarPagoBtn.classList.add('btn-stripe')
        confirmarPagoBtn.id = 'stripePayBtn'
        confirmarPagoBtn.innerHTML = `
            <span style="font-weight:bold;">Pagar con</span>
            <img src="./images/stripe.png" class="stripe-logo" />
        `
        setTimeout(() => {
            confirmarPagoBtn.addEventListener('click', async () => {
                const totalElement = document.getElementById('payment-total')
                if (!totalElement) return
                const totalText = totalElement.textContent.replace(/[^\d.]/g, '')
                const amount = Math.round(parseFloat(totalText) * 100)
                const res = await fetch("http://localhost:5500/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                })
                const data = await res.json()
                if (data.url) {
                    window.location.href = data.url // redirige a Stripe Checkout
                } else {
                    alert("Error al crear la sesión de pago. Intenta de nuevo.")
                }
            })
        }, 100)
    } else if (metodoPago === "paypal") {
        confirmarPagoBtn.classList.add('btn-paypal')
        confirmarPagoBtn.innerHTML = `
            <span style="font-weight:bold;">Pagar con</span>
            <img src="./images/paypal.png" class="paypal-logo" />
        `
        // Evento para PayPal
        setTimeout(() => {
            confirmarPagoBtn.addEventListener('click', async () => {
                const totalElement = document.getElementById('payment-total')
                if (!totalElement) return
                const totalText = totalElement.textContent.replace(/[^\d.]/g, '')
                const amount = Math.round(parseFloat(totalText) * 100)
                const res = await fetch("http://localhost:5500/create-paypal-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                })
                const data = await res.json()
                if (data.url) {
                    window.location.href = data.url // redirige a PayPal Checkout
                } else {
                    alert("Error al crear la orden de PayPal. Intenta de nuevo.")
                }
            })
        }, 100)
    } else if (metodoPago === "transfer") {
        confirmarPagoBtn.classList.add('bank-info')
        confirmarPagoBtn.innerHTML = `
            <div class="bank-info">
                <h4>Datos para Transferencia Bancaria</h4>
                <p>
                    <strong>Banco:</strong> BBVA<br>
                    <strong>Cuenta:</strong> 1234567890<br>
                    <strong>CLABE:</strong> 012345678901234567<br>
                    <strong>Titular:</strong> Aurum Gym
                </p>
                <div style="margin-top:12px; color:#b57f00;">
                    <strong>Importante:</strong> Una vez realizada la transferencia, envía tu comprobante a <a href="mailto:pagos@aurumgym.com">pagos@aurumgym.com</a> para procesar tu pedido.
                </div>
            </div>
        `
    }
}