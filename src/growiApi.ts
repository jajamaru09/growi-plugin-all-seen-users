/**
 * growiApi.ts — 閲覧者一覧の固有API
 *
 * 共通API（fetchPageIdByPath, fetchPageInfo, fetchUsers等）は extension-hub が提供する。
 * このファイルには本プラグイン固有のロジックのみ残す。
 */

export interface SeenUserInfo {
  id: string;
  name: string;
}

export interface SeenUsersResult {
  users: SeenUserInfo[];
  revisionId: string | null;
}

/**
 * pageId から閲覧者一覧を取得する。
 * hub.api.fetchPageInfo で seenUsers と revisionId を取得し、
 * hub.api.fetchUsers でユーザー詳細を取得する。
 */
export async function fetchSeenUsers(pageId: string): Promise<SeenUsersResult> {
  const hub = (window as any).growiPluginHub;
  const id = hub.api.sanitizePageId(pageId);

  hub.log('growi-plugin-all-seen-users', 'fetching seen users for:', id);

  const pageInfo = await hub.api.fetchPageInfo(id);
  const seenUserIds: string[] = pageInfo?.seenUsers ?? [];
  const revisionId: string | null = pageInfo?.revision?._id ?? null;

  if (seenUserIds.length === 0) {
    hub.log('growi-plugin-all-seen-users', 'no seen users');
    return { users: [], revisionId };
  }

  hub.log('growi-plugin-all-seen-users', 'seen user count:', seenUserIds.length);
  const users = await hub.api.fetchUsers(seenUserIds);

  return {
    users: seenUserIds.map(uid => {
      const user = users.find((u: any) => u._id === uid);
      return {
        id: uid,
        name: user ? (user.name ?? user.username ?? 'Unknown') : `Unknown(${uid})`,
      };
    }),
    revisionId,
  };
}
