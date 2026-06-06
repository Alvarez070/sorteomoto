const axios = require("axios");
const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const { nombre, telefono, correo, numeros } = JSON.parse(event.body || "{}");

    if (!numeros || !Array.isArray(numeros)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Números inválidos" })
      };
    }

    const amount = numeros.length * 4000 * 100;
    const reference = Date.now().toString();

    const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

    if (!integrityKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Falta WOMPI_INTEGRITY_KEY" })
      };
    }

    // 🔐 firma correcta
    const signature = crypto
      .createHash("sha256")
      .update(reference + amount + "COP" + integrityKey)
      .digest("hex");

    // 🚀 Wompi Sandbox (CORRECTO)
    const response = await axios.post(
      "https://sandbox.wompi.co/v1/transactions",
      {
        amount_in_cents: amount,
        currency: "COP",
        reference,
        customer_email: correo,
        signature,
        redirect_url: "https://rifamym.netlify.app"
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
    console.log("WOMPI ERROR:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.response?.data || error.message
      })
    };
  }
};