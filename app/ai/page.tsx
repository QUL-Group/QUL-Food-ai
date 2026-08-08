import BottomNav from "@/components/BottomNav";

export default function AIPage() {

  return (
    <>
      <main className="min-h-screen bg-[#F5F8FC] p-6 pb-28">

        <div className="max-w-xl mx-auto">

          <h1 className="text-3xl font-bold text-[#809CCF]">
            🤖 AIアシスタント
          </h1>


          <p className="mt-2 text-gray-600">
            冷蔵庫の食材から献立やアイデアを提案します。
          </p>



          <section className="mt-8 bg-white rounded-3xl p-6 shadow-sm">


            <div className="bg-[#F5F8FC] rounded-2xl p-4 text-gray-600">

              <p className="font-bold text-gray-800">
                相談例
              </p>

              <p className="mt-3">
                ・今日の夕飯を考えて
              </p>

              <p>
                ・節約レシピを教えて
              </p>

              <p>
                ・冷蔵庫の残り物で作れる？
              </p>

            </div>



            <input
              placeholder="AIに質問..."
              className="
              mt-5
              w-full
              border
              rounded-xl
              p-3
              "
            />


            <button
              className="
              mt-4
              w-full
              bg-[#809CCF]
              text-white
              py-3
              rounded-xl
              font-bold
              "
            >
              送信
            </button>


          </section>


        </div>


      </main>


      <BottomNav />

    </>
  );
}