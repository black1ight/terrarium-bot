import { getDocs, collection, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchData = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({
      id: doc.id,
      username: doc.data().username,
    });
  });
  return data;
};
