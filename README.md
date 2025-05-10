# ToDoアプリ (ToDo App)

## 概要 (Overview)
このアプリはNode.jsとSQLiteを使用したシンプルなToDo管理アプリです。フロントエンドはHTML/CSS/JavaScriptで構成されており、サーバーサイドはNode.jsで動作します。

This application is a simple ToDo management app using Node.js and SQLite. The frontend is built with HTML, CSS, and JavaScript, and the backend runs on Node.js.

## 主な機能 (Main Features)
- タスクの追加、表示、削除
- データはローカルのSQLiteデータベース(todo.db)に保存
- シンプルなWebインターフェース

- Add, view, and delete tasks
- Data is stored in a local SQLite database (todo.db)
- Simple web interface

## セットアップ方法 (Setup)

1. 必要なパッケージをインストール  
   Install required packages:
   ```
   npm install
   ```

2. アプリを起動  
   Start the app:
   ```
   node server.js
   ```

3. ブラウザでアクセス  
   Access in your browser:
   ```
   http://localhost:3000
   ```

## 依存関係 (Dependencies)
- Node.js
- SQLite3
- (その他 package.json 参照)

- Node.js
- SQLite3
- (See package.json for details)

## テスト (Test)
```
npm test
```

## ライセンス (License)
MIT License
