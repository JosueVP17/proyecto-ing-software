import { auth, db } from "./firebase-config.js"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

/*Redirección a la página principal*/
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo img')
    if (logo) {
        logo.style.cursor = 'pointer'
        logo.addEventListener('click', () => {
            window.location.href = 'index.html#catalogo'
        });
    }
});

/*Inicia sección para el carrito de compras*/

/*Función para mostrar los productos agregados del carrito*/
const renderCartProducts = async () => {
    const user = auth.currentUser
    if (!user) {
        alert("Debes iniciar sesión para ver tu carrito.")
        return;
    }

    /*Se consulta el carrito del usuario en firebase*/
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)

    /*Si no hay productos, se envia un mensaje*/
    if (cartDocs.empty || !(cartDocs.docs[0].data().items && cartDocs.docs[0].data().items.length > 0)) {
        document.querySelector('.products').innerHTML = "<h1>Tu carrito está vacío.</h1>"
        return;
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
            <span style="display:block; margin-top:4px;">$${subtotal} MXN</span>
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
            descuento = appCoupon.valor;
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
                await renderTotal()
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
            await renderTotal()
        })

        /*Para eliminar un producto*/
        const removeBtn = cartProduct.querySelector('.remove-btn')
        removeBtn.addEventListener('click', async () => {
            await removeCartItem(productId)
            /*Se elimina el producto y su summary del carrito*/
            cartProduct.remove();
            const summaryItem = document.querySelector(`.summary-item[data-id="${productId}"]`)
            if (summaryItem) summaryItem.remove()
            await renderCartSummary()
            await renderCartProducts()
            await renderTotal()
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

/*Función para mostrar el total del carrito*/
const renderTotal = async () => {
    /*Se obtiene el usuario*/
    const user = auth.currentUser
    if (!user) return

    /*Se consulta el documento de la colección del carrito del usuario*/
    const cartQuery = query(collection(db, "cart"), where("email", "==", user.email))
    const cartDocs = await getDocs(cartQuery)

    /*Si no hay productos, se muestra $0*/
    if (cartDocs.empty) {
        document.querySelector('.total span').textContent = "$0"
        return;
    }

    /*Se obtienen los datos del carrito*/
    const cartData = cartDocs.docs[0].data();
    const items = cartData.items || [];

    let total = 0
    /*Se suman los totales de los productos*/
    for (const item of items) {
        const productRef = doc(db, "products", item.id)
        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) continue
        const product = productSnap.data()
        total += item.cantidad * product.precio
    }

    /*Aplicando el cupón si hay*/
    let descuento = 0
    if (appCoupon) {
        if (appCoupon.tipo === "porcentaje") {
            descuento = Math.round(total * (appCoupon.valor / 100));
        } else if (appCoupon.tipo === "fijo") {
            descuento = appCoupon.valor
        }
        if (descuento > total) descuento = total;
    }

    const totalFinal = total - descuento
    /*Se muestra el total de todo el carrito*/
    document.querySelector('.total span').textContent = `$${totalFinal}`
}

let appCoupon = null /*Para guardar el cupón a aplicar*/

/*Función para validar y aplicar el cupón*/
const applyCoupon = async () => {
    const input = document.getElementById('couponInput')
    const code = input.value.trim()
    const messageDiv = document.getElementById('couponMessage')
    if (!code) {
        messageDiv.textContent = "Ingresa un código de cupón."
        appCoupon = null
        renderCartSummary()
        renderTotal()
        return
    }

    /*Se busca el cupón en  la base de datos*/
    const couponsRef = collection(db, "coupons")
    const q = query(couponsRef, where("codigo", "==", code), where("activo", "==", true))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        messageDiv.textContent = "Cupón no válido o inactivo."
        appCoupon = null
        renderCartSummary()
        renderTotal()
        return
    }

    /*Se agarra el primer cupón válido*/
    const coupon = querySnapshot.docs[0].data()
    appCoupon = coupon;
    messageDiv.textContent = coupon.tipo === "porcentaje"
        ? `Cupón aplicado: ${coupon.valor}% de descuento`
        : `Cupón aplicado: $${coupon.valor} de descuento`

    renderCartSummary()
    renderTotal()
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
                renderCartSummary()
                renderTotal()
            }
        })
    }
})

/*Si el usuario esta autenticado, se muestran productos si es que tiene*/
auth.onAuthStateChanged(user => {
    if (user) {
        renderCartProducts()
        renderCartSummary()
        renderTotal()
    }
})

/*Finaliza sección para el carrito de compras*/

/*Inicia sección para el proceso de pago*/

/*Para seleccionar el método de pago*/
document.querySelectorAll('.payment-option input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });
        radio.closest('.payment-option').classList.add('selected');
    });
});

/*Para seleccionar la opción de pago*/
document.querySelectorAll('.shipping-option input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.shipping-option').forEach(option => {
            option.classList.remove('selected');
        });
        radio.closest('.shipping-option').classList.add('selected');
    });
});
/*Finaliza sección para el proceso de pago*/