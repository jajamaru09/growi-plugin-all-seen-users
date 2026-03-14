# Growiプラグイン開発仕様

## 概要

GrowiはオープンソースのWikiツールで、プラグインアーキテクチャを通じて機能拡張が可能です。プラグインはReactコンポーネントとして実装され、Growiのクライアントサイドアプリケーションに統合されます。

## プラグインアーキテクチャ

### 基本構造

```
growi-plugin-name/
├── package.json          # プラグインメタデータと依存関係
├── client-entry.tsx      # メインエントリーポイント
├── vite.config.ts       # ビルド設定
├── tsconfig.json        # TypeScript設定
└── src/
    ├── components/      # Reactコンポーネント
    ├── growiApi.ts     # API通信ユーティリティ
    ├── growiNavigation.ts # ページ遷移ハンドリング
    ├── pageContext.ts   # ページコンテキスト管理
    └── sidebarMount.tsx # UIマウント処理
```

### package.json設定

```json
{
  "name": "growi-plugin-name",
  "growiPlugin": {
    "schemaVersion": "4",
    "types": ["script"]
  },
  "devDependencies": {
    "@growi/pluginkit": "^1.1.0"
  }
}
```

## プラグインライフサイクル

### エントリーポイントパターン

```typescript
// client-entry.tsx
declare global {
    interface Window {
        pluginActivators?: Record<string, { activate(): void; deactivate(): void }>;
    }
}

const PLUGIN_NAME = 'growi-plugin-name';

function activate(): void {
    // プラグイン初期化処理
    navigationListener.start();
    handleInitialPageLoad();
}

function deactivate(): void {
    // プラグインクリーンアップ処理
    navigationListener.stop();
    unmountAllComponents();
    resetPluginState();
}

// Growiへの登録
if (window.pluginActivators == null) {
    window.pluginActivators = {};
}
window.pluginActivators[PLUGIN_NAME] = { activate, deactivate };
```

### ページ変更ハンドリング

```typescript
function handlePageChange(ctx: GrowiPageContext): void {
    if (ctx.mode === 'edit') {
        unmount(); // 編集モードでは非表示
        return;
    }
    mountOrUpdate(ctx.pageId); // 表示モードでプラグイン表示
}
```

## ページコンテキスト

```typescript
export interface GrowiPageContext {
    pageId: string;    // "/6995d3fcf17c96c558f6b0ab"
    mode: PageMode;    // "view" | "edit"
    revisionId?: string; // 履歴リビジョン用
}
```

## ページナビゲーション検知

```typescript
function createPageChangeListener(callback: PageChangeCallback) {
    const nav = (window as any).navigation;
    if (!nav) return; // 未サポートブラウザ対応
    
    const onNavigate = (event: any) => {
        try {
            const result = callback({ pageId, mode, revisionId });
            if (result instanceof Promise) {
                result.catch((e) => console.error('[plugin] callback error', e));
            }
        } catch (e) {
            console.error('[plugin] callback error', e);
        }
    };
    
    nav.addEventListener('navigate', onNavigate);
    
    return {
        start: () => nav.addEventListener('navigate', onNavigate),
        stop: () => nav.removeEventListener('navigate', onNavigate)
    };
}
```

## UI統合

### サイドバーマウント

```typescript
function getContainer(): HTMLElement | null {
    const anchor = 
        document.querySelector('[data-testid="pageListButton"]') ??
        document.querySelector('[data-testid="page-comment-button"]');
    return anchor?.parentElement as HTMLElement ?? null;
}

function mountOrUpdate(pageId: string): void {
    const container = getContainer();
    if (!container) return;
    
    // React 18のcreateRoot API使用
    ensureRoot(container).render(<PluginComponent pageId={pageId} />);
}
```

### CSSクラス取得

```typescript
function getCssModuleClass(): string {
    const btn = document.querySelector('[data-testid="pageListButton"] button');
    return Array.from(btn?.classList ?? [])
        .find(cls => cls.startsWith('PageAccessoriesControl_btn-page-accessories__')) ?? '';
}
```

## Growi API統合

### 基本APIパターン

```typescript
// ページデータ取得
const pageRes = await fetch(`/_api/v3/page?pageId=${pageId}`);
const pageData = await pageRes.json();
const seenUsers = pageData.page?.seenUsers ?? [];

// ユーザーデータ取得
const usersRes = await fetch(`/_api/v3/users/list?userIds=${userIds.join(',')}`);
const usersData = await usersRes.json();

// パス基準ページID解決
async function fetchPageIdByPath(path: string): Promise<string> {
    const res = await fetch(`/_api/v3/page/?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    return data.page._id;
}
```

## Reactコンポーネントパターン

### モーダルコンポーネント

```typescript
// ポータル使用
return createPortal(
    <div className="modal d-block" onClick={onClose}>
        <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            {/* モーダルコンテンツ */}
        </div>
    </div>,
    document.body
);

// キーボードイベント処理
useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
        if (e.key === 'Escape') onClose(); 
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
}, [onClose]);
```

### 状態管理

```typescript
// React hooks使用
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// 非同期処理での適切なエラーハンドリング
const handleAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const result = await someAsyncOperation();
        // 成功処理
    } catch (err) {
        setError('操作に失敗しました');
    } finally {
        setLoading(false);
    }
}, [dependencies]);
```

## ビルド設定

### Vite設定

```typescript
export default defineConfig({
    plugins: [react()],
    build: {
        manifest: true, // Growiがビルドファイルを見つけるために必要
        rollupOptions: {
            input: ['client-entry.tsx'],
            preserveEntrySignatures: 'strict' // ライフサイクル関数のツリーシェイキング防止
        }
    }
});
```

### TypeScript設定

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "strict": true,
        "noEmit": true // Viteがコンパイル処理
    }
}
```

## ベストプラクティス

### 1. モジュラー構造
- 関心の分離（API、ナビゲーション、マウント、コンポーネント）
- TypeScript インターフェース使用による型安全性
- ビジネスロジックとUIコンポーネントの明確な分離

### 2. エラーハンドリング
- try/catchとPromise拒否処理による堅牢なエラーハンドリング
- ユーザーフレンドリーなエラーメッセージ
- 開発者向けコンソールログ

### 3. パフォーマンス
- React.memoやuseMemoによる最適化
- 適切なuseEffectの依存関係管理
- イベントリスナーのクリーンアップ

### 4. アクセシビリティ
- 適切なARIA属性
- キーボードナビゲーション対応
- セマンティックHTML使用

### 5. セキュリティ
- XSS防止のためのデータサニタイゼーション
- CSRFトークン使用（必要に応じて）
- 適切な権限チェック

## デバッグとテスト

### 開発環境
```bash
npm run dev          # 開発サーバー起動
npm run build:watch  # ビルド監視
npm run build        # 本番ビルド
```

### トラブルシューティング
- ブラウザ開発者ツールでのコンソールエラー確認
- Navigation APIサポート確認
- DOMクエリセレクタの検証
- React DevToolsでのコンポーネント状態確認

## 参考プロジェクト

- [growi-plugin-backlink](https://github.com/jajamaru09/growi-plugin-backlink) - ボタン追加、ページ遷移検出、モーダル表示の実装例