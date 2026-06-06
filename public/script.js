import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = window.db;

/* =========================
   VARIABLES TABLERO
========================= */
let seleccionados = [];
let estadoNumeros = {};

/* =========================
   CALCULAR TOTAL
========================= */
window.calcularTotal = function () {

  const numeros = document.getElementById("numeros").value
    .split("\n")
    .map(n => n.trim())
    .filter(n => n !== "");

  if (numeros.length < 3) {
    alert("Mínimo 3 números");
    return;
  }

  const total = numeros.length * 4000;

  document.getElementById("total").innerText =
    "Total: $" + total.toLocaleString("es-CO");
};

/* =========================
   TABLERO - ABRIR
========================= */
window.abrirTablero = async function () {

  alert("Abriendo tablero");

  document.getElementById("tableroContainer").style.display = "block";

  onSnapshot(collection(db, "numeros_usados"), (snap) => {

    estadoNumeros = {};

    snap.forEach(docu => {
      estadoNumeros[docu.id] = docu.data().estado;
    });

    renderTablero();
  });

};

/* =========================
   RENDER TABLERO
========================= */
function renderTablero() {
    

  const cont = document.getElementById("tableroNumeros");
  cont.innerHTML = "";

  for (let i = 0; i < 10000; i++) {

    const num = String(i).padStart(4, "0");

    const estado = estadoNumeros[num] || "disponible";

    const div = document.createElement("div");

    div.innerText = num;
    div.classList.add("numero");

    if (estado === "vendido") {
      div.classList.add("vendido");
    } else if (estado === "reservado") {
      div.classList.add("reservado");
    } else {
      div.classList.add("disponible");

      div.onclick = () => toggleNumero(num, div);
    }

    if (seleccionados.includes(num)) {
      div.classList.add("seleccionado");
    }

    cont.appendChild(div);
  }
}

/* =========================
   SELECCIONAR NUMERO
========================= */
function toggleNumero(num, div) {

  if ((estadoNumeros[num] || "disponible") !== "disponible") {
    alert("Número no disponible");
    return;
  }

  if (seleccionados.includes(num)) {
    seleccionados = seleccionados.filter(n => n !== num);
    div.classList.remove("seleccionado");

  } else {

    if (seleccionados.length >= 10) {
      alert("Máximo 10 números");
      return;
    }

    seleccionados.push(num);
    div.classList.add("seleccionado");
  }

  document.getElementById("listaSeleccionados").innerText =
    seleccionados.length ? seleccionados.join(", ") : "Ninguno";
}

/* =========================
   CERRAR TABLERO
========================= */
window.cerrarTablero = function () {

  document.getElementById("tableroContainer").style.display = "none";

  document.getElementById("numeros").value =
    seleccionados.join("\n");
};

/* =========================
   RESERVAR NÚMEROS
========================= */
async function reservarNumeros(numeros, usuario) {

  for (let num of numeros) {

    const ref = doc(db, "numeros_usados", num);
    const snap = await getDoc(ref);

    if (!snap.exists()) {

      await setDoc(ref, {
        estado: "reservado",
        usuario
      });

      continue;
    }

    if (snap.data().estado !== "disponible") {
      throw new Error("Número ocupado: " + num);
    }

    await updateDoc(ref, {
      estado: "reservado",
      usuario
    });
  }

  await addDoc(collection(db, "reservas"), {
    numeros,
    usuario,
    estado: "pendiente",
    expira: Date.now() + 10 * 60 * 1000
  });
}

/* =========================
   PAGAR
========================= */
window.pagar = async function () {

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();

  const numeros = document.getElementById("numeros")
    .value
    .split("\n")
    .map(n => n.trim())
    .filter(n => n !== "");

  if (!nombre || !telefono || !correo) {
    alert("Completa los datos");
    return;
  }

  if (numeros.length < 3) {
    alert("Mínimo 3 números");
    return;
  }

  try {

    await reservarNumeros(numeros, nombre);

    const res = await fetch("/api/crearTransaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        telefono,
        correo,
        numeros
      })
    });

 const data = await res.json();

console.log("Respuesta:", data);

if (data.checkoutUrl) {
  window.location.href = data.checkoutUrl;
} else {
  alert(JSON.stringify(data));
}

  } catch (e) {
    alert(e.message);
  }
};