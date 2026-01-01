<?php

// データを取得する
$id = $_POST["id"] ?? "error";

// バリデーション
if ($id === '') {
  exit('ValidationError: id required.');
}

// DB接続の５ステップ⓵
try {
  //ID:'root', Password: xamppは 空白 ''
  $pdo = new PDO('***********;charset=utf8;host=localhost','root','');
} catch (PDOException $e) {
  exit('DBConnectError:'.$e->getMessage());
}

// SQL準備の５ステップ⓶　->とはある変数が持っているメソッドを使うときの手法で、JSの.と同じだ
$stmt = $pdo->prepare("DELETE FROM ************ WHERE id=:id");

// バインド変数といって実際にデータを流し込む。文字列扱いする魔法の一種　５ステップ⓷
$stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);

// 実行する　５ステップ⓸
$status = $stmt->execute();

//４．データ登録処理後　５ステップ⓹
if($status === false){
  //SQL実行時にエラーがある場合（エラーオブジェクト取得して表示）errorの２が人間用エラー
  $error = $stmt->errorInfo();
  exit('ErrorMessage:' . $error[2]);
}else{
    header('Location: db.php'); // 戻り先ページ
    exit();
}
?>