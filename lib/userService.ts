import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "./firebase";



// ユーザー設定保存

export async function saveUserSettings(

  uid:string,

  data:any

){


  await setDoc(

    doc(
      db,
      "users",
      uid
    ),

    {

      ...data,

      updatedAt:
      new Date()

    },

    {

      merge:true

    }

  );


}






// ユーザー設定取得

export async function getUserSettings(

  uid:string

){


  const snap =
  await getDoc(

    doc(
      db,
      "users",
      uid
    )

  );



  if(!snap.exists()){

    return null;

  }



  return snap.data();


}






// 通知トークン保存

export async function saveNotificationToken(

  uid:string,

  token:string

){


  await updateDoc(

    doc(
      db,
      "users",
      uid
    ),

    {

      notificationToken:
      token


    }

  );


}