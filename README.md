Gantt Sample - Power Apps Code App

説明:
- HTML/CSS/JSのみのサンプルCode Appです。
- 10件のデモタスクを生成します。
- ガントバーはドラッグして移動、左右のハンドルでリサイズできます。
- マウスオーバーでタスクの詳細をToolTipに表示します。

使い方:
1. フォルダを静的ホスト（ブラウザで開くか、Power AppsのCode componentとして使用）します。
2. `index.html` をブラウザで開くと動作を確認できます。

注意点:
- 現在はローカルでのみ動作確認済み。下記の手順で Power Apps の Code component (iframe ベース) として組み込めるように簡易メッセージングを追加しました。
- 日付計算は単純化されています。タイムゾーンの違いなどは考慮していません。

今後の改善:
- スナップ（1日単位）の強化
- モバイル向けのタッチ操作対応
- データの永続化（API経由で保存）

Power Apps への組み込み手順（簡易）:
1. このフォルダを静的ホスティング（Azure Static Web App / Blob Static Website / 任意のホスティング）にデプロイして、https 経由でアクセスできるようにします。
2. Power Apps の画面上で『埋め込み』または Code component から iframe を使ってこの `index.html` を読み込みます。
3. Code App は postMessage を介してホスト (Power Apps) と通信します。ホストから初期データを渡す例:

```js
// ホスト側（Power Apps のカスタム HTML など）から iframe.contentWindow に送信
iframe.contentWindow.postMessage({ type: 'init', props: { tasks: [ { id:1, title:'T1', owner:'Alice', start:'2025-09-01', end:'2025-09-03', percent:10 } ] } }, '*');
```

4. タスクがユーザー操作で変更されたときは、iframe 内からホストへメッセージを送るように拡張できます（現在は ready シグナルのみ送信しています）。

イベント: tasksChanged
- 説明: ユーザーがバーを移動またはリサイズして mouseup で変更を確定した際、iframe はホストへ tasksChanged メッセージを送ります。
- 受け取るデータ例:

```json
{ "type": "tasksChanged", "tasks": [ { "id":1, "title":"T1", "owner":"Alice", "start":"2025-09-01", "end":"2025-09-03", "percent":10 } ] }
```

必要であれば、Power Apps 用に正式な Code component（PCF）ラッパーを作り、入力プロパティ（tasks JSON）と出力イベント（onChange）を実装します。進めますか？
