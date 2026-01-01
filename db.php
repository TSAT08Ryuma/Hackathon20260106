<?php
// XSS攻撃を防御する
require_once('funcs.php');

//1.  DB接続　5ステップ⓵
try {
  //Password:MAMP='root',XAMPP=''
  $pdo = new PDO('mysql:dbname=***********;charset=utf8;host=localhost', 'root', '');
} catch (PDOException $e) {
  exit('DBConnectError' . $e->getMessage());
}

//２．データ取得SQL作成して実行　5ステップ⓶⓸
$stmt = $pdo->prepare("SELECT * FROM `************`");
$status = $stmt->execute();

//３．データ表示　5ステップ⓹エラーか、エラー出ないならば…。i++みたいなもの
$view = "";
if ($status == false) {
  //execute（SQL実行時にエラーがある場合）
  $error = $stmt->errorInfo();
  exit("ErrorQuery:" . $error[2]);
} else {
  while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $title = h($result['title']);
    $content = h($result['content']); // 表示用
    $content_process = h($result['content']); // data属性用（ENT_QUOTES効いてる想定）表示されているものをコピーして使うこともできるが、今回は 読み込んだものを仮データとして保存、それを正として使っている。data- を使うと実現。
    $view .= '<tr class="row" data-content="' . $content_process . '" ><td class="id">' //trが行でtdが列
      . h($result['id'])
      . '</td><td>'
      . h($title)
      . '</td><td>'
      . h($content)
      . '</td><td class="delete">'
      . '<form method="POST" action="delete.php" >' //nameとvalueを送ってて、nameで取り出してる。テキストエリアとインプットエリアの場合は入っている文字がvalueだから、valueを指定していないが、そうでないボタン系はvalueが何か指定する必要がある
      . '<input type="hidden" name="id" value="' . h($result['id']) . '">'
      . '<button type = "submit" class="delete">削除</button>'
      . '</form>'
      . '</td></tr>';
  }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./css/style.css" type="text/css">
  <title>保存データの管理ページ</title>
</head>

<body>
  <div class="wrap">
    <div class="header">
      <h1>データベース</h1>
    </div>
    <h2>削除したいものを選んでね</h2>
    <div class="data-container">
      <?php if (empty($view)): ?>
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
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <?= $view ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>
  </div>

</body>

</html>