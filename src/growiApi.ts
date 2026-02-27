/**
 * growiApi.ts — GROWI API 呼び出しユーティリティ
 *
 * 閲覧中ページの seenUsers を取得し、ユーザー情報と合わせて返す。
 */

export interface SeenUserInfo {
  id: string;
  name: string;
}

/**
 * pageId から閲覧者一覧を取得する。
 *
 * @param pageId - ページのURL（例: /6995d3fcf17c96c558f6b0ab）
 * @returns 閲覧者情報の配列。閲覧者がいない場合は空配列。
 */
export async function fetchSeenUsers(pageId: string): Promise<SeenUserInfo[]> {
  // 先頭のスラッシュを除去して ID のみ取り出す
  const id = pageId.replace(/^\//, '');

  const pageRes = await fetch(`/_api/v3/page?pageId=${id}`);
  const pageData = await pageRes.json();
  const seenUserIds: string[] = pageData.page?.seenUsers ?? [];

  if (seenUserIds.length === 0) return [];

  const usersRes = await fetch(`/_api/v3/users/list?userIds=${seenUserIds.join(',')}`);
  const usersData = await usersRes.json();
  const users: { _id: string; name?: string; username?: string }[] = usersData.users ?? [];

  return seenUserIds.map(uid => {
    const user = users.find(u => u._id === uid);
    return {
      id: uid,
      name: user ? (user.name ?? user.username ?? 'Unknown') : `Unknown(${uid})`,
    };
  });
}
