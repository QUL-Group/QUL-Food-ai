"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/firebase";
import { getFoodItems } from "@/lib/foodService";

export default function MenuPage() {
  const [foods, setFoods] = useState<any[]>([]);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFoods = async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const data = await getFoodItems(user.uid);
    setFoods(data);
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const generateRecipe = async () => {
    setLoading(true);
    setRecipe("");

    try {
      const response = await fetch("/api/recipe-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foods: foods.map((food) => food.name),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "レシピ生成に失敗しました"
        );
      }

      setRecipe(data.recipe || "");
    } catch (error) {
      console.error("Recipe API Error:", error);
      setRecipe("生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-md px-5 py-8">
        <h1 className="text-2xl font-bold">
          🍳 AI献立
        </h1>

        <p className="mt-2 text-gray-500">
          冷蔵庫の食材からおすすめの料理を提案します。
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-bold">
            🥬 使用できる食材
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {foods.length > 0 ? (
              foods.map((food) => (
                <span
                  key={food.id}
                  className="rounded-xl bg-[#F5F8FC] px-3 py-2 text-sm"
                >
                  {food.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                登録されている食材がありません。
              </p>
            )}
          </div>
        </section>

        <button
          onClick={generateRecipe}
          disabled={loading || foods.length === 0}
          className="mt-6 w-full rounded-xl bg-[#809CCF] py-3 font-bold text-white disabled:opacity-50"
        >
          {loading
            ? "🤖 考え中..."
            : "🍳 献立を作る"}
        </button>

        {recipe && (
          <section className="mt-8 rounded-2xl bg-[#F5F8FC] p-5">
            <h2 className="text-lg font-bold">
              🍽️ おすすめ献立
            </h2>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-7">
              {recipe}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}