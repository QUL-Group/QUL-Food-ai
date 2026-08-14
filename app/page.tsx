"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { auth } from "@/lib/firebase";
import { getFoodItems } from "@/lib/foodService";
import { getNotifications } from "@/lib/notificationService";

export default function HomePage() {
  const [user, setUser] = useState<NonNullable<typeof auth.currentUser> | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [foods, setFoods] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (currentUser: NonNullable<typeof auth.currentUser>) => {
    const data = await getFoodItems(currentUser.uid);
    setFoods(data);

    const notice = await getNotifications(currentUser.uid);
    setNotifications(notice);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      load(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // 公開トップページ：ログイン不要。AdSenseクローラーもアクセスできます。
  if (authChecked && !user) {
    return (
      <main className="min-h-screen bg-[#F5F8FC] p-6">
        <div className="max-w-xl mx-auto min-h-screen flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="text-5xl">🥬</div>
            <h1 className="mt-4 text-3xl font-bold text-[#809CCF]">QUL Food AI</h1>
            <p className="mt-3 text-gray-600 leading-relaxed">
              冷蔵庫の食材をかしこく管理。<br />
              レシート登録からAI献立提案まで、食材管理をもっと簡単に。
            </p>
            <Link
              href="/login"
              className="mt-7 block bg-[#809CCF] text-white rounded-2xl p-4 font-bold"
            >
              Googleでログインして始める
            </Link>
          </div>
          <AdBanner />
        </div>
      </main>
    );
  }

  if (!authChecked || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F8FC]">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  const today = new Date();
  const danger = foods.filter(food => food.expirationDate && new Date(food.expirationDate) <= today);
  const soon = foods.filter(food => {
    if (!food.expirationDate) return false;
    const diff = (new Date(food.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 3;
  });

  return (
    <>
      <main className="min-h-screen bg-[#F5F8FC] p-6 pb-28">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-[#809CCF]">🥬 QUL Food AI</h1>
          <p className="mt-2 text-gray-600">冷蔵庫をかしこく管理</p>

          <section className="mt-8 bg-white rounded-3xl p-6">
            <h2 className="font-bold">📊 冷蔵庫状況</h2>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-[#F5F8FC] rounded-2xl p-4 text-center"><p className="text-2xl font-bold">{foods.length}</p><p>食材</p></div>
              <div className="bg-red-50 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-red-500">{danger.length}</p><p>期限切れ</p></div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center"><p className="text-2xl font-bold">{soon.length}</p><p>3日以内</p></div>
            </div>
          </section>

          <section className="mt-6 bg-white rounded-3xl p-6">
            <h2 className="font-bold">🔔 お知らせ</h2>
            {notifications.length === 0 ? <p className="mt-3 text-gray-500">お知らせはありません</p> : notifications.map((n, index) => <p key={index} className="mt-3">{n.type === "danger" ? "🔴" : "🟠"}{n.message}</p>)}
          </section>

          <section className="mt-6 bg-white rounded-3xl p-6">
            <h2 className="font-bold">⏰ 注意する食材</h2>
            {danger.length === 0 && soon.length === 0 ? <p className="mt-4 text-gray-500">問題なし🎉</p> : [...danger, ...soon].map(food => <div key={food.id} className="mt-3 bg-[#F5F8FC] rounded-xl p-4">🥬 {food.name}<p>期限：{food.expirationDate}</p></div>)}
          </section>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link href="/receipt" className="bg-[#809CCF] text-white rounded-2xl p-5 text-center font-bold">📷<br />レシート登録</Link>
            <Link href="/fridge" className="bg-white rounded-2xl p-5 text-center font-bold">🥬<br />食材管理</Link>
          </div>

          <section className="mt-6 bg-white rounded-3xl p-6">
            <h2 className="font-bold">🍳 AIおすすめ献立</h2>
            <p className="mt-3 text-gray-500">食材を登録すると提案します</p>
          </section>

          <AdBanner />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
