const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express()
app.use(express.json())

const path = require('path')
app.use(express.static(path.join(__dirname, '..', 'public')))

app.post('/create-checkout-session', async (req, res) => {
    const { amount } = req.body

    try {
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
            currency: 'mxn',
            product_data: {
                name: 'Pago del carrito',
            },
            unit_amount: amount,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: 'http://localhost:5500/success.html',
        cancel_url: 'http://localhost:5500/cancel.html',
        })

        res.json({ url: session.url })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(5500, () => console.log('Servidor en http://localhost:5500'))