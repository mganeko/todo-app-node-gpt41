# 目的

ToDoのWebアプリを作ってください。

## 仕様

- タスクを追加できる
    - テキストを入力して[Enter]キーを押すと、そのまま追加できる
- タスクにチェックを付けると、完了になる（削除はしない）
- タスクを削除できる
- 完了済みのタスクを、まとめて削除できる

## サーバー

- サーバーは、node.jsで動く
- サーバーは静的なファイルとして、html、クライアント用のJavaScript、CSSを返す
- サーバーはREST型のWebAPIを提供する。新規作成はPOST、更新にPUT、削除にDELETE、そして一覧取得と単一アイテム取得のGETのインターフェイスを持つ
- サーバーでのデータ保存にsqlite3を利用する。DBファイルとして todo.db ファイルを使う

## クライアント

- クライアントは静的なhtmlファイルとJavaScriptファイル、CSSファイルから成り立つ
- クライアントはサーバーの提供するREST APIを利用する
- クライアントはTodoの一覧の取得、新規作成、更新、削除を行う

## その他

- .gitignoreを作って、node_modulesとデータベースファイルを対象外にして
- このアプリを説明するREADME.mdを作って
    - 日本語と英語の両方で説明して
    - GPT4.1で生成していることを追記して


---

## サーバーのテスト

- サーバーのRESTをHTTP経由でテストしたい。適切なテストコードを作って
- 完了済みのタスクを一括削除する機能をテストしい
    - 2つのタスクを追加
    - タスクの数を取得して覚える
    - 2つのタスクを完了に
    - 完了済みタスクを一括削除
    - タスクの数を取得
    - 最初に覚えたタスクの数から2つ減っていることを確認
- テスト時には、ファイルのDBではなく、メモリ上の一時的なDBを利用して

--

## リファクタリング

(ブランチ: try_refactor)

- サーバーをリファクタリングしたい。ネットワーク通信と、DB処理を別の関数にしたい
- server.jsでREST処理の中でデータベースを操作しているが、それを別のファイルに分けたい
- DB関連のテストも別に用意して
- DB関連のテストでは、ファイルではなくメモリー上の一時的なDBを利用して



