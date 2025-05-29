require('dotenv').config()
const express = require('express')
const router = express.Router() // Usa Router en vez de app

// Reemplaza con tus credenciales de PayPal Sandbox
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID
const PAYPAL_SECRET = process.env.PAYPAL_SECRET

const base = "https://api-m.sandbox.paypal.com"

async function getAccessToken() {
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(PAYPAL_CLIENT + ":" + PAYPAL_SECRET).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    })
    const data = await response.json()
    return data.access_token
}

router.post('/create-paypal-order', async (req, res) => {
    const { amount } = req.body
    const accessToken = await getAccessToken()
    const response = await fetch(`${base}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: "MXN",
                    value: (amount / 100).toFixed(2)
                }
            }],
            application_context: {
                return_url: "http://localhost:5500/success.html",
                cancel_url: "http://localhost:5500/cancel.html"
            }
        })
    })
    const data = await response.json()
    // Busca el link de aprobación
    const approve = data.links.find(link => link.rel === "approve")
    res.json({ url: approve ? approve.href : null })
})

module.exports = router