/**
 * sidebarMount.tsx — React コンポーネントをサイドバーにマウントするユーティリティ
 *
 * GROWI のサイドバーボタン群（data-testid="pageListButton" など）が含まれる
 * 親要素を見つけて、そこに SeenUsersButton を追加する。
 */

import { createRoot, type Root } from 'react-dom/client';
import { SeenUsersButton } from './components/SeenUsersButton';

const MOUNT_ID = 'growi-plugin-all-seen-users-mount';

let root: Root | null = null;

function getContainer(): HTMLElement | null {
  const anchor =
    document.querySelector('[data-testid="pageListButton"]') ??
    document.querySelector('[data-testid="page-comment-button"]');
  return (anchor?.parentElement as HTMLElement) ?? null;
}

function getCssModuleClass(): string {
  const btn = document.querySelector<HTMLButtonElement>(
    '[data-testid="pageListButton"] button, [data-testid="page-comment-button"] button',
  );
  return (
    Array.from(btn?.classList ?? []).find(cls =>
      cls.startsWith('PageAccessoriesControl_btn-page-accessories__'),
    ) ?? ''
  );
}

function ensureRoot(container: HTMLElement): Root {
  const existing = document.getElementById(MOUNT_ID);
  if (existing && document.body.contains(existing) && root) {
    return root;
  }
  root?.unmount();
  const el = document.createElement('div');
  el.id = MOUNT_ID;
  container.appendChild(el);
  root = createRoot(el);
  return root;
}

export function mountOrUpdate(pageId: string): void {
  const container = getContainer();
  if (!container) return;
  ensureRoot(container).render(
    <SeenUsersButton pageId={pageId} cssClass={getCssModuleClass()} />,
  );
}

export function unmount(): void {
  root?.unmount();
  root = null;
  document.getElementById(MOUNT_ID)?.remove();
}
