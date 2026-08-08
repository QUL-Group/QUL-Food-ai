import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "GEMINI_API_KEYが設定されていません",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const foods = body?.foods;

    if (!Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "食材を1つ以上選択してください",
        },
        { status: 400 }
      );
    }

    const foodNames = foods
      .filter((food: unknown): food is string => {
        return typeof food === "string";
      })
      .map((food: string) => food.trim())
      .filter(Boolean);

    if (foodNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "有効な食材がありません",
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
あなたは家庭料理のAIアシスタントです。

冷蔵庫にある食材を使って、
おすすめ料理を3つ提案してください。

【冷蔵庫の食材】
${foodNames.join("、")}

【条件】
・冷蔵庫にある食材をできるだけ優先する
・家庭で作りやすい料理にする
・3品とも違う料理にする
・調理時間を書く
・使用する食材を書く
・足りない材料がある場合は追加材料として書く
・簡単な作り方を書く
・日本語で回答する
・特別な調理器具はできるだけ使わない
・分量は家庭で分かりやすくする

【回答形式】

🍳 料理1：料理名

⏰ 調理時間：
○分

🥬 使用食材：
・○○
・○○

🛒 追加材料：
・○○
・○○

📝 作り方：
1. ○○
2. ○○
3. ○○

🍳 料理2：料理名

⏰ 調理時間：
○分

🥬 使用食材：
・○○
・○○

🛒 追加材料：
・○○

📝 作り方：
1. ○○
2. ○○
3. ○○

🍳 料理3：料理名

⏰ 調理時間：
○分

🥬 使用食材：
・○○
・○○

🛒 追加材料：
・○○

📝 作り方：
1. ○○
2. ○○
3. ○○
`;

    console.log(
      "Recipe AI request:",
      foodNames
    );

    const result = await model.generateContent(
      prompt
    );

    const text = result.response.text();

    console.log(
      "Recipe AI response:",
      text
    );

    if (!text || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AIからレシピが返ってきませんでした",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        recipe: text.trim(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "Recipe AI Error:",
      error
    );

    let message =
      "レシピAIでエラーが発生しました";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}