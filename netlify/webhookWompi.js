const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
  });
}

const db = admin.firestore();

exports.handler = async (event) => {

  const body = JSON.parse(event.body);

  const transaction = body.data?.transaction;

  if (transaction?.status === "APPROVED") {

    const referencia = transaction.reference;

    const nombre = transaction.customer_data?.full_name || "sin nombre";

    const numeros = await generarNumerosUnicos(db, 1);

    await db.collection("ventas").add({
      nombre,
      telefono: "N/A",
      cantidad: 1,
      numeros,
      estado: "pagado",
      referencia,
      fecha: new Date()
    });
  }

  return {
    statusCode: 200,
    body: "ok"
  };
};


// 🎲 GENERADOR
async function generarNumerosUnicos(db, cantidad) {

  const snap = await db.collection("ventas").get();

  let usados = new Set();

  snap.forEach(d => {
    let data = d.data();
    (data.numeros || []).forEach(n => usados.add(n));
  });

  let nuevos = [];

  while (nuevos.length < cantidad) {

    let num = String(Math.floor(Math.random() * 9999)).padStart(4, "0");

    if (!usados.has(num)) {
      usados.add(num);
      nuevos.push(num);
    }
  }

  return nuevos;
}