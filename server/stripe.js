require('dotenv').config()

const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const router = express.Router()
router.use(express.json())

const path = require('path')
router.use(express.static(path.join(__dirname, '..', 'public')))

router.post('/create-checkout-session', async (req, res) => {
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

module.exports = router