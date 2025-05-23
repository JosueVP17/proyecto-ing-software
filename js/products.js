import {db} from "./firebase-config.js"
import {collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

const productsCollection = collection(db, 'products')

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

// CARGAR PRODUCTOS DEL CATÁLOGO
const renderProducts = async() => {
    const productsContainer = document.getElementById('productos')
    productsContainer.innerHTML = ''

    const products = await getProducts()

    products.forEach((product) => {
        const productCard = document.createElement('div')
        productCard.innerHTML = `
            <img src="${product.imagen}">
            <h4>${product.marca}</h4>
            <h3>${product.nombre}</h3>
            <div>
                <p>$${product.precio}</p>
                <button><i class="fa fa-shopping-cart fa-2x" aria-hidden="true"></i></button>
            </div>
        `
        productCard.classList.add('producto')
        productsContainer.appendChild(productCard)
    })
}

const renderTable = async () => {
    const tbody = document.getElementById('tbody')
    const products = await getProducts()

    tbody.innerHTML = ''

    products.forEach((product) => {
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

        await renderProducts()
    } else {
        productsContainer.style.display = "none"
        table.style.display = "block"
        inventoryBtn.innerHTML = '<i class="fa fa-long-arrow-left" aria-hidden="true"></i> REGRESAR'

        await renderTable()
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

        await renderProducts()
        await renderTable()
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

        await renderTable()
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

        await renderTable()
        console.log('@@@ Producto eliminado')
    } catch(error) {
        console.log('@@@ Error al eliminar el producto', error)
    }
})

renderProducts()