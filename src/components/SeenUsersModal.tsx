/**
 * SeenUsersModal.tsx — 閲覧者一覧モーダルコンポーネント
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { SeenUserInfo } from '../growiApi';

interface Props {
  users: SeenUserInfo[];
  loading: boolean;
  error: string | null;
  revisionId: string | null;
  onClose: () => void;
}

export function SeenUsersModal({ users, loading, error, revisionId, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!revisionId) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(revisionId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // HTTP環境など非セキュアコンテキストのフォールバック
      const ta = document.createElement('textarea');
      ta.value = revisionId;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [revisionId]);
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
            <h5 className="modal-title d-flex align-items-center gap-2">
              閲覧者一覧
              {revisionId && (
                <span
                  style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}
                >
                  Rev: {revisionId.slice(-8)}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary ms-1 py-0 px-1"
                    style={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                    onClick={handleCopy}
                    title="Revision IDをコピー"
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                </span>
              )}
            </h5>
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
