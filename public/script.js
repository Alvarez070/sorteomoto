window.calcularTotal = function () {

    let cantidad = Number(document.getElementById("cantidad").value);

    document.getElementById("total").innerText =
        "Total: $" + (cantidad * 4000);
};


// 💳 FUNCIÓN DE PAGO (NETLIFY + WOMPI)
window.pagar = async function () {

    let nombre = document.getElementById("nombre").value;
    let telefono = document.getElementById("telefono").value;
    let cantidad = document.getElementById("cantidad").value;

    if (!nombre || !telefono || !cantidad) {
        alert("Completa todos los campos");
        return;
    }

    try {

        const res = await fetch("/api/crearTransaccion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                telefono,
                cantidad
            })
        });

        const data = await res.json();

        if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
        } else {
            alert("Error creando pago");
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
};