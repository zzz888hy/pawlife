import type { PetFriend, FriendRequest, DirectMessage } from '@/types';

export const mockPetFriends: PetFriend[] = [
  { id: 'f-1', nickname: '小鹿', avatar: '🦌', petName: '豆豆', petEmoji: '🐕', breed: '柯基', distance: '500m', signature: '和豆豆一起散步的第800天', online: true, isFriend: true, tags: ['柯基', '户外'] },
  { id: 'f-2', nickname: '阿橙', avatar: '🍊', petName: '团子', petEmoji: '🐱', breed: '英短', distance: '800m', signature: '喵星人铲屎官，欢迎来撸', online: true, isFriend: true, tags: ['英短', '宅家'] },
  { id: 'f-3', nickname: '晚风', avatar: '🌙', petName: '雪球', petEmoji: '🐰', breed: '垂耳兔', distance: '1.2km', signature: '兔兔也可以交朋友哦', online: false, isFriend: false, tags: ['兔兔', '安静'] },
  { id: 'f-4', nickname: '糯米', avatar: '🍡', petName: '布丁', petEmoji: '🐕', breed: '泰迪', distance: '1.5km', signature: '泰迪精力旺盛，求遛', online: true, isFriend: false, tags: ['泰迪', '遛狗'] },
  { id: 'f-5', nickname: '大白', avatar: '🐻', petName: '可乐', petEmoji: '🐕', breed: '金毛', distance: '2km', signature: '金毛暖男本男', online: true, isFriend: false, tags: ['金毛', '暖男'] },
  { id: 'f-6', nickname: '糖糖', avatar: '🍬', petName: '奶昔', petEmoji: '🐱', breed: '布偶', distance: '2.3km', signature: '布偶奶昔的日常', online: false, isFriend: false, tags: ['布偶', '拍照'] },
  { id: 'f-7', nickname: '柚子', avatar: '🍋', petName: '球球', petEmoji: '🐕', breed: '柴犬', distance: '3km', signature: '柴犬的倔强你不懂', online: true, isFriend: false, tags: ['柴犬', '搞笑'] },
  { id: 'f-8', nickname: '小满', avatar: '🌿', petName: '汤圆', petEmoji: '🐱', breed: '橘猫', distance: '3.5km', signature: '橘猫减肥中，监督我', online: false, isFriend: false, tags: ['橘猫', '减肥'] },
];

export const mockFriendRequests: FriendRequest[] = [
  {
    id: 'r-1',
    friend: { id: 'f-9', nickname: '草莓', avatar: '🍓', petName: '毛球', petEmoji: '🐱', breed: '美短', distance: '900m', signature: '美短小粘人精', online: true, isFriend: false, tags: ['美短', '粘人'] },
    message: '你好呀，我家毛球想和豆豆做朋友～',
    time: '10分钟前',
    status: 'pending',
  },
  {
    id: 'r-2',
    friend: { id: 'f-10', nickname: '阿树', avatar: '🌲', petName: '蛋挞', petEmoji: '🐕', breed: '边牧', distance: '1.8km', signature: '边牧的智商碾压我', online: false, isFriend: false, tags: ['边牧', '聪明'] },
    message: '看到你家柯基好可爱！',
    time: '1小时前',
    status: 'pending',
  },
];

const NOW = Date.now();
const MIN = 60000;

export const mockChatHistory: Record<string, DirectMessage[]> = {
  'f-1': [
    { id: 'm-1', role: 'friend', text: '豆豆今天在家干嘛呀？', timestamp: NOW - 45 * MIN },
    { id: 'm-2', role: 'me', text: '刚睡醒，正在沙发上发呆😂', timestamp: NOW - 42 * MIN },
    { id: 'm-3', role: 'friend', text: '哈哈好羡慕，我家豆豆刚拆完家', timestamp: NOW - 40 * MIN },
    { id: 'm-4', role: 'me', text: '周末要不要一起去公园遛狗？', timestamp: NOW - 35 * MIN },
    { id: 'm-5', role: 'friend', text: '好呀！周六下午怎么样？', timestamp: NOW - 30 * MIN },
  ],
  'f-2': [
    { id: 'm-1', role: 'friend', text: '团子今天吐毛球了，正常吗？', timestamp: NOW - 120 * MIN },
    { id: 'm-2', role: 'me', text: '偶尔吐毛球正常的，可以喂点化毛膏', timestamp: NOW - 115 * MIN },
    { id: 'm-3', role: 'friend', text: '好嘞，谢谢！', timestamp: NOW - 110 * MIN },
  ],
};

export function getMockFriendReply(text: string): string {
  if (/遛|散步|出门|公园/.test(text)) return '好呀，周末一起去公园遛狗呀～';
  if (/吃|零食|狗粮|猫粮|化毛/.test(text)) return '我家宝最近在吃这个，效果不错，安利给你！';
  if (/生病|医院|打针|疫苗/.test(text)) return '别担心，带它去正规医院看看，很快会好的。';
  if (/照片|可爱|好看|萌/.test(text)) return '嘿嘿，你家宝也超可爱呀！';
  if (/你好|hi|在吗|哈喽/.test(text)) return '在的在的，怎么啦～';
  if (/睡|发呆|懒/.test(text)) return '哈哈哈我家这位也是整天睡觉';
  return '哈哈哈对呀，养宠物的快乐就是这样～';
}
