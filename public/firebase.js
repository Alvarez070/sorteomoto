import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHwQNWakMY0CDphF2IQab2ZUpeklOeE8s",
  authDomain: "rifa-boxer-ct100.firebaseapp.com",
  projectId: "rifa-boxer-ct100",
  storageBucket: "rifa-boxer-ct100.appspot.com",
  messagingSenderId: "389698810798",
  appId: "1:389698810798:web:3cf895f3341130a9d48e3f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 Exponer Firebase para tus otros archivos
window.db = db;
window.addDoc = addDoc;
window.collection = collection;
window.doc = doc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.getDocs = getDocs;