/**
 * sidebarMount.tsx — React コンポーネントをサイドバーにマウントするユーティリティ
 *
 * GROWI のサイドバーボタン群（pageListButton など）が含まれる
 * flex コンテナを見つけて、そこに SeenUsersButton を追加する。
 */

import { createRoot, type Root } from 'react-dom/client';
import { SeenUsersButton } from './components/SeenUsersButton';

const MOUNT_ID = 'growi-plugin-all-seen-users-mount';

let root: Root | null = null;
let mountEl: HTMLElement | null = null;

/**
 * サイドバーのボタン群が格納された flex コンテナを返す。
 * 見つからなければ null。
 */
function getContainer(): HTMLElement | null {
  const btn = document.querySelector('[class*="pageListButton"], [class*="page-comment-button"]');
  if (!btn) return null;
  return (btn.closest('[style*="display: flex"], .d-flex') as HTMLElement) ?? null;
}

/**
 * 隣接ボタンの CSS Modules クラス名を取得する。
 * 同じスタイルを適用するために使用する。
 */
function getCssModuleClass(): string {
  const btn = document.querySelector('[class*="pageListButton"]');
  if (!btn) return '';
  const match = btn.className.match(/\S*pageListButton\S*/);
  return match ? match[0] : '';
}

/**
 * マウントポイントを取得または新規作成する。
 * サイドバーが再レンダリングで DOM から消えた場合も再生成する。
 */
function ensureMount(): { root: Root; el: HTMLElement } | null {
  // 既存のマウントポイントが DOM 上にあればそのまま使う
  if (root && mountEl && document.body.contains(mountEl)) {
    return { root, el: mountEl };
  }
  // 消えていた場合は再生成
  const container = getContainer();
  if (!container) return null;

  const el = document.createElement('div');
  el.id = MOUNT_ID;
  container.appendChild(el);
  mountEl = el;
  root = createRoot(el);
  return { root, el };
}

/**
 * SeenUsersButton をサイドバーにマウント（または更新）する。
 *
 * @param pageId - 現在閲覧中のページ ID（例: /6995d3fcf17c96c558f6b0ab）
 */
export function mountOrUpdate(pageId: string): void {
  const mount = ensureMount();
  if (!mount) return;
  const cssClass = getCssModuleClass();
  mount.root.render(<SeenUsersButton pageId={pageId} cssClass={cssClass} />);
}

/**
 * React ルートをアンマウントして DOM 要素を削除する。
 * 編集モード遷移時やプラグイン無効化時に呼ぶ。
 */
export function unmount(): void {
  root?.unmount();
  mountEl?.remove();
  root = null;
  mountEl = null;
}
