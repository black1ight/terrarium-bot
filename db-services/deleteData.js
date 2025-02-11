import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    console.log(
      `Документ с ID: ${documentId} успешно удален из коллекции ${collectionName}.`
    );
  } catch (error) {
    console.error("Ошибка при удалении документа:", error);
  }
};
