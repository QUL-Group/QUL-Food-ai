"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { saveUserSetup } from "@/lib/userService";

export default function SetupPage() {
  const router = useRouter();

  const [fridgeSize, setFridgeSize] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [store, setStore] = useState("");

  const save = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("ログインしてください");
      return;
    }

    await saveUserSetup(user.uid, {
      fridgeSize: Number(fridgeSize),
      familyCount: Number(familyCount),
      favoriteStore: store,
      notification: true,
      aiEnabled: true,
    });

    router.push("/dashboard");
  };


  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">

        <h1 className="text-3xl font-bold text-[#809CCF]">
          🧊 初期設定
        </h1>

        <p className="mt-3 text-gray-600">
          QUL Food AIをあなた用に設定します
        </p>


        <input
          className="mt-6 w-full border rounded-xl p-3"
          placeholder="冷蔵庫容量（例 400L）"
          value={fridgeSize}
          onChange={(e)=>setFridgeSize(e.target.value)}
        />


        <input
          className="mt-4 w-full border rounded-xl p-3"
          placeholder="家族人数"
          value={familyCount}
          onChange={(e)=>setFamilyCount(e.target.value)}
        />


        <input
          className="mt-4 w-full border rounded-xl p-3"
          placeholder="よく行くスーパー"
          value={store}
          onChange={(e)=>setStore(e.target.value)}
        />


        <button
          onClick={save}
          className="mt-8 w-full bg-[#809CCF] text-white py-3 rounded-xl"
        >
          保存して開始
        </button>

      </div>

    </main>
  );
}