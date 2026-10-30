---
name: pre-release-check
description: 機能の完成時や公開前に、lint・build・セキュリティ・UI品質をまとめて点検し、結果を docs/release-checks/ に記録する手順。ユーザーが /pre-release-check と入力したときだけ使う。
disable-model-invocation: true
---

# 公開前チェック

最重要: このスキルの中でも、CLAUDE.md の禁止事項（git の commit や push、パッケージの追加、設定ファイルの変更）を守る。問題を見つけても勝手に直さず、報告して指示を待つ。.env 系のファイルは読まない。

## 手順
1. npm run lint と npm run build を実行し、成否と、エラーや警告の要約を記録する。
2. docs/セキュリティ基礎ガイド.md の第5章（公開前チェックリスト）で、今回の変更を点検する。サーバーやデータベースがないなど、対象外の項目は「対象外（理由）」と書く。最低限、次を確認する。
   - 秘密の値がコードやログに含まれていないか
   - dangerouslySetInnerHTML、外部への通信、外部スクリプトを使っていないか
   - 入力値を検証しているか（文字数、空白、型、localStorage から読んだ値）
   - package.json の依存パッケージが増えていないか（git diff で確認する）
3. 変更した画面を、design-system スキルの「禁止パターン」と「機能面の最低ライン」で点検する。
4. docs/要件定義書.md の第6章の受け入れ基準のうち、今回の変更に関係するものを挙げ、ユーザーが手で確認する手順として並べる。
5. 結果を docs/release-checks/YYYY-MM-DD_機能名.md に「OK / 要修正 / 要確認 / 対象外」の4区分で書く。
6. 最後にユーザーへ、/security-review の実行を案内する（git 管理と GitHub のリモート設定が必要）。
