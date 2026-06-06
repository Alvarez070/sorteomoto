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

    const reference = transaction.reference;

    // 🔥 buscar reservas activas
    const reservasSnap = await db.collection("reservas")
      .where("estado", "==", "pendiente")
      .get();

    reservasSnap.forEach(async (docu) => {

      const data = docu.data();

      if (data.expira < Date.now()) return;

      // ✔ pasar a ventas
      await db.collection("ventas").add({
        nombre: data.usuario,
        telefono: data.telefono,
        correo: data.correo,
        numeros: data.numeros,
        estado: "pagado",
        referencia
      });

      // ✔ marcar números como vendidos
      for (let num of data.numeros) {
        await db.collection("numeros_usados").doc(num).update({
          estado: "vendido"
        });
      }

      // ✔ cerrar reserva
      await docu.ref.update({
        estado: "pagado"
      });
    });
  }

  return {
    statusCode: 200,
    body: "ok"
  };
};