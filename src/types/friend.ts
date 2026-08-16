export interface PetFriend {
  id: string;
  nickname: string;
  avatar: string; // emoji 头像
  petName: string;
  petEmoji: string;
  breed: string;
  distance: string;
  signature: string;
  online: boolean;
  isFriend: boolean;
  isRequested?: boolean;
  tags: string[];
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  friend: PetFriend;
  message: string;
  time: string;
  status: FriendRequestStatus;
}

export type DirectRole = 'me' | 'friend';

export interface DirectMessage {
  id: string;
  role: DirectRole;
  text: string;
  timestamp: number;
}
