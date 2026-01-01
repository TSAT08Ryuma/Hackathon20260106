import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import cors from "cors";

// expressを使ってappにルール登録できるようにしてるし、外から来たものを受け取れる箱にもなるしたい気もしてくれる
// useの中には設定を書く。appに書いたものは外に出してよいよという宣言とjson()とするとjson形式出来たらそう対応できるようにするという設定をしている

const app = express();
app.use(cors({
  origin: "http://localhost",
  methods: ["POST"],
}));
app.use(express.json());
app.use(express.static("public"));

// app.post(通路名, (受け取り係, 返事係) => {

//   ① 入力を取り出す
//   ② 必要な処理をする
//   ③ 結果を返す

// });

// APIキーを取得している
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });

// // APIキーが不足している場合に強制終了する（※本番環境でonにする）
// if (!process.env.GEMINI_API_KEY) {
//   console.error("GEMINI_API_KEY is missing");
//   process.exit(1);
// }

// 受け取る→処理→返すという流れ。app.postをすると発生するデータをreqに入れてresで返している感じ。textはreq.bodyの変数textのデータを対象にしている。
app.post("/api/gemini", async (req, res) => {
  try {

    // エラー発生時にはフロントにエラーメッセージを出すことにした。
    const text = (req.body?.text || "").trim(); //死ぬほど長いデータとか入れられないようにした。?で該当データ無かったらundefinedにしてtrim()出て前と後ろの空欄消してる
    if (!text) return res.status(400).json({ error: "text is required" });
    if (text.length > 1000) return res.status(413).json({ error: "text too long" });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: text,
    });

    res.json({ result: result.text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API failed" });
  }


});


// appを待機にしている
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("起動中");
});