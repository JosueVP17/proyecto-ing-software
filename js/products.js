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

renderProducts()