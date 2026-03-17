import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDlu0V0zsG4tqpqQrQw31l-rry5HLmhiH4",
  authDomain: "basketball-stat-keeper.firebaseapp.com",
  databaseURL: "https://basketball-stat-keeper-default-rtdb.firebaseio.com",
  projectId: "basketball-stat-keeper",
  storageBucket: "basketball-stat-keeper.firebasestorage.app",
  messagingSenderId: "737685750433",
  appId: "1:737685750433:web:106d8b7e78e60bc76266e0",
  measurementId: "G-92X8BFB9VW",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
