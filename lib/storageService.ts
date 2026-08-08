import { storage } from "./firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export async function uploadReceiptImage(
  uid: string,
  file: File
) {
  const fileName = `${Date.now()}_${file.name}`;

  const storageRef = ref(
    storage,
    `receipts/${uid}/${fileName}`
  );

  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);

  return {
    url,
    fileName,
  };
}