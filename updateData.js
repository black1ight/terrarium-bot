import { getFirestore, doc, updateDoc } from "firebase/firestore";

const db = getFirestore();

export const updateData = async (docId, field) => {
  const docRef = doc(db, "users", docId);
  await updateDoc(docRef, field);
};
