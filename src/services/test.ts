import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export const testFirestore = async () => {
  try {
    await addDoc(collection(db, "test"), {
      message: "RentWise Firebase Connected",
      createdAt: new Date(),
    });

    console.log("SUCCESS");
  } catch (error) {
    console.log("ERROR:", error);
  }
};
