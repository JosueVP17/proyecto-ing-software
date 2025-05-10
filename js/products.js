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

const addProduct = async() => {
    const product = {
        imagen: "https://shop.bodybuilding.com/cdn/shop/files/bodybuildingcom-signature-100-whey-protein-30-servings-668541.jpg?v=1735446931&width=3000",
        nombre: "Bodybuilding.com Signature 100% Whey, 60 Servings",
        precio: 999.99,
        marca: "Bodybuilding.com",
        descripcion: "Signature 100% Whey Protein ofrece una potente combinación de tres fuentes de proteína de alta calidad: 6 gramos de concentrado de proteína de suero, 13 gramos de aislado de proteína de suero y 6 gramos de proteína de suero hidrolizada, lo que te proporciona proteína limpia y de rápida digestión en cada porción. Con la cantidad justa de concentrado de suero para aportar un sabor cremoso y una textura suave, esta mezcla está diseñada para promover el crecimiento muscular, contrarrestar el deterioro muscular y acelerar la recuperación después del entrenamiento.*"
    }

    const existingProductQuery = query(productsCollection, where('nombre', '==', product.nombre))
    const docsRef = await getDocs(existingProductQuery)

    if (!docsRef.empty) {
        console.log('El producto ya existe')
        return
    }

    try {
        const newDoc = await addDoc(productsCollection, product)
        renderProducts()
        console.log('@@@ Producto agregado con ID ', newDoc.id)
    } catch(error) {
        console.log('@@@ Error al agregar el producto: ', error)
    }
}

addProduct()

renderProducts()