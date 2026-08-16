/**
 * 排行榜服务层
 */
import { MOCK_ENABLED } from './mock';
import { mockRankEntries, RankEntry } from './mock/rank.mock';
import { callCloudFunction } from './cloud';

interface RawRank {
  _id: string;
  rank: number;
  pet: string;
  petName: string;
  breed: string;
  owner: string;
  likes: number;
  trend: RankEntry['trend'];
  bg: string;
}

export async function fetchRank(): Promise<RankEntry[]> {
  if (MOCK_ENABLED) return [...mockRankEntries];
  const list = await callCloudFunction<RawRank[]>('rank', { action: 'list', data: {} });
  return (list || []).map((r) => ({
    id: r._id,
    rank: r.rank,
    pet: r.pet,
    petName: r.petName,
    breed: r.breed,
    owner: r.owner,
    likes: r.likes,
    trend: r.trend,
    bg: r.bg,
  }));
}
