import {db} from "./firebase-config.js"
import {collection, addDoc, getDoc, getDocs, query, where} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

const productsCollection = collection(db, 'products')

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

addProductBtn.addEventListener('click', () => {
    adminModal.style.display = 'block'
})

closeModalBtn.addEventListener('click', () => {
    adminModal.style.display = 'none'
})

productForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('nombre').value
    const precio = parseFloat(document.getElementById('precio').value)
    const marca = document.getElementById('marca').value
    const imagen = document.getElementById('imagen').value
    const descripcion = document.getElementById('descripcion').value

    const producto = { nombre, precio, marca, imagen, descripcion }

    const existingProductQuery = query(productsCollection, where('nombre', '==', producto.nombre))
    const docsRef = await getDocs(existingProductQuery)

    if (!docsRef.empty) {
        console.log('El producto ya existe')
        return
    }

    try {
        const newDoc = await addDoc(productsCollection, producto)
        renderProducts()
        console.log('@@@ Producto agregado con ID ', newDoc.id)
        adminModal.style.display = 'none'
        document.getElementById('productForm').reset()
    } catch(error) {
        console.log('@@@ Error al agregar el producto: ', error)
    }
})

inventoryBtn.addEventListener('click', async() => {
    const inventoryBtn = document.getElementById('inventoryBtn')
    const productsContainer = document.getElementById('productos')
    const table = document.getElementById('tabla')
    
    if(productsContainer.style.display === "none") {
        productsContainer.style.display = "grid"
        table.style.display = "none"
        inventoryBtn.innerHTML = '<i class="fa fa-archive" aria-hidden="true"></i> INVENTARIO'

        renderProducts()
    } else {
        productsContainer.style.display = "none"
        table.style.display = "block"
        inventoryBtn.innerHTML = '<i class="fa fa-long-arrow-left" aria-hidden="true"></i> REGRESAR'

        const tbody = document.getElementById('tbody')
        const products = await getProducts()

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
                    <button class="productEdit"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button>
                    <button class="productDelete"><i class="fa fa-trash" aria-hidden="true"></i> Eliminar</button>
                </td>
            `

            tbody.appendChild(row)
        })
    }
})

renderProducts()