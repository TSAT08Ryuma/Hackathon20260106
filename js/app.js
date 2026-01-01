// ボタン系のデータをインプット
const input = document.getElementById("input");
const send = document.getElementById("send");
const output = document.getElementById("output");
const play = document.getElementById("play");
const save = document.getElementById("save");
const list = document.getElementById("list");
const form = document.getElementById("form");
const progressBar = document.getElementById("progress_bar");
const progressText = document.getElementById("progress_text"); //%表記のやつ
let repeat = document.getElementById("repeat")

// グローバル関数にして文クリック、文分割、文光るやつでも使う
let sentences = []; 
// これは再生バー用だが、再生系のものと一緒に使うのでグローバル化
let currentUtterance = null;
// 冒頭の読み上げエラー対応で色々かみ合いそうなのでグローバル化
const START_WORD = "uh. . . . . . .";
const offset = START_WORD.length;


//普通にhtmlで処理するから変なもの返さないようにするためのツール で//の中身を探し、gは全部探すという意味　\s+は改行とかタブとかでmatchのところで改行に変換している
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// . ! ? で文分割
function splitIntoSentences(text) {
  const t = text.replace(/\s+/g, " ").trim();
  const arr = t.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return arr ? arr.map((s) => s.trim()) : [t];
  //配列を返すときに使うのが最後の[t]で、mapはそれぞれについて同じ処理をするというもので、trimは前後の空白を消す処理
  //条件?A:BはtrueでAでfalseはB。
}

function renderSentences(text) {
    // このリザルトは加工した文章にspanをつけたものを詰めるためのもの
  let result = [];
  sentences = splitIntoSentences(text); //二番目の関数の結果でセンテンスは複数の行が入った配列

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    result.push(`<span class="sent" data-i="${i}">${escapeHtml(s)}</span> `); //escapeで危ないものをセーフにしてる
  }

  output.innerHTML = result.join(""); //配列の中身を全部くっつけて表示。一回DOM要素にした箱なのでvalueとかinnnerHTMLとか使えるけど今回はhtmlでつかませたいのでこれをした。そもそも今回はinputでもtextareaでもないからそれ限定のvalueは使えない
  document.getElementById("hidden_output").value = sentences.join("");
}

// fetchの中身は　行先、方法、形式、中身という感じになってる
send.addEventListener("click", async () => {
  // 送信する文字列を以下とする。このボタン押したときの値を取ってほしいから関数の中に入れた。
  const level = document.getElementById("level").value;
  const levelMap = {
    junior_high_school:
      "very simple English for Japanese junior high school students",
    high_school: "standard English for Japanese high school students",
    business:
      "business English focused on comprehension rather than fluent speaking",
    news: "neutral news-style English",
    native: "natural native-level English",
  };
  const levelPrompt = levelMap[level];

  const text_for_ai =
    "Write an English passage between 110 and 130 words.\n" +
    "Difficulty of vocabulary and sentence length:" +
    levelPrompt +
    "\n" +
    "Theme:" +
    input.value +
    "\n" +
    "Do not include any introductions, explanations, or meta comments. Output only the English passage.";
  output.textContent = "considering";

  console.log(text_for_ai);

  const res = await fetch("http://localhost:3000/api/gemini", {
    //Geminiはnode.jsで開いているのでこちらのポート番号を選択している。
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text_for_ai }),
  });
  //表示をするためのもの
  const data = await res.json();
  renderSentences(data.result); //表示系の関数に結果をぶちこんだ
});

// 再生ボタン
// 再生中　speechSynthesis.speaking && !paused
// 一時停止中　speechSynthesis.paused

// 再生終了時やエラー時
function resetProgress() {
  if (!progressBar || !progressText) return;
  progressBar.value = 0;
  progressText.textContent = "0%";
}

// 再生機能のほう
play.addEventListener("click", () => {

    // 変数
    

  // 再生するものや数を数えるための変数
  const text = output.textContent.trim();
  const text_for_speech = START_WORD + text;
  if (!text) return;

  // 再生中 → 一時停止
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    play.textContent = "▶ 再開";
    return;
  }

  // 一時停止中 → 再開
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    play.textContent = "⏸ 停止";
    return;
  }

  // 初回
  const utterance = new SpeechSynthesisUtterance(text_for_speech);
  utterance.lang = "en-US"; // 英語
  utterance.rate = 1.0; // 速度（0.8〜1.2がおすすめ）

  // 先に currentUtterance へ保持してからハンドラを付ける
  currentUtterance = utterance;

 // 読んだ場所を計算している
  currentUtterance.onboundary = (event) => {
    if (!progressBar || !progressText) return;
    const idx = Math.max(0, event.charIndex - offset);
    const percent = Math.min(
      100,
      Math.floor((idx / text.length) * 100)
    );
    progressBar.value = percent;
    progressText.textContent = `${percent}%`;

    // ここで光る関数
    highlight(idx);
  };

//   再生が普通に終わったらどうするか
  currentUtterance.onend = () => {
    play.textContent = "▶ 再生";
    resetProgress();
    currentUtterance = null;

    // // 繰り返し時
    //  if(repeat.checked){
    //     const next = new SpeechSynthesisUtterance(text_for_speech);
    //     next.lang = "en-US";
    //     next.rate = 1.0;
    // // 進捗・ハイライトを同じ処理にするならハンドラを引き継ぐ
    //     next.onboundary = currentUtterance.onboundary;
    //     next.onerror = currentUtterance.onerror;
    //     next.onend = currentUtterance.onend;
    //     currentUtterance = next;
    //     speechSynthesis.speak(next);
    //     play.textContent = "⏸ 停止";
    // return;
    // }
  };

  currentUtterance.onerror = () => {
    play.textContent = "▶ 再生";
    resetProgress();
    currentUtterance = null;
  };

 //念のための保険でエラー・多重用見上げ対策で読み上げ前に一回キャンセルしている
  speechSynthesis.cancel();
  resetProgress();
  setTimeout(() => speechSynthesis.speak(utterance), 0);
  play.textContent = "⏸ 停止";
});

// リロード / タブ閉じ / 遷移 で止める
function stopTTS() {
  try { speechSynthesis.cancel(); } catch {}
  currentUtterance = null;
  // UIも戻したいなら
  if (play) play.textContent = "▶ 再生";
  resetProgress?.();
}
window.addEventListener("beforeunload", stopTTS); 
// iOS Safariや一部ブラウザで beforeunload が弱い時の保険
window.addEventListener("pagehide", stopTTS);

//  保存ボタン 今回はhiddenにデータを格納するのでbutton type="submit"で解決せず、これを加えている。今回はsubmitという行為をeにいれていて、submitされたらそれが確定する直前に値を詰めるという処理をしてくれる
form.addEventListener("submit", (e) => {
  document.getElementById("hidden_output").value = output.textContent.trim();
});

//　クリックしたら上に動く
document.addEventListener("DOMContentLoaded", () => {
  //ページ全部読み込まれたら～という関数で必ずしも必要ない
  document.querySelectorAll("tr.row").forEach((tr) => {
    //列とか指定するときはクエリセレクトオール
    tr.addEventListener("click", () => {
      //それぞれの列のうちクリックイベントで反応するもの決定
      const text = tr.dataset.content; // data-で作ったデータを取り出すために使用する。
      if (!text) return;
      renderSentences(text); // 上に表示
    });
  });
});

// 光る関数。sentencesは文章の塊でsentクラスがついたクエリを取り出してspansにいれてる
function highlight(charIndex) {
  const spans = document.querySelectorAll(".sent");
  if (!spans.length || !sentences.length) return;

  // 文章ごとの開始位置を順に足し上げて、charIndex がどこに入るかで判定して、cssの.sent .activeを光らせてる
  let acc = 0;
  for (let i = 0; i < sentences.length; i++) {
    const start = acc;
    const end = acc + sentences[i].length;
    // 次の sentence の前に 1 文字スペースを入れているなら acc++ などで調整
    if (charIndex >= start && charIndex < end) {
      spans.forEach((s) => s.classList.remove("active"));
      spans[i].classList.add("active");
      break;
    }
    acc = end + 1; // sentences を join するときに挟んだスペース分を足す
  }
}


// // 今回はsave.php内のデータを取り出している　関数内にhtml化する関数を組み込んだ
// fetch("save.php")
//     .then(res => res.json()) //まずsave.phpのデータを引数としてjsonファイルにした
//     .then(aaa => { //そのファイルをaaaと名付けて、thenでそのデータを受け取り、それぞれに対して処理
//         aaa.forEach(item => { //それぞれをitemとして、まずliタグを作るコードと、作ったliタグの中身を記載し、DOMであるlistにどんどん追加していく
//             const li = document.createElement("li");
//             li.textContent = `${item.title} `;

//             // クリックで上に流し込む
//             li.addEventListener("click", () => {
//                 renderSentences(item.text);
//             });

//             list.appendChild(li);
//         });
//     });
