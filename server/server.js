require('dotenv').config()
const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'public')))

// Importa los routers de Stripe y PayPal
const stripeRoutes = require('./stripe')
const paypalRoutes = require('./paypal')

// Usa los routers
app.use(stripeRoutes)
app.use(paypalRoutes)

// Inicia el servidor en un solo puerto
app.listen(5500, () => console.log(`Servidor en http://localhost:5500`))