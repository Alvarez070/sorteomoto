const axios = require("axios");

exports.handler = async (event) => {

  const body = JSON.parse(event.body);

  const { nombre, telefono, cantidad } = body;

  const amount = Number(cantidad) * 4000 * 100;

  try {

    const response = await axios.post("https://sandbox.wompi.co/v1/transactions", {
      amount_in_cents: amount,
      currency: "COP",
      customer_email: "cliente@test.com",
      reference: Date.now().toString()
    }, {
      headers: {
        Authorization: "Bearer TU_PRIVATE_KEY"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        checkoutUrl: response.data.data.checkout_url
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error creando transacción" })
    };
  }
};