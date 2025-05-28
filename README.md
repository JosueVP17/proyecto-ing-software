# AURUM GYM

Este proyecto es un sistema de interacción con el usuario mediante el crecimiento personal sobre su meta física. Puede adquirir productos y comprar planes de suscripción para potenciar su crecimiento. Así mismo, ponerse en contacto con profesionales de la salud.

## Requisitos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- Una cuenta de [Stripe](https://dashboard.stripe.com/test/apikeys) (para obtener tus llaves de prueba)
- Una cuenta de [PayPal Developer](https://developer.paypal.com/) (para obtener tus credenciales sandbox)

## Instalación

1. Clona el repositorio:

    https://github.com/JosueVP17/proyecto-ing-software

2. Instala las dependencias necesarias:

    ```sh
    npm install node
    npm install express
    npm install stripe
    npm install dotenv
    ```

3. Crea un archivo `.env` en la raíz del proyecto con tus llaves de Stripe y PayPal:

    ```
    STRIPE_SECRET_KEY=sk_test_...
    PAYPAL_CLIENT_ID=...
    PAYPAL_SECRET=...
    ```

## Uso

1. Inicia el servidor:

    ```sh
    node server/server.js
    ```

2. Abre tu navegador en [http://localhost:5500]

3. Realiza interacciones con la funcionalidad de la página.

## Notas

- Para pagos con **Stripe**, puedes usar tarjetas de prueba como `4242 4242 4242 4242`.
- Para pagos con **PayPal**, inicia sesión con una cuenta sandbox de tipo "Personal".

## Créditos

Desarrollado por el equipo 4 para la materia de Ingeniería de Software.
