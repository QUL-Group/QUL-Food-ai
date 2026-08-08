"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/firebase";
import { getFoodItems } from "@/lib/foodService";

type FoodItem = {
  id?: string;
  name?: string;
  price?: number;
  [key: string]: unknown;
};

export default function RecipePage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] =
    useState<string[]>([]);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [loadingFoods, setLoadingFoods] =
    useState(true);
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("ログインしてください");
        setLoadingFoods(false);
        return;
      }

      const result =
        await getFoodItems(user.uid);

      if (Array.isArray(result)) {
        const normalized: FoodItem[] =
          result
            .map((item: any) => {
              if (typeof item === "string") {
                return {
                  name: item,
                };
              }

              return {
                ...item,
                name:
                  typeof item?.name === "string"
                    ? item.name
                    : "",
              };
            })
            .filter(
              (item) =>
                typeof item.name ===
                  "string" &&
                item.name.trim() !== ""
            );

        setFoods(normalized);
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error(
        "食材読み込みエラー:",
        error
      );

      setMessage(
        "食材の読み込みに失敗しました"
      );
    } finally {
      setLoadingFoods(false);
    }
  };

  const toggleFood = (
    name: string
  ) => {
    setSelectedFoods((current) => {
      if (current.includes(name)) {
        return current.filter(
          (item) => item !== name
        );
      }

      return [
        ...current,
        name,
      ];
    });
  };

  const generateRecipe =
    async () => {
      if (
        selectedFoods.length === 0
      ) {
        setMessage(
          "食材を1つ以上選択してください"
        );
        return;
      }

      setLoading(true);
      setRecipe("");
      setMessage("");

      try {
        const response =
          await fetch(
            "/api/recipe-ai",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                foods:
                  selectedFoods,
              }),
            }
          );

        /*
         * 404などでHTMLが返ってきても
         * JSON.parse系のエラーにしない
         */
        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "Recipe API response:",
            text
          );

          throw new Error(
            `レシピAPIが利用できません（${response.status}）`
          );
        }

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "レシピ生成に失敗しました"
          );
        }

        setRecipe(
          typeof data.recipe ===
            "string"
            ? data.recipe
            : ""
        );

        if (
          !data.recipe
        ) {
          setMessage(
            "AIからレシピが返ってきませんでした"
          );
        }
      } catch (error) {
        console.error(
          "レシピ生成エラー:",
          error
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "レシピ生成に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <main
        className="
          min-h-screen
          bg-[#F5F8FC]
          px-5
          py-6
          pb-28
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-xl
          "
        >
          <h1
            className="
              text-3xl
              font-bold
              text-gray-900
            "
          >
            🍳 AIレシピ
          </h1>

          <p
            className="
              mt-2
              text-gray-500
            "
          >
            冷蔵庫の食材から
            おすすめ料理を提案します。
          </p>

          <section
            className="
              mt-6
              rounded-3xl
              bg-white
              p-5
              shadow-sm
            "
          >
            <h2
              className="
                text-xl
                font-bold
              "
            >
              🥬 食材を選ぶ
            </h2>

            {loadingFoods ? (
              <div
                className="
                  mt-5
                  rounded-2xl
                  bg-gray-50
                  p-5
                  text-center
                  text-gray-500
                "
              >
                食材を読み込み中...
              </div>
            ) : foods.length ===
              0 ? (
              <div
                className="
                  mt-5
                  rounded-2xl
                  bg-gray-50
                  p-5
                  text-center
                "
              >
                <p
                  className="
                    font-bold
                    text-gray-800
                  "
                >
                  冷蔵庫に食材がありません
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-500
                  "
                >
                  レシート登録から
                  食材を追加してください。
                </p>
              </div>
            ) : (
              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                {foods.map(
                  (
                    food,
                    index
                  ) => {
                    const name =
                      food.name ||
                      "";

                    const selected =
                      selectedFoods.includes(
                        name
                      );

                    return (
                      <button
                        key={
                          food.id ||
                          `${name}-${index}`
                        }
                        type="button"
                        onClick={() =>
                          toggleFood(
                            name
                          )
                        }
                        className={`
                          rounded-2xl
                          border
                          p-4
                          text-left
                          transition
                          ${
                            selected
                              ? "border-[#809CCF] bg-[#809CCF]/10"
                              : "border-gray-200 bg-white"
                          }
                        `}
                      >
                        <span className="mr-2">
                          {selected
                            ? "☑️"
                            : "⬜"}
                        </span>

                        <span
                          className="
                            font-bold
                            text-gray-800
                          "
                        >
                          {name}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {selectedFoods.length >
              0 && (
              <div
                className="
                  mt-4
                  rounded-xl
                  bg-[#809CCF]/10
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-gray-700
                "
              >
                {selectedFoods.length}
                個の食材を選択中
              </div>
            )}

            <button
              type="button"
              onClick={
                generateRecipe
              }
              disabled={
                loading ||
                selectedFoods.length ===
                  0
              }
              className="
                mt-6
                w-full
                rounded-xl
                bg-[#809CCF]
                py-4
                text-lg
                font-bold
                text-white
                transition
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "🤖 AIが考え中..."
                : "✨ レシピを提案"}
            </button>
          </section>

          {recipe && (
            <section
              className="
                mt-6
                rounded-3xl
                bg-white
                p-5
                shadow-sm
              "
            >
              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                🍳 おすすめレシピ
              </h2>

              <div
                className="
                  mt-4
                  whitespace-pre-wrap
                  leading-7
                  text-gray-700
                "
              >
                {recipe}
              </div>
            </section>
          )}

          {message && (
            <div
              className="
                mt-5
                rounded-2xl
                bg-white
                p-4
                text-center
                font-bold
                text-gray-700
                shadow-sm
              "
            >
              {message}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}