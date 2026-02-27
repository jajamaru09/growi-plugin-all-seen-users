/**
 * SeenUsersModal.tsx — 閲覧者一覧モーダルコンポーネント
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SeenUserInfo } from '../growiApi';

interface Props {
  users: SeenUserInfo[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function SeenUsersModal({ users, loading, error, onClose }: Props) {
  // Escape キーで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">閲覧者一覧</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="閉じる" />
          </div>
          <div className="modal-body">
            {loading && <p className="text-center text-muted">読み込み中...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && users.length === 0 && (
              <p className="text-muted">閲覧者はいません</p>
            )}
            {!loading && !error && users.length > 0 && (
              <ul className="list-group list-group-flush">
                {users.map(u => (
                  <li key={u.id} className="list-group-item">{u.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
