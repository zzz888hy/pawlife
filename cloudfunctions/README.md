# PawLife 云开发后端

微信云开发（CloudBase）后端：云函数 + 云数据库 + 云存储。

## 目录结构

```
cloudfunctions/
  login/       # 登录（拿 openid，建/查用户）
  user/        # 用户信息（getProfile/updateProfile/addCoins/setVip）
  pet/         # 宠物 CRUD + 成长记录（addRecord/listRecords/timeline/updateRecord/removeRecord）
  feed/        # 动态广场（list/create/update/remove/listMine/listByUser/like/comment/listComments）
  task/        # 每日任务（list/complete）
  product/     # 商品（list/categories/create）
  order/       # 购物车/订单（cartAdd/cartList/cartRemove/cartClear/create/list/updateStatus）
  ai/          # AI 宠物助手（chat 关键词问答）
  friend/      # 好友（discover/sendRequest/listRequests/acceptRequest/rejectRequest/listMessages/sendMessage 自动回复）
  message/     # 消息通知（list/markRead/markAllRead，首次进入种演示通知）
  identity/    # 宠物身份认证（list/apply）
  memorial/    # 星光纪念馆（list）
  rank/        # 星光宠榜（从 feed 实时聚合摸摸数）
  db-init/     # 一键初始化种子数据（分类/商品/宠友/纪念/动态）
```

## 云函数约定

- 每个云函数用 `wx-server-sdk`，`cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`。
- 入参统一走 `event.action` + `event.data`；返回统一 `{ code: 0, data }` 成功 / `{ code: 非0, message }` 失败。
- 前端通过 `callCloudFunction(name, data)` 调用，`code === 0` 时取 `data`。
- 用户身份一律用 `cloud.getWXContext().OPENID`，前端不传 openid。

## 数据库集合（共 18 个）

> 在「云开发控制台 → 数据库」手动创建，权限设为「仅创建者可读写」。
> `db-init` 云函数会填充 `categories` / `products` / `friends` / `memorials` 的种子数据，在 `feed` 为空时写入一批种子动态（供广场与榜单展示），并写入「昨天」的 `rank_snapshots` 基线（让榜单趋势立即可见）。

| 集合 | 关键字段 | 说明 |
|---|---|---|
| users | openid, nickname, avatarUrl, coins, isVip, petCount, recordCount | 用户 |
| pets | openid, name, type, breed, avatar, birthday, gender, personality, hobbies, photos | 宠物 |
| pets_records | openid, petId, type, content, images | 成长记录 |
| feed | openid, pet, petName, breed, txt, tags, images, category, likeOpenids, commentCount, visibility | 动态（visibility: public/friends/private，默认 public） |
| comments | openid, feedId, content, userName, avatar | 评论 |
| tasks | openid, taskId, completed, date | 任务完成记录 |
| categories | name, emoji, sort | 商品分类 |
| products | name, emoji, price, oldPrice, category, soldCount, rating, status, tags, bg | 商品 |
| cart | openid, productId, quantity | 购物车 |
| orders | openid, orderNo, items, totalPrice, status | 订单 |
| friends | nickname, avatar, petName, petEmoji, breed, distance, signature, online, tags | 附近宠友（发现） |
| friendships | openid, friendId | 好友关系（首次进入自动种小鹿/阿橙） |
| friendRequests | openid, direction, friendId, nickname/avatar/…（内联对方信息）, message, status | 好友申请（收到/发出） |
| directMessages | openid, friendId, role, text | 私聊消息（对方自动回复） |
| messages | openid, type, avatar, title, content, read, url, tab | 消息通知（首次进入种演示通知） |
| identities | openid, petId, chipNo, vaccineNo, pedigree, status | 身份认证 |
| memorials | emoji, name, dateRange, message | 纪念馆 |
| rank_snapshots | petName, likes, date | 榜单每日快照（趋势对比用） |

> 注：排行榜不再单独存 `rankings` 集合，`rank` 云函数直接从 `feed` 聚合每个宠物的「摸摸」数实时排名，并把每日数据写入 `rank_snapshots` 用于计算上升/下降趋势。

## 部署步骤

1. 微信开发者工具打开本项目（根目录 `pawlife-taro`）。
2. 工具栏「云开发」→ 已开通 → 记下**环境 ID**（已填在 `src/services/cloud.ts`）。
3. 对**每个云函数目录**，右键 →「上传并部署：云端安装依赖」。
   （本次新增/改动：`feed`、`task`、`product`、`order`、`ai`、`friend`、`message`、`identity`、`memorial`、`rank`、`db-init`）
4. 在「云开发控制台 → 数据库」按上表创建 18 个集合（权限「仅创建者可读写」）。
5. 运行一次 `db-init` 云函数（开发者工具右键 → 云端测试，或控制台「云函数 → 测试」），填充种子数据。
6. 前端 `src/services/mock/index.ts` 的 `MOCK_ENABLED` 保持 `false`。

## 本地权限校验注意

- 云函数里不要信任前端传的 `openid` / `userId`，一律用 `cloud.getWXContext().OPENID`。
- 集合权限用「仅创建者可读写」，敏感操作走云函数（云函数有管理员权限）。
