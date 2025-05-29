import {auth, db} from "./firebase-config.js"
import {collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

const productsCollection = collection(db, 'products')
let allProducts = []
let filtros = {
    marca: "",
    precioMin: "",
    precioMax: ""
}

// OBTENER PRODUCTOS DE FIREBASE
const getProducts = async() => {
    try {
        const products = await getDocs(productsCollection)
        return products.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))

    } catch (error) {
       console.error('Error al obtener los productos => ', error)
    }
}

// MOSTRAR Y OCULTAR MODAL DE FILTROS
const filterModal = document.getElementById('filterModal')
const filterBtn = document.getElementById('filterBtn')
const closeFilterModal = document.getElementById('closeFilterModal')

filterBtn.addEventListener('click', () => {
    // Mostrar modal
    filterModal.style.display = 'block';

    // Reiniciar el listado de marcas
    const marcaFiltro = document.getElementById('marcaFiltro')
    marcaFiltro.innerHTML = '<option value="">Todas</option>'

    // Guardar el nombre de cada marca
    const marcas = [...new Set(allProducts.map(p => p.marca))]
    // Crear dropdown con las marcas
    marcas.forEach(marca => {
        const option = document.createElement('option')
        option.value = marca
        option.textContent = marca
        marcaFiltro.appendChild(option)
    })
})

// Cerrar modal
closeFilterModal.addEventListener('click', () => {
    filterModal.style.display = 'none'
})

// Cerrar modal sin botón
window.onclick = function(event) {
    if (event.target == filterModal) filterModal.style.display = "none"
}

// APLICAR O ELIMINAR FILTROS
const aplicarFiltrosBtn = document.getElementById('aplicarFiltros')
aplicarFiltrosBtn.addEventListener('click', () => {
    // Guardar los filtros
    filtros.marca = document.getElementById('marcaFiltro').value
    filtros.precioMin = document.getElementById('precioMin').value
    filtros.precioMax = document.getElementById('precioMax').value
    filterModal.style.display = 'none'
    renderProducts(document.getElementById('searchInput')?.value || "")
    renderTable(document.getElementById('searchInput')?.value || "")
})

const eliminarFiltrosBtn = document.getElementById('eliminarFiltros')
eliminarFiltrosBtn.addEventListener('click', () => {
    // Limpiar los filtros
    filtros.marca = ""
    filtros.precioMin = ""
    filtros.precioMax = ""
    document.getElementById('marcaFiltro').value = ""
    document.getElementById('precioMin').value = ""
    document.getElementById('precioMax').value = ""
    filterModal.style.display = 'none'
    renderProducts(document.getElementById('searchInput')?.value || "")
    renderTable(document.getElementById('searchInput')?.value || "")
})

// EVENTO PARA LA BARRA DE BÚSQUEDA
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value)
            renderTable(e.target.value)
        })
    }
})

// CARGAR PRODUCTOS DEL CATÁLOGO
const renderProducts = async (filterText = "") => {
    const productsContainer = document.getElementById('productos')
    productsContainer.innerHTML = ''

    allProducts = await getProducts()

    // Filtrar productos por nombre o marca
    const filteredProducts = allProducts.filter(product => {
        const text = filterText.toLowerCase()

        // Para cada coincidencia es True o False
        // Si coincide con el nombre o marca, TRUE
        let coincideBusqueda = (
            product.nombre.toLowerCase().includes(text) ||
            product.marca.toLowerCase().includes(text)
        )
        // Si no hay filtro de marca o si coincide este producto con el filtro, TRUE
        let coincideMarca = !filtros.marca || product.marca === filtros.marca
        // Si no hay filtro de precio mínimo o si el precio es mayor al filtro, TRUE
        let coincidePrecioMin = !filtros.precioMin || Number(product.precio) >= Number(filtros.precioMin)
        // Si no hay filtro de precio máximo o si el precio es menor al filtro, TRUE
        let coincidePrecioMax = !filtros.precioMax || Number(product.precio) <= Number(filtros.precioMax)
        // Si todas coincidencias son TRUE, se filtra el producto a filteredProducts
        return coincideBusqueda && coincideMarca && coincidePrecioMin && coincidePrecioMax
    })

    // Renderizar los productos
    filteredProducts.forEach((product) => {
        const productCard = document.createElement('div')
        productCard.innerHTML = `
            <img src="${product.imagen}">
            <h4>${product.marca}</h4>
            <h3>${product.nombre}</h3>
            <div>
                <p>$${product.precio}</p>
                <button class="addToCart" data-id=${product.id}><i class="fa fa-shopping-cart fa-2x" aria-hidden="true"></i></button>
            </div>
        `
        productCard.classList.add('producto')
        productsContainer.appendChild(productCard)
    })

    document.querySelectorAll(".addToCart").forEach((btn) => {
        // Obtener el id del producto del botón
        const productId = btn.getAttribute('data-id')

        btn.addEventListener('click', async() => {
            const user = auth.currentUser
            if (!user) {
                alert('Debes iniciar sesión para agregar productos al carrito.')
                return;
            }
            const userEmail = user.email

            // Tabla cart
            const cartCollection = collection(db, 'cart')
            // Consulta para buscar un documento con el userEmail
            const cartQuery = query(cartCollection, where('email', '==', userEmail))
            // Resultado de la consulta
            const cartDocs = await getDocs(cartQuery)

            let cartDocRef
            let cartData = { email: userEmail, items: []}

            if(!cartDocs.empty) {
                // Si existe el documento con userEmail
                // Referencia al documento con userEmail
                cartDocRef = cartDocs.docs[0].ref
                // Datos del documento
                cartData = cartDocs.docs[0].data()

                const index = cartData.items.findIndex(item => item.id === productId)
                if(index !== -1) {
                    // Si existe el producto aumenta en uno
                    cartData.items[index].cantidad += 1
                } else {
                    // Si no existe añade el producto al array de items
                    cartData.items.push({id: productId, cantidad: 1})
                }
                // Actualiza el documento con el array actualizado
                await updateDoc(cartDocRef, {items: cartData.items})
            } else {
                // Si no existe el documento añadir el producto con cantidad 1
                cartData.items.push({id: productId, cantidad: 1})

                // Añadir el documento con el correo, el producto y la cantidad
                await addDoc(cartCollection, cartData)
            }

            alert('Producto añadido al carrito')
        })
    })
}

const renderTable = async (filterText = "") => {
    const tbody = document.getElementById('tbody')
    tbody.innerHTML = ''

    allProducts = await getProducts()

    // Filtrar productos por nombre o marca
    const filteredProducts = allProducts.filter(product => {
        const text = filterText.toLowerCase()

        // Para cada coincidencia es True o False
        // Si coincide con el nombre o marca, TRUE
        let coincideBusqueda = (
            product.nombre.toLowerCase().includes(text) ||
            product.marca.toLowerCase().includes(text)
        )
        // Si no hay filtro de marca o si coincide este producto con el filtro, TRUE
        let coincideMarca = !filtros.marca || product.marca === filtros.marca
        // Si no hay filtro de precio mínimo o si el precio es mayor al filtro, TRUE
        let coincidePrecioMin = !filtros.precioMin || Number(product.precio) >= Number(filtros.precioMin)
        // Si no hay filtro de precio máximo o si el precio es menor al filtro, TRUE
        let coincidePrecioMax = !filtros.precioMax || Number(product.precio) <= Number(filtros.precioMax)
        // Si todas coincidencias son TRUE, se filtra el producto a filteredProducts
        return coincideBusqueda && coincideMarca && coincidePrecioMin && coincidePrecioMax
    })

    filteredProducts.forEach((product) => {
        const row = document.createElement('tr')

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nombre}</td>
            <td>$${product.precio}</td>
            <td>${product.marca}</td>
            <td><img src="${product.imagen}"></td>
            <td>${product.descripcion}</td>
            <td>
                <button class="productEdit edit" data-id=${product.id}><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button>
                <button class="productDelete delete" data-id=${product.id}><i class="fa fa-trash" aria-hidden="true"></i> Eliminar</button>
            </td>
        `

        tbody.appendChild(row)
    })

    // ACTIVACIÓN DEL MODAL PARA ACTUALIZAR PRODUCTO
    const modalActualizar = document.getElementById('modalActualizar')
    document.querySelectorAll('.edit').forEach((btn) => {
        btn.addEventListener('click', async(event) => {
            modalActualizar.style.display = 'block'

            const productId = event.target.getAttribute('data-id')
            const productRef = doc(db, 'products', productId)
            const productSnap = await getDoc(productRef)
            const productData = productSnap.data()

            const id = document.getElementById('updateProductID')
            const nombre = document.getElementById('updateNombre')
            const precio = document.getElementById('updatePrecio')
            const marca = document.getElementById('updateMarca')
            const imagen = document.getElementById('updateImagen')
            const descripcion = document.getElementById('updateDescripcion')

            id.value = productId
            nombre.value = productData.nombre
            precio.value = productData.precio
            marca.value = productData.marca
            imagen.value = productData.imagen
            descripcion.value = productData.descripcion
        })
    })

    // CERRAR MODAL PARA ACTUALIZAR PRODUCTO
    const updateModalCloseBtn = document.getElementById('updateModalCloseBtn')
    updateModalCloseBtn.addEventListener('click', () => {
        modalActualizar.style.display = 'none'
    })

    // ACTIVACIÓN DEL MODAL PARA ELIMINAR PRODUCTO
    const modalEliminar = document.getElementById('modalEliminar')
    document.querySelectorAll('.delete').forEach((btn) => {
        btn.addEventListener('click', async(event) => {
            modalEliminar.style.display = 'block'

            const productId = event.target.getAttribute('data-id')

            const id = document.getElementById('deleteProductID')

            id.value = productId
        })
    })

    // CERRAR MODAL PARA ELIMINAR PRODUCTO
    const deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn')
    deleteModalCloseBtn.addEventListener('click', () => {
        modalEliminar.style.display = 'none'
    })
}

// DISPLAY DE LA TABLA DE INVENTARIO
inventoryBtn.addEventListener('click', async () => {
    const inventoryBtn = document.getElementById('inventoryBtn')
    const productsContainer = document.getElementById('productos')
    const table = document.getElementById('tabla')
    
    if(productsContainer.style.display === "none") {
        productsContainer.style.display = "grid"
        table.style.display = "none"
        inventoryBtn.innerHTML = '<i class="fa fa-archive" aria-hidden="true"></i> INVENTARIO'

        await renderProducts(document.getElementById('searchInput')?.value || "")
    } else {
        productsContainer.style.display = "none"
        table.style.display = "block"
        inventoryBtn.innerHTML = '<i class="fa fa-long-arrow-left" aria-hidden="true"></i> REGRESAR'

        await renderTable(document.getElementById('searchInput')?.value || "")
    }
})

// DISPLAY DE MODAL PARA AÑADIR PRODUCTO
const addProductBtn = document.getElementById('addProductBtn')
const addModalCloseBtn = document.getElementById('addModalCloseBtn')
const modalAgregar = document.getElementById('modalAgregar')
addProductBtn.addEventListener('click', () => {
    modalAgregar.style.display = 'block'
})

addModalCloseBtn.addEventListener('click', () => {
    modalAgregar.style.display = 'none'
})

// OBTENER FORMULARIO Y AÑADIR PRODUCTO
const addProductForm = document.getElementById('addProductForm')
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('addNombre').value
    const precio = parseFloat(document.getElementById('addPrecio').value)
    const marca = document.getElementById('addMarca').value
    const imagen = document.getElementById('addImagen').value
    const descripcion = document.getElementById('addDescripcion').value

    const producto = { nombre, precio, marca, imagen, descripcion }

    const existingProductQuery = query(productsCollection, where('nombre', '==', producto.nombre))
    const docsRef = await getDocs(existingProductQuery)

    if (!docsRef.empty) {
        console.log('El producto ya existe')
        return
    }

    try {
        const newDoc = await addDoc(productsCollection, producto)
        modalAgregar.style.display = 'none'
        document.getElementById('addProductForm').reset()

        await renderProducts(document.getElementById('searchInput')?.value || "")
        await renderTable(document.getElementById('searchInput')?.value || "")
        console.log('@@@ Producto agregado con ID ', newDoc.id)
    } catch(error) {
        console.log('@@@ Error al agregar el producto: ', error)
    }
})

// OBTENER FORMULARIO Y ACTUALIZAR PRODUCTO
const updateProductForm = document.getElementById('updateProductForm')
updateProductForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('updateProductID').value
    const nombre = document.getElementById('updateNombre').value
    const precio = document.getElementById('updatePrecio').value
    const marca = document.getElementById('updateMarca').value
    const imagen = document.getElementById('updateImagen').value
    const descripcion = document.getElementById('updateDescripcion').value
    
    try {
        const productRef = doc(db, 'products', id)
        await updateDoc(productRef, {nombre, precio, marca, imagen, descripcion})

        modalActualizar.style.display = 'none'
        document.getElementById('updateProductForm').reset()

        await renderProducts(document.getElementById('searchInput')?.value || "")
        await renderTable(document.getElementById('searchInput')?.value || "")
        console.log('@@@ Producto actualizado')
    } catch(error) {
        console.log('@@@ Error al actualizar el producto', error)
    }
})

// OBTENER FORMULARIO Y ELIMINAR PRODUCTO
const deleteProductForm = document.getElementById('deleteProductForm')
deleteProductForm.addEventListener('submit', async(e) => {
    e.preventDefault()

    const id = document.getElementById('deleteProductID').value

    try {
        const productRef = doc(db, 'products', id)
        await deleteDoc(productRef)

        modalEliminar.style.display = 'none'
        document.getElementById('deleteProductForm').reset()

        await renderProducts(document.getElementById('searchInput')?.value || "")
        await renderTable(document.getElementById('searchInput')?.value || "")
        console.log('@@@ Producto eliminado')
    } catch(error) {
        console.log('@@@ Error al eliminar el producto', error)
    }
})

renderProducts(document.getElementById('searchInput')?.value || "")