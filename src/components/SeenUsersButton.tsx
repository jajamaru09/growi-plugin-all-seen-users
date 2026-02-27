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
      <button
        type="button"
        className={`btn btn-outline-secondary btn-sm rounded-pill ${cssClass ?? ''}`}
        onClick={handleOpen}
        title="閲覧者一覧"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '1rem', verticalAlign: 'middle' }}
        >
          group
        </span>
      </button>
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
