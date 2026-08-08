import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  return (
    <>
      <main className="min-h-screen bg-[#F5F8FC] p-6 pb-28">

        <div className="max-w-xl mx-auto space-y-6">


          {/* Header */}
          <section className="bg-gradient-to-r from-[#809CCF] to-[#9FB6E8] rounded-3xl p-6 text-white shadow-lg">

            <p className="text-sm opacity-90">
              おはようございます
            </p>

            <h1 className="text-3xl font-bold mt-1">
              QUL Food AI
            </h1>

            <p className="mt-3 text-sm opacity-90">
              AIで冷蔵庫管理をもっとスマートに
            </p>

          </section>



          {/* Fridge Status */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">

            <div className="flex justify-between items-center">

              <h2 className="font-bold text-lg">
                🧊 冷蔵庫
              </h2>

              <span className="text-[#809CCF] font-bold">
                68%
              </span>

            </div>


            <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">

              <div className="h-full w-[68%] bg-[#809CCF] rounded-full" />

            </div>


            <p className="mt-3 text-gray-500 text-sm">
              登録食材 24個
            </p>

          </section>




          {/* Expiry */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">

            <h2 className="font-bold text-lg">
              ⚠ 期限が近い食材
            </h2>


            <div className="mt-4 space-y-3">


              <div className="flex justify-between bg-orange-50 rounded-xl p-3">

                <span>
                  牛乳
                </span>

                <span className="text-orange-500">
                  あと2日
                </span>

              </div>



              <div className="flex justify-between bg-orange-50 rounded-xl p-3">

                <span>
                  豆腐
                </span>

                <span className="text-orange-500">
                  今日まで
                </span>

              </div>


            </div>

          </section>




          {/* AI Recommendation */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">

            <h2 className="font-bold text-lg">
              🤖 AIおすすめ
            </h2>


            <p className="mt-3 text-gray-600">
              冷蔵庫の食材を分析して、
              あなたに合った献立を提案します。
            </p>


            <div className="mt-5 bg-[#F5F8FC] rounded-2xl p-4">

              <p className="font-bold">
                今日のおすすめ
              </p>

              <p className="mt-2 text-gray-500">
                AI献立は下のバーから！
              </p>

            </div>

          </section>


        </div>


      </main>


      <BottomNav />

    </>
  );
}