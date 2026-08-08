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
            "GEMINI_API_KEYが設定されていません",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // リクエスト取得
    // =========================

    const body = await request.json();

    const images = body?.images;

    if (
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "画像がありません",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // 画像を整理
    // =========================

    const validImages: ImageData[] = [];

    for (const image of images) {
      if (
        !image ||
        typeof image !== "object"
      ) {
        continue;
      }

      if (
        typeof image.data !== "string" ||
        image.data.length === 0
      ) {
        continue;
      }

      let mimeType =
        typeof image.mimeType === "string"
          ? image.mimeType
          : "image/jpeg";

      /*
       * iPhoneなどから送られた場合の補正
       */

      if (
        mimeType === "image/jpg" ||
        mimeType === ""
      ) {
        mimeType = "image/jpeg";
      }

      /*
       * 対応形式
       *
       * jpeg
       * png
       * webp
       * heic
       * heif
       */

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ];

      if (
        !allowedMimeTypes.includes(
          mimeType
        )
      ) {
        console.warn(
          "Unsupported image type:",
          mimeType
        );

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
          message:
            "対応している画像がありません",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // Gemini
    // =========================

    const genAI =
      new GoogleGenerativeAI(apiKey);

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

    // =========================
    // プロンプト
    // =========================

    const prompt = `
あなたは高精度なレシート解析AIです。

添付されたレシート画像を解析して、
購入商品をできるだけ正確に読み取ってください。

必ずJSONだけを返してください。

Markdownのコードブロックは使用しないでください。

【読み取る内容】

・店名
・購入日
・合計金額
・商品名
・商品価格

商品は食材だけに限定しません。

スーパー、コンビニ、ドラッグストアなどの
レシートに記載された商品をできるだけそのまま抽出してください。

例えば、

牛乳
卵
豚肉
鶏肉
魚
野菜
果物
パン
お菓子
飲料
冷凍食品
調味料
日用品

などです。

【重要】

・商品名を勝手に一般化しない
・レシートに書かれている商品名を優先する
・価格は税込価格を優先する
・数量が書かれている場合も商品単位で整理する
・値引きがある場合は可能な範囲で考慮する
・読み取れない項目は推測しすぎない
・画像が複数ある場合は同じレシートの続きとして扱う
・複数のレシートがある場合は別々に整理する
・読み取れる商品が1つでもあれば返す
・商品が完全に読み取れない場合でも空のレスポンスにせず、分かる範囲で返す

【返却形式】

{
  "receipts": [
    {
      "storeName": "",
      "date": "",
      "totalPrice": 0,
      "items": [
        {
          "name": "",
          "price": 0
        }
      ]
    }
  ]
}

JSON以外の文章は絶対に返さないでください。
`;

    // =========================
    // Gemini contents
    // =========================

    const parts: any[] = [
      {
        text: prompt,
      },
    ];

    for (const image of validImages) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    // =========================
    // AI実行
    // =========================

    const result =
      await model.generateContent({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType:
            "application/json",
        },
      });

    const response =
      result.response;

    const text =
      response.text();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AIから解析結果が返ってきませんでした",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // JSON整形
    // =========================

    let parsedData: any;

    try {
      parsedData = JSON.parse(
        text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch (jsonError) {
      console.error(
        "Receipt JSON Parse Error:",
        text
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AIの解析結果をJSONとして読み取れませんでした",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // データ補正
    // =========================

    if (
      !parsedData ||
      !Array.isArray(
        parsedData.receipts
      )
    ) {
      parsedData = {
        receipts: [],
      };
    }

    parsedData.receipts =
      parsedData.receipts.map(
        (receipt: any) => ({
          storeName:
            typeof receipt?.storeName ===
            "string"
              ? receipt.storeName
              : "",

          date:
            typeof receipt?.date ===
            "string"
              ? receipt.date
              : "",

          totalPrice:
            typeof receipt?.totalPrice ===
            "number"
              ? receipt.totalPrice
              : Number(
                  receipt?.totalPrice
                ) || 0,

          items:
            Array.isArray(
              receipt?.items
            )
              ? receipt.items
                  .filter(
                    (item: any) =>
                      item &&
                      typeof item.name ===
                        "string" &&
                      item.name.trim()
                  )
                  .map(
                    (item: any) => ({
                      name:
                        item.name.trim(),

                      price:
                        typeof item.price ===
                        "number"
                          ? item.price
                          : Number(
                              item.price
                            ) || 0,
                    })
                  )
              : [],
        })
      );

    // =========================
    // 成功
    // =========================

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error(
      "Receipt AI Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "レシートAIでエラーが発生しました",
      },
      {
        status: 500,
      }
    );
  }
}