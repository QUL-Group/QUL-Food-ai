```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { saveUserSetup } from "@/lib/userService";

export default function SetupPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [fridgeSize, setFridgeSize] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [store, setStore] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("ログインしてください");
      return;
    }

    if (!nickname.trim()) {
      alert("ニックネームを入力してください");
      return;
    }

    if (!fridgeSize || Number(fridgeSize) <= 0) {
      alert("冷蔵庫容量を入力してください");
      return;
    }

    if (!familyCount || Number(familyCount) <= 0) {
      alert("家族人数を入力してください");
      return;
    }

    setSaving(true);

    try {
      await saveUserSetup(user.uid, {
        nickname: nickname.trim(),
        fridgeSize: Number(fridgeSize),
        familyCount: Number(familyCount),
        favoriteStore: store.trim(),
        notification: true,
        aiEnabled: true,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Setup save error:", error);
      alert("設定の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#809CCF]">
          🧊 初期設定
        </h1>

        <p className="mt-3 text-gray-600">
          QUL Food AIをあなた用に設定します
        </p>

        {/* ニックネーム */}
        <label className="block mt-6 font-bold text-gray-700">
          👤 ニックネーム
        </label>

        <input
          type="text"
          className="mt-2 w-full border rounded-xl p-3"
          placeholder="例：QUL"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        {/* 冷蔵庫容量 */}
        <label className="block mt-5 font-bold text-gray-700">
          🧊 冷蔵庫容量
        </label>

        <input
          type="number"
          min="1"
          className="mt-2 w-full border rounded-xl p-3"
          placeholder="例：300"
          value={fridgeSize}
          onChange={(e) => setFridgeSize(e.target.value)}
        />

        <p className="mt-1 text-sm text-gray-500">
          容量はL（リットル）で入力してください
        </p>

        {/* 家族人数 */}
        <label className="block mt-5 font-bold text-gray-700">
          👨‍👩‍👧‍👦 家族人数
        </label>

        <input
          type="number"
          min="1"
          className="mt-2 w-full border rounded-xl p-3"
          placeholder="例：3"
          value={familyCount}
          onChange={(e) => setFamilyCount(e.target.value)}
        />

        {/* よく行くスーパー */}
        <label className="block mt-5 font-bold text-gray-700">
          🛒 よく行くスーパー
        </label>

        <input
          type="text"
          className="mt-2 w-full border rounded-xl p-3"
          placeholder="例：QUL Store"
          value={store}
          onChange={(e) => setStore(e.target.value)}
        />

        {/* 保存 */}
        <button
          onClick={save}
          disabled={saving}
          className="mt-8 w-full bg-[#809CCF] text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存して開始"}
        </button>
      </div>
    </main>
  );
}
```
