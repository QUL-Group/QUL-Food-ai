"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { auth } from "@/lib/firebase";
import { getFoodItems, addFoodItem, deleteFoodItem } from "@/lib/foodService";

export default function FridgePage(){
  const [foods,setFoods] = useState<any[]>([]);
  const [name,setName] = useState("");
  const [expirationDate,setExpirationDate] = useState("");

  const loadFoods = async()=>{
    const user = auth.currentUser;
    if(!user) return;
    const data = await getFoodItems(user.uid);
    setFoods(data);
  };

  useEffect(()=>{ loadFoods(); },[]);

  const add = async()=>{
    const user = auth.currentUser;
    if(!user || !name) return;
    await addFoodItem(user.uid,{ name, expirationDate, quantity:1 });
    setName("");
    setExpirationDate("");
    loadFoods();
  };

  const remove = async(id:string)=>{
    const user = auth.currentUser;
    if(!user) return;
    await deleteFoodItem(user.uid,id);
    loadFoods();
  };

  return (
    <>
      <main className="min-h-screen bg-[#F5F8FC] p-6 pb-28">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#809CCF]">🥬 食材管理</h1>
            <AdBanner />
          </div>

          <section className="mt-8 bg-white rounded-3xl p-6">
            <h2 className="font-bold">＋ 手動追加</h2>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="食材名" className="mt-4 w-full border rounded-xl p-3" />
            <input type="date" value={expirationDate} onChange={e=>setExpirationDate(e.target.value)} className="mt-3 w-full border rounded-xl p-3" />
            <button onClick={add} className="mt-4 w-full bg-[#809CCF] text-white py-3 rounded-xl font-bold">追加</button>
          </section>

          <section className="mt-6 bg-white rounded-3xl p-6">
            <h2 className="font-bold">登録食材</h2>
            {foods.length===0 ? <p className="mt-4 text-gray-500">まだ食材がありません</p> : foods.map(food=>(
              <div key={food.id} className="mt-4 bg-[#F5F8FC] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">🥬 {food.name}</p>
                  {food.expirationDate && <p className="text-sm text-gray-600">期限：{food.expirationDate}</p>}
                </div>
                <button onClick={()=>remove(food.id)} className="bg-red-500 text-white px-3 py-2 rounded-xl">削除</button>
              </div>
            ))}
          </section>
        </div>
      </main>
      <BottomNav/>
    </>
  );
}
