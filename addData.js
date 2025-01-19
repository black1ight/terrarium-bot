import { addDoc, collection, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const addData = async () => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name: "John Doe",
      age: 30,
      email: "johndoe@example.com",
    });
    console.log("Документ добавлен с ID:", docRef.id);
  } catch (e) {
    console.error("Ошибка добавления документа:", e);
  }
};
