"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import BottomNav from "@/components/BottomNav";


import { auth } from "@/lib/firebase";


import {
  saveUserSettings,
  getUserSettings,
  saveNotificationToken,
} from "@/lib/userService";


import {
  requestNotificationPermission,
} from "@/lib/notificationClient";


import { signOut } from "firebase/auth";


export default function SettingsPage() {
  const router = useRouter();


  const [capacity, setCapacity] = useState("");
  const [family, setFamily] = useState("1");
  const [notice, setNotice] = useState(true);
  const [nickname, setNickname] = useState("");


  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;


      if (!user) return;


      const data = await getUserSettings(user.uid);


      if (data) {
        setNickname(data.nickname || "");
        setCapacity(
          data.fridgeSize?.toString() ||
          data.capacity?.toString() ||
          ""
        );


        setFamily(
          data.familyCount?.toString() ||
          data.family?.toString() ||
          "1"
        );


        setNotice(
          data.notification ??
          data.notice ??
          true
        );
      }
    };


    load();
  }, []);


  const save = async () => {
    const user = auth.currentUser;


    if (!user) {
      alert("ログインしてください");
      return;
    }


    await saveUserSettings(user.uid, {
      nickname,
      fridgeSize: Number(capacity),
      familyCount: Number(family),
      notification: notice,


      // 既存データとの互換性
      capacity,
      family,
      notice,
    });


    alert("設定を保存しました");
  };


  const enableNotification = async () => {
    const token = await requestNotificationPermission();


    console.log("通知TOKEN", token);


    const user = auth.currentUser;


    if (user && token) {
      await saveNotificationToken(
        user.uid,
        token
      );
    }


    alert("通知を有効化しました");
  };


  const logout = async () => {
    const confirmed = window.confirm(
      "ログアウトしますか？"
    );


    if (!confirmed) return;


    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );


      alert(
        "ログアウトに失敗しました"
      );
    }
  };


  return (
    <main className="min-h-screen bg-[#F5F8FC] pb-24">
      <div className="max-w-xl mx-auto px-4 py-8">


        <h1 className="text-3xl font-bold text-[#809CCF]">
          ⚙️ 設定
        </h1>


        {/* ユーザー設定 */}
        <section className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold">
            👤 ユーザー設定
          </h2>


          <p className="mt-3 text-gray-600">
            QUL Food AI
          </p>


          <input
            value={nickname}
            onChange={(e) =>
              setNickname(e.target.value)
            }
            placeholder="ニックネーム"
            className="mt-4 w-full border rounded-xl p-3"
          />


          <button
            onClick={save}
            className="mt-6 w-full bg-[#809CCF] text-white py-3 rounded-xl font-bold"
          >
            💾 設定を保存
          </button>
        </section>


        {/* 冷蔵庫設定 */}
        <section className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold">
            🧊 冷蔵庫設定
          </h2>


          <input
            value={capacity}
            onChange={(e) =>
              setCapacity(e.target.value)
            }
            placeholder="冷蔵庫容量（L）"
            type="number"
            className="mt-4 w-full border rounded-xl p-3"
          />


          <select
            value={family}
            onChange={(e) =>
              setFamily(e.target.value)
            }
            className="mt-3 w-full border rounded-xl p-3"
          >
            <option value="1">
              1人
            </option>


            <option value="2">
              2人
            </option>


            <option value="3">
              3人
            </option>


            <option value="4">
              4人
            </option>


            <option value="5">
              5人
            </option>


            <option value="6">
              6人以上
            </option>
          </select>


          <button
            onClick={save}
            className="mt-4 w-full bg-[#809CCF] text-white py-3 rounded-xl font-bold"
          >
            💾 冷蔵庫設定を保存
          </button>
        </section>


        {/* 通知 */}
        <section className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold">
            🔔 通知
          </h2>


          <button
            onClick={enableNotification}
            className="mt-4 bg-[#809CCF] text-white px-4 py-3 rounded-xl font-bold"
          >
            🔔 通知を有効化
          </button>


          <label className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={notice}
              onChange={(e) =>
                setNotice(e.target.checked)
              }
            />


            <span>
              期限通知
            </span>
          </label>
        </section>


        {/* ログアウト */}
        <section className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold">
            🚪 アカウント
          </h2>


          <button
            onClick={logout}
            className="mt-4 w-full border border-red-300 text-red-500 py-3 rounded-xl font-bold"
          >
            🚪 ログアウト
          </button>
        </section>


      </div>


      <BottomNav />
    </main>
  );
}
