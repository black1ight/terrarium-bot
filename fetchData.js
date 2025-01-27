import { getDocs, collection, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchData = async (username = null) => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({
      docId: doc.id,
      ...doc.data(),
    });
  });
  if (username) {
    return data.find((doc) => doc.username === username);
  } else {
    return data;
  }
};
