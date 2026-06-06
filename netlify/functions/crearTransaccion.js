const axios = require("axios");
const crypto = require("crypto");

exports.handler = async (event) => {

  if (!event.body) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "No se recibieron datos" })
  };
}

  const { nombre, telefono, correo, numeros } = JSON.parse(event.body);

  const amount = numeros.length * 4000 * 100;

  const reference = Date.now().toString();

  // 🔥 IMPORTANTE: tu integrity key de Wompi
 const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

  const signature = crypto
    .createHash("sha256")
    .update(reference + amount + "COP" + integrityKey)
    .digest("hex");

  try {

    const response = await axios.post(
      ""https://sandbox.wompi.co/v1/transactions"",
      {
        amount_in_cents: amount,
        currency: "COP",
        reference,
        customer_email: correo,
        signature: signature,
        redirect_url: "https://tusitio.com/gracias"
      },
      {
        headers: {
          Authorization: "Bearer prv_test_x2oEtJxKeTq3yMuVoYhmHSb9SzXNxI17"
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        checkoutUrl: response.data.data.checkout_url,
        reference
      })
    };

  } catch (error) {
    console.log(error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error creando transacción" })
    };
  }
};