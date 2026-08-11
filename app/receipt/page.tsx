"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/firebase";
import { uploadReceiptImage } from "@/lib/storageService";
import { saveReceiptData } from "@/lib/receiptService";
import { saveFoodItems } from "@/lib/foodService";

type ReceiptItem = {
  name: string;
  price: number;
};

type Receipt = {
  storeName?: string;
  date?: string;
  totalPrice?: number;
  items?: ReceiptItem[];
};

type ReceiptData = {
  receipts?: Receipt[];
};

type ImagePayload = {
  data: string;
  mimeType: string;
};

export default function ReceiptPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [receiptData, setReceiptData] =
    useState<ReceiptData | null>(null);
  const [selectedItems, setSelectedItems] =
    useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /*
   * ========================================
   * 写真追加
   * ========================================
   */

  const addImages = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const type = file.type.toLowerCase();
      const name = file.name.toLowerCase();

      return (
        type === "image/jpeg" ||
        type === "image/jpg" ||
        type === "image/png" ||
        type === "image/webp" ||
        type === "image/heic" ||
        type === "image/heif" ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp") ||
        name.endsWith(".heic") ||
        name.endsWith(".heif")
      );
    });

    if (validFiles.length === 0) {
      setMessage("対応している画像を選択してください");
      event.target.value = "";
      return;
    }

    const newPreviews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setFiles((previous) => [
      ...previous,
      ...validFiles,
    ]);

    setPreviews((previous) => [
      ...previous,
      ...newPreviews,
    ]);

    setReceiptData(null);
    setSelectedItems([]);

    setMessage(
      `${validFiles.length}枚の写真を追加しました`
    );

    event.target.value = "";
  };

  /*
   * ========================================
   * 写真削除
   * ========================================
   */

  const removeImage = (index: number) => {
    const preview = previews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setPreviews((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setReceiptData(null);
    setSelectedItems([]);
    setMessage("");
  };

  /*
   * ========================================
   * 写真全削除
   * ========================================
   */

  const clearImages = () => {
    previews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setFiles([]);
    setPreviews([]);
    setReceiptData(null);
    setSelectedItems([]);
    setMessage("");
  };

  /*
   * ========================================
   * AI読み取り
   * ========================================
   */

  const analyzeReceipt = async () => {
    if (files.length === 0) {
      setMessage(
        "先にレシート写真を選択してください"
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setReceiptData(null);
    setSelectedItems([]);

    try {
      const images: ImagePayload[] =
        await Promise.all(
          files.map((file) =>
            fileToBase64(file)
          )
        );

      const response = await fetch(
        "/api/receipt-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "AI読み取りに失敗しました"
        );
      }

      let result: ReceiptData;

      if (typeof data.data === "string") {
        const cleanText = data.data
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        result = JSON.parse(cleanText);
      } else {
        result = data.data;
      }

      const receipts = Array.isArray(
        result?.receipts
      )
        ? result.receipts
        : [];

      const items: ReceiptItem[] =
        receipts.flatMap((receipt) => {
          if (!Array.isArray(receipt.items)) {
            return [];
          }

          return receipt.items.filter(
            (item) =>
              item &&
              typeof item.name === "string"
          );
        });

      setReceiptData({
        receipts,
      });

      setSelectedItems(items);

      if (items.length === 0) {
        setMessage(
          "読み取りは完了しましたが、商品が見つかりませんでした"
        );
      } else {
        setMessage(
          `${items.length}件の商品を読み取りました`
        );
      }
    } catch (error) {
      console.error(
        "Receipt AI Error",
        error
      );

      setReceiptData(null);
      setSelectedItems([]);

      setMessage(
        "AI読み取りに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================
   * 商品選択
   * ========================================
   */

  const toggleItem = (
    item: ReceiptItem
  ) => {
    const exists = selectedItems.some(
      (selected) =>
        selected.name === item.name &&
        selected.price === item.price
    );

    if (exists) {
      setSelectedItems(
        selectedItems.filter(
          (selected) =>
            !(
              selected.name === item.name &&
              selected.price === item.price
            )
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        item,
      ]);
    }
  };

  /*
   * ========================================
   * 全選択
   * ========================================
   */

  const toggleAll = () => {
    const allItems: ReceiptItem[] =
      receiptData?.receipts?.flatMap(
        (receipt) =>
          Array.isArray(receipt.items)
            ? receipt.items
            : []
      ) || [];

    if (
      allItems.length > 0 &&
      selectedItems.length === allItems.length
    ) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItems);
    }
  };

  /*
   * ========================================
   * 冷蔵庫へ登録
   * ========================================
   */

  const saveReceipt = async () => {
    const user = auth.currentUser;

    if (!user) {
      setMessage(
        "ログインしてください"
      );
      return;
    }

    if (selectedItems.length === 0) {
      setMessage(
        "登録する商品を選択してください"
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const imageUrls =
        await Promise.all(
          files.map(async (file) => {
            const result =
              await uploadReceiptImage(
                user.uid,
                file
              );

            return result.url;
          })
        );

      await saveReceiptData(
        user.uid,
        {
          imageUrls,
          items: selectedItems,
          receiptInfo: receiptData,
          status: "checked",
        }
      );

      await saveFoodItems(
        user.uid,
        selectedItems
      );

      setMessage(
        "✅ 冷蔵庫に登録しました"
      );
    } catch (error) {
      console.error(
        "Save Receipt Error",
        error
      );

      setMessage(
        "保存に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================
   * 画面
   * ========================================
   */

  return (
    <>
      <main className="min-h-screen bg-[#F5F8FC] px-5 py-6 pb-28">
        <div className="mx-auto max-w-xl">

          {/* タイトル */}

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📷 レシート登録
            </h1>

            <p className="mt-2 text-gray-500">
              レシートを撮影・選択して、
              AIで商品を読み取ります。
            </p>
          </div>


          {/* 写真追加 */}

          <div className="mt-6">
            <label
              htmlFor="receipt-image-input"
              className="
                block
                w-full
                cursor-pointer
                rounded-2xl
                bg-[#809CCF]
                p-5
                text-center
                font-bold
                text-white
                shadow-sm
                transition
                active:scale-[0.98]
              "
            >
              <div className="text-lg">
                📸 レシートを撮影・追加
              </div>

              <div className="mt-1 text-sm font-normal text-white/80">
                JPG・JPEG・PNG・WebP・HEIC対応
              </div>
            </label>

            <input
              id="receipt-image-input"
              type="file"
              accept="
                image/jpeg,
                image/jpg,
                image/png,
                image/webp,
                image/heic,
                image/heif,
                .jpg,
                .jpeg,
                .png,
                .webp,
                .heic,
                .heif
              "
              multiple
              onChange={addImages}
              className="hidden"
            />
          </div>


          {/* 写真プレビュー */}

          {files.length > 0 && (
            <section className="mt-6">

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  📸 選択した写真
                </h2>

                <button
                  type="button"
                  onClick={clearImages}
                  className="
                    text-sm
                    font-bold
                    text-red-500
                  "
                >
                  すべて削除
                </button>
              </div>


              <div className="space-y-4">

                {files.map(
                  (file, index) => {
                    const preview =
                      previews[index];

                    const isHeic =
                      file.type ===
                        "image/heic" ||
                      file.type ===
                        "image/heif" ||
                      /\.(heic|heif)$/i.test(
                        file.name
                      );

                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className="
                          relative
                          overflow-hidden
                          rounded-2xl
                          bg-white
                          p-2
                          shadow-sm
                        "
                      >

                        {isHeic ? (
                          <div
                            className="
                              flex
                              h-56
                              w-full
                              flex-col
                              items-center
                              justify-center
                              rounded-xl
                              bg-gray-100
                            "
                          >
                            <div className="text-5xl">
                              📷
                            </div>

                            <p className="mt-3 font-bold">
                              HEIC写真
                            </p>

                            <p className="mt-1 max-w-[90%] truncate text-sm text-gray-500">
                              {file.name}
                            </p>
                          </div>
                        ) : (
                          <img
                            src={preview}
                            alt={`レシート ${index + 1}`}
                            className="
                              block
                              max-h-[650px]
                              w-full
                              rounded-xl
                              object-contain
                            "
                            onError={() => {
                              console.error(
                                "画像表示エラー",
                                file
                              );

                              setMessage(
                                "写真を表示できませんでした"
                              );
                            }}
                          />
                        )}


                        {/* 番号 */}

                        <div
                          className="
                            absolute
                            left-4
                            top-4
                            rounded-full
                            bg-black/60
                            px-3
                            py-1
                            text-sm
                            text-white
                          "
                        >
                          {index + 1}
                        </div>


                        {/* 削除 */}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(index)
                          }
                          className="
                            absolute
                            right-3
                            top-3
                            h-10
                            w-10
                            rounded-full
                            bg-red-500
                            text-xl
                            font-bold
                            text-white
                            shadow-lg
                          "
                        >
                          ×
                        </button>

                      </div>
                    );
                  }
                )}

              </div>
            </section>
          )}


          {/* AI読み取りボタン */}

          {files.length > 0 &&
            !receiptData && (
              <button
                type="button"
                onClick={analyzeReceipt}
                disabled={loading}
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-[#809CCF]
                  py-4
                  text-lg
                  font-bold
                  text-white
                  shadow-sm
                  disabled:opacity-50
                "
              >
                {loading
                  ? "🤖 AIが読み取り中..."
                  : "✨ AIでレシートを読み取る"}
              </button>
            )}


          {/* 読み取り結果 */}

          {receiptData && (
            <section
              className="
                mt-6
                rounded-3xl
                bg-white
                p-5
                shadow-sm
              "
            >

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold">
                  📄 読み取り結果
                </h2>

                <button
                  type="button"
                  onClick={toggleAll}
                  className="
                    text-sm
                    font-bold
                    text-[#809CCF]
                  "
                >
                  全選択 / 全解除
                </button>

              </div>


              <p className="mt-2 text-sm text-gray-500">
                冷蔵庫に登録する商品を選択してください。
              </p>


              {receiptData.receipts?.map(
                (receipt, receiptIndex) => (
                  <div
                    key={receiptIndex}
                    className="
                      mt-5
                      rounded-2xl
                      bg-[#F5F8FC]
                      p-4
                    "
                  >

                    {receipt.storeName && (
                      <p className="text-lg font-bold">
                        🏪 {receipt.storeName}
                      </p>
                    )}

                    {receipt.date && (
                      <p className="mt-1 text-sm text-gray-500">
                        📅 {receipt.date}
                      </p>
                    )}

                    {receipt.totalPrice !==
                      undefined && (
                      <p className="mt-1 text-sm text-gray-500">
                        💰 合計 {receipt.totalPrice}円
                      </p>
                    )}


                    <div className="mt-4">

                      {receipt.items &&
                      receipt.items.length > 0 ? (
                        receipt.items.map(
                          (item, itemIndex) => {
                            const checked =
                              selectedItems.some(
                                (selected) =>
                                  selected.name ===
                                    item.name &&
                                  selected.price ===
                                    item.price
                              );

                            return (
                              <label
                                key={itemIndex}
                                className="
                                  flex
                                  cursor-pointer
                                  items-center
                                  gap-3
                                  border-b
                                  border-gray-200
                                  py-3
                                  last:border-b-0
                                "
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleItem(item)
                                  }
                                  className="
                                    h-5
                                    w-5
                                  "
                                />

                                <span className="flex-1">
                                  {item.name}
                                </span>

                                <span className="whitespace-nowrap font-bold">
                                  {item.price}円
                                </span>
                              </label>
                            );
                          }
                        )
                      ) : (
                        <p className="text-sm text-gray-500">
                          商品を読み取れませんでした。
                        </p>
                      )}

                    </div>

                  </div>
                )
              )}


              {/* 冷蔵庫登録 */}

              <button
                type="button"
                onClick={saveReceipt}
                disabled={
                  loading ||
                  selectedItems.length === 0
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
                  disabled:opacity-50
                "
              >
                {loading
                  ? "保存中..."
                  : `🥬 ${selectedItems.length}件を冷蔵庫に登録`}
              </button>

            </section>
          )}


          {/* メッセージ */}

          {message && (
            <div
              className="
                mt-5
                rounded-xl
                bg-white
                p-4
                text-center
                font-bold
                text-gray-700
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


/*
 * ========================================
 * ファイル → Base64
 * ========================================
 */

async function fileToBase64(
  file: File
): Promise<ImagePayload> {
  // HEIC/HEIFはブラウザでCanvas変換できないことがあるため、
  // その場合は元画像を送る（サーバー側で対応できる場合に備える）
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name);

  if (isHeic) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        const commaIndex = result.indexOf(",");

        if (commaIndex === -1) {
          reject(
            new Error("画像データの変換に失敗しました")
          );
          return;
        }

        resolve({
          data: result.substring(commaIndex + 1),
          mimeType: file.type || getMimeType(file.name),
        });
      };

      reader.onerror = () => {
        reject(
          new Error("画像の読み込みに失敗しました")
        );
      };

      reader.readAsDataURL(file);
    });
  }

  // 通常画像はブラウザ側で圧縮してからBase64化する。
  // これによりVercelの413 FUNCTION_PAYLOAD_TOO_LARGEを防ぎやすくする。
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 2000;
        const JPEG_QUALITY = 0.72;

        let width = img.naturalWidth;
        let height = img.naturalHeight;

        const scale = Math.min(
          1,
          MAX_WIDTH / width,
          MAX_HEIGHT / height
        );

        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(
            new Error("画像処理を開始できませんでした")
          );
          return;
        }

        // 白背景にして、透過PNGなども読みやすいJPEGに変換
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(
                new Error("画像の圧縮に失敗しました")
              );
              return;
            }

            const reader = new FileReader();

            reader.onload = () => {
              const result = reader.result as string;
              const commaIndex = result.indexOf(",");

              if (commaIndex === -1) {
                reject(
                  new Error(
                    "画像データの変換に失敗しました"
                  )
                );
                return;
              }

              resolve({
                data: result.substring(
                  commaIndex + 1
                ),
                mimeType: "image/jpeg",
              });
            };

            reader.onerror = () => {
              reject(
                new Error(
                  "圧縮画像の読み込みに失敗しました"
                )
              );
            };

            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error("画像を読み込めませんでした")
      );
    };

    img.src = objectUrl;
  });
}


/*
 * ========================================
 * 拡張子からMIMEタイプを取得
 * ========================================
 */

function getMimeType(
  fileName: string
): string {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";

    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "heic":
      return "image/heic";

    case "heif":
      return "image/heif";

    default:
      return "image/jpeg";
  }
}