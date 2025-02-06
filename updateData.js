import { getFirestore, doc, updateDoc } from "firebase/firestore";

const db = getFirestore();

export const updateData = async (collection, docId, field) => {
  const docRef = doc(db, collection, docId);
  await updateDoc(docRef, field);
};
