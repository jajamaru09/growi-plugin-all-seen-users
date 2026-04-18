import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchSeenUsers, type SeenUserInfo } from '../growiApi';
import { SeenUsersModal } from './SeenUsersModal';

interface Props {
  pageId: string;
  onClose: () => void;
}

export function SeenUsersAction({ pageId, onClose }: Props) {
  const [users, setUsers] = useState<SeenUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revisionId, setRevisionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let targetPageId = pageId;
        if (!pageId || pageId === '/') {
          const hub = (window as any).growiPluginHub;
          targetPageId = await hub.api.fetchPageIdByPath('/') ?? '';
        }
        const result = await fetchSeenUsers(targetPageId);
        if (!cancelled) {
          setUsers(result.users);
          setRevisionId(result.revisionId);
        }
      } catch {
        if (!cancelled) setError('データの取得に失敗しました');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [pageId]);

  return createPortal(
    <SeenUsersModal
      users={users}
      loading={loading}
      error={error}
      revisionId={revisionId}
      onClose={onClose}
    />,
    document.body,
  );
}
