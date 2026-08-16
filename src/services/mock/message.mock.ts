import type { MessageItem } from '@/types';

export const mockMessages: MessageItem[] = [
  { id: 'n-1', type: 'like', avatar: '🦌', title: '小鹿 赞了你的动态', content: '「和豆豆的周末」', time: '刚刚', read: false, url: '/pages/hall/index', tab: true },
  { id: 'n-2', type: 'comment', avatar: '🍊', title: '阿橙 评论了你', content: '豆豆也太可爱了吧！', time: '5分钟前', read: false, url: '/pages/hall/index', tab: true },
  { id: 'n-3', type: 'chat', avatar: '🦌', title: '小鹿 发来消息', content: '周末一起去公园遛狗吧～', time: '20分钟前', read: false, url: '/pages/sub-pages/chat/index?id=f-1' },
  { id: 'n-4', type: 'friend-request', avatar: '🍓', title: '草莓 请求加你为好友', content: '你好呀，我家毛球想和豆豆做朋友～', time: '10分钟前', read: false, url: '/pages/friends/index', tab: true },
  { id: 'n-5', type: 'system', avatar: '🐾', title: 'PawLife 系统通知', content: '恭喜你完成今日全部任务，获得 20 金币', time: '1小时前', read: false },
  { id: 'n-6', type: 'like', avatar: '🌙', title: '晚风 赞了你的动态', content: '「兔兔的下午茶」', time: '2小时前', read: true, url: '/pages/hall/index', tab: true },
  { id: 'n-7', type: 'comment', avatar: '🍡', title: '糯米 评论了你', content: '这个姿势笑死我了哈哈哈', time: '3小时前', read: true, url: '/pages/hall/index', tab: true },
  { id: 'n-8', type: 'chat', avatar: '🍊', title: '阿橙 发来消息', content: '化毛膏买哪个牌子好？', time: '昨天', read: true, url: '/pages/sub-pages/chat/index?id=f-2' },
  { id: 'n-9', type: 'system', avatar: '🐾', title: 'PawLife 系统通知', content: '你的宠物身份认证已通过审核', time: '昨天', read: true },
  { id: 'n-10', type: 'friend-request', avatar: '🌲', title: '阿树 请求加你为好友', content: '看到你家柯基好可爱！', time: '1小时前', read: false, url: '/pages/friends/index', tab: true },
];
