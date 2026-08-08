"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import { getUserData } from "@/lib/userService";
export default function LoginPage() {
  const router = useRouter();

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
     const result = await signInWithPopup(auth, provider);

const user = result.user;

await setDoc(
  doc(db, "users", user.uid),
  {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: new Date(),
  },
  { merge: true }
);

const userData = await getUserData(user.uid);

if (userData?.setupCompleted) {
  router.push("/dashboard");
} else {
  router.push("/setup");
}
    } catch (error) {
      console.error(error);
      alert("ログインに失敗しました。お手数ですが通信状況を確認してもう一度お試しください。");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-[#809CCF] mb-2">
          🧊 QUL Food AI
        </h1>

        <p className="text-gray-600 mb-8">
          AIで冷蔵庫管理をもっと便利に
        </p>

        <button
          onClick={loginGoogle}
          className="w-full bg-[#809CCF] hover:opacity-90 text-white font-semibold py-3 rounded-xl transition"
        >
          Googleでログイン
        </button>
      </div>
    </main>
  );
}