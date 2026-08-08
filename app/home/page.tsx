export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#809CCF]">
          🧊 QUL Food AI
        </h1>

        <p className="mt-2 text-gray-600">
          ようこそ！
        </p>

        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold">
            はじめに設定しましょう
          </h2>

          <p className="mt-2 text-gray-600">
            QUL Food AIを利用するために、初期設定を行います。
            所要時間は約2〜3分です。
          </p>

          <div className="mt-6 space-y-3">
            <div>✅ 冷蔵庫の容量</div>
            <div>✅ 常に買っておきたい食材</div>
            <div>✅ よく利用するスーパー</div>
            <div>✅ 通知設定</div>
            <div>✅ AIの利用設定</div>
          </div>

          <button className="mt-8 w-full bg-[#809CCF] text-white py-3 rounded-xl">
            初期設定を開始
          </button>
        </div>
      </div>
    </main>
  );
}