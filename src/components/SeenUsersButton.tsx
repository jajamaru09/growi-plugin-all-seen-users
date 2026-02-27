/**
 * SeenUsersButton.tsx — 閲覧者一覧を開くボタンコンポーネント
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchSeenUsers, type SeenUserInfo } from '../growiApi';
import { SeenUsersModal } from './SeenUsersModal';

interface Props {
  pageId: string;
  /** 隣接ボタンから取得した CSS Modules クラス名（省略可） */
  cssClass?: string;
}

export function SeenUsersButton({ pageId, cssClass }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<SeenUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ページが変わったらモーダルを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pageId]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSeenUsers(pageId);
      setUsers(result);
    } catch {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  return (
    <>
      <div className="d-flex">
        <button
          type="button"
          className={`btn btn-outline-neutral-secondary ${cssClass ?? ''} rounded-pill py-1 px-lg-3`}
          onClick={handleOpen}
        >
          <span className="grw-icon d-flex me-lg-2">
            <span className="material-symbols-outlined">group</span>
          </span>
          <span className="grw-labels d-none d-lg-flex">閲覧者一覧</span>
        </button>
      </div>
      {isOpen && (
        <SeenUsersModal
          users={users}
          loading={loading}
          error={error}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
