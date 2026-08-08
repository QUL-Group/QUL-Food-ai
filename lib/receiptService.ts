import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";


export async function saveReceiptData(
  uid: string,
  data: any
) {

  const receiptsRef = collection(
    db,
    "receipts"
  );


  await addDoc(
    receiptsRef,
    {

      uid,

      ...data,


      // 画像チェック待ち
      checkStatus: "pending",


      createdAt: new Date(),

    }
  );

}