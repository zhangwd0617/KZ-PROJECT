/**
 * 数据定义 —— 由原 CSV 文件转换而来
 * Abl, Talent, Palam, Exp, Item, Train, Mark, Source, Str
 */

// ========== ABL: 能力 (0-103) ==========
window.ABL_DEFS = {
    0: { name: "阴蒂感觉", category: "sensation" },
    1: { name: "胸部感觉", category: "sensation" },
    2: { name: "阴道感觉", category: "sensation" },
    3: { name: "肛门感觉", category: "sensation" },
    4: { name: "口腔感觉", category: "sensation" },
    10: { name: "顺从", category: "mental" },
    11: { name: "欲望", category: "mental" },
    12: { name: "技巧", category: "mental" },
    13: { name: "侍奉技术", category: "mental" },
    14: { name: "性交技术", category: "mental" },
    // REMOVED: 15 话术 (unused), 16 侍奉精神 (unused)
    17: { name: "露出癖", category: "mental" },
    20: { name: "抖Ｓ气质", category: "fetish" },
    21: { name: "抖Ｍ气质", category: "fetish" },
    // REMOVED: 22 百合气质 (unused), 23 搞基气质 (unused)
    30: { name: "性交成瘾", category: "addiction" },
    31: { name: "自慰成瘾", category: "addiction" },
    32: { name: "精液成瘾", category: "addiction" },
    // REMOVED: 33 百合成瘾 (unused), 34 卖春成瘾 (unused), 35 兽奸成瘾 (unused/broken)
    36: { name: "露出成瘾", category: "addiction" },
    37: { name: "同性成淫", category: "addiction" },
    // REMOVED: 101 运动能力 (unused), 102 战斗能力 (unused), 103 感受性 (unused)
    100: { name: "学习能力", category: "otherworld" }
};

// ========== TALENT: 素质 (0-999+) ==========
window.TALENT_DEFS = {
    // 基础状态
    0: { name: "处女", type: "bool" },
    1: { name: "童贞", type: "bool" },
    9: { name: "崩坏", type: "bool" },
    // 性格
    10: { name: "胆怯", type: "bool", group: "personality" },
    11: { name: "反抗心", type: "bool", group: "personality" },
    12: { name: "刚强", type: "bool", group: "personality" },
    13: { name: "坦率", type: "bool", group: "personality" },
    14: { name: "傲慢", type: "bool", group: "personality" },
    15: { name: "高姿态", type: "bool", group: "personality" },
    16: { name: "低姿态", type: "bool", group: "personality" },
    17: { name: "老实", type: "bool", group: "personality" },
    18: { name: "傲娇", type: "bool", group: "personality" },
    // 性向
    20: { name: "克制", type: "bool", group: "interest" },
    21: { name: "冷漠", type: "bool", group: "interest" },
    22: { name: "缺乏感情", type: "bool", group: "interest" },
    23: { name: "好奇心", type: "bool", group: "interest" },
    24: { name: "保守", type: "bool", group: "interest" },
    25: { name: "乐观", type: "bool", group: "interest" },
    26: { name: "悲观", type: "bool", group: "interest" },
    27: { name: "警戒心", type: "bool", group: "interest" },
    28: { name: "喜欢炫耀", type: "bool", group: "interest" },
    // 处女心
    30: { name: "看重贞操", type: "bool", group: "maiden" },
    31: { name: "看轻贞操", type: "bool", group: "maiden" },
    32: { name: "压抑", type: "bool", group: "maiden" },
    33: { name: "奔放", type: "bool", group: "maiden" },
    34: { name: "抵抗", type: "bool", group: "maiden" },
    35: { name: "害羞", type: "bool", group: "maiden" },
    36: { name: "不知羞耻", type: "bool", group: "maiden" },
    37: { name: "容易被要挟", type: "bool", group: "maiden" },
    // 体质
    40: { name: "害怕疼痛", type: "bool", group: "body" },
    41: { name: "耐痛", type: "bool", group: "body" },
    42: { name: "容易湿", type: "bool", group: "body" },
    43: { name: "不易湿", type: "bool", group: "body" },
    44: { name: "爱哭鬼", type: "bool", group: "body" },
    45: { name: "不易哭", type: "bool", group: "body" },
    46: { name: "药瘾", type: "bool", group: "body" },
    47: { name: "精液爱好", type: "bool", group: "body" },
    48: { name: "眼镜", type: "bool", group: "body" },
    // 技术
    50: { name: "学习快", type: "bool", group: "tech" },
    51: { name: "学习慢", type: "bool", group: "tech" },
    52: { name: "擅用舌头", type: "bool", group: "tech" },
    53: { name: "调合知识", type: "bool", group: "tech" },
    54: { name: "药物抗性", type: "bool", group: "tech" },
    55: { name: "容易尿床", type: "bool", group: "tech" },
    // 忠诚
    60: { name: "容易自慰", type: "bool", group: "devotion" },
    61: { name: "不怕污臭", type: "bool", group: "devotion" },
    62: { name: "反感污臭", type: "bool", group: "devotion" },
    63: { name: "献身", type: "bool", group: "devotion" },
    64: { name: "不怕脏", type: "bool", group: "devotion" },
    // 诱惑
    69: { name: "抵抗诱惑", type: "bool", group: "honesty" },
    70: { name: "接受快感", type: "bool", group: "honesty" },
    71: { name: "否定快感", type: "bool", group: "honesty" },
    72: { name: "容易上瘾", type: "bool", group: "honesty" },
    73: { name: "容易陷落", type: "bool", group: "honesty" },
    // 特殊淫荡素质
    74: { name: "自慰狂", type: "bool", group: "lewd" },
    75: { name: "性交狂", type: "bool", group: "lewd" },
    76: { name: "淫乱", type: "bool", group: "lewd" },
    77: { name: "尻穴狂", type: "bool", group: "lewd" },
    78: { name: "乳狂", type: "bool", group: "lewd" },
    // 性取向/魅力
    79: { name: "男人婆", type: "bool", group: "orientation" },
    80: { name: "变态", type: "bool", group: "orientation" },
    81: { name: "双性恋", type: "bool", group: "orientation" },
    82: { name: "讨厌男人", type: "bool", group: "orientation" },
    83: { name: "施虐狂", type: "bool", group: "orientation" },
    84: { name: "嫉妒", type: "bool", group: "orientation" },
    85: { name: "爱慕", type: "bool", group: "orientation" },
    86: { name: "盲信", type: "bool", group: "orientation" },
    182: { name: "挚爱", type: "bool", group: "orientation" },
    183: { name: "重塑", type: "bool", group: "special" },
    87: { name: "小恶魔", type: "bool", group: "orientation" },
    295: { name: "贵族", type: "bool", group: "special" },
    296: { name: "洗脑", type: "bool", group: "special" },
    88: { name: "被虐狂", type: "bool", group: "orientation" },
    89: { name: "露出狂", type: "bool", group: "orientation" },
    // 魅力
    91: { name: "魅惑", type: "bool", group: "charm" },
    92: { name: "谜之魅力", type: "bool", group: "charm" },
    93: { name: "压迫感", type: "bool", group: "charm" },
    // 主角专属
    94: { name: "灭世魔王", type: "bool", group: "special" },
    // 体型
    99: { name: "魁梧", type: "bool", group: "physique" },
    100: { name: "娇小", type: "bool", group: "physique" },
    109: { name: "贫乳", type: "bool", group: "breast" },
    110: { name: "巨乳", type: "bool", group: "breast" },
    114: { name: "爆乳", type: "bool", group: "breast" },
    116: { name: "绝壁", type: "bool", group: "breast" },
    121: { name: "扶她", type: "bool", group: "gender" },
    122: { name: "男性", type: "bool", group: "gender" },
    123: { name: "男型扶她", type: "bool", group: "gender" },
    // 母乳
    130: { name: "母乳体质", type: "bool", group: "special" },
    // 职业
    200: { name: "战士", type: "bool", group: "job" },
    201: { name: "魔法师", type: "bool", group: "job" },
    202: { name: "神官", type: "bool", group: "job" },
    203: { name: "盗贼", type: "bool", group: "job" },
    204: { name: "骑士", type: "bool", group: "job" },
    205: { name: "炼金术士", type: "bool", group: "job" },
    206: { name: "游侠", type: "bool", group: "job" },
    207: { name: "舞者", type: "bool", group: "job" },
    208: { name: "格斗家", type: "bool", group: "job" },
    209: { name: "巫女", type: "bool", group: "job" },
    210: { name: "枪兵", type: "bool", group: "job" },
    211: { name: "吟游诗人", type: "bool", group: "job" },
    212: { name: "暗杀者", type: "bool", group: "job" },
    213: { name: "医者", type: "bool", group: "job" },
    214: { name: "舞娘", type: "bool", group: "job" },
    // 战斗技能
    240: { name: "战术", type: "level", group: "combat_skill" },
    241: { name: "魔术", type: "level", group: "combat_skill" },
    242: { name: "法术", type: "level", group: "combat_skill" },
    243: { name: "召唤", type: "level", group: "combat_skill" },
    244: { name: "话术", type: "level", group: "combat_skill" },
    245: { name: "歌舞", type: "level", group: "combat_skill" },
    246: { name: "训狗", type: "level", group: "combat_skill" },
    247: { name: "洗脑", type: "level", group: "combat_skill" },
    248: { name: "医术", type: "level", group: "combat_skill" },
    249: { name: "铁壁", type: "level", group: "combat_skill" },
    250: { name: "怪物", type: "level", group: "combat_skill" },
    251: { name: "忍术", type: "level", group: "combat_skill" },
    // 元素能力已移除（无实际效果）
    // 外观
    300: { name: "发色", type: "value", group: "appearance" },
    301: { name: "发质", type: "value", group: "appearance" },
    302: { name: "发长", type: "value", group: "appearance" },
    303: { name: "发型", type: "value", group: "appearance" },
    304: { name: "有无刘海", type: "value", group: "appearance" },
    305: { name: "目", type: "value", group: "appearance" },
    306: { name: "瞳色", type: "value", group: "appearance" },
    307: { name: "唇", type: "value", group: "appearance" },
    308: { name: "体型", type: "value", group: "appearance" },
    309: { name: "乳头", type: "value", group: "appearance" },
    310: { name: "阴毛", type: "value", group: "appearance" },
    311: { name: "腋毛", type: "value", group: "appearance" },
    314: { name: "种族", type: "value", group: "appearance" },
    // 背景
    315: { name: "勇者前生活", type: "value", group: "backstory" },
    316: { name: "成为勇者理由", type: "value", group: "backstory" },
    317: { name: "喜欢的东西", type: "value", group: "backstory" },
    320: { name: "家族构成", type: "value", group: "backstory" },
    // 特殊
    153: { name: "妊娠", type: "bool", group: "state" },
    157: { name: "人妻", type: "bool", group: "state" },
    160: { name: "慈爱", type: "bool", group: "personality2" },
    161: { name: "自信家", type: "bool", group: "personality2" },
    162: { name: "懦弱", type: "bool", group: "personality2" },
    163: { name: "高贵", type: "bool", group: "personality2" },
    164: { name: "冷静", type: "bool", group: "personality2" },
    165: { name: "叛逆", type: "bool", group: "personality2" },
    166: { name: "恶女", type: "bool", group: "personality2" },
    167: { name: "天真", type: "bool", group: "personality2" },
    168: { name: "感性", type: "bool", group: "personality2" },
    169: { name: "武人", type: "bool", group: "personality2" },
    170: { name: "孤独者", type: "bool", group: "personality2" },
    171: { name: "愚者", type: "bool", group: "personality2" },
    172: { name: "知性", type: "bool", group: "personality2" },
    173: { name: "庇护者", type: "bool", group: "personality2" },
    175: { name: "伶俐", type: "bool", group: "personality2" },
    // 57抄袭者已移除（无实际效果）
    79: { name: "男人婆", type: "bool", group: "orientation" },

    152: { name: "洁癖", type: "bool", group: "special" },
    158: { name: "同性恋", type: "bool", group: "special" },
    180: { name: "娼妇", type: "bool", group: "special" },
    181: { name: "卖春", type: "bool", group: "special" },
    188: { name: "母性", type: "bool", group: "special" },
    230: { name: "淫核感觉上升", type: "bool", group: "lewd" },
    231: { name: "淫乳感觉上升", type: "bool", group: "lewd" },
    232: { name: "淫壶感觉上升", type: "bool", group: "lewd" },
    233: { name: "淫肛感觉上升", type: "bool", group: "lewd" },
    272: { name: "淫魔", type: "bool", group: "lewd" },

};

// 素质冲突组（互斥）
window.TALENT_CONFLICTS = [
    [10, 12], [11, 13], [14, 16], [20, 23], [30, 31],
    [40, 41], [42, 43], [44, 45], [50, 51], [61, 62],
    [69, 70], [70, 71], [109, 110, 114, 116],
    [121, 122], [74, 20], [85, 82],
    [99, 100], [101, 102], [103, 104], [105, 106], [107, 108],
    [140, 141, 142, 143]
];

// ========== PALAM: 参数 (0-100) ==========
window.PALAM_DEFS = {
    0: { name: "阴蒂快感", category: "pleasure" },
    1: { name: "阴道快感", category: "pleasure" },
    2: { name: "肛门快感", category: "pleasure" },
    3: { name: "润滑", category: "physical" },
    4: { name: "顺从", category: "mental" },
    5: { name: "欲情", category: "mental" },
    6: { name: "屈服", category: "mental" },
    7: { name: "习得", category: "mental" },
    8: { name: "羞耻", category: "mental" },
    9: { name: "痛苦", category: "physical" },
    10: { name: "恐惧", category: "mental" },
    11: { name: "反感", category: "mental" },
    12: { name: "不快", category: "physical" },
    13: { name: "抑郁", category: "mental" },
    14: { name: "胸部快感", category: "pleasure" },
    15: { name: "口腔快感", category: "pleasure" },
    100: { name: "否定", category: "special" }
};

// ========== EXP: 经验 (0-99) ==========
window.EXP_DEFS = {
    0: { name: "阴道经验" },
    1: { name: "肛门经验" },
    2: { name: "绝顶经验" },
    3: { name: "射精经验" },
    4: { name: "性交经验" },
    5: { name: "异常经验" },
    10: { name: "自慰经验" },
    11: { name: "调教自慰经验" },
    20: { name: "精液经验" },
    21: { name: "侍奉快乐经验" },
    22: { name: "口交经验" },
    23: { name: "爱情经验" },
    30: { name: "被虐快乐经验" },
    31: { name: "放尿经验" },
    32: { name: "Ａ快乐经验" },
    33: { name: "施虐快乐经验" },
    34: { name: "阴蒂经验" },
    35: { name: "胸部经验" },
    40: { name: "百合经验" },
    41: { name: "ＢＬ经验" },
    50: { name: "异常经验" },
    51: { name: "紧缚经验" },
    52: { name: "Ｖ扩张经验" },
    53: { name: "Ａ扩张经验" },
    54: { name: "喷乳经验" },
    55: { name: "触手经验" },
    56: { name: "兽奸经验" },
    57: { name: "药物经验" },
    60: { name: "生产经验" },
    61: { name: "料理经验" },
    62: { name: "异种妊娠经验" },
    65: { name: "调教失神经验" },
    66: { name: "魔王调教经验" },
    70: { name: "摄影经验" },
    71: { name: "歌唱经验" },
    72: { name: "舞蹈经验" },
    73: { name: "调教谈话经验" },
    74: { name: "卖春经验" },
    75: { name: "通奸经验" },
    76: { name: "斗技场胜利经验" },
    80: { name: "战斗经验" },
    81: { name: "洗脑经验" },
    99: { name: "异世界经验" }
};

// ========== MARK: 刻印 (0-10) ==========
window.MARK_DEFS = {
    0: { name: "屈服刻印", max: 3 },
    1: { name: "快乐刻印", max: 3 },
    2: { name: "侍奉刻印", max: 3 },
    3: { name: "反抗刻印", max: 3 },
    4: { name: "猎奇刻印", max: 3 },
    5: { name: "淫乱刻印", max: 3 },
    6: { name: "征服刻印", max: 3 },
    7: { name: "悲恋刻印", max: 3 }
};

// ========== ITEM: 物品 (0-200+) ==========
window.ITEM_DEFS = {
    // === 基础调教道具 ===
    0:  { name: "振动宝石", price: 500, type: "tool", description: "镶嵌了魔力宝石的振动道具。使用效果：对阴蒂产生强烈振动刺激，大幅提升C快感与欲情。" },
    1:  { name: "壶中虫", price: 800, type: "tool", description: "装在壶中的特殊蠕虫。使用效果：放入肛门后持续蠕动刺激，增加A快感与羞耻。" },
    2:  { name: "振动杖", price: 1200, type: "tool", description: "长柄振动魔导器。使用效果：可深入阴道内部振动，大幅提升V快感与润滑。" },
    10: { name: "眼罩", price: 300, type: "tool", description: "黑色丝绸眼罩。使用效果：剥夺视觉后其他感官敏锐度上升，羞耻心与恐惧感增加。" },
    11: { name: "绳索", price: 400, type: "tool", description: "魔法加固的束缚绳。使用效果：捆绑身体限制行动，拘束状态下屈服感与羞耻大幅上升。" },
    12: { name: "口球", price: 500, type: "tool", description: "球形口塞。使用效果：塞入口中限制言语，唾液分泌增加，羞耻心与屈服感提升。" },
    13: { name: "鞭子", price: 600, type: "tool", description: "皮革鞭。使用效果：抽打身体造成疼痛，痛苦与快感交织，M气质者效果倍增。" },
    14: { name: "针", price: 700, type: "tool", description: "纤细的银针。使用效果：穿刺敏感部位带来尖锐刺激，痛苦与羞耻大幅上升。" },
    15: { name: "搾乳器", price: 1500, type: "tool", description: "自动吸吮装置。使用效果：安装在乳头上持续吸吮，B快感与喷乳经验增加。" },
    16: { name: "飞机杯", price: 1000, type: "tool", description: "柔软内壁的杯状道具。使用效果：套在阴茎上摩擦，男性专用快感道具。" },
    // V10.1: 补充缺失的工具道具
    3:  { name: "阴蒂夹", price: 600, type: "tool", description: "金属夹具。使用效果：夹住阴蒂持续刺激，C快感与羞耻大幅上升。" },
    4:  { name: "乳头夹", price: 500, type: "tool", description: "可调节松紧的夹具。使用效果：夹住乳头持续刺激，B快感与痛苦上升。" },
    5:  { name: "淋浴器", price: 300, type: "tool", description: "魔导水流装置。使用效果：水流冲击敏感部位，羞耻与润滑度上升。" },
    6:  { name: "肛门珠", price: 700, type: "tool", description: "串珠状插入道具。使用效果：逐颗塞入/拉出肛门，A快感与羞耻大幅波动。" },
    7:  { name: "浣肠器", price: 800, type: "tool", description: "灌肠专用器具。使用效果：灌入液体后栓住，羞耻与痛苦大幅上升。" },
    8:  { name: "束缚装", price: 1200, type: "tool", description: "全身拘束皮革装。使用效果：全身束缚，大幅度限制行动，屈服感飙升。" },
    9:  { name: "肛门电极", price: 1000, type: "tool", description: "通电式肛门刺激器。使用效果：电流脉冲刺激直肠，A快感与痛苦交织。" },

    // === 消耗品 ===
    20: { name: "润滑液", price: 100, type: "consumable", description: "透明粘稠液体。使用效果：涂抹后大幅润滑，减少插入疼痛，A/V快感更容易累积。" },
    21: { name: "媚药", price: 500, type: "consumable", description: "粉色催情药剂。使用效果：服用后全身敏感带觉醒，全部快感+30%，欲情大幅提升。" },
    22: { name: "利尿剂", price: 300, type: "consumable", description: "促进代谢的药丸。使用效果：加速膀胱充盈，羞耻感与放尿欲望增加，适合羞辱Play。" },
    23: { name: "避孕套", price: 50, type: "consumable", description: "薄橡胶 sheath。使用效果：性行为时使用，防止受孕，但会降低部分快感。" },
    // V10.1: 电池删除，所有道具改为魔力驱动
    // 31: { name: "电池", ... } // 已删除
    40: { name: "营养品", price: 1000, type: "consumable", description: "浓缩营养精华。使用效果：服用后恢复体力与气力，适合调教前后补充。" },

    // === 装备/特殊 ===
    30: { name: "摄像机", price: 5000, type: "equipment", description: "魔导录像装置。使用效果：开启后记录调教过程，羞耻感大幅上升，可用于摄影Play。" },
    50: { name: "魅力秤", price: 2000, type: "buff", description: "测量魅力的魔法仪器。使用效果：可测量奴隶当前魅力值，用于美容评估。" },

    // === 结婚道具 ===
    70: { name: "魔王的婚戒", price: 15000, type: "consumable", description: "刻有魔王纹章的暗黑婚戒。使用效果：向已陷落的奴隶求婚，缔结婚约后可在日终触发新婚之夜事件。（同时只能有一位妻子）" },

    // === 陷阱（已转化为御敌策略，保留数据兼容） ===
    60: { name: "落穴陷阱", price: 800, type: "trap", description: "【御敌策略】勇者跌入深坑受到伤害。" },
    61: { name: "箭矢陷阱", price: 1000, type: "trap", description: "【御敌策略】暗处箭矢射击勇者造成伤害。" },

    // === 召唤物 ===
    90: { name: "触手召唤", price: 3000, type: "creature", description: "召唤异界触手的卷轴。使用效果：召唤触手缠绕奴隶，全部位同时被刺激，触手经验增加。" },
    100: { name: "哥布林", price: 500, type: "monster", description: "低级魔物哥布林。使用效果：召唤哥布林与奴隶交合，增加异常经验与精液经验。" },
    101: { name: "史莱姆", price: 600, type: "monster", description: "粘液状低级魔物。使用效果：史莱姆包裹全身融化衣物，溶解液带来特殊快感。" },
    102: { name: "兽人", price: 800, type: "monster", description: "肌肉发达的兽人。使用效果：兽人强力的体力带来激烈交合，V/A扩张经验增加。" },
    103: { name: "巨魔", price: 1200, type: "monster", description: "体型巨大的巨魔。使用效果：巨物带来极致扩张体验，异常经验与痛苦大幅提升。" },
    // V10.1: 新增扩展道具
    32: { name: "尿道棒", price: 800, type: "tool", description: "纤细金属棒，用于尿道刺激与扩张。使用效果：插入尿道带来极端痛苦与异常快感，尿道扩张经验增加。" },
    33: { name: "项圈", price: 500, type: "tool", description: "皮革项圈，刻上奴隶编号。使用效果：佩戴后进入'犬化'状态，屈服感与羞耻大幅上升。" },
    34: { name: "牵引绳", price: 300, type: "tool", description: "连接项圈用的牵引绳，需配合项圈使用。使用效果：牵引爬行，羞耻与服从感飙升。" },
    35: { name: "假阴茎", price: 800, type: "tool", description: "逼真造型的魔导假阳具。使用效果：让奴隶用它自慰，V快感与羞耻大幅上升。" },
    36: { name: "双头龙", price: 1200, type: "tool", description: "两端均可使用的长型道具。使用效果：助手佩戴后对奴隶进行插入调教，双方快感反馈。" },
};

// ========== TRAIN: 训练指令 (0-200+) ==========
window.TRAIN_DEFS = {
    0: { name: "爱抚", category: "caress", group: "caress" },
    1: { name: "舔阴", category: "caress", group: "caress" },
    2: { name: "肛门爱抚", category: "caress", group: "caress" },
    3: { name: "自慰", category: "caress", group: "caress" },
    4: { name: "口交(主)", category: "caress", group: "caress" },
    5: { name: "胸爱抚", category: "caress", group: "caress" },
    6: { name: "接吻", category: "caress", group: "caress" },
    7: { name: "秘贝开帐", category: "caress", group: "caress" },
    8: { name: "指插入", category: "caress", group: "caress" },
    9: { name: "肛门舔舐", category: "caress", group: "caress" },
    10: { name: "振动宝石", category: "tool", group: "tool", requiredItem: 0 },
    11: { name: "振动杖", category: "tool", group: "tool", requiredItem: 2 },
    12: { name: "肛门蠕虫", category: "tool", group: "tool", requiredItem: 1 },
    13: { name: "阴蒂夹", category: "tool", group: "tool", requiredItem: 3 },
    14: { name: "乳头夹", category: "tool", group: "tool", requiredItem: 4 },
    15: { name: "搾乳器", category: "tool", group: "tool", requiredItem: 15 },
    16: { name: "飞机杯", category: "tool", group: "tool", requiredItem: 16 },
    17: { name: "淋浴", category: "tool", group: "tool", requiredItem: 5 },
    18: { name: "肛门珠", category: "tool", group: "tool", requiredItem: 6 },
    19: { name: "肛门珠拉出", category: "tool", group: "tool" },
    20: { name: "正常位", category: "vagina", group: "vaginal" },
    21: { name: "后背位", category: "vagina", group: "vaginal" },
    22: { name: "对面座位", category: "vagina", group: "vaginal" },
    23: { name: "背面座位", category: "vagina", group: "vaginal" },
    24: { name: "逆强奸", category: "vagina", group: "vaginal" },
    25: { name: "逆肛门强奸", category: "anal", group: "anal" },
    26: { name: "正常位肛门", category: "anal", group: "anal" },
    27: { name: "后背位肛门", category: "anal", group: "anal" },
    28: { name: "对面座位肛门", category: "anal", group: "anal" },
    29: { name: "背面座位肛门", category: "anal", group: "anal" },
    30: { name: "手淫", category: "service", group: "service" },
    31: { name: "口交", category: "service", group: "service" },
    32: { name: "乳交", category: "service", group: "service" },
    33: { name: "素股", category: "service", group: "service" },
    34: { name: "骑乘位", category: "service", group: "service" },
    35: { name: "泡沫舞", category: "service", group: "service" },
    36: { name: "骑乘位肛门", category: "service", group: "service" },
    37: { name: "肛门侍奉", category: "service", group: "service" },
    38: { name: "足交", category: "service", group: "service" },
    40: { name: "打屁股", category: "sm", group: "sm" },
    41: { name: "鞭子", category: "sm", group: "sm", requiredItem: 13 },
    42: { name: "针", category: "sm", group: "sm", requiredItem: 14 },
    43: { name: "眼罩", category: "sm", group: "sm", requiredItem: 10 },
    44: { name: "绳索", category: "sm", group: "sm", requiredItem: 11 },
    45: { name: "口球", category: "sm", group: "sm", requiredItem: 12 },
    46: { name: "浣肠器+栓", category: "sm", group: "sm", requiredItem: 7 },
    47: { name: "束缚装", category: "sm", group: "sm", requiredItem: 8 },
    48: { name: "踩踏", category: "sm", group: "sm" },
    49: { name: "肛门电极", category: "sm", group: "sm", requiredItem: 9 },
    50: { name: "润滑液", category: "item", group: "special" },
    51: { name: "媚药", category: "item", group: "special" },
    52: { name: "利尿剂", category: "item", group: "special" },
    53: { name: "水晶球", category: "item", group: "special" },
    54: { name: "野外play", category: "item", group: "special" },
    55: { name: "什么都不做", category: "item", group: "special" },
    56: { name: "对话", category: "item", group: "special" },
    57: { name: "羞耻play", category: "item", group: "special" },
    58: { name: "浴室play", category: "item", group: "special" },
    59: { name: "新妻play", category: "item", group: "special" },
    60: { name: "助手接吻", category: "assistant", group: "assistant" },
    61: { name: "强制舔阴", category: "assistant", group: "assistant" },
    62: { name: "侵犯助手", category: "assistant", group: "assistant" },
    63: { name: "磨镜", category: "assistant", group: "assistant" },
    64: { name: "３Ｐ", category: "assistant", group: "assistant" },
    65: { name: "让助手侵犯", category: "assistant", group: "assistant" },
    66: { name: "双人口交", category: "assistant", group: "assistant" },
    67: { name: "给助手足交", category: "assistant", group: "assistant" },
    68: { name: "双重口交", category: "assistant", group: "assistant" },
    69: { name: "六九式", category: "assistant", group: "assistant" },
    70: { name: "双重素股", category: "assistant", group: "assistant" },
    71: { name: "双重乳交", category: "assistant", group: "assistant" },
    72: { name: "剃阴毛", category: "cosmetic", group: "special" },
    73: { name: "弄发型", category: "cosmetic", group: "special" },
    80: { name: "强制深喉", category: "rough", group: "rough" },
    81: { name: "拳头性交", category: "rough", group: "rough" },
    82: { name: "肛门拳头", category: "rough", group: "rough" },
    83: { name: "双穴拳头", category: "rough", group: "rough" },
    84: { name: "Ｇ点刺激", category: "rough", group: "rough" },
    85: { name: "放尿", category: "rough", group: "rough" },
    87: { name: "穿环", category: "rough", group: "rough" },
    90: { name: "乳头性交", category: "rough", group: "rough" },
    100: { name: "触手召唤", category: "monster", group: "monster" },
    110: { name: "穿衣脱衣", category: "special", group: "special" },
    111: { name: "撕破衣服", category: "rough", group: "rough" },
    120: { name: "插入G点刺激", category: "vagina", group: "vaginal" },
    121: { name: "插入子宫口刺激", category: "vagina", group: "vaginal" },
    122: { name: "龟头顶住", category: "caress", group: "caress" },
    123: { name: "乳交口交", category: "service", group: "service" },
    124: { name: "深喉", category: "rough", group: "rough" },
    125: { name: "口交自慰", category: "service", group: "service" },
    126: { name: "手淫口交", category: "service", group: "service" },
    127: { name: "真空口交", category: "rough", group: "rough" },
    128: { name: "正常位・接吻", category: "vagina", group: "vaginal" },
    129: { name: "正常位・胸爱抚", category: "vagina", group: "vaginal" },
    130: { name: "正常位SP", category: "vagina", group: "vaginal" },
    131: { name: "后背位・胸爱抚", category: "vagina", group: "vaginal" },
    132: { name: "后背位・打屁股", category: "vagina", group: "vaginal" },
    133: { name: "站立后背位", category: "vagina", group: "vaginal" },
    134: { name: "后背位SP", category: "vagina", group: "vaginal" },
    135: { name: "自我舔阴", category: "caress", group: "caress" },
    150: { name: "自由调教", category: "free", group: "free" },
    200: { name: "斗技场", category: "arena", group: "arena" },
    201: { name: "助手", category: "system", group: "system" },
    208: { name: "触手", category: "arena", group: "arena" },

    // === 恢复 ===
    998: { name: "安抚", category: "recovery", group: "special" },
    999: { name: "休息", category: "recovery", group: "special" },

    // === 助手 ===
    900: { name: "助手代行", category: "assistant", group: "assistant" },
    901: { name: "助手参与", category: "assistant", group: "assistant" },

    // === 魔王技能 ===
    989: { name: "强制绝顶", category: "master", group: "special" },
    990: { name: "释放许可", category: "master", group: "special" },
    991: { name: "边缘控制", category: "master", group: "special" },
    992: { name: "强制蓄力", category: "master", group: "special" },

    // === NEW: 道具指令扩展 ===
    160: { name: "喂食营养品", category: "item", group: "special", requiredItem: 40 },
    161: { name: "使用魅力秤", category: "item", group: "special", requiredItem: 50 },
    162: { name: "摄影", category: "item", group: "special", requiredItem: 30 },

    // V10.1: 避孕套系统
    170: { name: "使用避孕套", category: "item", group: "special", requiredItem: 23 },
    171: { name: "喝避孕套内精液", category: "rough", group: "rough" },
    172: { name: "展示用过的避孕套", category: "rough", group: "rough" },
    // V10.1: 尿道玩法
    173: { name: "尿道刺激", category: "rough", group: "rough", requiredItem: 32 },
    174: { name: "尿道插入", category: "rough", group: "rough", requiredItem: 32 },
    // V10.1: 犬化/宠物玩法
    175: { name: "犬化", category: "sm", group: "sm", requiredItem: 33 },
    176: { name: "遛狗", category: "sm", group: "sm", requiredItem: 34 },
    177: { name: "野外撒尿(狗)", category: "rough", group: "rough" },
    // V10.1: 双头龙/假阴茎
    178: { name: "假鸡巴自慰", category: "tool", group: "tool", requiredItem: 35 },
    179: { name: "助手双头龙插入", category: "assistant", group: "assistant", requiredItem: 36 },
    180: { name: "助手双头龙肛门插入", category: "assistant", group: "assistant", requiredItem: 36 },
    // V10.1: 水晶球系统
    181: { name: "欣赏性爱记录", category: "item", group: "special" },
    182: { name: "制作水晶球副本", category: "item", group: "special", requiredItem: 53 },
    // V10.1: 药水使用
    183: { name: "使用回复药水", category: "item", group: "special" },

};

// 指令分组（用于过滤）
window.TRAIN_GROUPS = {
    "caress": [0,1,2,3,4,5,6,7,8,9,122,135],
    "tool": [10,11,12,13,14,15,16,17,18,19,178],
    "vaginal": [20,21,22,23,24,120,121,128,129,130,131,132,133,134],
    "anal": [25,26,27,28,29],
    "service": [30,31,32,33,34,35,36,37,38,123,125,126],
    "sm": [40,41,42,43,44,45,46,47,48,49,175,176],
    "assistant": [60,61,62,63,64,65,66,67,68,69,70,71,179,180,900,901],
    "special": [50,51,52,53,54,55,56,57,58,59,72,73,110,160,161,162,170,181,182,183,989,990,991,992,998,999],
    "rough": [80,81,82,83,84,85,87,90,111,124,127,171,172,173,174,177],
    "monster": [100],
    "arena": [200,208],
    "free": [150],
};

// ========== SOURCE: -source 来源定义 ==========
window.SOURCE_DEFS = {
    0: { name: "阴蒂快感" }, 1: { name: "阴道快感" }, 2: { name: "肛门快感" },
    3: { name: "胸部快感" }, 4: { name: "口腔快感" }, 10: { name: "爱液" },
    11: { name: "射精" }, 12: { name: "母乳" }, 14: { name: "羞耻" },
    15: { name: "恐惧" }, 16: { name: "痛苦" }, 17: { name: "屈服" },
    18: { name: "欲情" }, 19: { name: "习得" }, 20: { name: "反感" },
    21: { name: "中毒充足" }, 22: { name: "伤害" }
};

// ========== 能力升级条件表 (ABLUP) ==========
// 每个能力: { juelType, expCond, markCond, maxLv }
// expCond: { expId: 最小经验值 }  (多个条件取AND)
// markCond: { markId: 最小刻印等级 }
window.ABLUP_CONDITIONS = {
    // 感觉系 — 需要对应部位经验和快感珠
    0:  { juelType: 0,  maxLv: 10, name: "阴蒂感觉", expCond: { 34: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    1:  { juelType: 14, maxLv: 10, name: "胸部感觉", expCond: { 35: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    2:  { juelType: 1,  maxLv: 10, name: "阴道感觉", expCond: { 0:  [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    3:  { juelType: 2,  maxLv: 10, name: "肛门感觉", expCond: { 1:  [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    4:  { juelType: 15, maxLv: 10, name: "口腔感觉", expCond: { 2:  [0, 5,  20, 50, 100, 180, 300, 500, 800, 1200] } },

    // 精神/技术系
    10: { juelType: 6,  maxLv: 10, name: "顺从",   markCond: { 2: [0, 1, 1, 2, 2, 3, 3, 3, 3, 3] } }, // 屈服刻印
    11: { juelType: 5,  maxLv: 10, name: "欲望",   expCond: { 2: [0, 1, 5, 20, 50, 100, 200, 350, 600, 1000] } }, // 绝顶经验
    12: { juelType: 7,  maxLv: 10, name: "技巧",   expCond: { 4: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } }, // 性交经验
    13: { juelType: 7,  maxLv: 10, name: "侍奉技术", expCond: { 22: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } }, // 口交经验
    14: { juelType: 7,  maxLv: 10, name: "性交技术", expCond: { 4: [0, 5, 20, 50, 100, 180, 300, 500, 800, 1200] } },
    // REMOVED: 15 话术, 16 侍奉精神
    17: { juelType: 8,  maxLv: 10, name: "露出癖",   expCond: { 5: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } }, // 异常经验替代露出

    // 性癖系
    20: { juelType: 9,  maxLv: 10, name: "抖Ｓ气质", expCond: { 33: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } }, // 施虐快乐经验
    21: { juelType: 6,  maxLv: 10, name: "抖Ｍ气质", expCond: { 30: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } }, // 被虐快乐经验
    // REMOVED: 22 百合气质, 23 搞基气质

    // 成瘾系
    30: { juelType: 5,  maxLv: 10, name: "性交成瘾", expCond: { 4: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    31: { juelType: 5,  maxLv: 10, name: "自慰成瘾", expCond: { 10: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    32: { juelType: 5,  maxLv: 10, name: "精液成瘾", expCond: { 20: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    33: { juelType: 5,  maxLv: 10, name: "百合成瘾", expCond: { 40: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    // REMOVED: 34 卖春成瘾, 35 兽奸成瘾
    36: { juelType: 5,  maxLv: 10, name: "露出成瘾", expCond: { 5: [0, 5, 20, 60, 120, 200, 350, 550, 800, 1200] } },
    37: { juelType: 5,  maxLv: 10, name: "同性成淫", expCond: { 41: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },

    // 其他世界能力
    100: { juelType: 7, maxLv: 10, name: "学习能力", expCond: { 7: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } }, // 药物经验替代
    101: { juelType: 7, maxLv: 10, name: "运动能力", expCond: { 7: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } },
    102: { juelType: 7, maxLv: 10, name: "战斗能力", expCond: { 7: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } },
    103: { juelType: 7, maxLv: 10, name: "感受性",   expCond: { 7: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } },
};

// 通用升级所需珠数表 (按当前等级)
window.ABLUP_COST_TABLE = [1, 20, 100, 500, 2000, 8000, 30000, 100000, 300000, 1000000];

// ABLUP升级特殊效果: { ablId: { level: { talentId: value, text: "描述" } } }
window.ABLUP_EFFECTS = {
    11: { // 欲望
        3: { talent: { 74: 1 }, text: "【${name}获得了「自慰狂」的素质！】" },
        5: { talent: { 75: 1 }, text: "【${name}获得了「性交狂」的素质！】" },
    },
    0: { // 阴蒂感觉
        4: { text: "【${name}的阴蒂变得更加敏感了……】" },
    },
    1: { // 胸部感觉
        4: { text: "【${name}的胸部变得更加敏感了……】" },
    },
    2: { // 阴道感觉
        4: { text: "【${name}的阴道变得更加敏感了……】" },
    },
    3: { // 肛门感觉
        4: { text: "【${name}的肛门变得更加敏感了……】" },
    },
    21: { // 抖M气质
        3: { talent: { 88: 1 }, text: "【${name}获得了「被虐狂」的素质！】" },
    },
    20: { // 抖S气质
        3: { talent: { 83: 1 }, text: "【${name}获得了「施虐狂」的素质！】" },
    },
    10: { // 顺从
        3: { text: "【${name}的眼神变得更加顺从了……】" },
    },
    17: { // 露出癖
        3: { talent: { 89: 1 }, text: "【${name}获得了「露出狂」的素质！】" },
    },
};

// SOURCE → PALAM 映射 (SOURCE索引 → PALAM索引)
// 因为SOURCE和PALAM使用不同的编号系统，需要映射转换
window.SOURCE_TO_PALAM = {
    0: 0,   // 阴蒂快感 → 阴蒂快感
    1: 1,   // 阴道快感 → 阴道快感
    2: 2,   // 肛门快感 → 肛门快感
    3: 14,  // 胸部快感 → 胸部快感 (PALAM[3]是润滑!)
    4: 15,  // 口腔快感 → 口腔快感 (PALAM[4]是顺从!)
    5: 5,   // 欲情 → 欲情
    8: 8,   // 羞耻 → 羞耻
    15: 10, // 恐惧 → 恐惧 (PALAM[15]是口腔快感!)
    16: 9,  // 痛苦 → 痛苦 (PALAM[16]未定义!)
    17: 6,  // 屈服 → 屈服 (PALAM[17]是习得!)
    19: 7,  // 习得 → 习得 (PALAM[19]未定义!)
    20: 11, // 反感 → 反感
};

// PALAM 到 JUEL 的转换阈值
window.PALAM_TO_JUEL = [
    { threshold: 100, ratio: 1 },
    { threshold: 500, ratio: 2 },
    { threshold: 3000, ratio: 5 },
    { threshold: 10000, ratio: 10 },
    { threshold: 30000, ratio: 20 },
    { threshold: 60000, ratio: 50 },
    { threshold: 100000, ratio: 100 }
];


// ========== 指令解锁条件表 (TRAIN_UNLOCK) ==========
// rank: 调教师等级要求 (0=新手, 1=入门, 2=熟练, 3=进阶, 4=专家, 5=大师)
// masterExp: 魔王调教经验要求 (替代rank的数值条件)
// masterAbl: { ablId: minLevel } 魔王能力要求
// items: [itemId, ...] 需要持有的道具
// targetAbl: { ablId: minLevel } 目标能力要求
// targetExp: { expId: minValue } 目标经验要求
// targetTalent: [talentId, ...] 目标需要的素质
// forbiddenTalent: [talentId, ...] 目标不能有的素质

window.TRAIN_UNLOCK = {
    // === Rank 0: 新手 (无需经验) ===
    0:  { rank: 0, desc: "基础接触" },
    1:  { rank: 0, desc: "基础接触" },
    5:  { rank: 0, desc: "基础接触" },
    6:  { rank: 0, desc: "基础接触" },
    55: { rank: 0, desc: "基础接触" },
    56: { rank: 0, desc: "基础接触" },

    // === Rank 1: 入门 (需5次调教经验) ===
    2:  { rank: 1, desc: "需调教经验5+" },
    3:  { rank: 1, desc: "需调教经验5+" },
    4:  { rank: 1, desc: "需调教经验5+" },
    7:  { rank: 1, desc: "需调教经验5+" },
    8:  { rank: 1, desc: "需调教经验5+" },
    30: { rank: 1, desc: "需调教经验5+" },
    31: { rank: 1, desc: "需调教经验5+" },
    32: { rank: 1, desc: "需调教经验5+" },
    33: { rank: 1, desc: "需调教经验5+" },
    34: { rank: 1, desc: "需调教经验5+" },
    38: { rank: 1, desc: "需调教经验5+" },
    40: { rank: 1, desc: "需调教经验5+" },
    41: { rank: 1, desc: "需调教经验5+" },
    42: { rank: 1, desc: "需调教经验5+" },
    43: { rank: 1, desc: "需调教经验5+" },
    44: { rank: 1, desc: "需调教经验5+" },
    45: { rank: 1, desc: "需调教经验5+" },
    50: { rank: 1, desc: "需调教经验5+" },
    51: { rank: 1, desc: "需调教经验5+" },
    52: { rank: 1, desc: "需调教经验5+" },
    53: { rank: 1, desc: "需调教经验5+" },
    58: { rank: 1, desc: "需调教经验5+" },
    59: { rank: 1, desc: "需调教经验5+" },
    72: { rank: 1, desc: "需调教经验5+" },
    73: { rank: 1, desc: "需调教经验5+" },

    // === Rank 2: 熟练 (需15次调教经验) ===
    10: { rank: 2, desc: "需调教经验15+" },
    11: { rank: 2, desc: "需调教经验15+" },
    12: { rank: 2, desc: "需调教经验15+" },
    13: { rank: 2, desc: "需调教经验15+" },
    14: { rank: 2, desc: "需调教经验15+" },
    15: { rank: 2, desc: "需调教经验15+" },
    17: { rank: 2, desc: "需调教经验15+" },
    18: { rank: 2, desc: "需调教经验15+" },
    20: { rank: 2, desc: "需调教经验15+" },
    21: { rank: 2, desc: "需调教经验15+" },
    22: { rank: 2, desc: "需调教经验15+" },
    23: { rank: 2, desc: "需调教经验15+" },
    24: { rank: 2, desc: "需调教经验15+" },
    35: { rank: 2, desc: "需调教经验15+" },
    37: { rank: 2, desc: "需调教经验15+" },
    46: { rank: 2, desc: "需调教经验15+" },
    47: { rank: 2, desc: "需调教经验15+" },
    48: { rank: 2, desc: "需调教经验15+" },
    54: { rank: 2, desc: "需调教经验15+" },
    57: { rank: 2, desc: "需调教经验15+" },
    60: { rank: 2, desc: "需调教经验15+, 需助手" },
    61: { rank: 2, desc: "需调教经验15+, 需助手" },
    62: { rank: 2, desc: "需调教经验15+, 需助手" },
    63: { rank: 2, desc: "需调教经验15+, 需助手" },
    80: { rank: 2, desc: "需调教经验15+" },
    84: { rank: 2, desc: "需调教经验15+" },
    85: { rank: 2, desc: "需调教经验15+" },
    87: { rank: 2, desc: "需调教经验15+" },
    90: { rank: 2, desc: "需调教经验15+" },
    110:{ rank: 2, desc: "需调教经验15+" },
    111:{ rank: 2, desc: "需调教经验15+" },

    // === Rank 3: 进阶 (需30次调教经验) ===
    9:  { rank: 3, desc: "需调教经验30+" },
    16: { rank: 3, desc: "需调教经验30+" },
    19: { rank: 3, desc: "需调教经验30+, 需已装备肛门珠" },
    25: { rank: 3, desc: "需调教经验30+, 目标肛门感觉Lv.1+" },
    26: { rank: 3, desc: "需调教经验30+, 目标肛门感觉Lv.1+" },
    27: { rank: 3, desc: "需调教经验30+, 目标肛门感觉Lv.1+" },
    28: { rank: 3, desc: "需调教经验30+, 目标肛门感觉Lv.1+" },
    29: { rank: 3, desc: "需调教经验30+, 目标肛门感觉Lv.1+" },
    36: { rank: 3, desc: "需调教经验30+, 目标肛门感觉Lv.1+" },
    49: { rank: 3, desc: "需调教经验30+" },
    64: { rank: 3, desc: "需调教经验30+, 需助手" },
    65: { rank: 3, desc: "需调教经验30+, 需助手" },
    66: { rank: 3, desc: "需调教经验30+, 需助手" },
    67: { rank: 3, desc: "需调教经验30+, 需助手" },
    68: { rank: 3, desc: "需调教经验30+, 需助手" },
    69: { rank: 3, desc: "需调教经验30+, 需助手" },
    70: { rank: 3, desc: "需调教经验30+, 需助手" },
    71: { rank: 3, desc: "需调教经验30+, 需助手" },
    100:{ rank: 3, desc: "需调教经验30+, 需触手召唤契约", items: [90] },
    120:{ rank: 3, desc: "需调教经验30+" },
    121:{ rank: 3, desc: "需调教经验30+" },
    122:{ rank: 3, desc: "需调教经验30+" },
    123:{ rank: 3, desc: "需调教经验30+" },
    124:{ rank: 3, desc: "需调教经验30+" },
    125:{ rank: 3, desc: "需调教经验30+" },
    126:{ rank: 3, desc: "需调教经验30+" },
    127:{ rank: 3, desc: "需调教经验30+" },

    // === Rank 4: 专家 (需50次调教经验) ===
    81: { rank: 4, desc: "需调教经验50+, 目标阴道感觉Lv.3+或V扩张经验3+", targetAbl: { 2: 3 } },
    82: { rank: 4, desc: "需调教经验50+, 目标肛门感觉Lv.3+或A扩张经验3+", targetAbl: { 3: 3 } },
    83: { rank: 4, desc: "需调教经验50+, 目标阴道/肛门感觉Lv.3+", targetAbl: { 2: 3, 3: 3 } },
    128:{ rank: 4, desc: "需调教经验50+" },
    129:{ rank: 4, desc: "需调教经验50+" },
    130:{ rank: 4, desc: "需调教经验50+" },
    131:{ rank: 4, desc: "需调教经验50+" },
    132:{ rank: 4, desc: "需调教经验50+" },
    133:{ rank: 4, desc: "需调教经验50+" },
    134:{ rank: 4, desc: "需调教经验50+" },
    135:{ rank: 4, desc: "需调教经验50+" },

    // === Rank 5: 大师 (需80次调教经验) ===
    150:{ rank: 5, desc: "需调教经验80+" },
    200:{ rank: 5, desc: "需调教经验80+" , element: ['physical'] },
    208:{ rank: 5, desc: "需调教经验80+" , element: ['physical'] },

    // === NEW: 道具指令扩展 ===
    160:{ rank: 1, desc: "需营养品" },
    161:{ rank: 2, desc: "需魅力秤" },
    162:{ rank: 2, desc: "需摄像机" },

    // V10.1: 新增指令解锁条件
    170:{ rank: 2, desc: "需避孕套" },
    171:{ rank: 3, desc: "需使用过避孕套的状态" },
    172:{ rank: 3, desc: "需使用过避孕套的状态" },
    173:{ rank: 3, desc: "需尿道棒" },
    174:{ rank: 4, desc: "需尿道棒+润滑液" },
    175:{ rank: 2, desc: "需项圈" },
    176:{ rank: 3, desc: "需项圈+牵引绳" },
    177:{ rank: 3, desc: "需项圈+野外play状态" },
    178:{ rank: 2, desc: "需假阴茎" },
    179:{ rank: 3, desc: "需双头龙+助手" },
    180:{ rank: 4, desc: "需双头龙+助手" },
    181:{ rank: 2, desc: "需收藏馆有水晶球记录" },
    182:{ rank: 3, desc: "需水晶球" },
    183:{ rank: 1, desc: "需炼金工房有药水库存" },
};

// 魔王调教等级名称
window.MASTER_RANK_NAMES = [
    "新手调教师", "入门调教师", "熟练调教师", "进阶调教师", "专家调教师", "大师调教师"
];

// 魔王等级→所需经验阈值
window.MASTER_RANK_EXP = [0, 5, 15, 30, 50, 80];


// ========== 设施定义 (FACILITY_DEFS) ==========
// id: 设施编号
// name: 设施名称
// description: 描述
// maxLv: 最大等级
// cost: 每级建造费用数组 [Lv1, Lv2, ...]
// effects: 每级效果描述
// unlockItems: 解锁后可购买的道具ID列表
// unlockTrains: 解锁后可使用的调教指令ID列表

window.FACILITY_DEFS = {
    3: {
        name: "肉体改造室",
        description: "对奴隶进行肉体改造，解锁特殊Play",
        maxLv: 4,
        cost: [3000, 8000, 20000, 50000],
        effects: [
            "解锁触手相关Play",
            "解锁怪物召唤",
            "解锁肉体变形",
            "解锁终极改造"
        ],
        unlockTrains: {
            1: [90, 91, 92, 93],      // 触手
            2: [100, 101, 102, 103],  // 怪物
            3: [110, 111, 112],       // 特殊改造
            4: [150, 151, 152]        // 终极
        },
        icon: "🔬"
    },
    6: {
        name: "监狱",
        description: "关押俘虏的勇者，可执行调教或处刑",
        maxLv: 3,
        cost: [1000, 3000, 8000],
        effects: [
            "可容纳2名俘虏",
            "可容纳4名俘虏，解锁拷问",
            "可容纳8名俘虏，解锁洗脑"
        ],
        icon: "⛓️"
    },
    8: {
        name: "魔法研究所",
        description: "研究魔法陷阱和御敌策略",
        maxLv: 4,
        cost: [3000, 8000, 20000, 50000],
        effects: [
            "解锁基础御敌策略",
            "解锁中级御敌策略",
            "解锁高级御敌策略",
            "解锁传说级御敌策略"
        ],
        unlockStrategies: {
            1: [1, 2, 3],
            2: [4, 5, 6],
            3: [7, 8, 9],
            4: [10, 11]
        },
        icon: "🔮"
    }
};

// ========== 地下城怪物模板 (MONSTER_TEMPLATES) ==========
// V6.0: 怪物等级动态生成，第N层怪物等级在 [(N-1)*20, N*20] 区间浮动
// 属性由等级自动计算，不再硬编码

window.MONSTER_AI_TYPES = ["attack", "defense", "magic", "speed", "balanced"];

window.MONSTER_TEMPLATES = {
    // 第1层: 幽暗洞穴 (Lv.1~20)
    1: [
        { name: "洞穴蝙蝠",    icon: "🦇", description: "倒挂在洞顶的蝙蝠群，数量众多", ai: "speed" },
        { name: "巨型老鼠",    icon: "🐀", description: "被魔力侵蚀的巨型老鼠，牙齿带有毒素", ai: "attack" },
        { name: "洞穴史莱姆",  icon: "💧", description: "吸收了洞穴魔力的蓝色史莱姆", ai: "defense" },
        { name: "岩蜥",        icon: "🦎", description: "潜伏在岩石缝隙中的捕食者", ai: "balanced" },
    ],
    // 第2层: 翡翠洞窟 (Lv.20~40)
    2: [
        { name: "毒孢子蘑菇",  icon: "🍄", description: "散发剧毒孢子的发光蘑菇", ai: "magic" },
        { name: "翡翠蜘蛛",    icon: "🕷️", description: "拥有翡翠色外壳的剧毒蜘蛛", ai: "speed" },
        { name: "苔藓蜥蜴人",  icon: "🦎", description: "身上长满发光苔藓的蜥蜴人战士", ai: "attack" },
        { name: "食苔巨虫",    icon: "🐛", description: "以魔力苔藓为食的巨大蠕虫", ai: "defense" },
    ],
    // 第3层: 腐沼雨林 (Lv.40~60)
    3: [
        { name: "沼泽鳄鱼",    icon: "🐊", description: "潜伏在沼泽深处的巨型鳄鱼", ai: "attack" },
        { name: "食人花",      icon: "🌺", description: "巨大的肉食植物，花瓣如同利齿", ai: "magic" },
        { name: "沼灵",        icon: "👻", description: "由沼泽怨念凝聚而成的灵体", ai: "magic" },
        { name: "腐沼巨蛙",    icon: "🐸", description: "吞下整头牛的巨型毒蛙", ai: "balanced" },
        { name: "雨林蟒蛇",    icon: "🐍", description: "长达十米的魔力蟒蛇，缠绕力惊人", ai: "speed" },
    ],
    // 第4层: 霜皑冰原 (Lv.60~80)
    4: [
        { name: "冰原狼",      icon: "🐺", description: "毛发如冰晶般的狼群首领", ai: "speed" },
        { name: "小雪怪",      icon: "❄️", description: "由积雪和魔力构成的低级雪怪", ai: "defense" },
        { name: "冰元素",      icon: "🧊", description: "纯粹的冰元素生物，触碰即冻伤", ai: "magic" },
        { name: "冰霜巨熊",    icon: "🐻", description: "冰原的霸主，一掌可碎巨石", ai: "attack" },
        { name: "冰龙幼崽",    icon: "🐉", description: "误入冰原的幼龙，已能喷吐冰息", ai: "balanced" },
    ],
    // 第5层: 熔火深渊 (Lv.80~100)
    5: [
        { name: "火蜥蜴",      icon: "🦎", description: "在岩浆边缘栖息的火属性蜥蜴", ai: "attack" },
        { name: "熔岩史莱姆",  icon: "🔥", description: "体内流淌着熔岩的灼热史莱姆", ai: "defense" },
        { name: "炎魔",        icon: "👹", description: "从熔岩中诞生的低级恶魔", ai: "magic" },
        { name: "岩浆巨人",    icon: "🌋", description: "由凝固岩浆组成的巨型魔像", ai: "attack" },
        { name: "地狱犬",      icon: "🐕", description: "三头地狱犬的幼体，已能喷火", ai: "speed" },
        { name: "红龙",        icon: "🐲", description: "守护深渊入口的红龙", ai: "balanced" },
    ],
    // 第6层: 幻梦镜界 (Lv.100~120)
    6: [
        { name: "镜妖",        icon: "🪞", description: "从镜子中爬出的扭曲妖怪", ai: "magic" },
        { name: "幻影刺客",    icon: "👤", description: "由幻觉凝聚的刺客，虚实难辨", ai: "speed" },
        { name: "梦境兽",      icon: "🦄", description: "吞噬梦境的异界生物", ai: "balanced" },
        { name: "虚空之眼",    icon: "👁️", description: "凝视它的人会陷入永恒的噩梦", ai: "magic" },
        { name: "镜像勇者",    icon: "🎭", description: "镜界制造的勇者复制品", ai: "balanced" },
        { name: "梦魇",        icon: "😈", description: "操控梦境的上级恶魔", ai: "magic" },
    ],
    // 第7层: 死寂沙海 (Lv.120~140)
    7: [
        { name: "沙虫",        icon: "🐛", description: "潜伏在沙下伺机而动的巨型沙虫", ai: "attack" },
        { name: "木乃伊",      icon: "🧟", description: "古代诅咒复活的干尸战士", ai: "defense" },
        { name: "沙元素",      icon: "🏜️", description: "由沙砾构成的元素生物", ai: "magic" },
        { name: "蝎王",        icon: "🦂", description: "拥有剧毒的沙漠蝎王", ai: "speed" },
        { name: "法老亡灵",    icon: "👑", description: "古代地下王国法老的亡灵", ai: "magic" },
        { name: "沙海巨鲸",    icon: "🐋", description: "在沙海中游弋的传说巨兽", ai: "attack" },
    ],
    // 第8层: 地下王城 (Lv.140~160)
    8: [
        { name: "石像鬼",      icon: "🗿", description: "古代宫殿的守卫雕像突然活了过来", ai: "defense" },
        { name: "亡灵骑士",    icon: "💀", description: "效忠古代王国的亡灵骑士", ai: "balanced" },
        { name: "古代守卫",    icon: "🛡️", description: "古代魔法强化的宫殿守卫", ai: "defense" },
        { name: "暗影刺客",    icon: "🥷", description: "潜伏在王城阴影中的暗杀者", ai: "speed" },
        { name: "魔导傀儡",    icon: "🤖", description: "古代魔导技术的最高杰作", ai: "magic" },
        { name: "死亡骑士",    icon: "⚔️", description: "统领亡灵军团的死亡骑士", ai: "attack" },
        { name: "古代龙王",    icon: "🐉", description: "古代王国的守护龙，沉睡了千年", ai: "balanced" },
    ],
    // 第9层: 狂风苔原 (Lv.160~180)
    9: [
        { name: "风狼",        icon: "🐺", description: "驾驭狂风的风元素狼群", ai: "speed" },
        { name: "冰霜巨人",    icon: "🧊", description: "身高五米的冰霜巨人", ai: "attack" },
        { name: "风暴元素",    icon: "🌪️", description: "纯粹风暴凝聚的元素生物", ai: "magic" },
        { name: "雪女",        icon: "👻", description: "在暴风雪中出现的神秘雪女", ai: "magic" },
        { name: "雷神鹰",      icon: "🦅", description: "羽翼带电的传说猛禽", ai: "speed" },
        { name: "世界蛇",      icon: "🐍", description: "盘踞在苔原深处的世界蛇遗种", ai: "balanced" },
        { name: "芬里尔",      icon: "🐺", description: "传说中的魔狼，呼出的气息能冻结灵魂", ai: "speed" },
    ],
    // 第10层: 魔王宫殿 (Lv.180~200)
    10: [
        { name: "恶魔卫士",    icon: "👿", description: "魔王宫殿的普通守卫", ai: "balanced" },
        { name: "黑暗骑士",    icon: "🛡️", description: "身穿黑曜石铠甲的精英骑士", ai: "defense" },
        { name: "深渊法师",    icon: "🧙", description: "钻研深渊魔法的宫廷法师", ai: "magic" },
        { name: "魔龙",        icon: "🐲", description: "臣服于魔王的强大魔龙", ai: "attack" },
        { name: "堕天使",      icon: "😇", description: "堕落的天界使者，拥有神圣与黑暗的双重力量", ai: "magic" },
        { name: "混沌恶魔",    icon: "👹", description: "从混沌中诞生的上级恶魔", ai: "balanced" },
        { name: "魔王亲卫队",  icon: "👑", description: "魔王直属的亲卫队队长，仅次于魔王的存在", ai: "attack" },
    ]
};

// 旧定义保留兼容（过渡期间）
window.FLOOR_MONSTER_DEFS = {};

// ========== 御敌策略定义 (STRATEGY_DEFS) ==========
// 基于原始游戏 DUNGEON_TRAP.ERB 中全部陷阱转化
// effect类型: damage(伤害), confuse(混乱), lust(情欲), summon(召唤), debuff(削弱), stun(眩晕),
//             charm(魅惑), trap(陷阱), bind(束缚), terror(恐惧), break(崩溃), teleport(传送),
//             heal(治疗勇者-反向), weaken_atk(削弱攻击), weaken_def(削弱防御), weaken_mag(削弱魔防),
//             curse(诅咒), oil(油滑), fire(火焰), worm(寄生), slime(史莱姆), hypnotize(催眠),
//             mimic(拟态), succubus(梦魔), net(蛛网), darkness(黑暗), shoot(弹射), merchant(商人),
//             gem(宝石), dispel(驱散), illusion(幻境)

window.STRATEGY_DEFS = {
    // === 基础伤害类 ===
    1:  { name: "落穴陷阱",      description: "地板突然打开，勇者坠入深坑",              price: 500,  effect: "damage",      value: 300,  icon: "🕳️", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者HP -300，侵略进度 -5%" },
    2:  { name: "箭矢陷阱",      description: "暗处射出无数箭矢，贯穿勇者",              price: 600,  effect: "damage",      value: 250,  icon: "🏹", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者HP -250，侵略进度 -3%" },
    3:  { name: "火箭发射",      description: "墙壁喷射火焰箭矢，点燃一切",              price: 800,  effect: "fire",        value: 350,  icon: "🚀", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者HP -350，气力 -50，侵略进度 -5%" },
    4:  { name: "弹射机关",      description: "地面弹射，勇者坠入下层",                  price: 900,  effect: "shoot",       value: 400,  icon: "⚡", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者HP -400，传送至其他楼层，侵略进度 -10%" },

    // === 控制类 ===
    5:  { name: "传送阵",        description: "魔法阵强制传送勇者到随机位置",            price: 700,  effect: "teleport",    value: 1,    icon: "🔀", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者传送至随机楼层，侵略进度 -15%" },
    6:  { name: "单向之门",      description: "门在身后锁死，勇者迷失方向",              price: 800,  effect: "confuse",     value: 3,    icon: "🚪", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者混乱3回合（攻击·防御 -15%），侵略进度 -5%" },
    7:  { name: "无尽黑暗",      description: "夺去视野，黑暗中暗藏杀机",                price: 1000, effect: "darkness",    value: 2,    icon: "🌑", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者眩晕2回合，HP -100，侵略进度 -8%" },
    8:  { name: "毒蛛巢穴",      description: "粘性蛛网缠绕，毒蜘蛛伺机而动",            price: 600,  effect: "net",         value: 150,  icon: "🕸️", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者HP -150，束缚3回合（速度 -30%），侵略进度 -5%" },
    9:  { name: "石化凝视",      description: "雕像射出石化光线，冻结勇者",              price: 1200, effect: "stun",        value: 2,    icon: "🗿", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者石化2回合（无法行动），HP -200，侵略进度 -10%" },

    // === 情欲类 ===
    10: { name: "催情迷雾",      description: "甘甜气体喷涌而出，激发欲望",              price: 800,  effect: "lust",        value: 50,   icon: "💨", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者情欲 +50，气力 -30，侵略进度 -2%" },
    11: { name: "触手巢穴",      description: "满地触手一拥而上，缠绕全身",              price: 1000, effect: "charm",       value: 80,   icon: "🐙", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -80，情欲 +80，气力 -40，侵略进度 -8%" },
    12: { name: "媚药池",        description: "掉入装满媚药的水池，全身浸透",            price: 1100, effect: "lust",        value: 120,  icon: "💧", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者情欲 +120，气力 -60，攻击·防御 -20%，侵略进度 -5%" },
    13: { name: "梦魔诱惑",      description: "伪装成受害少女的魅魔，强吻勇者",          price: 1300, effect: "charm",       value: 100,  icon: "💋", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -50，情欲 +100，气力 -50，攻击 -25%（3回合），侵略进度 -8%" },
    14: { name: "拟态生物",      description: "墙壁化为活体，触手灌入媚药",              price: 1500, effect: "mimic",       value: 120,  icon: "🧬", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -120，情欲 +100，气力 -40，装备耐久 -1，侵略进度 -10%" },
    15: { name: "史莱姆潮",      description: "墙壁渗出史莱姆，融化装备",                price: 900,  effect: "slime",       value: 60,   icon: "🫧", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -60，装备被溶解（攻击·防御 -20%），侵略进度 -5%" },
    16: { name: "淫虫巢穴",      description: "踩入虫巢，淫虫爬满全身",                  price: 800,  effect: "lust",        value: 70,   icon: "🐛", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -50，情欲 +70，气力 -35，持续3回合每回合HP -20，侵略进度 -6%" },
    17: { name: "催眠之光",      description: "头晕目眩，失去自我开始自慰",              price: 1400, effect: "hypnotize",   value: 3,    icon: "💫", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者催眠3回合（停止前进），气力 -80，侵略进度 -12%" },

    // === 削弱类 ===
    18: { name: "破甲图腾",      description: "诅咒图腾弱化勇者防御",                    price: 700,  effect: "weaken_def",  value: 20,   icon: "🛡️", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者防御 -20%，侵略进度 -3%" },
    19: { name: "卸力图腾",      description: "诅咒图腾弱化勇者攻击",                    price: 700,  effect: "weaken_atk",  value: 20,   icon: "⚔️", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者攻击 -20%，侵略进度 -3%" },
    20: { name: "魔导增幅",      description: "魔法阵增加勇者受到的魔法伤害",            price: 800,  effect: "weaken_mag",  value: 25,   icon: "✨", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者魔防 -25%，受到的魔法伤害 +30%，侵略进度 -4%" },
    21: { name: "绝望诅咒",      description: "惨白之手缠绕，全方位弱化",                price: 1200, effect: "debuff",      value: 30,   icon: "☠️", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者攻击·防御·魔防 -15%，HP -100，侵略进度 -8%" },
    22: { name: "油滑地面",      description: "满地滑油，行动受限",                      price: 500,  effect: "oil",         value: 40,   icon: "🛢️", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者速度 -40%，2回合行动受限，HP -50，侵略进度 -4%" },

    // === 特殊类 ===
    23: { name: "召唤阵",        description: "召唤地下城魔物袭击勇者",                  price: 1000, effect: "summon",      value: 2,    icon: "👹", unlockFacilityLv: { 8: 2 }, effectDesc: "召唤2只魔物，勇者HP -200，气力 -30，侵略进度 -10%" },
    24: { name: "诅咒阵",        description: "诅咒魔法阵爆炸，侵蚀精神",                price: 1100, effect: "curse",       value: 50,   icon: "🔯", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -150，气力 -50，全属性 -10%（3回合），侵略进度 -8%" },
    25: { name: "寄生蠕虫",      description: "肛门虫滑入体内，疯狂蠕动",                price: 900,  effect: "worm",        value: 80,   icon: "🪱", unlockFacilityLv: { 8: 2 }, effectDesc: "勇者HP -100，气力 -60，持续4回合每回合HP -30，侵略进度 -10%" },
    26: { name: "贪婪之诱",      description: "高价宝石引诱勇者，降低战意",              price: 600,  effect: "gem",         value: 30,   icon: "💎", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者攻击 -30%，战意丧失，侵略进度 -5%" },
    27: { name: "奸商",          description: "奸商高价兜售，榨干勇者钱包",              price: 500,  effect: "merchant",    value: 200,  icon: "💰", unlockFacilityLv: { 8: 1 }, effectDesc: "勇者金钱 -200G（不足则HP -100），侵略进度 -3%" },
    28: { name: "幻境",          description: "陷入幻境，看到最恐惧的景象",              price: 1500, effect: "illusion",    value: 60,   icon: "🌀", unlockFacilityLv: { 8: 3 }, effectDesc: "勇者HP -150，气力 -100，恐惧2回合（攻击·防御 -25%），侵略进度 -15%" },
    29: { name: "深渊凝视",      description: "来自深渊的恐怖直接冲击灵魂",              price: 4000, effect: "terror",      value: 80,   icon: "👁️", unlockFacilityLv: { 8: 3 }, effectDesc: "勇者HP -200，气力 -120，恐惧3回合（攻击·防御 -30%），侵略进度 -20%" },
    30: { name: "魔王威压",      description: "残留魔王气息令勇者战意全失",              price: 5000, effect: "break",       value: 100,  icon: "👑", unlockFacilityLv: { 8: 4 }, effectDesc: "勇者HP -300，气力 -200，全属性 -50%，恐惧4回合，侵略进度 -30%" },
};

// ========== 地下城事件定义 (DUNGEON_EVENT_DEFS) ==========
// 勇者探索地下城时触发的事件

window.DUNGEON_EVENT_DEFS = {
    // === 基础事件 ===
    1:  { name: "空房间",        description: "什么都没有发生",               type: "none",      weight: 12, icon: "🚪" },
    2:  { name: "发现补给",      description: "勇者找到了一些恢复道具",       type: "heal",      weight: 8,  icon: "🧪", value: 200 },
    3:  { name: "触发陷阱",      description: "古老的机关被触发了",           type: "damage",    weight: 10, icon: "⚙️", value: 100 },
    4:  { name: "低级魔物",      description: "一只弱小的魔物出现了",         type: "combat",    weight: 15, icon: "🐀", value: 1 },
    5:  { name: "精神污染",      description: "地下城的魔力侵蚀勇者",         type: "debuff",    weight: 6,  icon: "💀", value: 10 },
    6:  { name: "宝箱",          description: "发现一个上锁的宝箱",           type: "treasure",  weight: 5,  icon: "📦", value: 500 },

    // === 御敌策略触发事件 ===
    7:  { name: "策略发动",      description: "御敌策略被触发了！",           type: "strategy",  weight: 20, icon: "🛡️" },

    // === 需要设施解锁的事件 ===
    8:  { name: "宝藏密室",      description: "发现隐藏的宝库！",             type: "treasure",  weight: 3,  icon: "💎", value: 1500, requireFacility: { 2: 1 } },
    9:  { name: "遭遇精英",      description: "强大的精英魔物挡在面前",       type: "combat",    weight: 5,  icon: "👺", value: 3,   requireFacility: { 4: 2 } },
    10: { name: "囚禁室",        description: "发现被关押的前任勇者",         type: "rescue",    weight: 2,  icon: "🗝️", requireFacility: { 6: 1 } },
    11: { name: "古代遗迹",      description: "墙壁上刻着失传的魔法",         type: "learn",     weight: 3,  icon: "📜", requireFacility: { 8: 2 } },
    12: { name: "深渊入口",      description: "通向更深层的恐怖入口",         type: "depth",     weight: 2,  icon: "🌀", requireFacility: { 9: 2 } },
    13: { name: "迷途治疗师",    description: "一位流浪治疗师愿意提供帮助",   type: "healer",    weight: 5,  icon: "💊", value: 30 },
    14: { name: "诅咒之泉",      description: "被污染的泉水散发着不祥气息",   type: "curse",     weight: 3,  icon: "🌑", value: 20 },
    15: { name: "媚药雾气",      description: "粉红色的迷雾弥漫在空气中",     type: "aphrodisiac", weight: 3, icon: "💕", value: 25 },
};

// ========== 地下城层定义 (DUNGEON_FLOOR_DEFS) ==========
// 10层地下城，每层3级升级

window.DUNGEON_FLOOR_DEFS = {
    1: {
        name: "幽暗洞穴",
        theme: "洞穴",
        description: "魔王城最外层的天然洞穴，昏暗潮湿，钟乳石林立",
        icon: "🕳️",
        bgClass: "floor-cave",
        upgradeCost: [1000, 2500, 5000],
        upgrades: [
            { name: "潮湿雾气",  description: "洞穴中弥漫的湿气削弱勇者行动力",   effect: "hero_spd_down",  value: 10 },
            { name: "落石机关",  description: "随机落石增加勇者受到伤害的概率",   effect: "damage_chance",  value: 15 },
            { name: "洞穴战士",  description: "洞穴中训练的奴隶战士攻防+10%",     effect: "slave_buff",     value: 10 },
        ]
    },
    2: {
        name: "翡翠洞窟",
        theme: "洞穴+绿地",
        description: "洞穴深处出现奇异的发光苔藓与地下植物，散发着幽幽绿光",
        icon: "🌿",
        bgClass: "floor-green",
        upgradeCost: [1500, 3500, 7000],
        upgrades: [
            { name: "毒雾弥漫",  description: "有毒孢子削弱勇者耐力",             effect: "hero_sta_down",  value: 15 },
            { name: "毒藤缠绕",  description: "地面毒藤增加勇者被束缚概率",       effect: "bind_chance",    value: 20 },
            { name: "绿地精灵",  description: "受植物精化影响的奴隶速度+15%",     effect: "slave_spd",      value: 15 },
        ]
    },
    3: {
        name: "腐沼雨林",
        theme: "雨林+沼泽",
        description: "地下积水形成沼泽，巨大的菌菇与蕨类植物遮天蔽日",
        icon: "🍄",
        bgClass: "floor-swamp",
        upgradeCost: [2000, 5000, 10000],
        upgrades: [
            { name: "暴雨泥泞",  description: "持续暴雨降低勇者移速",             effect: "hero_spd_down",  value: 20 },
            { name: "瘴气中毒",  description: "有毒瘴气使勇者持续损失体力",       effect: "poison_dot",     value: 25 },
            { name: "沼泽魔物",  description: "沼泽中异化的奴隶战士HP+20%",       effect: "slave_hp",       value: 20 },
        ]
    },
    4: {
        name: "霜皑冰原",
        theme: "冰原+高山",
        description: "地下深处的极寒地带，冰柱如林，地面覆盖着永不融化的霜雪",
        icon: "❄️",
        bgClass: "floor-ice",
        upgradeCost: [3000, 7000, 14000],
        upgrades: [
            { name: "暴风雪",    description: "刺骨寒风削弱勇者攻击力",           effect: "hero_atk_down",  value: 15 },
            { name: "冰裂雪崩",  description: "冰层碎裂增加勇者坠落受伤概率",     effect: "damage_chance",  value: 25 },
            { name: "冰原战士",  description: "冰原训练的奴隶获得冰抗性+25%",     effect: "slave_ice_res",  value: 25 },
        ]
    },
    5: {
        name: "熔火深渊",
        theme: "火山+岩浆",
        description: "地下火山口，岩浆河流纵横，空气中弥漫着硫磺的刺鼻气味",
        icon: "🌋",
        bgClass: "floor-volcano",
        upgradeCost: [4000, 10000, 20000],
        upgrades: [
            { name: "热浪灼烧",  description: "持续高温使勇者持续损失体力",       effect: "burn_dot",       value: 20 },
            { name: "岩浆喷发",  description: "随机岩浆喷发造成大量伤害",         effect: "damage_chance",  value: 30 },
            { name: "火元素使",  description: "火元素奴隶火焰伤害+30%",           effect: "slave_fire_dmg", value: 30 },
        ]
    },
    6: {
        name: "幻梦镜界",
        theme: "魔法幻境",
        description: "由古老魔法创造的扭曲空间，现实与幻觉交织，方向感完全失效",
        icon: "🔮",
        bgClass: "floor-mirror",
        upgradeCost: [5000, 12000, 25000],
        upgrades: [
            { name: "现实扭曲",  description: "空间扭曲使勇者命中率下降",         effect: "hero_hit_down",  value: 20 },
            { name: "精神侵蚀",  description: "幻觉增加勇者混乱与恐惧概率",       effect: "mental_chance",  value: 25 },
            { name: "幻术师",    description: "幻境中训练的奴隶闪避+35%",         effect: "slave_dodge",    value: 35 },
        ]
    },
    7: {
        name: "死寂沙海",
        theme: "沙漠",
        description: "地下干涸的古海床，无边无际的沙海，隐藏着无数古代遗骸",
        icon: "🏜️",
        bgClass: "floor-desert",
        upgradeCost: [6000, 15000, 30000],
        upgrades: [
            { name: "烈日暴晒",  description: "地下异常高温削弱勇者防御",         effect: "hero_def_down",  value: 20 },
            { name: "沙暴掩埋",  description: "沙暴增加勇者迷失与窒息概率",       effect: "trap_chance",    value: 30 },
            { name: "沙漠刺客",  description: "沙漠潜行者暴击率+40%",             effect: "slave_crit",     value: 40 },
        ]
    },
    8: {
        name: "地下王城",
        theme: "地下宫殿",
        description: "古代地下王国的遗迹，宏伟的石柱与雕刻诉说着逝去的辉煌",
        icon: "🏛️",
        bgClass: "floor-palace",
        upgradeCost: [8000, 20000, 40000],
        upgrades: [
            { name: "幽暗压抑",  description: "宫殿阴森氛围削弱勇者精神",         effect: "hero_mp_down",   value: 25 },
            { name: "古代机关",  description: "远古机关增加各种陷阱触发概率",     effect: "trap_chance",    value: 35 },
            { name: "宫殿守卫",  description: "古代仪式强化的奴隶防御+45%",       effect: "slave_def",      value: 45 },
        ]
    },
    9: {
        name: "狂风苔原",
        theme: "苔原",
        description: "接近地表的冰冷苔原，永不停歇的狂风裹挟着冰晶与碎石",
        icon: "🌨️",
        bgClass: "floor-tundra",
        upgradeCost: [10000, 25000, 50000],
        upgrades: [
            { name: "飓风呼啸",  description: "狂风削弱勇者稳定性与命中",         effect: "hero_hit_down",  value: 25 },
            { name: "极寒冻结",  description: "极寒增加勇者被冻结概率",           effect: "freeze_chance",  value: 30 },
            { name: "风暴战士",  description: "风暴中历练的奴隶攻击+50%",         effect: "slave_atk",      value: 50 },
        ]
    },
    10: {
        name: "魔王宫殿",
        theme: "魔王宫",
        description: "魔王居住的核心殿堂，黑暗魔力的源泉，充斥着压倒性的威压",
        icon: "👑",
        bgClass: "floor-throne",
        upgradeCost: [15000, 35000, 70000],
        upgrades: [
            { name: "魔王威压",  description: "魔王气息使入侵者全属性下降",       effect: "hero_all_down",  value: 20 },
            { name: "黑暗侵蚀",  description: "纯粹黑暗增加勇者崩溃概率",         effect: "break_chance",   value: 40 },
            { name: "魔王亲卫",  description: "魔王直属亲卫队全属性+60%",         effect: "slave_all",      value: 60 },
        ]
    }
};

// ========== 基础商店商品（开局可购买）==========
window.BASIC_SHOP_ITEMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 23, 30, 32, 33, 34, 35, 36, 40, 50, 70];


// ========== 勇者职业定义 ==========
// id: 对应 talent ID (新增 211 战士, 212 魔法师)
// baseStats: 基础属性修正系数 (hp, mp, atk, def, spd)
// skills: [常规技能1, 常规技能2, 专属技能]
window.HERO_CLASS_DEFS = {
    211: {
        name: "战士",
        talentId: 211,
        desc: "以压倒性的力量粉碎敌人",
        baseStats: { hp: 1.3, mp: 0.8, atk: 1.25, def: 1.1, spd: 0.9 },
        skills: ["power_strike", "war_cry", "berserk"],
        ai: { aggressive: 0.7, defensive: 0.2, support: 0.1 }
    },
    212: {
        name: "魔法师",
        talentId: 212,
        desc: "操控元素之力的奥术大师",
        baseStats: { hp: 0.8, mp: 1.5, atk: 1.2, def: 0.8, spd: 1.0 },
        skills: ["fireball", "mana_shield", "meteor"],
        ai: { aggressive: 0.6, defensive: 0.2, support: 0.2 }
    },
    202: {
        name: "神官",
        talentId: 202,
        desc: "以神圣之光治愈与守护同伴",
        baseStats: { hp: 1.0, mp: 1.3, atk: 0.8, def: 1.1, spd: 0.9 },
        skills: ["heal", "holy_light", "mass_resurrect"],
        ai: { aggressive: 0.1, defensive: 0.4, support: 0.5 }
    },
    203: {
        name: "盗贼",
        talentId: 203,
        desc: "在阴影中收割生命的暗杀者",
        baseStats: { hp: 0.9, mp: 1.0, atk: 1.15, def: 0.8, spd: 1.3 },
        skills: ["backstab", "evasion", "assassinate"],
        ai: { aggressive: 0.6, defensive: 0.2, support: 0.2 }
    },
    204: {
        name: "骑士",
        talentId: 204,
        desc: "以钢铁意志守护同伴的壁垒",
        baseStats: { hp: 1.2, mp: 0.9, atk: 1.0, def: 1.3, spd: 0.8 },
        skills: ["shield_bash", "guard", "aegis"],
        ai: { aggressive: 0.3, defensive: 0.5, support: 0.2 }
    },
    205: {
        name: "炼金术士",
        talentId: 205,
        desc: "以科学与魔法调制毁灭之力",
        baseStats: { hp: 0.9, mp: 1.2, atk: 1.1, def: 0.9, spd: 1.0 },
        skills: ["throw_potion", "poison_mist", "big_bang"],
        ai: { aggressive: 0.5, defensive: 0.2, support: 0.3 }
    },
    206: {
        name: "游侠",
        talentId: 206,
        desc: "百步穿杨的荒野猎手",
        baseStats: { hp: 1.0, mp: 1.0, atk: 1.15, def: 0.9, spd: 1.15 },
        skills: ["rapid_shot", "trap", "arrow_rain"],
        ai: { aggressive: 0.5, defensive: 0.3, support: 0.2 }
    },
    207: {
        name: "舞者",
        talentId: 207,
        desc: "以魅惑之舞扰乱战场的妖精",
        baseStats: { hp: 0.9, mp: 1.1, atk: 1.0, def: 0.9, spd: 1.2 },
        skills: ["inspire", "slow_dance", "finale"],
        ai: { aggressive: 0.2, defensive: 0.3, support: 0.5 }
    },
    209: {
        name: "巫女",
        talentId: 209,
        desc: "沟通神明、净化污秽的祭祀者",
        baseStats: { hp: 0.9, mp: 1.3, atk: 0.9, def: 1.0, spd: 1.0 },
        skills: ["exorcism", "seal", "kagura"],
        ai: { aggressive: 0.2, defensive: 0.4, support: 0.4 }
    },
    210: {
        name: "枪兵",
        talentId: 210,
        desc: "以长枪贯穿一切防线的先锋",
        baseStats: { hp: 1.1, mp: 0.9, atk: 1.2, def: 1.0, spd: 1.0 },
        skills: ["pierce", "sweep", "dragon_lance"],
        ai: { aggressive: 0.6, defensive: 0.3, support: 0.1 }
    }
};

// 勇者职业随机池
window.HERO_CLASS_POOL = [211, 212, 202, 203, 204, 205, 206, 207, 209, 210];

// ========== 勇者技能定义 ==========
// effectType:
//   damage:    直接伤害 (power + level*scale)
//   heal:      治疗 (power + level*scale)
//   buff_atk:  攻击增益
//   buff_def:  防御增益
//   buff_spd:  速度增益
//   debuff_atk: 攻击减益
//   debuff_def: 防御减益
//   dot:       持续伤害
//   cleanse:   净化异常
//   stun:      眩晕(无法行动)
//   lifesteal: 吸血
//   counter:   反击
//   aoe:       范围攻击
window.HERO_SKILL_DEFS = {
    // === 战士 ===
    power_strike: {
        name: "猛击", type: "active", effectType: "damage",
        power: 50, scale: 2.0, cost: 10, target: "enemy",
        description: "用全力一击造成高额物理伤害"
    },
    war_cry: {
        name: "战吼", type: "active", effectType: "buff_atk",
        power: 20, scale: 0.5, cost: 15, target: "self", duration: 3,
        description: "怒吼提升自身攻击力"
    },
    berserk: {
        name: "狂暴", type: "active", effectType: "berserk",
        power: 40, scale: 1.0, cost: 25, target: "self", duration: 3,
        description: "【专属】以防御为代价大幅提升攻击力"
    },

    // === 魔法师 ===
    fireball: {
        name: "火球术", type: "active", effectType: "damage",
        power: 60, scale: 2.5, cost: 15, target: "enemy",
        description: "发射炽热火球，高威力魔法伤害"
    },
    mana_shield: {
        name: "魔力护盾", type: "active", effectType: "buff_def",
        power: 30, scale: 1.0, cost: 20, target: "self", duration: 3,
        description: "以魔力构筑护盾提升防御"
    },
    meteor: {
        name: "陨石术", type: "active", effectType: "aoe",
        power: 80, scale: 3.0, cost: 40, target: "all_enemies",
        description: "【专属】召唤陨石轰击全体敌人"
    },

    // === 神官 ===
    heal: {
        name: "治疗术", type: "active", effectType: "heal",
        power: 40, scale: 2.0, cost: 15, target: "ally",
        description: "以神圣之力恢复目标HP"
    },
    holy_light: {
        name: "神圣之光", type: "active", effectType: "damage",
        power: 35, scale: 1.5, cost: 15, target: "enemy",
        description: "以神圣光芒灼烧敌人"
    },
    mass_resurrect: {
        name: "群体复苏", type: "active", effectType: "mass_heal",
        power: 30, scale: 1.5, cost: 35, target: "all_allies",
        description: "【专属】以神力恢复全体同伴HP"
    },

    // === 盗贼 ===
    backstab: {
        name: "背刺", type: "active", effectType: "crit_damage",
        power: 40, scale: 2.0, cost: 10, target: "enemy",
        description: "从背后突袭，高概率暴击"
    },
    evasion: {
        name: "闪避", type: "active", effectType: "buff_spd",
        power: 25, scale: 0.8, cost: 10, target: "self", duration: 2,
        description: "提升闪避率与速度"
    },
    assassinate: {
        name: "暗杀", type: "active", effectType: "execute",
        power: 100, scale: 4.0, cost: 30, target: "enemy",
        description: "【专属】对低HP目标造成即死级伤害"
    },

    // === 骑士 ===
    shield_bash: {
        name: "盾击", type: "active", effectType: "damage",
        power: 30, scale: 1.5, cost: 10, target: "enemy",
        description: "以盾牌猛击敌人"
    },
    guard: {
        name: "守护", type: "active", effectType: "buff_def",
        power: 35, scale: 1.0, cost: 15, target: "self", duration: 3,
        description: "大幅强化自身防御"
    },
    aegis: {
        name: "圣盾", type: "active", effectType: "invincible",
        power: 0, scale: 0, cost: 30, target: "self", duration: 1,
        description: "【专属】一回合内免疫所有伤害"
    },

    // === 炼金术士 ===
    throw_potion: {
        name: "投掷药水", type: "active", effectType: "damage",
        power: 35, scale: 1.8, cost: 10, target: "enemy",
        description: "向敌人投掷爆炸性药水"
    },
    poison_mist: {
        name: "毒雾", type: "active", effectType: "dot",
        power: 15, scale: 0.5, cost: 15, target: "enemy", duration: 3,
        description: "释放毒雾使敌人中毒"
    },
    big_bang: {
        name: "大爆炸", type: "active", effectType: "aoe",
        power: 70, scale: 2.5, cost: 35, target: "all_enemies",
        description: "【专属】引发炼金爆炸攻击全体"
    },

    // === 游侠 ===
    rapid_shot: {
        name: "连射", type: "active", effectType: "multi_damage",
        power: 25, scale: 1.2, cost: 12, target: "enemy", hits: 2,
        description: "连续射出两箭"
    },
    trap: {
        name: "陷阱", type: "active", effectType: "debuff_spd",
        power: 20, scale: 0.5, cost: 10, target: "enemy", duration: 3,
        description: "布置陷阱降低敌人速度"
    },
    arrow_rain: {
        name: "箭雨", type: "active", effectType: "aoe",
        power: 45, scale: 1.8, cost: 25, target: "all_enemies",
        description: "【专属】向全体敌人射出箭雨"
    },

    // === 舞者 ===
    inspire: {
        name: "鼓舞", type: "active", effectType: "buff_atk",
        power: 15, scale: 0.5, cost: 12, target: "all_allies", duration: 3,
        description: "以舞蹈激励同伴提升攻击"
    },
    slow_dance: {
        name: "迟缓之舞", type: "active", effectType: "debuff_spd",
        power: 20, scale: 0.5, cost: 12, target: "enemy", duration: 3,
        description: "以舞蹈降低敌人速度"
    },
    finale: {
        name: "终焉之舞", type: "active", effectType: "debuff_all",
        power: 25, scale: 1.0, cost: 30, target: "all_enemies", duration: 2,
        description: "【专属】以禁忌之舞大幅降低全体敌人全属性"
    },

    // === 巫女 ===
    exorcism: {
        name: "驱邪", type: "active", effectType: "cleanse",
        power: 0, scale: 0, cost: 15, target: "ally",
        description: "净化目标的一个异常状态"
    },
    seal: {
        name: "封印", type: "active", effectType: "seal",
        power: 20, scale: 0.5, cost: 15, target: "enemy", duration: 2,
        description: "封印敌人技能"
    },
    kagura: {
        name: "神乐", type: "active", effectType: "buff_all",
        power: 20, scale: 0.8, cost: 30, target: "all_allies", duration: 3,
        description: "【专属】以神乐提升全体同伴全属性"
    },

    // === 枪兵 ===
    pierce: {
        name: "突刺", type: "active", effectType: "pierce",
        power: 45, scale: 2.0, cost: 12, target: "enemy",
        description: "贯穿防御的突刺攻击"
    },
    sweep: {
        name: "横扫", type: "active", effectType: "damage",
        power: 30, scale: 1.5, cost: 10, target: "enemy",
        description: "长枪横扫攻击"
    },
    dragon_lance: {
        name: "龙枪", type: "active", effectType: "execute_pierce",
        power: 90, scale: 3.5, cost: 30, target: "enemy",
        description: "【专属】召唤龙之力进行毁灭性突刺"
    }
};

// ========== 异常状态定义 ==========
// 使用 cflag[CFLAGS.HERO_PREVIOUS] 作为位掩码存储异常状态
// 使用 cflag[921-930] 存储各状态的持续回合
window.STATUS_AILMENT_DEFS = {
    curse: {
        id: 0, name: "诅咒", bit: 1,
        desc: "被黑暗力量缠绕，全属性大幅下降。只能通过城镇神官或特殊道具解除。",
        effect: { atkMod: -0.20, defMod: -0.20, spdMod: -0.20 },
        dot: { type: "none" },
        actionBlock: 0,
        cureMethods: ["town_priest", "special_item", "town_rest"],
        cureChance: { camp: 0, healer_event: 0, ally_healer: 0, town_rest: 1.0 }
    },
    weak: {
        id: 1, name: "虚弱", bit: 2,
        desc: "体力透支，攻击力与防御力下降。",
        effect: { atkMod: -0.30, defMod: -0.30, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.5, healer_event: 0.8, ally_healer: 0.6 }
    },
    burn: {
        id: 2, name: "烧伤", bit: 4,
        desc: "身体被火焰灼烧，每回合损失HP。",
        effect: { atkMod: -0.10, defMod: 0, spdMod: 0 },
        dot: { type: "hp_percent", value: 0.05 },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.4, healer_event: 0.7, ally_healer: 0.5 }
    },
    aphrodisiac: {
        id: 3, name: "春药中毒", bit: 8,
        desc: "体内充满媚药毒素，每回合损失MP，攻击变得无力。",
        effect: { atkMod: -0.15, defMod: 0, spdMod: -0.10 },
        dot: { type: "mp_percent", value: 0.10 },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.3, healer_event: 0.6, ally_healer: 0.4 }
    },
    paralysis: {
        id: 4, name: "麻痹", bit: 16,
        desc: "身体被电流麻痹，有概率无法行动。",
        effect: { atkMod: -0.20, defMod: -0.10, spdMod: -0.30 },
        dot: { type: "none" },
        actionBlock: 0.50,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.3, healer_event: 0.7, ally_healer: 0.5 }
    },
    freeze: {
        id: 5, name: "冰冻", bit: 32,
        desc: "身体被寒冰冻结，速度大幅下降，有概率无法行动。",
        effect: { atkMod: -0.10, defMod: 0, spdMod: -0.50 },
        dot: { type: "none" },
        actionBlock: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.4, healer_event: 0.8, ally_healer: 0.6 }
    },
    poison: {
        id: 6, name: "中毒", bit: 64,
        desc: "身中剧毒，每回合持续损失HP。",
        effect: { atkMod: -0.10, defMod: -0.10, spdMod: 0 },
        dot: { type: "hp_percent", value: 0.03 },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.5, healer_event: 0.9, ally_healer: 0.7 }
    },
    fear: {
        id: 7, name: "恐惧", bit: 128,
        desc: "内心被恐惧吞噬，攻击力大幅下降，有概率逃跑。",
        effect: { atkMod: -0.40, defMod: -0.20, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.4, healer_event: 0.7, ally_healer: 0.5 }
    },
    confusion: {
        id: 8, name: "混乱", bit: 256,
        desc: "神智混乱，有概率攻击同伴。",
        effect: { atkMod: 0, defMod: -0.20, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0.30,
        friendlyFire: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.3, healer_event: 0.6, ally_healer: 0.5 }
    },
    charm: {
        id: 9, name: "魅惑", bit: 512,
        desc: "被魅惑之力控制，有概率为敌方治疗或攻击同伴。",
        effect: { atkMod: -0.20, defMod: -0.20, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0.30,
        friendlyFire: 0.30,
        healEnemy: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.2, healer_event: 0.5, ally_healer: 0.4 }
    },
    severe_injury: {
        id: 10, name: "重伤", bit: 1024,
        desc: "战斗中受到重创，所有战斗属性大幅下降。只能通过城镇休息解除。",
        effect: { atkMod: -0.50, defMod: -0.50, spdMod: -0.50, hpMod: -0.50, mpMod: -0.50 },
        dot: { type: "none" },
        actionBlock: 0,
        cureMethods: ["town_rest"],
        cureChance: { town_rest: 1.0 }
    }
};

// 异常状态位掩码 → ID 映射
window.STATUS_AILMENT_BITS = {};
for (const key in window.STATUS_AILMENT_DEFS) {
    const s = window.STATUS_AILMENT_DEFS[key];
    window.STATUS_AILMENT_BITS[s.bit] = key;
}

// 异常状态持续回合存储的 cflag 索引
window.STATUS_AILMENT_TURN_CFIDS = {
    curse: 921, weak: 922, burn: 923, aphrodisiac: 924,
    paralysis: 925, freeze: 926, poison: 927, fear: 928,
    confusion: 929, charm: 930, severe_injury: 931
};

// 治疗职业列表（V5.0 动态从 CLASS_DEFS 中筛选）
window.HEALER_CLASS_IDS = (window.CLASS_DEFS ? Object.keys(window.CLASS_DEFS).map(Number).filter(id => {
    const role = window.CLASS_DEFS[id].role;
    return role && (role.includes('healer') || role.includes('heal'));
}) : [202, 209]);

// ========== 勇者入侵配置 ==========
window.HERO_INVASION_CONFIG = {
    intervalMin: 5,
    intervalMax: 10,
    powerScale: 0.05,
    defaultGenderRatio: 90, // 默认女性比例 (%)
    heroTemplates: {
        male: {
            namePrefix: "",
            namePools: {
                human: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["亚瑟", "罗兰", "加百列", "塞巴斯蒂安", "马克西米利安", "弗雷德里克", "利奥波德", "康拉德", "狄奥多西", "瓦伦丁", "奥托", "卡斯帕", "埃米尔", "雨果", "费利克斯", "卢卡斯", "马蒂亚斯", "尼古拉斯", "奥斯卡", "帕特里克", "昆汀", "拉斐尔", "斯特凡", "西奥多", "乌尔里希", "维克多", "威廉", "克萨维尔", "伊扎克", "阿德里安", "巴纳巴斯", "克里斯托弗", "多米尼克", "埃德蒙", "弗洛里安", "杰拉德", "亨利克", "伊格纳茨", "朱利安", "卡西米尔", "莱纳德", "莫里茨", "诺伯特", "菲利普", "雷蒙德", "西格弗里德", "提图斯", "乌尔班", "文森特", "沃尔夫拉姆"]
                },
                elf: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["瑟兰迪尔", "埃拉诺", "格洛芬德尔", "凯勒鹏", "芬罗德", "欧洛芬", "埃克塞理安", "奇尔丹", "埃斯泰尔", "阿拉贡", "莱戈拉斯", "哈尔迪尔", "贝烈瑞安德", "图奥", "图林", "胡林", "胡奥", "费艾诺", "芬国昐", "芬巩", "特刚", "埃克塞理安", "葛罗芬戴尔", "格劳龙", "格威希昂", "兰巴斯", "梅利安", "美丽安", "辛葛", "迪奥", "埃路林", "埃路瑞安", "埃尔隆德", "埃尔洛斯", "凯兰崔尔", "凯勒布理鹏", "安纳塔", "索伦", "萨鲁曼", "甘道夫", "瑞达加斯特", "阿拉塔尔", "帕蓝多", "欧罗林", "库路耐尔", "阿温迪尔", "埃尔达", "凡雅", "诺多", "帖勒瑞"]
                },
                dwarf: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["索林", "巴林", "德瓦林", "菲力", "奇力", "欧因", "格罗因", "比弗", "波弗", "邦弗", "多瑞", "诺瑞", "欧瑞", "葛罗音", "金雳", "铁足", "戴因", "索尔", "瑟莱因", "纳因", "法拉", "吉姆利", "格罗姆", "托尔加", "卡扎克", "杜加", "布鲁诺", "莫拉丁", "克兰格", "巴伦德", "杜林", "都林", "米姆", "阿扎格哈尔", "贝烈戈斯特", "诺格罗德", "铁丘陵", "孤山", "灰色山脉", "迷雾山脉", "铁山脉", "蓝色山脉", "红色山脉", "黄色山脉", "白色山脉", "黑色山脉", "沸腾之炉", "永恒熔炉", "火焰深渊", "大地之心"]
                },
                orc: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["格罗姆", "乌尔扎克", "卡加斯", "基尔罗格", "古尔丹", "耐奥祖", "萨尔", "杜隆坦", "奥格瑞姆", "雷克萨", "加尔鲁什", "纳兹戈林", "伊崔格", "德雷克塔尔", "萨鲁法尔", "布洛克斯", "瓦罗克", "格罗玛什", "塔加尔", "洛卡", "莫格", "祖尔", "曼祖", "贾拉克", "达喀尔", "卡洛克", "古尔", "科格", "格罗什", "乌尔索克", "莫格洛克", "塔兹丁苟", "祖尔金", "洛克汗", "萨穆罗", "卡格", "罗格", "穆戈尔", "克罗格", "古拉克", "纳兹格雷尔", "卡德拉克", "马古", "布鲁塔", "凯罗格", "戈尔", "拉克", "杜尔", "萨尔克", "纳克"]
                }
            }
        },
        female: {
            namePrefix: "",
            namePools: {
                human: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["伊莎贝拉", "维多利亚", "凯瑟琳", "伊丽莎白", "玛格丽特", "埃莉诺", "阿德莱德", "夏洛特", "艾米莉", "安娜斯塔西娅", "索菲亚", "奥利维亚", "格蕾丝", "费奥多拉", "海伦娜", "朱丽叶", "罗莎琳德", "塞西莉亚", "奥菲莉亚", "佩内洛普", "比阿特丽斯", "克拉拉", "达芙妮", "埃斯特拉", "弗洛伦萨", "加布里埃拉", "亨丽埃塔", "伊莫金", "约瑟芬", "露西尔", "米尔德丽德", "娜塔莉", "奥克塔维娅", "普里西拉", "昆妮", "丽贝卡", "塞雷娜", "塔比莎", "厄休拉", "维奥莱特", "温妮弗雷德", "泽诺比亚", "雅辛塔", "阿斯特丽德", "贝拉特里克斯", "卡桑德拉", "黛安娜", "欧律狄刻", "芙蕾雅", "盖娅"]
                },
                elf: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["阿尔玟", "塔瑞尔", "露西恩", "伊缀尔", "芬杜伊拉丝", "奈尔贝诺", "埃兰迪尔", "埃尔汶", "凯兰崔尔", "亚玟", "阿尔温", "埃斯泰尔", "伊欧文", "伊欧玟", "洛丝罗瑞恩", "加拉德瑞尔", "阿尔费琳", "芬罗德", "芬杜伊拉丝", "希斯路", "米瑞尔", "茵迪丝", "奈丹妮尔", "阿瑞蒂尔", "伊欧尔", "埃伦弥瑞", "安娜伊尔", "奈米尔", "宁洛丝", "雅凡娜", "瓦娜", "妮莎", "埃丝缇", "薇瑞", "伊安斯", "奈莎", "欧莉", "雅瑞恩", "提里安", "希尔瓦", "雅凡娜", "涅娜", "埃丝缇", "薇瑞", "伊尔玛瑞", "雅瑞恩", "阿尔玟", "暮星", "晓星", "璨星"]
                },
                dwarf: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["迪丝", "希尔迪", "布里", "博菲", "迪斯", "法丽", "格洛丽", "哈迪", "伊迪", "杰迪", "凯迪", "洛迪", "米迪", "尼迪", "奥迪", "皮迪", "奎迪", "鲁迪", "萨迪", "蒂迪", "乌迪", "维迪", "维迪", "赞迪", "艾迪", "贝拉", "茜拉", "黛拉", "埃拉", "菲拉", "吉拉", "赫拉", "伊拉", "吉拉", "基拉", "莉拉", "玛拉", "妮拉", "奥拉", "佩拉", "奎拉", "瑞拉", "萨拉", "提拉", "乌拉", "维拉", "维拉", "泽拉", "齐拉", "艾拉"]
                },
                orc: {
                    family: ["雷恩哈特","布莱克伍德","斯特林","瓦伦丁","圣克莱尔","费尔南德斯","杜兰德","韦伯","莫罗","勒鲁瓦","加尼耶","里希特","维兰德","埃德尔斯坦","蒙特福特","洛伦茨","贝尔纳","佩兰","克鲁格","马雷夏尔","科尔","格雷","怀特","布莱克","弗林特","斯诺","里弗斯","福雷斯特","斯通","希尔","布鲁克","格林","埃姆斯","佩恩","蔡斯","马什","索恩","戴克","沃尔什","纳什"],
                    nobleFamily: ["哈布斯堡","温莎","雷明顿","索尔兹伯里","埃斯特","法布里修斯","高蒂埃","卢瓦尔","莫里亚克","奥尔良","普罗斯特","坦普尔","乌尔苏斯","泽维尔","伊普西兰蒂","祖尔","容克","凯因","霍恩海姆","拉克鲁瓦"],
                    given: ["德拉卡", "阿格拉", "迦罗娜", "盖亚拉", "阿格娜", "科尔拉", "加尔维", "科拉", "玛卡", "萨尔加", "塔拉", "乌尔瓦", "瓦拉", "祖尔玛", "德拉", "加兹拉", "卡兹拉", "莫格拉", "纳格拉", "拉格拉", "塔格拉", "瓦格拉", "祖格拉", "希尔瓦拉", "莫格娜", "塔尔加", "瓦拉娜", "祖拉卡", "德拉加", "萨尔娜", "塔兹拉", "乌尔加", "克罗加", "莫加", "萨加", "瓦加", "祖加", "玛加", "卡加", "拉加", "纳加", "马加", "达加", "阿加", "布加", "加加", "塔加", "瓦加", "祖加", "玛尔加"]
                }
            }
        }
    }
};


// ========== 精英怪物类型定义 (V6.0) ==========
// 首领 = 该层最高等级(Lv.N*20)同级战力的 1.1 倍
// 守关Boss = 该层最高等级同级战力的 1.2 倍
window.ELITE_TYPE_DEFS = {
    normal: {
        label: "普通",
        hpMul: 1.0, atkMul: 1.0, defMul: 1.0, spdMul: 1.0,
        dropRarityBonus: 0, icon: "", namePrefix: "", descSuffix: ""
    },
    chief: {
        label: "首领",
        hpMul: 1.0, atkMul: 1.1, defMul: 1.1, spdMul: 1.0,
        dropRarityBonus: 1, icon: "👑", namePrefix: "首领·", descSuffix: "【首领级】"
    },
    overlord: {
        label: "守关Boss",
        hpMul: 1.2, atkMul: 1.2, defMul: 1.2, spdMul: 0.9,
        dropRarityBonus: 2, icon: "💀", namePrefix: "霸主·", descSuffix: "【霸主级】"
    }
};

// ========== 晋升徽章定义 (V6.0 等级锁系统) ==========
// 每20级一道锁，击败对应层守关Boss后从宝箱获取
window.BADGE_DEFS = {
    20:  { id: 9020, name: "20级晋升徽章", icon: "🔰", desc: "击败第1层守关Boss的证明，使用后解锁Lv.21升级上限", sellPrice: 20000 },
    40:  { id: 9040, name: "40级晋升徽章", icon: "🔰", desc: "击败第2层守关Boss的证明", sellPrice: 40000 },
    60:  { id: 9060, name: "60级晋升徽章", icon: "🔰", desc: "击败第3层守关Boss的证明", sellPrice: 60000 },
    80:  { id: 9080, name: "80级晋升徽章", icon: "🔰", desc: "击败第4层守关Boss的证明", sellPrice: 80000 },
    100: { id: 9100, name: "100级晋升徽章", icon: "🔰", desc: "击败第5层守关Boss的证明", sellPrice: 100000 },
    120: { id: 9120, name: "120级晋升徽章", icon: "🔰", desc: "击败第6层守关Boss的证明", sellPrice: 120000 },
    140: { id: 9140, name: "140级晋升徽章", icon: "🔰", desc: "击败第7层守关Boss的证明", sellPrice: 140000 },
    160: { id: 9160, name: "160级晋升徽章", icon: "🔰", desc: "击败第8层守关Boss的证明", sellPrice: 160000 },
    180: { id: 9180, name: "180级晋升徽章", icon: "🔰", desc: "击败第9层守关Boss的证明", sellPrice: 180000 },
    200: { id: 9200, name: "200级晋升徽章", icon: "👑", desc: "地下城至高荣誉，击败第10层守关Boss的证明", sellPrice: 200000 , element: ['physical'] }
};

// 转职徽章
window.CLASS_CHANGE_BADGE_DEF = {
    id: 9100, name: "转职徽章", icon: "⚜️",
    desc: "守关Boss的稀有掉落，20级转职的必需品。高等级但仍未转职的勇者常为此苦恼。",
    sellPrice: 50000
};

// 等级锁配置
window.LEVEL_LOCK_CONFIG = {
    // lockLevel -> { requiredFloor: 需要击败的楼层, badgeId: 徽章ID }
    20:  { requiredFloor: 1,  badgeId: 9020 },
    40:  { requiredFloor: 2,  badgeId: 9040 },
    60:  { requiredFloor: 3,  badgeId: 9060 },
    80:  { requiredFloor: 4,  badgeId: 9080 },
    100: { requiredFloor: 5,  badgeId: 9100 },
    120: { requiredFloor: 6,  badgeId: 9120 },
    140: { requiredFloor: 7,  badgeId: 9140 },
    160: { requiredFloor: 8,  badgeId: 9160 },
    180: { requiredFloor: 9,  badgeId: 9180 },
    200: { requiredFloor: 10, badgeId: 9200 }
};

// ========== 楼层设施定义 ==========
// shop: 地下城商店 (2/4/6/8层, 40%处)
// spring: 回复泉水 (1-9层, 80%处)
// arena: 竞技场 (3/5/7层, 70%处)
window.FLOOR_FACILITY_DEFS = {
    shop: {
        name: "地下城商店",
        icon: "🏪",
        floors: [2, 4, 6, 8],
        progress: 40
    },
    spring: {
        name: "回复泉水",
        icon: "💧",
        floors: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        progress: 80
    },
    arena: {
        name: "竞技场",
        icon: "⚔️",
        floors: [3, 5, 7],
        progress: 70
    }
};

// ========== 勇者攻略目标定义 ==========
window.HERO_GOAL_DEFS = {
    defeat_master: {
        name: "讨伐魔王",
        desc: "他们的目标是击败魔王，终结黑暗统治。",
        icon: "⚔️",
        behaviorHint: " aggressively pushes forward",
        color: "#ff4444"
    },
    rescue_slave: {
        name: "拯救奴隶",
        desc: "他们听闻地下城囚禁着无辜之人，前来解救。",
        icon: "🕊️",
        behaviorHint: " searches for hidden passages",
        color: "#44aaff"
    },
    collect_treasure: {
        name: "收集宝藏",
        desc: "贪婪的目光盯着地下城深处的传说财宝。",
        icon: "💎",
        behaviorHint: " lingers around treasure rooms",
        color: "#ffaa00"
    },
    explore_abyss: {
        name: "探索深渊",
        desc: "为了追求真相与未知，他们勇闯最深层。",
        icon: "🔮",
        behaviorHint: " delves deeper without hesitation",
        color: "#aa44ff"
    },
    fame_glory: {
        name: "追求荣耀",
        desc: "为了名望与赞誉，他们需要一场惊天动地的胜利。",
        icon: "🏆",
        behaviorHint: " seeks out the strongest foes",
        color: "#ffdd44"
    }
};

// ========== 勇者冒险口号池（按目标分类） ==========
window.HERO_MOTTO_POOLS = {
    defeat_master: [
        "以光明之名，讨伐黑暗！",
        "魔王，你的末日到了！",
        "正义或许会迟到，但绝不会缺席！",
        "为了这片大陆，我必须前进！",
        "黑暗终将被驱散！",
        "讨伐魔王，是我毕生的使命！",
        "身后的万家灯火，是我唯一的退路。",
        "只要还有一口气，就绝不后退！",
        "邪不胜正，这是亘古不变的真理！",
        "今日，便是魔王的陨落之日！"
    ],
    rescue_slave: [
        "没有人应该被囚禁在黑暗中！",
        "我会带你们回家。",
        "正义不是口号，是行动。",
        "哪怕只有一线希望，我也不会放弃。",
        "每一个生命都值得被拯救。",
        "牢笼锁不住我，更锁不住希望。",
        "跟我走，我带你离开这里。",
        "黑暗中，我来成为那束光。",
        "不是为了荣耀，只是为了救人。",
        "自由的代价，我来承担。"
    ],
    collect_treasure: [
        "深渊之中必有重宝！",
        "富贵险中求，这次我押上性命。",
        "只要拿到那件宝物，这辈子就值了！",
        "风险越大，回报越高。",
        "我的眼睛能看穿一切伪装，包括宝藏。",
        "传说中的秘宝，就在这一层！",
        "为了金币，我可以赴汤蹈火。",
        "这趟买卖，稳赚不赔。",
        "如果死了，就当是为宝物殉葬。",
        "宝物在前，谁还管什么魔王？"
    ],
    explore_abyss: [
        "深渊在呼唤我……",
        "真相，往往藏在最黑暗的地方。",
        "我想看看，最底层到底有什么。",
        "人类的认知太渺小了，我要去触碰未知。",
        "恐惧源于无知，而我追求知识。",
        "这条路的尽头，一定有什么在等着我。",
        "历史学家会记住我的名字。",
        "不是为了战斗，是为了发现。",
        "古老的预言，必须由我来验证。",
        "越是危险的地方，越隐藏着真理。"
    ],
    fame_glory: [
        "我要让全世界记住我的名字！",
        "英雄？不，我要成为传说！",
        "只有站在顶点，才能被所有人仰望。",
        "这个时代，需要一个新的英雄。",
        "我的剑，将为我的名字而战！",
        "吟游诗人会传唱我的故事。",
        "不是每个人都能名垂青史，但我可以。",
        "荣耀即吾命！",
        "这一战，我要让所有人都看见。",
        "勇者？那只是开始，我要成为神話！"
    ]
};


// ========== 外观描述映射表 ==========
// 用于将 talent[300-314] 的数值转换为叙事性外观描述文本
window.APPEARANCE_DESC_DEFS = {
    hairColor: {
        1: "乌黑", 2: "深棕", 3: "亚麻", 4: "银白", 5: "火红",
        6: "天蓝", 7: "翠绿", 8: "紫罗兰", 9: "粉红", 10: "白金"
    },
    hairQuality: {
        1: "柔顺如丝", 2: "略显粗糙", 3: "自然蓬松", 4: "油亮光泽", 5: "干枯分叉"
    },
    hairLength: {
        1: "寸头", 2: "短发", 3: "及肩发", 4: "长发及腰", 5: "拖地长发"
    },
    hairStyle: {
        1: "直发", 2: "自然卷", 3: "大波浪", 4: "双马尾", 5: "单马尾",
        6: "包子头", 7: "麻花辫", 8: "散发", 9: "侧分刘海", 10: "齐刘海短发"
    },
    hasBangs: {
        1: "有齐刘海", 2: "斜刘海", 3: "中分", 4: "无刘海", 5: "碎发刘海"
    },
    eyeShape: {
        1: "杏眼", 2: "丹凤眼", 3: "桃花眼", 4: "圆眼", 5: "细长眼",
        6: "吊梢眼", 7: "下垂眼", 8: "猫眼", 9: "三白眼", 10: "眯眯眼"
    },
    eyeColor: {
        1: "漆黑", 2: "深褐", 3: "碧蓝", 4: "翠绿", 5: "琥珀",
        6: "血红", 7: "紫晶", 8: "银灰", 9: "金黄", 10: "异色瞳"
    },
    lipShape: {
        1: "樱桃小嘴", 2: "丰满厚唇", 3: "薄唇", 4: "嘴角上扬", 5: "唇珠明显"
    },
    bodyType: {
        1: "纤细苗条", 2: "匀称标准", 3: "丰腴柔美", 4: "健壮结实", 5: "娇小玲珑"
    },
    nippleType: {
        1: "淡粉小巧", 2: "蔷薇色", 3: "褐色", 4: "挺立敏感", 5: "内陷"
    },
    pubicHair: {
        1: "光滑无毛", 2: "稀疏细软", 3: "浓密卷曲", 4: "精心修剪", 5: "倒三角"
    },
    armpitHair: {
        1: "光滑", 2: "少许", 3: "浓密"
    },
    race: {
        1: "人类", 2: "精灵", 3: "兽人", 4: "矮人", 5: "魔族",
        6: "天使", 7: "龙人", 8: "海族", 9: "吸血鬼", 10: "恶魔混血"
    },
    raceFaction: {
        1: "圣光联邦", 2: "翡翠之冠", 3: "赤潮联盟", 4: "霜铁议会",
        5: "魔族", 6: "天界", 7: "龙族", 8: "深海", 9: "血族", 10: "混血者"
    }
};


// ========== 勇者委托池 ==========
window.COMMISSION_DEFS = {
    1: { name: "寻找失踪的勇者", type: "find_hero", description: "寻找在地下城失踪的{target}", rewardGold: 500, rewardFame: 2, icon: "🔍" },
    2: { name: "回收古代遗物", type: "find_item", description: "在{floor}层寻找古代遗物", rewardGold: 800, rewardFame: 3, icon: "🏺" },
    3: { name: "讨伐精英怪物", type: "defeat_elite", description: "击败{floor}层的精英怪物", rewardGold: 1000, rewardFame: 5, icon: "👹" },
    4: { name: "护送商队", type: "escort", description: "护送商队安全通过{floor}层", rewardGold: 600, rewardFame: 2, icon: "🐪" },
    5: { name: "调查异变", type: "investigate", description: "调查{floor}层出现的异常现象", rewardGold: 700, rewardFame: 3, icon: "🔮" }
};

// 委托道具池（find_item 用）
window.COMMISSION_ITEM_NAMES = [
    "古代石板", "失落宝珠", "龙鳞碎片", "魔导书残页", "精灵之泪",
    "矮人锻造锤", "海神三叉戟碎片", "吸血鬼獠牙", "天使羽毛", "混沌核心"
];

// ========== 勇者任务类型定义 ==========
window.HERO_TASK_TYPE_DEFS = {
    0: { name: "无任务", icon: "", desc: "" },
    1: { name: "讨伐地下城", icon: "⚔️", desc: "前往目标楼层击败关底Boss" },
    2: { name: "完成委托", icon: "📜", desc: "在城镇接取的委托任务" },
    3: { name: "回城恢复", icon: "🏥", desc: "返回城镇恢复伤势" },
    4: { name: "修炼", icon: "🧘", desc: "在城镇停留修炼，每天EXP+10%" },
    5: { name: "寻找真相", icon: "🔮", desc: "探索地下城寻找关于魔王的真相" }
};


// ========== 奴隶任务定义 ==========
window.SLAVE_TASK_DEFS = {
    1: { name: "讨伐勇者", icon: "⚔️", desc: "从指定楼层反向移动到第一层，途中击败并俘虏勇者", rewardMedal: true },
    2: { name: "潜伏", icon: "🎭", desc: "潜入勇者队伍，消耗其MP使其屈服投降", rewardMedal: true },
    3: { name: "袭击城镇", icon: "🔥", desc: "带领怪物攻击城镇，抓捕勇者并获得资源", rewardMedal: true }
};

// ========== 相性系统定义 ==========

// 种族相性基础值 (0-100)
window.RACE_AFFINITY = {
    1: 50,  // 人类 — 平衡
    2: 75,  // 精灵 — 自然/和谐
    3: 40,  // 兽人 — 野性/冲动
    4: 60,  // 矮人 — 坚韧/固执
    5: 20,  // 魔族 — 混沌/邪恶
    6: 85,  // 天使 — 光明/秩序
    7: 70,  // 龙人 — 高傲/力量
    8: 65,  // 海族 — 自由/流动
    9: 30,  // 吸血鬼 — 黑暗/孤独
    10: 25  // 恶魔混血 — 混沌/冲突
};

// 职业相性基础值 (0-100) — 使用 cflag[CFLAGS.HERO_CLASS] 的英雄职业ID
window.JOB_AFFINITY = {
    211: 60, // 吟游诗人
    212: 45, // 暗杀者
    213: 75, // 医者
    214: 65, // 舞娘
    202: 80, // 神官
    203: 35, // 盗贼
    204: 75, // 骑士
    205: 65, // 炼金术士
    206: 60, // 游侠
    207: 70, // 忍者(原舞者id被忍者使用)
    209: 78, // 巫女
    210: 58  // 枪兵
};

// 性格相性基础值 (0-100) — 主性格 talent[10]-talent[18]
window.PERSONALITY_AFFINITY = {
    10: 45,  // 胆怯
    11: 30,  // 反抗心
    12: 50,  // 刚强
    13: 70,  // 坦率
    14: 40,  // 傲慢
    15: 55,  // 高姿态
    16: 55,  // 低姿态
    17: 75,  // 老实
    18: 35,  // 傲娇
    // 次要性格
    160: 72, // 慈爱
    161: 50, // 自信
    162: 40, // 懦弱
    163: 60, // 高贵
    164: 72, // 冷静
    165: 30, // 叛逆
    166: 25, // 恶女
    167: 65, // 天真
    168: 60, // 感性
    169: 55, // 武人
    170: 35, // 孤独
    171: 50, // 愚钝
    172: 70, // 知性
    173: 75, // 庇护者
    175: 68  // 伶俐
};

// 关系等级定义
// level: 0=不死不休, 1=敌视, 2=点头之交(默认), 3=好感, 4=莫逆之交
window.AFFINITY_RELATION_DEFS = {
    0: { name: "不死不休", icon: "💀", color: "#ff3333", desc: "水火不容，见面就会厮杀" },
    1: { name: "敌视", icon: "😠", color: "#ff8844", desc: "互相看不顺眼，容易冲突" },
    2: { name: "点头之交", icon: "😐", color: "#aaaaaa", desc: "认识但关系平淡" },
    3: { name: "好感", icon: "😊", color: "#44ff88", desc: "相处融洽，愿意互相帮助" },
    4: { name: "莫逆之交", icon: "💕", color: "#ff44aa", desc: "生死之交，形影不离" }
};

// 相性差 -> 初始关系等级映射
window.AFFINITY_DIFF_RELATION = [
    { maxDiff: 10, level: 4 },   // |diff| <= 10: 莫逆之交
    { maxDiff: 25, level: 3 },   // |diff| <= 25: 好感
    { maxDiff: 45, level: 2 },   // |diff| <= 45: 点头之交
    { maxDiff: 65, level: 1 },   // |diff| <= 65: 敌视
    { maxDiff: 100, level: 0 }   // |diff| > 65: 不死不休
];

// 关系事件定义
window.RELATION_EVENT_DEFS = {
    // 变好事件
    help_combat: { name: "拔刀相助", icon: "⚔️", desc: "在战斗中挺身而出协助同伴", delta: 1 },
    defeat_elite: { name: "共度难关", icon: "🏆", desc: "一起击败了强大的精英敌人", delta: 1 },
    complete_quest: { name: "齐心协力", icon: "🤝", desc: "共同完成委托任务", delta: 1 },
    share_rest: { name: "同甘共苦", icon: "🏕️", desc: "一起露营休息时建立了友谊", delta: 1 },
    rescue: { name: "救命之恩", icon: "💊", desc: "在濒死时被同伴救下", delta: 2 },
    // 变差事件
    loot_dispute: { name: "分赃不均", icon: "💎", desc: "战利品分配发生争执", delta: -1 },
    reckless: { name: "一意孤行", icon: "🚫", desc: "不顾劝阻导致队伍陷入危机", delta: -1 },
    ignore_help: { name: "见死不救", icon: "🙈", desc: "对需要帮助的同伴置之不理", delta: -1 },
    betray: { name: "背叛", icon: "🔪", desc: "在战斗中背叛了同伴", delta: -2 },
    steal_loot: { name: "独吞宝物", icon: "👿", desc: "私自独占了珍贵的战利品", delta: -2 }
};


// ============================================
// V5.0 种族特长与分层职业系统
// ============================================

// ---------- 种族特长定义 ----------
window.RACE_TRAITS = {
  1: {
    name: "适应性",
    stats: { hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 },
    passiveId: "human_adaptability",
    affinity: {},
    weakness: {},
    element: ['none'],
    desc: "均衡发展的种族，可以胜任任何职业"
  },
  2: {
    name: "自然亲和",
    stats: { hp: 0.9, mp: 1.3, atk: 0.95, def: 0.9, spd: 1.15 },
    passiveId: "elf_nature",
    affinity: { nature: 1.25, light: 1.1 },
    weakness: { dark: 1.2, fire: 1.1 },
    element: ['wind'],
    desc: "魔力与速度出众，但体质脆弱。森林中速度+20%"
  },
  3: {
    name: "野性本能",
    stats: { hp: 1.2, mp: 0.8, atk: 1.15, def: 1.0, spd: 0.95 },
    passiveId: "orc_feral",
    affinity: { earth: 1.2 },
    weakness: { ice: 1.15 },
    element: ['earth'],
    desc: "体力与攻击力极强，HP<30%时攻击力+25%"
  },
  4: {
    name: "锻造大师",
    stats: { hp: 1.15, mp: 0.85, atk: 1.0, def: 1.2, spd: 0.8 },
    passiveId: "dwarf_forge",
    affinity: { earth: 1.25, fire: 1.1 },
    weakness: { nature: 1.15 },
    element: ['earth', 'fire'],
    desc: "防御力与耐久无人能及，对异常状态抗性+30%"
  },
  5: {
    name: "黑暗亲和",
    stats: { hp: 1.1, mp: 1.15, atk: 1.1, def: 0.95, spd: 1.0 },
    passiveId: "demon_dark",
    affinity: { dark: 1.3, fire: 1.15 },
    weakness: { light: 1.3 },
    element: ['dark', 'fire'],
    desc: "攻守兼备的黑暗种族，暗属性伤害+20%"
  },
  6: {
    name: "神圣庇护",
    stats: { hp: 0.95, mp: 1.25, atk: 0.9, def: 1.15, spd: 1.05 },
    passiveId: "angel_holy",
    affinity: { light: 1.3, wind: 1.1 },
    weakness: { dark: 1.25 },
    element: ['holy', 'wind'],
    desc: "回复技能效果+25%，对暗属性伤害-20%"
  },
  7: {
    name: "龙血觉醒",
    stats: { hp: 1.25, mp: 1.0, atk: 1.2, def: 1.1, spd: 0.75 },
    passiveId: "dragon_blood",
    affinity: { fire: 1.25, ice: 1.2 },
    weakness: { nature: 1.15 },
    element: ['fire', 'ice'],
    desc: "HP>50%时攻击力+15%，对火/冰抗性+30%"
  },
  8: {
    name: "深海祝福",
    stats: { hp: 0.95, mp: 1.2, atk: 0.9, def: 0.95, spd: 1.15 },
    passiveId: "sea_blessing",
    affinity: { water: 1.3, ice: 1.15 },
    weakness: { fire: 1.2, lightning: 1.15 },
    element: ['water', 'ice'],
    desc: "水中全属性+15%，对冰抗性+20%"
  },
  9: {
    name: "血之渴望",
    stats: { hp: 1.0, mp: 1.05, atk: 1.15, def: 0.95, spd: 1.15 },
    passiveId: "vampire_bloodlust",
    affinity: { dark: 1.25, blood: 1.2 },
    weakness: { light: 1.35, fire: 1.15 },
    element: ['dark', 'blood'],
    desc: "造成伤害的15%转化为HP回复，惧怕圣光"
  },
  10: {
    name: "混沌多面手",
    stats: { hp: 1.05, mp: 1.1, atk: 1.1, def: 1.0, spd: 1.05 },
    passiveId: "hybrid_chaos",
    affinity: { dark: 1.15, fire: 1.1 },
    weakness: { light: 1.15 },
    element: ['dark', 'fire'],
    desc: "每回合开始时随机一项属性+10%"
  },
  // ===== 堕落种族（勇者陷落后转化） =====
  11: {
    name: "背教者",
    stats: { hp: 1.05, mp: 1.05, atk: 1.10, def: 1.00, spd: 1.05 },
    passiveId: "heretic_apostasy",
    affinity: { dark: 1.25, light: 0.8 },
    weakness: { holy: 1.20 },
    element: ['dark'],
    desc: "质疑教廷的异端，暗属性亲和，25%概率暴击伤害翻倍"
  },
  12: {
    name: "古契者",
    stats: { hp: 1.15, mp: 0.90, atk: 1.05, def: 1.25, spd: 0.80 },
    passiveId: "ancient_contract",
    affinity: { earth: 1.25, fire: 1.15 },
    weakness: { nature: 1.15 },
    element: ['earth', 'fire'],
    desc: "古代契约继承者，土/火属性亲和，25%概率暴击伤害翻倍"
  },
  13: {
    name: "回归者",
    stats: { hp: 0.90, mp: 1.35, atk: 0.95, def: 0.90, spd: 1.15 },
    passiveId: "returner_memory",
    affinity: { nature: 1.25, dark: 1.15 },
    weakness: { fire: 1.20 },
    element: ['wind', 'dark'],
    desc: "世界树记忆觉醒，自然/暗属性亲和，25%概率暴击伤害翻倍"
  },
  14: {
    name: "血誓者",
    stats: { hp: 1.25, mp: 0.80, atk: 1.20, def: 0.95, spd: 0.95 },
    passiveId: "blood_oath",
    affinity: { blood: 1.30, fire: 1.15 },
    weakness: { ice: 1.20 },
    element: ['blood', 'fire'],
    desc: "古老血誓之血，极限攻击力，25%概率暴击伤害翻倍"
  },
  15: {
    name: "堕天使",
    stats: { hp: 1.00, mp: 1.30, atk: 1.05, def: 1.05, spd: 1.05 },
    passiveId: "fallen_grace",
    affinity: { dark: 1.20, light: 1.10 },
    weakness: { holy: 1.25 },
    desc: "质疑神王的天使，暗/光双属性，25%概率暴击伤害翻倍"
  }
};

// ---------- 统一职业定义表（基础+进阶） ----------
window.CLASS_DEFS = {
  // ===== 基础职业（ID 200-214）=====
  200: { tier: "basic", name: "战士",     advClassId: 300, role: "front_dps",  desc: "均衡的近战物理输出者，攻守兼备",                           stats: { hp: 1.20, mp: 1.00, atk: 1.25, def: 1.05, spd: 0.95 }, ai: { agg: 0.70, def: 0.20, sup: 0.10 }, skills: [1001, 1002, 2001, 3001], weapons: ["sword","axe","hammer"] , element: ['physical'] },
  201: { tier: "basic", name: "魔法师",   advClassId: 301, role: "magic_dps",  desc: "高MP的AoE魔法大师，擅长范围毁灭",                          stats: { hp: 0.85, mp: 1.50, atk: 1.20, def: 0.85, spd: 1.00 }, ai: { agg: 0.60, def: 0.20, sup: 0.20 }, skills: [1001, 1003, 2002, 3002], weapons: ["staff","wand"] , element: ['fire'] },
  202: { tier: "basic", name: "神官",     advClassId: 302, role: "healer",     desc: "团队回复与净化核心，神圣魔法的大师",                       stats: { hp: 0.95, mp: 1.30, atk: 0.85, def: 1.00, spd: 0.95 }, ai: { agg: 0.10, def: 0.40, sup: 0.50 }, skills: [1004, 1001, 2003, 3003], weapons: ["mace","staff","wand"] , element: ['holy'] },
  203: { tier: "basic", name: "盗贼",     advClassId: 303, role: "assassin",   desc: "高SPD的暴击刺客，从暗影中收割生命",                       stats: { hp: 0.95, mp: 1.00, atk: 1.15, def: 0.90, spd: 1.30 }, ai: { agg: 0.60, def: 0.20, sup: 0.20 }, skills: [1001, 1005, 2004, 3004], weapons: ["dagger","claw"] , element: ['dark'] },
  204: { tier: "basic", name: "骑士",     advClassId: 304, role: "tank",       desc: "高DEF的护盾型前排，守护队友的钢铁壁垒",                   stats: { hp: 1.20, mp: 1.00, atk: 1.00, def: 1.30, spd: 0.80 }, ai: { agg: 0.30, def: 0.50, sup: 0.20 }, skills: [1002, 1006, 2005, 3005], weapons: ["sword","spear","shield"] , element: ['holy', 'physical'] },
  205: { tier: "basic", name: "炼金术士", advClassId: 305, role: "dot_aoe",    desc: "毒/燃烧DoT与范围破坏，用科学毁灭敌人",                     stats: { hp: 1.00, mp: 1.20, atk: 1.05, def: 1.00, spd: 1.00 }, ai: { agg: 0.50, def: 0.20, sup: 0.30 }, skills: [1003, 1007, 2006, 3006], weapons: ["flask","dagger"] , element: ['poison', 'fire'] },
  206: { tier: "basic", name: "游侠",     advClassId: 306, role: "ranged",     desc: "高命中多段射击，百步穿杨的远程专家",                       stats: { hp: 0.95, mp: 1.00, atk: 1.15, def: 0.90, spd: 1.15 }, ai: { agg: 0.50, def: 0.30, sup: 0.20 }, skills: [1001, 1005, 2007, 3007], weapons: ["bow","crossbow"] , element: ['wind'] },
  207: { tier: "basic", name: "忍者",     advClassId: 307, role: "ninja",      desc: "高速闪避与即死攻击，来无影去无踪",                         stats: { hp: 0.90, mp: 1.10, atk: 1.10, def: 0.85, spd: 1.20 }, ai: { agg: 0.50, def: 0.20, sup: 0.30 }, skills: [1001, 1005, 2008, 3008], weapons: ["kunai","shuriken","dagger"] , element: ['dark', 'wind'] },
  208: { tier: "basic", name: "格斗家",   advClassId: 308, role: "brawler",    desc: "徒手高连击爆发，以肉体为武器的格斗大师",                   stats: { hp: 1.15, mp: 0.90, atk: 1.20, def: 1.00, spd: 1.05 }, ai: { agg: 0.70, def: 0.20, sup: 0.10 }, skills: [1001, 1008, 2009, 3009], weapons: ["fist","claw"] , element: ['physical'] },
  209: { tier: "basic", name: "巫女",     advClassId: 309, role: "healer_buff", desc: "治疗+敌方封印，神圣与咒术的双重使者",                     stats: { hp: 0.90, mp: 1.30, atk: 0.90, def: 1.05, spd: 1.00 }, ai: { agg: 0.20, def: 0.40, sup: 0.40 }, skills: [1004, 1001, 2010, 3010], weapons: ["wand","staff","paper"] , element: ['holy'] },
  210: { tier: "basic", name: "枪兵",     advClassId: 310, role: "pierce",     desc: "对坦克特化的贯穿DPS，长枪如龙",                            stats: { hp: 1.05, mp: 1.00, atk: 1.20, def: 0.95, spd: 1.05 }, ai: { agg: 0.60, def: 0.30, sup: 0.10 }, skills: [1001, 1008, 2011, 3011], weapons: ["spear","halberd"] , element: ['pierce', 'physical'] },
  211: { tier: "basic", name: "吟游诗人", advClassId: 311, role: "bard",       desc: "全队Buff与士气提升，用歌声扭转战局",                       stats: { hp: 0.90, mp: 1.15, atk: 0.90, def: 0.90, spd: 1.10 }, ai: { agg: 0.20, def: 0.30, sup: 0.50 }, skills: [1001, 1008, 2012, 3012], weapons: ["instrument","dagger"] , element: ['charm', 'wind'] },
  212: { tier: "basic", name: "暗杀者",   advClassId: 312, role: "assassin",   desc: "低HP目标处刑专家，一击必杀的黑暗使者",                     stats: { hp: 0.85, mp: 1.05, atk: 1.30, def: 0.80, spd: 1.25 }, ai: { agg: 0.70, def: 0.20, sup: 0.10 }, skills: [1001, 1005, 2013, 3013], weapons: ["dagger","claw"] , element: ['dark'] },
  213: { tier: "basic", name: "医者",     advClassId: 313, role: "healer_dot", desc: "单体极限治疗与异常解除，妙手回春",                         stats: { hp: 1.00, mp: 1.20, atk: 0.85, def: 1.00, spd: 1.00 }, ai: { agg: 0.20, def: 0.30, sup: 0.50 }, skills: [1003, 1007, 2014, 3014], weapons: ["syringe","dagger"] , element: ['holy', 'water'] },
  214: { tier: "basic", name: "舞娘",     advClassId: 314, role: "dancer",     desc: "魅惑与敌方Debuff，用舞蹈操控战场",                         stats: { hp: 0.85, mp: 1.10, atk: 0.85, def: 0.85, spd: 1.20 }, ai: { agg: 0.20, def: 0.30, sup: 0.50 }, skills: [1005, 1007, 2015, 3015], weapons: ["fan","whip","dagger"] , element: ['charm'] },

  // ===== 进阶职业（ID 300-314）=====
  300: { tier: "advanced", name: "狂战士",   baseClassId: 200, role: "front_burst",  desc: "牺牲防御换取极限输出，HP越低伤害越高",                    stats: { hp: 1.25, mp: 1.00, atk: 1.45, def: 0.80, spd: 1.05 }, ai: { agg: 0.85, def: 0.10, sup: 0.05 }, skills: [1101, 1102, 3101, 3102, 4001], weapons: ["sword","axe","hammer","greatsword","dual_axe"] , element: ['fire', 'physical'] },
  301: { tier: "advanced", name: "大魔导师", baseClassId: 201, role: "magic_aoe",    desc: "掌控毁灭级魔法的至高法师，可改变战场元素环境",            stats: { hp: 0.80, mp: 1.70, atk: 1.35, def: 0.80, spd: 1.00 }, ai: { agg: 0.70, def: 0.15, sup: 0.15 }, skills: [1101, 1103, 3103, 3104, 4002], weapons: ["staff","wand","orb","grimoire"] , element: ['fire'] },
  302: { tier: "advanced", name: "大主教",   baseClassId: 202, role: "healer_core",  desc: "群体复活+神圣护盾，团队不可动摇的核心",                   stats: { hp: 0.90, mp: 1.50, atk: 0.85, def: 1.10, spd: 0.95 }, ai: { agg: 0.10, def: 0.35, sup: 0.55 }, skills: [1104, 1102, 3105, 3106, 4003], weapons: ["mace","staff","wand","scepter"] , element: ['holy'] },
  303: { tier: "advanced", name: "影舞者",   baseClassId: 203, role: "dodge_assassin", desc: "闪避转化为反击伤害，在敌人攻击间隙跳舞",                stats: { hp: 0.90, mp: 1.10, atk: 1.20, def: 0.85, spd: 1.40 }, ai: { agg: 0.60, def: 0.20, sup: 0.20 }, skills: [1105, 1101, 3107, 3108, 4004], weapons: ["dagger","claw","dual_dagger"] , element: ['dark'] },
  304: { tier: "advanced", name: "圣骑士",   baseClassId: 204, role: "holy_tank",    desc: "伤害转化为治疗，圣光笼罩的不灭壁垒",                      stats: { hp: 1.25, mp: 1.10, atk: 1.05, def: 1.35, spd: 0.80 }, ai: { agg: 0.35, def: 0.45, sup: 0.20 }, skills: [1102, 1104, 3109, 3110, 4005], weapons: ["sword","spear","shield","holy_sword","tower_shield"] , element: ['holy'] },
  305: { tier: "advanced", name: "贤者",     baseClassId: 205, role: "battle_control", desc: "大范围增益+敌人弱化，用智慧支配战场",                   stats: { hp: 1.00, mp: 1.35, atk: 1.10, def: 1.00, spd: 1.00 }, ai: { agg: 0.40, def: 0.25, sup: 0.35 }, skills: [1103, 1107, 3111, 3112, 4006], weapons: ["flask","dagger","tome"] , element: ['poison', 'wind'] },
  306: { tier: "advanced", name: "风行者",   baseClassId: 206, role: "mobile_ranged", desc: "攻击后自动位移回避，风一般的射手",                       stats: { hp: 0.90, mp: 1.10, atk: 1.20, def: 0.85, spd: 1.30 }, ai: { agg: 0.55, def: 0.25, sup: 0.20 }, skills: [1105, 1101, 3113, 3114, 4007], weapons: ["bow","crossbow","longbow"] , element: ['wind'] },
  307: { tier: "advanced", name: "影忍",     baseClassId: 207, role: "master_ninja", desc: "隐身+必中即死，暗杀的终极形态",                           stats: { hp: 0.85, mp: 1.20, atk: 1.20, def: 0.80, spd: 1.35 }, ai: { agg: 0.60, def: 0.15, sup: 0.25 }, skills: [1105, 1101, 3115, 3116, 4008], weapons: ["kunai","shuriken","dagger","ninjato"] , element: ['dark'] },
  308: { tier: "advanced", name: "拳圣",     baseClassId: 208, role: "combo_burst",  desc: "连击数越多伤害越高，拳速突破音速",                         stats: { hp: 1.20, mp: 0.95, atk: 1.35, def: 0.95, spd: 1.15 }, ai: { agg: 0.75, def: 0.15, sup: 0.10 }, skills: [1101, 1108, 3117, 3118, 4009], weapons: ["fist","claw","gauntlet"] , element: ['physical', 'fire'] },
  309: { tier: "advanced", name: "巫女长",   baseClassId: 209, role: "holy_seal",    desc: "全场封印+神圣审判，神的代行者",                           stats: { hp: 0.85, mp: 1.45, atk: 0.95, def: 1.10, spd: 1.00 }, ai: { agg: 0.25, def: 0.35, sup: 0.40 }, skills: [1104, 1102, 3119, 3120, 4010], weapons: ["wand","staff","paper","sacred_wand"] , element: ['holy'] },
  310: { tier: "advanced", name: "龙骑士",   baseClassId: 210, role: "mounted_pierce", desc: "对大型敌人特化，人与龙的完美配合",                     stats: { hp: 1.15, mp: 1.05, atk: 1.30, def: 1.05, spd: 1.00 }, ai: { agg: 0.65, def: 0.25, sup: 0.10 }, skills: [1101, 1106, 3121, 3122, 4011], weapons: ["spear","halberd","dragon_lance"] , element: ['fire'] },
  311: { tier: "advanced", name: "战歌者",   baseClassId: 211, role: "battle_command", desc: "增益带伤害附加，用歌声指挥全军",                       stats: { hp: 0.85, mp: 1.25, atk: 1.00, def: 0.90, spd: 1.10 }, ai: { agg: 0.30, def: 0.25, sup: 0.45 }, skills: [1104, 1108, 3123, 3124, 4012], weapons: ["instrument","dagger","harp"] , element: ['charm', 'wind'] },
  312: { tier: "advanced", name: "死神",     baseClassId: 212, role: "soul_reaper",  desc: "击杀刷新行动，灵魂的收割者",                               stats: { hp: 0.80, mp: 1.10, atk: 1.45, def: 0.75, spd: 1.30 }, ai: { agg: 0.75, def: 0.15, sup: 0.10 }, skills: [1101, 1105, 3125, 3126, 4013], weapons: ["dagger","claw","scythe"] , element: ['dark'] },
  313: { tier: "advanced", name: "神医",     baseClassId: 213, role: "extreme_heal", desc: "单体满血复活，超越生死的医术",                             stats: { hp: 1.00, mp: 1.35, atk: 0.85, def: 1.05, spd: 1.00 }, ai: { agg: 0.15, def: 0.30, sup: 0.55 }, skills: [1104, 1107, 3127, 3128, 4014], weapons: ["syringe","dagger","elixir"] , element: ['holy'] },
  314: { tier: "advanced", name: "舞姬",     baseClassId: 214, role: "battle_charm", desc: "群体魅惑+敌方自相残杀，战场上的绝色妖姬",                 stats: { hp: 0.80, mp: 1.20, atk: 0.90, def: 0.80, spd: 1.25 }, ai: { agg: 0.25, def: 0.25, sup: 0.50 }, skills: [1105, 1107, 3129, 3130, 4015], weapons: ["fan","whip","dagger","charm_fan"] , element: ['charm', 'dark'] },

  // ===== 魔王军基础职业（ID 400-414，原版属性+5%） =====
  400: { tier: "basic", name: "魔战士",     advClassId: 500, role: "front_dps",  desc: "被魔王之力侵蚀的战士，攻击力更强",                         stats: { hp: 1.25, mp: 1.05, atk: 1.30, def: 1.10, spd: 1.00 }, ai: { agg: 0.75, def: 0.15, sup: 0.10 }, skills: [1001, 1002, 2001, 3001], weapons: ["sword","axe","hammer","demon_sword"] , element: ['dark', 'physical'] , playerOnly: true },
  401: { tier: "basic", name: "暗魔法师",   advClassId: 501, role: "magic_dps",  desc: "研习黑暗魔法的法师，MP更加充沛",                           stats: { hp: 0.90, mp: 1.55, atk: 1.25, def: 0.90, spd: 1.05 }, ai: { agg: 0.65, def: 0.15, sup: 0.20 }, skills: [1001, 1003, 2002, 3002], weapons: ["staff","wand","orb","grimoire"] , element: ['dark'] , playerOnly: true },
  402: { tier: "basic", name: "暗祭司",     advClassId: 502, role: "healer",     desc: "信仰黑暗之力的治疗者，神圣与黑暗并存",                     stats: { hp: 1.00, mp: 1.35, atk: 0.90, def: 1.05, spd: 1.00 }, ai: { agg: 0.10, def: 0.35, sup: 0.55 }, skills: [1004, 1001, 2003, 3003], weapons: ["mace","staff","wand","scepter"] , element: ['dark', 'holy'], playerOnly: true },
  403: { tier: "basic", name: "暗影刺客",   advClassId: 503, role: "assassin",   desc: "潜伏于阴影中的猎手，速度更加致命",                         stats: { hp: 1.00, mp: 1.05, atk: 1.20, def: 0.95, spd: 1.35 }, ai: { agg: 0.65, def: 0.15, sup: 0.20 }, skills: [1001, 1005, 2004, 3004], weapons: ["dagger","claw","dual_dagger"] , element: ['dark'] , playerOnly: true },
  404: { tier: "basic", name: "黑骑士",     advClassId: 504, role: "tank",       desc: "抛弃圣光的守护骑士，防御更加坚不可摧",                     stats: { hp: 1.25, mp: 1.05, atk: 1.05, def: 1.35, spd: 0.85 }, ai: { agg: 0.30, def: 0.55, sup: 0.15 }, skills: [1002, 1006, 2005, 3005], weapons: ["sword","spear","shield","demon_sword","tower_shield"] , element: ['dark'] , playerOnly: true },
  405: { tier: "basic", name: "毒炼金术士", advClassId: 505, role: "dot_aoe",    desc: "用瘟疫与毒物毁灭敌人的黑暗科学家",                         stats: { hp: 1.05, mp: 1.25, atk: 1.10, def: 1.05, spd: 1.05 }, ai: { agg: 0.55, def: 0.15, sup: 0.30 }, skills: [1003, 1007, 2006, 3006], weapons: ["flask","dagger","tome"] , element: ['poison', 'dark'] , playerOnly: true },
  406: { tier: "basic", name: "魔弓手",     advClassId: 506, role: "ranged",     desc: "被魔力加持的射手，箭矢附带暗属性",                         stats: { hp: 1.00, mp: 1.05, atk: 1.20, def: 0.95, spd: 1.20 }, ai: { agg: 0.55, def: 0.25, sup: 0.20 }, skills: [1001, 1005, 2007, 3007], weapons: ["bow","crossbow","longbow"] , element: ['dark', 'wind'] , playerOnly: true },
  407: { tier: "basic", name: "暗忍者",     advClassId: 507, role: "ninja",      desc: "效忠魔王的暗杀者，隐身更加致命",                           stats: { hp: 0.95, mp: 1.15, atk: 1.15, def: 0.90, spd: 1.25 }, ai: { agg: 0.55, def: 0.15, sup: 0.30 }, skills: [1001, 1005, 2008, 3008], weapons: ["kunai","shuriken","dagger","ninjato"] , element: ['dark'] , playerOnly: true },
  408: { tier: "basic", name: "魔拳士",     advClassId: 508, role: "brawler",    desc: "以魔王之力强化肉体的格斗家，拳势更猛",                     stats: { hp: 1.20, mp: 0.95, atk: 1.25, def: 1.05, spd: 1.10 }, ai: { agg: 0.75, def: 0.15, sup: 0.10 }, skills: [1001, 1008, 2009, 3009], weapons: ["fist","claw","gauntlet"] , element: ['dark', 'physical'] , playerOnly: true },
  409: { tier: "basic", name: "暗巫女",     advClassId: 509, role: "healer_buff", desc: "信奉黑暗神明的巫女，封印之力更强",                        stats: { hp: 0.95, mp: 1.35, atk: 0.95, def: 1.10, spd: 1.05 }, ai: { agg: 0.20, def: 0.40, sup: 0.40 }, skills: [1004, 1002, 2010, 3010], weapons: ["wand","staff","paper","sacred_wand"] , element: ['dark', 'holy'] , playerOnly: true },
  410: { tier: "basic", name: "魔枪兵",     advClassId: 510, role: "pierce",     desc: "魔化长枪的持有者，贯穿力更强",                             stats: { hp: 1.10, mp: 1.05, atk: 1.25, def: 1.00, spd: 1.10 }, ai: { agg: 0.65, def: 0.25, sup: 0.10 }, skills: [1001, 1008, 2011, 3011], weapons: ["spear","halberd","dragon_lance"] , element: ['dark', 'pierce'] , playerOnly: true },
  411: { tier: "basic", name: "暗黑吟游者", advClassId: 511, role: "bard",       desc: "用黑暗旋律操控战场的歌者，buff带诅咒",                     stats: { hp: 0.95, mp: 1.20, atk: 0.95, def: 0.95, spd: 1.15 }, ai: { agg: 0.25, def: 0.25, sup: 0.50 }, skills: [1001, 1008, 2012, 3012], weapons: ["instrument","dagger","harp"] , element: ['dark', 'charm'] , playerOnly: true },
  412: { tier: "basic", name: "血暗杀者",   advClassId: 512, role: "assassin",   desc: "以血为誓的暗杀者，对低HP目标更致命",                       stats: { hp: 0.90, mp: 1.10, atk: 1.35, def: 0.85, spd: 1.30 }, ai: { agg: 0.75, def: 0.15, sup: 0.10 }, skills: [1001, 1005, 2013, 3013], weapons: ["dagger","claw","scythe"] , element: ['dark', 'blood'] , playerOnly: true },
  413: { tier: "basic", name: "暗医者",     advClassId: 513, role: "healer_dot", desc: "掌握黑暗医术的治疗者，治愈与腐蚀并存",                     stats: { hp: 1.05, mp: 1.25, atk: 0.90, def: 1.05, spd: 1.05 }, ai: { agg: 0.15, def: 0.30, sup: 0.55 }, skills: [1004, 1007, 2014, 3014], weapons: ["syringe","dagger","elixir"] , element: ['dark', 'holy'] , playerOnly: true },
  414: { tier: "basic", name: "暗舞娘",     advClassId: 514, role: "dancer",     desc: "以黑暗舞蹈操控敌人的魅惑者，debuff更强",                   stats: { hp: 0.90, mp: 1.15, atk: 0.90, def: 0.90, spd: 1.25 }, ai: { agg: 0.25, def: 0.25, sup: 0.50 }, skills: [1005, 1007, 2015, 3015], weapons: ["fan","whip","dagger","charm_fan"] , element: ['dark', 'charm'] , playerOnly: true },

  // ===== 魔王军进阶职业（ID 500-514，原版进阶属性+8%） =====
  500: { tier: "advanced", name: "魔狂战士",   baseClassId: 400, role: "front_burst",  desc: "被魔王之力完全侵蚀的狂战士，HP越低破坏力越惊人",         stats: { hp: 1.33, mp: 1.08, atk: 1.53, def: 0.88, spd: 1.13 }, ai: { agg: 0.90, def: 0.05, sup: 0.05 }, skills: [1101, 1102, 3101, 3102, 4001], weapons: ["sword","axe","hammer","greatsword","dual_axe","demon_sword"] , element: ['dark', 'fire'] , playerOnly: true },
  501: { tier: "advanced", name: "混沌魔导师", baseClassId: 401, role: "magic_aoe",    desc: "掌控混沌魔法的至高法师，可扭曲战场元素",                  stats: { hp: 0.88, mp: 1.78, atk: 1.43, def: 0.88, spd: 1.08 }, ai: { agg: 0.75, def: 0.10, sup: 0.15 }, skills: [1101, 1103, 3103, 3104, 4002], weapons: ["staff","wand","orb","grimoire","demon_orb"] , element: ['dark'] , playerOnly: true },
  502: { tier: "advanced", name: "堕落主教",   baseClassId: 402, role: "healer_core",  desc: "以黑暗之力施行治愈的堕神者，复活与护盾并存",              stats: { hp: 0.98, mp: 1.58, atk: 0.93, def: 1.18, spd: 1.03 }, ai: { agg: 0.10, def: 0.30, sup: 0.60 }, skills: [1104, 1102, 3105, 3106, 4003], weapons: ["mace","staff","wand","scepter","dark_scepter"] , element: ['dark'], playerOnly: true },
  503: { tier: "advanced", name: "虚无舞者",   baseClassId: 403, role: "dodge_assassin", desc: "在虚无中舞动的暗杀者，闪避即死亡",                      stats: { hp: 0.98, mp: 1.18, atk: 1.28, def: 0.93, spd: 1.48 }, ai: { agg: 0.65, def: 0.15, sup: 0.20 }, skills: [1105, 1101, 3107, 3108, 4004], weapons: ["dagger","claw","dual_dagger","void_blade"] , element: ['dark'] , playerOnly: true },
  504: { tier: "advanced", name: "深渊骑士",   baseClassId: 404, role: "holy_tank",    desc: "来自深渊的不灭壁垒，伤害转化为黑暗治愈",                  stats: { hp: 1.33, mp: 1.18, atk: 1.13, def: 1.43, spd: 0.88 }, ai: { agg: 0.30, def: 0.55, sup: 0.15 }, skills: [1102, 1104, 3109, 3110, 4005], weapons: ["sword","spear","shield","demon_sword","tower_shield","abyss_shield"] , element: ['dark'] , playerOnly: true },
  505: { tier: "advanced", name: "瘟疫贤者",   baseClassId: 405, role: "battle_control", desc: "散播瘟疫与智慧的黑暗支配者，大范围弱化敌人",            stats: { hp: 1.08, mp: 1.43, atk: 1.18, def: 1.08, spd: 1.08 }, ai: { agg: 0.45, def: 0.20, sup: 0.35 }, skills: [1103, 1107, 3111, 3112, 4006], weapons: ["flask","dagger","tome","plague_flask"] , element: ['poison', 'dark'] , playerOnly: true },
  506: { tier: "advanced", name: "暴风射手",   baseClassId: 406, role: "mobile_ranged", desc: "风与暗加持的魔弓手，射击后自动隐匿",                     stats: { hp: 0.98, mp: 1.18, atk: 1.28, def: 0.93, spd: 1.38 }, ai: { agg: 0.60, def: 0.20, sup: 0.20 }, skills: [1105, 1101, 3113, 3114, 4007], weapons: ["bow","crossbow","longbow","demon_bow"] , element: ['dark', 'wind'] , playerOnly: true },
  507: { tier: "advanced", name: "鬼影忍",     baseClassId: 407, role: "master_ninja", desc: "与暗影融为一体的终极暗杀者，隐身即必中",                  stats: { hp: 0.93, mp: 1.28, atk: 1.28, def: 0.88, spd: 1.43 }, ai: { agg: 0.65, def: 0.10, sup: 0.25 }, skills: [1105, 1101, 3115, 3116, 4008], weapons: ["kunai","shuriken","dagger","ninjato","ghost_kunai"] , element: ['dark'] , playerOnly: true },
  508: { tier: "advanced", name: "破坏拳圣",   baseClassId: 408, role: "combo_burst",  desc: "以魔王之力突破极限的拳圣，连击毁灭一切",                  stats: { hp: 1.28, mp: 1.03, atk: 1.43, def: 1.03, spd: 1.23 }, ai: { agg: 0.80, def: 0.10, sup: 0.10 }, skills: [1101, 1108, 3117, 3118, 4009], weapons: ["fist","claw","gauntlet","demon_gauntlet"] , element: ['dark', 'physical'] , playerOnly: true },
  509: { tier: "advanced", name: "诅咒巫女长", baseClassId: 409, role: "holy_seal",    desc: "以黑暗神罚制裁敌人的巫女长，全场封印+诅咒",              stats: { hp: 0.93, mp: 1.53, atk: 1.03, def: 1.18, spd: 1.08 }, ai: { agg: 0.25, def: 0.30, sup: 0.45 }, skills: [1104, 1102, 3119, 3120, 4010], weapons: ["wand","staff","paper","sacred_wand","cursed_paper"] , element: ['dark', 'holy'] , playerOnly: true },
  510: { tier: "advanced", name: "深渊龙骑",   baseClassId: 410, role: "mounted_pierce", desc: "与深渊魔龙缔结契约的龙骑士，对大型敌人特化",           stats: { hp: 1.23, mp: 1.13, atk: 1.38, def: 1.13, spd: 1.08 }, ai: { agg: 0.70, def: 0.20, sup: 0.10 }, skills: [1101, 1106, 3121, 3122, 4011], weapons: ["spear","halberd","dragon_lance","abyss_lance"] , element: ['dark', 'fire'] , playerOnly: true },
  511: { tier: "advanced", name: "毁灭战歌者", baseClassId: 411, role: "battle_command", desc: "以毁灭旋律指挥全军的黑暗歌者，增益带诅咒伤害",         stats: { hp: 0.93, mp: 1.33, atk: 1.08, def: 0.98, spd: 1.18 }, ai: { agg: 0.30, def: 0.20, sup: 0.50 }, skills: [1104, 1108, 3123, 3124, 4012], weapons: ["instrument","dagger","harp","demon_harp"] , element: ['dark', 'charm'] , playerOnly: true },
  512: { tier: "advanced", name: "冥界死神",   baseClassId: 412, role: "soul_reaper",  desc: "来自冥界的灵魂收割者，击杀即刷新行动",                    stats: { hp: 0.88, mp: 1.18, atk: 1.53, def: 0.83, spd: 1.38 }, ai: { agg: 0.80, def: 0.10, sup: 0.10 }, skills: [1101, 1105, 3125, 3126, 4013], weapons: ["dagger","claw","scythe","soul_scythe"] , element: ['dark'] , playerOnly: true },
  513: { tier: "advanced", name: "腐朽神医",   baseClassId: 413, role: "extreme_heal", desc: "以腐朽之力施行治愈的神医，复活并腐蚀敌人",               stats: { hp: 1.08, mp: 1.43, atk: 0.93, def: 1.13, spd: 1.08 }, ai: { agg: 0.15, def: 0.25, sup: 0.60 }, skills: [1104, 1107, 3127, 3128, 4014], weapons: ["syringe","dagger","elixir","plague_syringe"] , element: ['dark', 'holy'] , playerOnly: true },
  514: { tier: "advanced", name: "魅惑舞姬",   baseClassId: 414, role: "battle_charm", desc: "以黑暗魅惑操控敌人心智的妖姬，群体自相残杀",             stats: { hp: 0.88, mp: 1.28, atk: 0.98, def: 0.88, spd: 1.33 }, ai: { agg: 0.25, def: 0.20, sup: 0.55 }, skills: [1105, 1107, 3129, 3130, 4015], weapons: ["fan","whip","dagger","charm_fan","demon_fan"] , element: ['dark', 'charm'] , playerOnly: true },

  // ===== 魔王专属职业 =====
  999: { tier: "master", name: "魔王", role: "master", desc: "地下迷宫的主宰，统治一切的存在", stats: { hp: 1.30, mp: 1.20, atk: 1.30, def: 1.20, spd: 1.10 }, ai: { agg: 0.60, def: 0.30, sup: 0.10 }, skills: [1101, 1102, 1103, 1106, 4001], weapons: ["sword","staff","orb","grimoire","demon_sword"] , element: ['dark'] }
};

// ---------- 统一技能定义表 ----------
window.CLASS_SKILL_DEFS = {
  // ===== 基础通用技能（所有基础职业）=====
  1001: { name: "普通攻击",   type: "damage",     element: "physical", power: 1.0,  cost: 0, target: "single",    desc: "最基础的物理攻击" },
  1002: { name: "防御姿态",   type: "buff_def",   element: "none",     power: 0.2,  duration: 2, cost: 5, target: "self",      desc: "提升自身防御力20%" },
  1003: { name: "魔力飞弹",   type: "damage",     element: "magic",    power: 1.1,  cost: 5, target: "single",    desc: "最基础的魔法攻击" },
  1004: { name: "快速治疗",   type: "heal",       element: "holy",     power: 0.3,  cost: 10, target: "single",    desc: "恢复自身30%最大HP" },
  1005: { name: "疾风步",     type: "buff_spd",   element: "wind",     power: 0.2,  duration: 2, cost: 5, target: "self",      desc: "提升自身速度20%" },
  1006: { name: "挑衅",       type: "taunt",      element: "none",     power: 0,    duration: 2, cost: 5, target: "single",    desc: "强制目标下回合攻击自己" },
  1007: { name: "毒瓶投掷",   type: "dot",        element: "poison",   power: 0.15, duration: 3, cost: 5, target: "single",    desc: "每回合造成15%攻击力的毒伤害" },
  1008: { name: "聚力",       type: "buff_atk",   element: "none",     power: 0.2,  duration: 2, cost: 5, target: "self",      desc: "提升自身攻击力20%" },

  // ===== 高级通用技能（所有进阶职业）=====
  1101: { name: "强力斩击",   type: "damage",     element: "physical", power: 1.5,  cost: 10, target: "single",    desc: "强力的物理攻击" },
  1102: { name: "魔法屏障",   type: "buff_def",   element: "magic",    power: 0.4,  duration: 3, cost: 10, target: "self",      desc: "大幅提升防御并抵消一次魔法伤害" },
  1103: { name: "炎爆术",     type: "damage",     element: "fire",     power: 1.6,  cost: 15, target: "single",    desc: "高威力火属性魔法" },
  1104: { name: "群体治疗",   type: "mass_heal",  element: "holy",     power: 0.25, cost: 20, target: "all_ally",  desc: "恢复全队25%最大HP" },
  1105: { name: "瞬身",       type: "buff_spd",   element: "wind",     power: 0.4,  duration: 2, cost: 10, target: "self",      desc: "大幅提升速度并提升闪避率" },
  1106: { name: "铁壁",       type: "buff_def",   element: "earth",    power: 0.5,  duration: 3, cost: 10, target: "self",      desc: "极大幅提升防御50%" },
  1107: { name: "猛毒云",     type: "dot",        element: "poison",   power: 0.25, duration: 3, cost: 15, target: "all_enemy", desc: "使全体敌人中毒" },
  1108: { name: "战意高涨",   type: "buff_atk",   element: "none",     power: 0.35, duration: 3, cost: 10, target: "self",      desc: "大幅提升攻击力35%" },

  // ===== 基础职业技能（200-214，每个1个）=====
  2001: { name: "战吼",       type: "buff_atk",   element: "none",     power: 0.25, duration: 3, cost: 10, target: "all_ally",  desc: "提升全队攻击力25%" },
  2002: { name: "魔力护盾",   type: "buff_def",   element: "magic",    power: 0.3,  duration: 3, cost: 10, target: "self",      desc: "用魔力抵挡30%伤害" },
  2003: { name: "神圣之光",   type: "heal",       element: "holy",     power: 0.5,  cost: 15, target: "single",    desc: "中量恢复HP并解除一个弱化" },
  2004: { name: "背刺",       type: "damage",     element: "physical", power: 1.4,  cost: 10, target: "single",    critBonus: 0.2, desc: "从背后攻击，暴击率+20%" },
  2005: { name: "盾击",       type: "damage",     element: "physical", power: 1.1,  cost: 10, target: "single",    desc: "用盾牌猛击，概率眩晕" },
  2006: { name: "投掷药水",   type: "dot",        element: "poison",   power: 0.2,  duration: 3, cost: 10, target: "single",    desc: "投掷腐蚀性药水" },
  2007: { name: "连射",       type: "damage",     element: "physical", power: 0.7,  hits: 2,     cost: 10, target: "single",    desc: "连续射出两箭" },
  2008: { name: "烟雾弹",     type: "buff_spd",   element: "dark",     power: 0.3,  duration: 2, cost: 10, target: "self",      desc: "投掷烟雾弹提升闪避30%" },
  2009: { name: "连打",       type: "damage",     element: "physical", power: 0.6,  hits: 3,     cost: 10, target: "single",    desc: "快速连续三次拳击" },
  2010: { name: "封印符",     type: "seal",       element: "holy",     power: 0,    duration: 2, cost: 15, target: "single",    desc: "封印敌方技能一回合" },
  2011: { name: "突刺",       type: "damage",     element: "pierce",   power: 1.3,  cost: 10, target: "single",    desc: "贯穿防御的强力突刺" },
  2012: { name: "激励之歌",   type: "buff_atk",   element: "none",     power: 0.2,  duration: 3, cost: 15, target: "all_ally",  desc: "用歌声激励全队攻击力+20%" },
  2013: { name: "暗袭",       type: "damage",     element: "dark",     power: 1.5,  cost: 15, target: "single",    desc: "黑暗中发动的致命一击" },
  2014: { name: "解毒",       type: "cleanse",    element: "holy",     power: 0,    cost: 10, target: "single",    desc: "解除所有异常状态" },
  2015: { name: "魅惑之舞",   type: "debuff_atk", element: "charm",    power: 0.25, duration: 2, cost: 10, target: "single",    desc: "用舞蹈降低敌方攻击力25%" },

  // ===== 基础职业必杀技（3001-3015）=====
  3001: { name: "狂暴",       type: "berserk",    element: "none",     power: 1.5, duration: 3, cost: 25, target: "self",      desc: "攻击力+50%，防御-30%" },
  3002: { name: "陨石术",     type: "aoe",        element: "fire",     power: 1.3, cost: 30, target: "all_enemy", desc: "召唤陨石轰击全体敌人" },
  3003: { name: "神圣审判",   type: "aoe",        element: "holy",     power: 1.5, cost: 35, target: "all_enemy", desc: "以神圣之力审判全体敌人" },
  3004: { name: "暗杀",       type: "execute",    element: "dark",     power: 2.0, cost: 25, target: "single",    desc: "对低HP敌人造成200%伤害" },
  3005: { name: "圣盾庇护",   type: "invincible", element: "holy",     power: 0,   duration: 1, cost: 30, target: "self",      desc: "一回合内完全无敌" },
  3006: { name: "大爆炸",     type: "big_bang",   element: "fire",     power: 1.8, cost: 35, target: "all_enemy", desc: "炼金术的终极奥义" },
  3007: { name: "箭雨",       type: "aoe",        element: "physical", power: 1.1, cost: 25, target: "all_enemy", desc: "向天空射出无数箭矢" },
  3008: { name: "影分身",     type: "buff_spd",   element: "dark",     power: 0.5, duration: 3, cost: 20, target: "self",      desc: "制造分身提升闪避50%" },
  3009: { name: "百裂拳",     type: "damage",     element: "physical", power: 0.4, hits: 5,     cost: 20, target: "single",    desc: "一瞬间打出五连击" },
  3010: { name: "神乐",       type: "cleanse",    element: "holy",     power: 0,   cost: 30, target: "all_ally",  desc: "净化全队所有负面状态" },
  3011: { name: "龙枪突",     type: "damage",     element: "pierce",   power: 1.8, cost: 25, target: "single",    desc: "倾注全力的一击贯穿" },
  3012: { name: "终曲",       type: "buff_all",   element: "none",     power: 0.3, duration: 3, cost: 30, target: "all_ally",  desc: "提升全队全属性30%" },
  3013: { name: "虚无",       type: "execute",    element: "dark",     power: 3.0, cost: 40, target: "single",    desc: "将存在本身抹消的一击" },
  3014: { name: "生命之泉",   type: "mass_heal",  element: "holy",     power: 0.4, duration: 3, cost: 35, target: "all_ally",  desc: "持续恢复全队HP三回合" },
  3015: { name: "终焉之舞",   type: "debuff_all", element: "charm",    power: 0.2, duration: 3, cost: 35, target: "all_enemy", desc: "降低全体敌人全属性20%" },

  // ===== 进阶职业技能（3101-3130，每个进阶职业2个）=====
  // 狂战士（300）
  3101: { name: "血之渴望",   type: "buff_atk",   element: "blood",    power: 0.35, duration: 3, cost: 20, target: "self",      condition: "hp<50%", desc: "HP<50%时攻击力额外+20%" },
  3102: { name: "旋风斩",     type: "aoe",        element: "physical", power: 1.6,  cost: 25, target: "all_enemy", desc: "挥舞武器攻击全体敌人" },
  // 大魔导师（301）
  3103: { name: "元素风暴",   type: "damage",     element: "random",   power: 2.0,  cost: 25, target: "single",    desc: "随机属性的高威力魔法" },
  3104: { name: "魔力逆流",   type: "buff_atk",   element: "magic",    power: 0.6,  duration: 3, cost: 20, target: "self",      desc: "以魔力强化下一次攻击" },
  // 大主教（302）
  3105: { name: "神圣护盾",   type: "buff_def",   element: "holy",     power: 0.5,  duration: 3, cost: 25, target: "all_ally",  desc: "给全队附加神圣护盾" },
  3106: { name: "审判之光",   type: "damage",     element: "holy",     power: 1.8,  cost: 25, target: "single",    desc: "对邪恶敌人造成巨额伤害" },
  // 影舞者（303）
  3107: { name: "反击之舞",   type: "counter",    element: "physical", power: 1.2,  duration: 2, cost: 20, target: "self",      desc: "闪避后自动反击" },
  3108: { name: "暗影步",     type: "buff_spd",   element: "dark",     power: 0.6,  duration: 2, cost: 20, target: "self",      desc: "融入暗影大幅提升闪避" },
  // 圣骑士（304）
  3109: { name: "圣光反噬",   type: "reflect",    element: "holy",     power: 0.5,  duration: 3, cost: 25, target: "self",      desc: "受到伤害时反弹30%为治疗" },
  3110: { name: "天罚",       type: "damage",     element: "holy",     power: 1.7,  cost: 25, target: "single",    desc: "以圣光惩戒敌人" },
  // 贤者（305）
  3111: { name: "智慧光环",   type: "buff_all",   element: "none",     power: 0.25, duration: 3, cost: 25, target: "all_ally",  desc: "全队全属性+15%" },
  3112: { name: "思维瓦解",   type: "debuff_all", element: "magic",    power: 0.25, duration: 3, cost: 25, target: "all_enemy", desc: "敌人全属性-15%" },
  // 风行者（306）
  3113: { name: "风之步",     type: "buff_spd",   element: "wind",     power: 0.55, duration: 2, cost: 20, target: "self",      desc: "攻击后自动后撤" },
  3114: { name: "穿云箭",     type: "damage",     element: "physical", power: 2.2,  cost: 25, target: "single",    desc: "贯穿一切的狙击箭" },
  // 影忍（307）
  3115: { name: "隐身",       type: "stealth",    element: "dark",     power: 0,    duration: 2, cost: 20, target: "self",      desc: "进入隐身状态无法被选中" },
  3116: { name: "暗杀术",     type: "execute",    element: "dark",     power: 3.0,  cost: 30, target: "single",    desc: "隐身状态下必中且暴击" },
  // 拳圣（308）
  3117: { name: "连击之势",   type: "buff_atk",   element: "physical", power: 0.18, duration: 3, cost: 20, target: "self",      desc: "每次攻击后攻击力+10%" },
  3118: { name: "破山击",     type: "damage",     element: "physical", power: 2.8,  cost: 25, target: "single",    desc: "凝聚全力的破山一拳" },
  // 巫女长（309）
  3119: { name: "神圣结界",   type: "buff_def",   element: "holy",     power: 0.45, duration: 3, cost: 25, target: "all_ally",  desc: "全队防御+30%" },
  3120: { name: "神罚之雷",   type: "damage",     element: "lightning",power: 2.0,  cost: 25, target: "single",    desc: "召唤神雷审判罪人" },
  // 龙骑士（310）
  3121: { name: "龙息",       type: "damage",     element: "fire",     power: 1.8,  cost: 25, target: "all_enemy", desc: "与龙配合喷吐烈焰" },
  3122: { name: "龙翼横扫",   type: "damage",     element: "physical", power: 2.2,  cost: 25, target: "single",    desc: "龙翼挥击造成巨额伤害" },
  // 战歌者（311）
  3123: { name: "战歌",       type: "buff_atk",   element: "none",     power: 0.35, duration: 3, cost: 25, target: "all_ally",  desc: "全队攻击+25%且附带伤害" },
  3124: { name: "安魂曲",     type: "heal",       element: "holy",     power: 0.55, cost: 25, target: "all_ally",  desc: "用歌声治愈全队" },
  // 死神（312）
  3125: { name: "灵魂收割",   type: "execute",    element: "dark",     power: 3.5,  cost: 30, target: "single",    desc: "收割濒死灵魂" },
  3126: { name: "死亡宣告",   type: "dot",        element: "dark",     power: 0.45, duration: 3, cost: 20, target: "single",    desc: "标记目标使其持续流失生命" },
  // 神医（313）
  3127: { name: "回春术",     type: "heal",       element: "holy",     power: 1.0,  cost: 20, target: "single",    desc: "恢复目标80%最大HP" },
  3128: { name: "致命毒素",   type: "damage",     element: "poison",   power: 2.0, cost: 30, target: "single",    desc: "以剧毒侵蚀敌人内脏" },
  // 舞姬（314）
  3129: { name: "群体魅惑",   type: "debuff_atk", element: "charm",    power: 0.35, duration: 2, cost: 20, target: "all_enemy", desc: "全体敌人攻击力-20%" },
  3130: { name: "幻舞",       type: "confuse",    element: "charm",    power: 0,    duration: 2, cost: 25, target: "all_enemy", desc: "敌人概率互相攻击" },

  // ===== 进阶职业必杀技（4001-4015）=====
  4001: { name: "诸神黄昏",   type: "big_bang",   element: "physical", power: 3.0, cost: 50, target: "all_enemy", desc: "放弃一切防御的终极一击" },
  4002: { name: "星陨",       type: "big_bang",   element: "magic",    power: 3.2, cost: 50, target: "all_enemy", desc: "召唤陨石雨毁灭战场" },
  4003: { name: "神圣审判",   type: "aoe",        element: "holy",     power: 2.8, cost: 45, target: "all_enemy", desc: "以神之名义净化一切邪恶" },
  4004: { name: "死亡华尔兹", type: "damage",     element: "dark",     power: 2.8, hits: 3,     cost: 40, target: "single",    desc: "在死亡边缘跳舞的三连击" },
  4005: { name: "圣光领域",   type: "buff_all",   element: "holy",     power: 0.5, duration: 3, cost: 45, target: "all_ally",  desc: "全队全属性+40%并持续回复" },
  4006: { name: "真理之门",   type: "big_bang",   element: "magic",    power: 3.0, cost: 50, target: "all_enemy", desc: "打开真理之门毁灭敌人" },
  4007: { name: "风暴之眼",   type: "aoe",        element: "wind",     power: 2.5, cost: 40, target: "all_enemy", desc: "在风暴中心射出毁灭之箭" },
  4008: { name: "瞬狱杀",     type: "execute",    element: "dark",     power: 4.5, cost: 45, target: "single",    desc: "瞬杀——无法闪避的即死攻击" },
  4009: { name: "天冲拳",     type: "damage",     element: "physical", power: 3.5, cost: 40, target: "single",    desc: "冲破天际的终极一拳" },
  4010: { name: "神乐·终焉",  type: "cleanse",    element: "holy",     power: 0,   cost: 45, target: "all_ally",  desc: "净化一切并封印全场敌人" },
  4011: { name: "龙枪·天翔",  type: "damage",     element: "pierce",   power: 3.2, cost: 40, target: "single",    desc: "人与龙合力的天翔一击" },
  4012: { name: "镇魂歌",     type: "buff_all",   element: "none",     power: 0.45, duration: 3, cost: 45, target: "all_ally",  desc: "全队全属性+35%并附加伤害" },
  4013: { name: "死神的拥抱", type: "execute",    element: "dark",     power: 5.0, cost: 50, target: "single",    desc: "无视防御的绝对处刑" },
  4014: { name: "生命之树",   type: "mass_heal",  element: "holy",     power: 0.8, duration: 3, cost: 45, target: "all_ally",  desc: "全队持续大幅回复并清除负面状态" },
  4015: { name: "天魔之舞",   type: "debuff_all", element: "charm",    power: 0.4, duration: 3, cost: 45, target: "all_enemy", desc: "让敌人陷入疯狂的终极之舞" }
};

// ---------- 元素类型图标 ----------
window.ELEMENT_ICONS = {
  physical: "⚔️",
  magic: "✨",
  fire: "🔥",
  ice: "❄️",
  lightning: "⚡",
  wind: "💨",
  earth: "🪨",
  water: "💧",
  holy: "✝️",
  dark: "💀",
  poison: "☠️",
  blood: "🩸",
  charm: "💋",
  pierce: "🎯",
  none: "",
  random: "🎲"
};

// ---------- 元素克制矩阵 ----------
// 克制关系：攻击元素 → 被克制元素
// 火→冰→风→土→雷→水→火（自然循环）
// 光↔暗（互相克制）
window.ELEMENTAL_MATRIX = {
  // 克制倍率（攻击方优势）
  advantage: {
    fire: { ice: 1.30 },
    ice: { wind: 1.30 },
    wind: { earth: 1.30 },
    earth: { lightning: 1.30 },
    lightning: { water: 1.30 },
    water: { fire: 1.30 },
    holy: { dark: 1.30 },
    dark: { holy: 1.30 }
  },
  // 被克制倍率（攻击方劣势）
  disadvantage: {
    fire: { water: 0.80 },
    water: { lightning: 0.80 },
    lightning: { earth: 0.80 },
    earth: { wind: 0.80 },
    wind: { ice: 0.80 },
    ice: { fire: 0.80 },
    holy: { dark: 0.80 },
    dark: { holy: 0.80 }
  }
};

// 种族主元素映射（用于元素克制判断）
window.RACE_MAIN_ELEMENT = {
  1: 'none',      // 人类
  2: 'nature',    // 精灵
  3: 'earth',     // 兽人
  4: 'earth',     // 矮人
  5: 'dark',      // 魔族
  6: 'holy',      // 天使
  7: 'fire',      // 龙人
  8: 'water',     // 海族
  9: 'dark',      // 吸血鬼
  10: 'dark',     // 恶魔混血
  11: 'dark',     // 背教者
  12: 'earth',    // 古契者
  13: 'nature',   // 回归者
  14: 'blood',    // 血誓者
  15: 'dark'      // 堕天使
};

// 计算元素克制倍率
window.getElementalModifier = function(attackerElement, attackerRaceId, targetRaceId) {
  if (!attackerElement || attackerElement === 'none' || attackerElement === 'physical' || attackerElement === 'magic' || attackerElement === 'pierce' || attackerElement === 'poison' || attackerElement === 'blood' || attackerElement === 'charm') return 1.0;
  
  // random 元素：随机选择一个有效元素
  if (attackerElement === 'random') {
    const elements = ['fire', 'ice', 'wind', 'earth', 'lightning', 'water', 'holy', 'dark'];
    attackerElement = elements[RAND(elements.length)];
  }
  
  let mult = 1.0;
  const matrix = window.ELEMENTAL_MATRIX;
  const targetElement = window.RACE_MAIN_ELEMENT[targetRaceId] || 'none';
  
  // 全局元素克制（攻击元素 vs 目标种族主元素）
  if (targetElement !== 'none' && targetElement !== 'blood' && targetElement !== 'nature') {
    if (matrix.advantage[attackerElement] && matrix.advantage[attackerElement][targetElement]) {
      mult *= matrix.advantage[attackerElement][targetElement];
    } else if (matrix.disadvantage[attackerElement] && matrix.disadvantage[attackerElement][targetElement]) {
      mult *= matrix.disadvantage[attackerElement][targetElement];
    }
  }
  
  // 攻击者种族元素亲和（使用该元素攻击更强）
  const attackerTraits = window.RACE_TRAITS ? window.RACE_TRAITS[attackerRaceId] : null;
  if (attackerTraits && attackerTraits.affinity && attackerTraits.affinity[attackerElement]) {
    mult *= attackerTraits.affinity[attackerElement];
  }
  
  // 目标种族元素弱点（受到该元素伤害更多）
  const targetTraits = window.RACE_TRAITS ? window.RACE_TRAITS[targetRaceId] : null;
  if (targetTraits && targetTraits.weakness && targetTraits.weakness[attackerElement]) {
    mult *= targetTraits.weakness[attackerElement];
  }
  
  return mult;
};

// ---------- 种族×职业偏好矩阵 ----------
window.RACE_CLASS_PREFERENCE = {
  1: { favored: [],         disfavored: [],       bonus: {} },
  2: { favored: [201,206,207,211], disfavored: [208,210], bonus: { "201": { mp: 1.05 } } },
  3: { favored: [200,208,210],     disfavored: [201,213], bonus: { "200": { atk: 1.05 } } },
  4: { favored: [204,205,210],     disfavored: [201,207], bonus: { "204": { def: 1.05 } } },
  5: { favored: [201,203,212],     disfavored: [202,209], bonus: { "201": { atk: 1.05 } } },
  6: { favored: [202,209,213],     disfavored: [203,212], bonus: { "202": { mp: 1.05 } } },
  7: { favored: [200,204,210],     disfavored: [201,207], bonus: { "200": { hp: 1.05 } } },
  8: { favored: [201,206,214],     disfavored: [208,210], bonus: { "206": { spd: 1.05 } } },
  9: { favored: [203,207,212],     disfavored: [202,209], bonus: { "203": { spd: 1.05 } } },
  10:{ favored: [],                disfavored: [],       bonus: {} }
};

// ---------- 种族职业限制（禁止列表） ----------
window.RACE_CLASS_RESTRICTIONS = {
    1: [],                           // 人类：无限制
    2: [204, 208],                   // 精灵：不能骑士、格斗家（体质脆弱）
    3: [201, 202, 209, 213],         // 兽人：不能魔法师、神官、巫女、医者（魔力低下）
    4: [207, 212, 214],              // 矮人：不能忍者、暗杀者、舞娘（速度迟缓）
    5: [202, 204, 209],              // 魔族：不能神官、骑士、巫女（黑暗与神圣/守护冲突）
    6: [203, 207, 212],              // 天使：不能盗贼、忍者、暗杀者（神圣种族不适合暗影）
    7: [201, 205, 207],              // 龙人：不能魔法师、炼金术士、忍者（行动迟缓）
    8: [204, 208],                   // 海族：不能骑士、格斗家（水生种族不适合陆地格斗/重甲）
    9: [202, 209, 213],              // 吸血鬼：不能神官、巫女、医者（惧怕圣光）
    10: []                           // 恶魔混血：无限制
};

// V5.0: 覆盖治疗职业列表（确保在 CLASS_DEFS 加载后执行）
window.HEALER_CLASS_IDS = Object.keys(window.CLASS_DEFS || {}).map(Number).filter(id => {
    const role = window.CLASS_DEFS[id].role;
    return role && (role.includes('healer') || role.includes('heal'));
});

// ============================================
// V7.0: 称号系统 — 前缀池与后缀池
// ============================================

// ---------- 勇者方前缀池（按等级区间） ----------
window.HERO_TITLE_PREFIXES = [
    { minLv: 0,  maxLv: 49,  names: ['初出茅庐的', '青涩的', '见习的'] },
    { minLv: 50, maxLv: 69,  names: ['勇敢的', '坚韧的', '经验丰富的'] },
    { minLv: 70, maxLv: 89,  names: ['传说的', '耀眼的', '令人敬畏的'] },
    { minLv: 90, maxLv: 119, names: ['神话的', '无敌的', '举世闻名的'] },
    { minLv: 120, maxLv: 149, names: ['至高的', '神圣的', '不可战胜的'] },
    { minLv: 150, maxLv: 199, names: ['神选的', '天启的', '超越凡人的'] },
    { minLv: 200, maxLv: 999, names: ['永恒的', '宇宙级的', '创世之'] },
];

// ---------- 魔王方前缀池（按等级区间） ----------
window.SLAVE_TITLE_PREFIXES = [
    { minLv: 0,  maxLv: 49,  names: ['迷茫的', '堕落的', '迷失的'] },
    { minLv: 50, maxLv: 69,  names: ['黑暗的', '嗜血的', '冷酷的'] },
    { minLv: 70, maxLv: 89,  names: ['深渊的', '混沌的', '毁灭的'] },
    { minLv: 90, maxLv: 119, names: ['末日的', '绝望的', '吞噬一切的'] },
    { minLv: 120, maxLv: 149, names: ['永恒的', '不朽的', '统御死亡的'] },
    { minLv: 150, maxLv: 199, names: ['魔神的', '超越地狱的', '灭世的'] },
    { minLv: 200, maxLv: 999, names: ['终焉的', '虚无的', '创世逆转的'] },
];

// ---------- 勇者方后缀池 ----------
window.HERO_LEVEL_SUFFIXES = [
    { threshold: 0,  name: '勇者' },
    { threshold: 50, name: '战士' },
    { threshold: 70, name: '骑士' },
    { threshold: 90, name: '领主' },
    { threshold: 120, name: '君王' },
    { threshold: 150, name: '半神' },
    { threshold: 200, name: '神之化身' },
];
window.HERO_ELITE_SUFFIXES = [
    { threshold: 5,  name: '猎手' },
    { threshold: 15, name: '猎人' },
    { threshold: 30, name: '猎魔人' },
    { threshold: 50, name: '斩魔者' },
    { threshold: 80, name: '魔物克星' },
    { threshold: 120, name: '万魔之主' },
];
window.HERO_BOSS_SUFFIXES = [
    { threshold: 1,  name: '探险者' },
    { threshold: 5,  name: '征服者' },
    { threshold: 10, name: '深渊行者' },
    { threshold: 15, name: '地下城主宰' },
    { threshold: 25, name: '魔王克星' },
    { threshold: 40, name: '传说终结者' },
];
window.HERO_HERO_SUFFIXES = [
    { threshold: 5,   name: '斗士' },
    { threshold: 20,  name: '决斗者' },
    { threshold: 50,  name: '竞技场之王' },
    { threshold: 100, name: '无双战神' },
    { threshold: 200, name: '杀戮机器' },
];
window.HERO_SQUAD_SUFFIXES = [
    { threshold: 1,  name: '伙伴' },
    { threshold: 10, name: '领袖' },
    { threshold: 30, name: '统帅' },
    { threshold: 60, name: '军团长' },
];

// ---------- 魔王方后缀池 ----------
window.SLAVE_LEVEL_SUFFIXES = [
    { threshold: 0,   name: '仆从' },
    { threshold: 50,  name: '奴隶' },
    { threshold: 70,  name: '仆役' },
    { threshold: 90,  name: '走狗' },
    { threshold: 120, name: '爪牙' },
    { threshold: 150, name: '魔王之手' },
    { threshold: 200, name: '混沌化身' },
];
window.SLAVE_ELITE_SUFFIXES = [
    { threshold: 5,   name: '屠夫' },
    { threshold: 15,  name: '血饮者' },
    { threshold: 30,  name: '噬魂者' },
    { threshold: 50,  name: '死亡收割' },
    { threshold: 80,  name: '灵魂吞噬者' },
    { threshold: 120, name: '冥界之主' },
];
window.SLAVE_BOSS_SUFFIXES = [
    { threshold: 1,  name: '深渊吞噬者' },
    { threshold: 5,  name: '绝望之源' },
    { threshold: 10, name: '毁灭使者' },
    { threshold: 15, name: '终焉先驱' },
    { threshold: 25, name: '末日宣告者' },
    { threshold: 40, name: '虚无之王' },
];
window.SLAVE_HERO_SUFFIXES = [
    { threshold: 5,   name: '刽子手' },
    { threshold: 20,  name: '处刑人' },
    { threshold: 50,  name: '灵魂猎手' },
    { threshold: 100, name: '魔王之刃' },
    { threshold: 200, name: '死亡天使' },
];
window.SLAVE_BETRAYAL_SUFFIXES = [
    { threshold: 1,  name: '背叛者' },
    { threshold: 5,  name: '堕落者' },
    { threshold: 15, name: '背德者' },
    { threshold: 30, name: '混沌信徒' },
];
window.SLAVE_TRAIN_SUFFIXES = [
    { threshold: 1,   name: '玩物' },
    { threshold: 10,  name: '媚奴' },
    { threshold: 30,  name: '性宠' },
    { threshold: 60,  name: '极乐奴隶' },
    { threshold: 100, name: '欲望化身' },
];
window.SLAVE_EXHERO_SUFFIXES = [
    { threshold: 1,  name: '昔日勇者' },
    { threshold: 5,  name: '堕落先驱' },
    { threshold: 10, name: '逆神者' },
    { threshold: 20, name: '反叛之影' },
];
