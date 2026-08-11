import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

type ImageData = {
  data: string;
  mimeType: string;
};

export async function POST(request: Request) {
  try {
    // =========================
    // APIキー確認
    // =========================
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GEMINI_API_KEYが設定されていません。至急管理者へ連絡してください。",
        },
        { status: 500 }
      );
    }

    // =========================
    // リクエスト取得
    // =========================
    const body = await request.json();
    const images = body?.images;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "画像がありません",
        },
        { status: 400 }
      );
    }

    // =========================
    // 画像を整理
    // =========================
    const validImages: ImageData[] = [];

    for (const image of images) {
      if (!image || typeof image !== "object") continue;
      if (typeof image.data !== "string" || image.data.length === 0) continue;

      let mimeType =
        typeof image.mimeType === "string" ? image.mimeType : "image/jpeg";

      if (mimeType === "image/jpg" || mimeType === "") {
        mimeType = "image/jpeg";
      }

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ];

      if (!allowedMimeTypes.includes(mimeType)) {
        console.warn("Unsupported image type:", mimeType);
        continue;
      }

      validImages.push({
        data: image.data,
        mimeType,
      });
    }

    if (validImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "対応している画像がありません",
        },
        { status: 400 }
      );
    }

    // =========================
    // Gemini 設定 & プロンプト構築
    // =========================
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
あなたは高精度なレシート解析AIです。
添付されたレシート画像を解析して、購入情報を抽出してください。

【読み取る内容・注意事項】
- 店名、購入日、合計金額、商品名、商品価格（税込優先）を抽出すること。
- 商品名を勝手に一般化せず、レシートの記載内容を優先すること。
- 値引きがある場合は可能な範囲で考慮すること。
- 読み取れない項目は推測せず、空文字または0とすること。
- 画像が複数ある場合は同じレシートの続きとして扱うこと。
- 複数のレシートが写っている場合は別々に整理すること。

【返却フォーマット】
以下のJSONフォーマットのみを出力してください。Markdownのコードブロック（\`\`\`jsonなど）や余計な文章は一切含めないでください。

{
  "receipts": [
    {
      "storeName": "店名",
      "date": "YYYY-MM-DD",
      "totalPrice": 0,
      "items": [
        {
          "name": "商品名",
          "price": 0
        }
      ]
    }
  ]
}
`;

    const parts: any[] = [{ text: prompt }];

    for (const image of validImages) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    // =========================
    // AI実行 (安全なJSONモード)
    // =========================
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "AIから解析結果が返ってきませんでした",
        },
        { status: 500 }
      );
    }

    // =========================
    // JSON整形・安全なパース
    // =========================
    let parsedData: any;

    try {
      // 万が一コードブロックが含まれていても取り除ける処理を入れてパース
      const cleanText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsedData = JSON.parse(cleanText);
    } catch (jsonError) {
      console.error("Receipt JSON Parse Error:", text);

      return NextResponse.json(
        {
          success: false,
          message: "AIの解析結果をJSONとして読み取れませんでした",
        },
        { status: 500 }
      );
    }

    // データ構造の最低限のフォールバック補正
    if (!parsedData || !Array.isArray(parsedData.receipts)) {
      parsedData = { receipts: [] };
    }

    // =========================
    // 成功レスポンス
    // =========================
    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Receipt AI Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "レシートAIでエラーが発生しました",
      },
      { status: 500 }
    );
  }
}