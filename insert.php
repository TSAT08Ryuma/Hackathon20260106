<?php

// データを取得する
$title = $_POST["input"] ?? "error";
$content = $_POST["hidden_output"] ?? "error";

// バリデーション
if ($title === '' || $content === '') {
  exit('ValidationError: title and content are required.');
}
if (mb_strlen($title) > 120 || mb_strlen($content) > 5000) {
  exit('ValidationError: too long.');
}

// DB接続の５ステップ⓵
try {
  //ID:'root', Password: xamppは 空白 ''
  $pdo = new PDO('mysql:**********;charset=utf8;host=localhost','root','');
} catch (PDOException $e) {
  exit('DBConnectError:'.$e->getMessage());
}

// SQL準備の５ステップ⓶　->とはある変数が持っているメソッドを使うときの手法で、JSの.と同じだ
$stmt = $pdo->prepare("INSERT INTO ***********(title, content) VALUES(:title, :content)");

// バインド変数といって実際にデータを流し込む。文字列扱いする魔法の一種　５ステップ⓷

$stmt->bindValue(':title', $title, PDO::PARAM_STR);
$stmt->bindValue(':content', $content, PDO::PARAM_STR);

// 実行する　５ステップ⓸
$status = $stmt->execute();

//４．データ登録処理後　５ステップ⓹
if($status === false){
  //SQL実行時にエラーがある場合（エラーオブジェクト取得して表示）errorの２が人間用エラー
  $error = $stmt->errorInfo();
  exit('ErrorMessage:' . $error[2]);
}else{
    header('Location: gemini.php'); // 戻り先ページ
    exit();
}
?>