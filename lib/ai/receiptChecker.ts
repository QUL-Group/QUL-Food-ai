export async function checkReceiptImage(
  imageUrl: string
) {

  // 後でGemini APIを接続する場所

  console.log(
    "チェック対象:",
    imageUrl
  );


  return {
    success: true,

    message:
      "画像チェック完了",

    issues: [],

  };

}