import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";




// 食材取得

export async function getFoodItems(

  uid:string

){


  const snapshot =
    await getDocs(

      collection(
        db,
        "users",
        uid,
        "foods"
      )

    );



  return snapshot.docs.map(

    item=>({

      id:item.id,

      ...item.data()

    })

  );


}






// 食材追加

export async function addFoodItem(

  uid:string,

  food:any

){


  await addDoc(

    collection(

      db,

      "users",

      uid,

      "foods"

    ),


    {

      ...food,

      createdAt:
      serverTimestamp()


    }

  );


}






// 食材削除

export async function deleteFoodItem(

  uid:string,

  id:string

){


  await deleteDoc(

    doc(

      db,

      "users",

      uid,

      "foods",

      id

    )

  );


}
// レシートから食材一括保存

export async function saveFoodItems(

  uid:string,

  items:any[]

){


  for(const item of items){


    await addFoodItem(

      uid,

      {

        name:item.name,

        price:item.price,

        expirationDate:
        item.expirationDate || "",

        quantity:
        item.quantity || 1

      }

    );


  }


}