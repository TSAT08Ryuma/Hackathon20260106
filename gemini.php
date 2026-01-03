<?php
// XSS攻撃を防御する
require_once('funcs.php');

//1.  DB接続　5ステップ⓵
try {
  //Password:MAMP='root',XAMPP=''
  $pdo = new PDO('mysql:dbname=***********;charset=utf8;host=localhost','root','');
} catch (PDOException $e) {
  exit('DBConnectError'.$e->getMessage());
}

//２．データ取得SQL作成して実行　5ステップ⓶⓸
$stmt = $pdo->prepare("SELECT * FROM `*************`");
$status = $stmt->execute();

//３．データ表示　5ステップ⓹エラーか、エラー出ないならば…。i++みたいなもの
$view="";
if ($status==false) {
    //execute（SQL実行時にエラーがある場合）
  $error = $stmt->errorInfo();
  exit("ErrorQuery:".$error[2]);
}else{
while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $title = h($result['title']);
    $content = h($result['content']); // 表示用
    $content_process = h($result['content']); // data属性用（ENT_QUOTES効いてる想定）表示されているものをコピーして使うこともできるが、今回は 読み込んだものを仮データとして保存、それを正として使っている。data- を使うと実現。
        $view .= '<tr class="row" data-content="'. $content_process . '" ><td class="id">' //trが行でtdが列
        . h($result['id'])
        . '</td><td>' 
        . h($title) 
        . '</td><td>' 
        . h($content) 
        . '</td></tr>';
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<!-- http://localhost:3000/gemini.html　ではなくデフォルトのポート番号８０になっているhttp://localhost/learning_English/gemini.phpにて開かないといけない -->

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css" type="text/css">
    <title>AIでシャドーイング</title>
</head>

<body>
    <div class="wrap">
        <div class="header">
            <h1>Geminiでシャドーイング教材を作ろう</h1>
            <a href="db.php" class="nav-link">データ一覧</a>
        </div>
        <p>半導体材料からUSスチールの話まで、全てを1分の英語に。</p>
        <div id="button_area">
            <div id="play_row">
                <button id="play">▶ 再生</button>
                <!-- <label class="repeat-toggle">
                    <input type ="checkbox" id="repeat" value="repeat">REPEAT
                </label> -->
                <div id="progress_area">
                    <label for="progress_bar">再生バー：</label>
                    <progress id="progress_bar" max="100" value="0"></progress>
                    <span id="progress_text">0%</span>
                </div>
                <!-- <span>速度：</span>
                <select id="speed">
                <option value="1.5">1.5x</option>
                <option value="1.2">1.2x</option>
                <option value="1" selected>1x</option>
                <option value="0.8">0.8x</option>
                <option value="0.5">0.5x</option>
            </select> -->
            </div>
            <div>
            <button id="send">AI生成</button>
            <button type="submit" id="save" form="form">✉ 保存</button>
            <span>生成する英語の難易度：</span>
            <select id="level">
                <option value="junior_high_school">中学3年生レベル</option>
                <option value="high_school" selected>高校3年生レベル</option>
                <option value="business">ビジネスレベル</option>
                <option value="news">報道番組レベル</option>
                <option value="native">ネイティブレベル</option>
            </select>
            </div>
        </div>
        <form method="POST" action="insert.php" id="form">
            <textarea id="input" placeholder="AI生成したい話を入力してね" name="input"></textarea>
            <div id="output">表示エリアだよ</div>
            <!-- 表示用ではなくphp送信用 -->
            <input type="hidden" name="hidden_output" id="hidden_output">
        </form>
        <!-- <h2>テスト用：君の作った作品</h2>
        <ul id="list"></ul> -->
        <h2>君の作った作品</h2>            
            <div class="data-container">
                <?php if(empty($view)): ?>
                    <!-- もし $view データがない場合の表示 -->
                    <p>まだデータがありません</p>
                <?php else: ?>
                    <!-- もし $view データが存在する場合 -->
                    <table>
                        <thead>
                            <tr>
                                <th class="id">ID</th>
                                <th>Title</th>
                                <th>Content</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?= $view ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
    </div>

    <script src="./js/app.js"></script>

</body>
</html>