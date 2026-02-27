# プロジェクト概要
- このプロジェクトでは、OSS WikiツールのGrowiのプラグインを開発します。
- このプラグインは閲覧中の記事の閲覧者の一覧をモーダルで表示するボタンを画面右のside barに追加します。
- Growiの画面遷移の検出にはpageContext.ts、growiNavagation.tsを使用します
- client-entry.tsxでhandlePageChangeが呼ばれたら、閲覧中のページのpageIdを用いて、APIで閲覧者の情報を取得します

# 参考にするプロジェクト
## ボタンの追加方法
- ページ遷移の検出とボタンの追加方法、モーダルの表示方法などはこちらのプロジェクト参考にしてください
- https://github.com/jajamaru09/growi-plugin-backlink

# 使用するAPI
- 閲覧中の記事のpageIdを使用してseenUsersを得る方法
    // ページデータ取得方法
    const pageRes = await fetch(`/_api/v3/page?pageId=${pageId}`);
    const pageData = await pageRes.json();
    const seenUsers = pageData.page.seenUsers || [];

    if (seenUsers.length === 0) {
        alert('閲覧者はいません');
        return;
    }
- 得られたseenUsersから、ユーザデータを取得する方法
    // ユーザーデータ取得
    const usersRes = await fetch(`/_api/v3/users/list?userIds=${seenUsers.join(',')}`);
    const usersData = await usersRes.json();
    const users = usersData.users || [];
    // ユーザー名リストを作成
    const userNames = seenUsers.map(id => {
        const user = users.find(u => u._id === id);
        return user ? (user.name || user.username || 'Unknown') : `Unknown(${id})`;
    });

# 技術要件
- なるべく無駄な処理は省いてシンプルを目指す
- ReactのベストプラクティスやGrowiのベストプラクティスに従う
- ファイル構造などもgrowi-plugin-backlinkを参考にしてシンプルかつ分かりやすい構造にする