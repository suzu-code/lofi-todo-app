# Lofitodoアプリ

Firebaseを使用したシンプルなtodoアプリケーションです。


https://github.com/user-attachments/assets/abbad84a-fe2a-4c18-8f68-2aa0e72d4cad


## 機能
- Firebase Authenticationによるサインイン・サインアウト
- Firestoreを使用したtodoデータのリアルタイム保存（追加・更新・削除）
- 完了/未完了の状態フィルター機能
- lofiな背景動画と時計表示
- (lofi音楽を再生できる機能とポモドーロタイマーを実装予定)

## 使用技術
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Auth, Firestore)
- **Tooling**: Webpack (Build), dotenv-webpack (Env management)

## セットアップ手順

1. リポジトリをクローンまたはダウンロード
2. `npm install` で依存関係をインストール
3. ルートディレクトリに `.env` ファイルを作成し、自身のFirebase設定を記述
   ```text
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
