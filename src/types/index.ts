// Database entity types

export interface Room {
  id: string
  code: string
  created_by_user_id: string
  current_round: number // Current round number, starting from 1
  created_at: string
  updated_at: string
}

export interface Profile {
  user_id: string
  name: string
  avatar_emoji: string
  current_room_id: string | null
  joined_room_at: string | null
  created_at: string
}

// Alias for backward compatibility during migration
export type Player = Profile

export interface Transaction {
  id: string
  room_id: string
  from_user_id: string
  to_user_id: string
  amount: number // in cents
  round_num: number // Round number, starting from 1
  created_at: string
}

// Computed types

export interface PlayerBalance {
  userId: string
  userName: string
  balance: number // positive = winning, negative = losing
}

export interface SettlementTransfer {
  from: { id: string; name: string }
  to: { id: string; name: string }
  amount: number // in cents
}

export interface RoomHistory {
  id: string
  code: string
  playerName?: string
  lastVisited: string
}

// Player result in settlement history (snapshot with user_id for identification)
export interface PlayerResult {
  user_id: string
  name: string
  emoji: string
  balance: number // positive = winning, negative = losing
}

// Settlement history record
export interface SettlementHistory {
  id: string
  user_id: string
  room_id: string
  room_code: string
  settled_at: string
  player_results: PlayerResult[]
}

// 随机昵称列表（麻将/扑克风格）
export const RANDOM_NICKNAMES = [
  // 麻将术语
  '杠上花', '清一色', '大三元', '小四喜', '十三幺',
  '七对子', '碰碰胡', '混一色', '断幺九', '平胡王',
  '自摸王', '海底捞', '杠开花', '门清狂', '胡到底',
  // 扑克术语
  '同花顺', '四条王', '葫芦娃', '三带一', '顺子哥',
  '炸弹手', '王炸来', '地主婆', '农民工', '斗地主',
  // 动物
  '发财猫', '旺财狗', '招财兔', '福气鼠', '吉祥龙',
  '如意蛇', '奔腾马', '温顺羊', '机灵猴', '报晓鸡',
  '忠诚狗', '富贵猪', '锦鲤王', '麒麟儿', '凤凰女',
  // 食物
  '小笼包', '生煎侠', '馄饨仔', '饺子哥', '面条王',
  '烧麦君', '春卷侠', '锅贴哥', '汤圆妹', '粽子弟',
  '月饼叔', '豆腐脑', '油条哥', '豆浆妹', '煎饼侠',
  // 吉祥词
  '大富贵', '财神到', '招财猫', '金元宝', '聚宝盆',
  '摇钱树', '如意郎', '福满堂', '吉星高', '鸿运来',
  '好运旺', '发发发', '红包雨', '金满贯', '银满屋',
  // 性格
  '老实人', '倒霉蛋', '幸运星', '常胜将', '翻盘王',
  '咸鱼翻', '躺赢侠', '稳如狗', '浪如风', '铁头娃',
  '送财童', '抢红包', '吃鸡王', '摸鱼侠', '划水王',
  // 数字谐音
  '一路发', '二百五', '三阳开', '四季财', '五福临',
  '六六顺', '七星照', '八方来', '九九归', '十全美',
  // 趣味
  '小确幸', '大锦鲤', '欧皇附', '非酋命', '脸黑哥',
  '手气王', '气氛组', '捧场王', '抬杠精', '和事佬',
  '老油条', '小萌新', '大佬请', '菜鸟飞', '高手在',
  // 时间
  '早起鸟', '夜猫子', '午休党', '周末狂', '假日嗨',
  // 更多趣味
  '不服来', '再来一', '输不起', '赢到飞', '稳住别浪',
  '浪起来', '冲冲冲', '莽就完', '苟住了', '猥琐发育',
  '别送了', '稳稳稳', '冷静点', '别慌张', '我来了',
  '等等我', '带带我', '抱大腿', '躺平了', '起飞咯',
  // 职业
  '包租公', '包租婆', '打工人', '摸鱼王', '加班狗',
  '躺平族', '卷王来', '佛系人', '社恐怪', '话痨精',
  // 网络热词
  '奥利给', '芜湖起', '绝绝子', '无语子', 'yyds',
  '针不戳', '蚌埠住', '笑死了', '麻了麻', '裂开了',
  // 方言
  '巴适得', '安逸哦', '得劲儿', '贼拉香', '老铁稳',
  '杠杠的', '倍儿爽', '忒好了', '可带劲', '真中啊',
  // 美食续
  '火锅控', '烧烤迷', '奶茶命', '咖啡瘾', '可乐肥',
  '薯片脆', '辣条魂', '泡面王', '外卖狂', '深夜食',
  // 游戏
  '三缺一', '凑一桌', '开黑吗', '来一局', '再来啊',
  '打牌吗', '斗地主', '搓麻将', '掼蛋王', '升级狂',
  // 性格续
  '乐天派', '悲观狗', '纠结怪', '选择困', '决策快',
  '优柔寡', '当机立', '拖延症', '行动派', '思考者',
  // 祝福
  '步步高', '节节升', '年年好', '岁岁安', '天天乐',
  '事事顺', '心想事', '万事兴', '吉祥如', '福禄寿',
]

export function getRandomNickname(): string {
  return RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)]
}

export function getRandomEmoji(): string {
  // 使用 EmojiPicker 中的 emoji 列表
  const EMOJI_LIST = [
    '😀', '😎', '🤓', '😊', '🥳', '😇', '🤩', '😋',
    '🐶', '🐱', '🐼', '🐨', '🦊', '🦁', '🐯', '🐰',
    '🍀', '🌸', '🌺', '🌻', '🍎', '🍊', '🍋', '🍇',
    '⭐', '🌙', '☀️', '🔥', '💎', '🎮', '🎲', '🃏',
  ]
  return EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)]
}

export const DEFAULT_EMOJI = '😀'
