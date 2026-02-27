/**
 * client-entry.tsx — growi-plugin-all-seen-users エントリーポイント
 *
 * GROWIはビルド後のこのファイルをブラウザでロードする。
 * window.pluginActivators に { activate, deactivate } を登録することで
 * GROWIがプラグインとして認識し、適切なタイミングで呼び出す。
 */

import { createPageChangeListener } from './src/growiNavigation';
import { mountOrUpdate, unmount } from './src/sidebarMount';
import type { GrowiPageContext } from './src/pageContext';

// ─── グローバル型宣言 ──────────────────────────────────────────────
declare global {
    interface Window {
        pluginActivators?: Record<string, { activate(): void; deactivate(): void }>;
    }
}

// package.json の name フィールドと一致させる
const PLUGIN_NAME = 'growi-plugin-all-seen-users';

// ─── ページ遷移ハンドラ ───────────────────────────────────────────
/**
 * ページが切り替わるたびに呼ばれるコールバック。
 * 閲覧モードではサイドバーにボタンをマウント、編集モードでは非表示にする。
 */
function handlePageChange(ctx: GrowiPageContext): void {
    if (ctx.mode === 'edit') {
        unmount();
        return;
    }
    mountOrUpdate(ctx.pageId);
}

// ─── リスナーの生成 ───────────────────────────────────────────────
const { start, stop } = createPageChangeListener(handlePageChange);

// ─── プラグインライフサイクル ─────────────────────────────────────
function activate(): void {
    start();
}

function deactivate(): void {
    stop();
    unmount();
}

// ─── GROWI への自己登録 ───────────────────────────────────────────
if (window.pluginActivators == null) {
    window.pluginActivators = {};
}
window.pluginActivators[PLUGIN_NAME] = { activate, deactivate };
