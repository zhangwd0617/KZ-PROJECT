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
    15: { name: "话术", category: "mental" },
    16: { name: "侍奉精神", category: "mental" },
    17: { name: "露出癖", category: "mental" },
    20: { name: "抖Ｓ气质", category: "fetish" },
    21: { name: "抖Ｍ气质", category: "fetish" },
    22: { name: "百合气质", category: "fetish" },
    23: { name: "搞基气质", category: "fetish" },
    30: { name: "性交中毒", category: "addiction" },
    31: { name: "自慰中毒", category: "addiction" },
    32: { name: "精液中毒", category: "addiction" },
    33: { name: "百合中毒", category: "addiction" },
    34: { name: "卖春中毒", category: "addiction" },
    35: { name: "兽奸中毒", category: "addiction" },
    36: { name: "露出中毒", category: "addiction" },
    37: { name: "ＢＬ中毒", category: "addiction" },
    100: { name: "学习能力", category: "otherworld" },
    101: { name: "运动能力", category: "otherworld" },
    102: { name: "战斗能力", category: "otherworld" },
    103: { name: "感受性", category: "otherworld" }
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
    // 元素能力
    275: { name: "火之能力者", type: "bool", group: "element" },
    276: { name: "冰之能力者", type: "bool", group: "element" },
    277: { name: "雷之能力者", type: "bool", group: "element" },
    278: { name: "光之能力者", type: "bool", group: "element" },
    279: { name: "暗之能力者", type: "bool", group: "element" },
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
    // 补充定义（原游戏有但项目中缺失）
    57: { name: "抄袭者", type: "bool", group: "tech" },
    79: { name: "男人婆", type: "bool", group: "orientation" },
    140: { name: "母亲", type: "bool", group: "special" },
    141: { name: "姐姐", type: "bool", group: "special" },
    142: { name: "女儿", type: "bool", group: "special" },
    143: { name: "妹妹", type: "bool", group: "special" },
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
    290: { name: "妖怪", type: "bool", group: "special" },
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
    0: { name: "苦痛刻印", max: 3 },
    1: { name: "快乐刻印", max: 3 },
    2: { name: "屈服刻印", max: 3 },
    3: { name: "反抗刻印", max: 3 },
    4: { name: "恐怖刻印", max: 3 },
    5: { name: "淫乱刻印", max: 3 },
    6: { name: "反发刻印", max: 3 },
    7: { name: "哀伤刻印", max: 3 }
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

    // === 消耗品 ===
    20: { name: "润滑液", price: 100, type: "consumable", description: "透明粘稠液体。使用效果：涂抹后大幅润滑，减少插入疼痛，A/V快感更容易累积。" },
    21: { name: "媚药", price: 500, type: "consumable", description: "粉色催情药剂。使用效果：服用后全身敏感带觉醒，全部快感+30%，欲情大幅提升。" },
    22: { name: "利尿剂", price: 300, type: "consumable", description: "促进代谢的药丸。使用效果：加速膀胱充盈，羞耻感与放尿欲望增加，适合羞辱Play。" },
    23: { name: "避孕套", price: 50, type: "consumable", description: "薄橡胶 sheath。使用效果：性行为时使用，防止受孕，但会降低部分快感。" },
    31: { name: "电池", price: 200, type: "consumable", description: "魔力结晶电池。使用效果：为电动道具供能，消耗品，一次使用耗尽。" },
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
    10: { name: "振动宝石", category: "tool", group: "tool" },
    11: { name: "振动杖", category: "tool", group: "tool" },
    12: { name: "肛门蠕虫", category: "tool", group: "tool" },
    13: { name: "阴蒂夹", category: "tool", group: "tool" },
    14: { name: "乳头夹", category: "tool", group: "tool" },
    15: { name: "搾乳器", category: "tool", group: "tool" },
    16: { name: "飞机杯", category: "tool", group: "tool" },
    17: { name: "淋浴", category: "tool", group: "tool" },
    18: { name: "肛门珠", category: "tool", group: "tool" },
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
    41: { name: "鞭子", category: "sm", group: "sm" },
    42: { name: "针", category: "sm", group: "sm" },
    43: { name: "眼罩", category: "sm", group: "sm" },
    44: { name: "绳索", category: "sm", group: "sm" },
    45: { name: "口球", category: "sm", group: "sm" },
    46: { name: "浣肠器+栓", category: "sm", group: "sm" },
    47: { name: "束缚装", category: "sm", group: "sm" },
    48: { name: "踩踏", category: "sm", group: "sm" },
    49: { name: "肛门电极", category: "sm", group: "sm" },
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

};

// 指令分组（用于过滤）
window.TRAIN_GROUPS = {
    "caress": [0,1,2,3,4,5,6,7,8,9,122,135],
    "tool": [10,11,12,13,14,15,16,17,18,19],
    "vaginal": [20,21,22,23,24,120,121,128,129,130,131,132,133,134],
    "anal": [25,26,27,28,29],
    "service": [30,31,32,33,34,35,36,37,38,123,125,126],
    "sm": [40,41,42,43,44,45,46,47,48,49],
    "assistant": [60,61,62,63,64,65,66,67,68,69,70,71,900,901],
    "special": [50,51,52,53,54,55,56,57,58,59,72,73,110,989,990,991,992,998,999],
    "rough": [80,81,82,83,84,85,87,90,111,124,127],
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
    15: { juelType: 7,  maxLv: 10, name: "话术",     expCond: { 12: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } }, // 简化为性交经验替代
    16: { juelType: 6,  maxLv: 10, name: "侍奉精神", expCond: { 21: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } }, // 侍奉快乐经验
    17: { juelType: 8,  maxLv: 10, name: "露出癖",   expCond: { 5: [0, 1, 5, 15, 40, 80, 150, 250, 400, 700] } }, // 异常经验替代露出

    // 性癖系
    20: { juelType: 9,  maxLv: 10, name: "抖Ｓ气质", expCond: { 33: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } }, // 施虐快乐经验
    21: { juelType: 6,  maxLv: 10, name: "抖Ｍ气质", expCond: { 30: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } }, // 被虐快乐经验
    22: { juelType: 6,  maxLv: 10, name: "百合气质", expCond: { 40: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } },
    23: { juelType: 6,  maxLv: 10, name: "搞基气质", expCond: { 41: [0, 5, 15, 40, 80, 150, 250, 400, 600, 900] } },

    // 中毒系
    30: { juelType: 5,  maxLv: 10, name: "性交中毒", expCond: { 4: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    31: { juelType: 5,  maxLv: 10, name: "自慰中毒", expCond: { 10: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    32: { juelType: 5,  maxLv: 10, name: "精液中毒", expCond: { 20: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    33: { juelType: 5,  maxLv: 10, name: "百合中毒", expCond: { 40: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },
    34: { juelType: 5,  maxLv: 10, name: "卖春中毒", expCond: { 4: [0, 5, 20, 60, 120, 200, 350, 550, 800, 1200] } },
    36: { juelType: 5,  maxLv: 10, name: "露出中毒", expCond: { 5: [0, 5, 20, 60, 120, 200, 350, 550, 800, 1200] } },
    37: { juelType: 5,  maxLv: 10, name: "ＢＬ中毒", expCond: { 41: [0, 10, 30, 80, 150, 250, 400, 600, 900, 1500] } },

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
    200:{ rank: 5, desc: "需调教经验80+" },
    208:{ rank: 5, desc: "需调教经验80+" },
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

// ========== 地下城怪物定义 (FLOOR_MONSTER_DEFS) ==========
// 每层配置不同等级的怪物，等级区间: 层数 × 5 ~ 层数 × 10
// 属性: name(名称), level(等级), hp(体力), mp(气力), atk(攻击), def(防御), spd(速度), icon(图标), description(描述)

window.FLOOR_MONSTER_DEFS = {
    1: [ // 幽暗洞穴  Lv5~10
        { name: "洞穴蝙蝠",    level: 5,  hp: 350,  mp: 120, atk: 35, def: 18, spd: 12, icon: "🦇", description: "倒挂在洞顶的蝙蝠群，数量众多" },
        { name: "巨型老鼠",    level: 7,  hp: 480,  mp: 100, atk: 42, def: 22, spd: 15, icon: "🐀", description: "被魔力侵蚀的巨型老鼠，牙齿带有毒素" },
        { name: "洞穴史莱姆",  level: 8,  hp: 550,  mp: 150, atk: 38, def: 30, spd: 8,  icon: "💧", description: "吸收了洞穴魔力的蓝色史莱姆" },
        { name: "岩蜥",        level: 10, hp: 700,  mp: 80,  atk: 50, def: 35, spd: 10, icon: "🦎", description: "潜伏在岩石缝隙中的捕食者" },
    ],
    2: [ // 翡翠洞窟  Lv10~20
        { name: "毒孢子蘑菇",  level: 10, hp: 650,  mp: 200, atk: 45, def: 25, spd: 9,  icon: "🍄", description: "散发剧毒孢子的发光蘑菇" },
        { name: "翡翠蜘蛛",    level: 12, hp: 800,  mp: 180, atk: 55, def: 30, spd: 18, icon: "🕷️", description: "拥有翡翠色外壳的剧毒蜘蛛" },
        { name: "苔藓蜥蜴人",  level: 15, hp: 1000, mp: 250, atk: 68, def: 40, spd: 14, icon: "🦎", description: "身上长满发光苔藓的蜥蜴人战士" },
        { name: "食苔巨虫",    level: 18, hp: 1300, mp: 150, atk: 75, def: 50, spd: 11, icon: "🐛", description: "以魔力苔藓为食的巨大蠕虫" },
    ],
    3: [ // 腐沼雨林  Lv15~30
        { name: "沼泽鳄鱼",    level: 15, hp: 1100, mp: 200, atk: 70, def: 45, spd: 13, icon: "🐊", description: "潜伏在沼泽深处的巨型鳄鱼" },
        { name: "食人花",      level: 18, hp: 950,  mp: 300, atk: 65, def: 35, spd: 16, icon: "🌺", description: "巨大的肉食植物，花瓣如同利齿" },
        { name: "沼灵",        level: 22, hp: 1400, mp: 400, atk: 82, def: 48, spd: 20, icon: "👻", description: "由沼泽怨念凝聚而成的灵体" },
        { name: "腐沼巨蛙",    level: 25, hp: 1600, mp: 250, atk: 90, def: 55, spd: 17, icon: "🐸", description: "吞下整头牛的巨型毒蛙" },
        { name: "雨林蟒蛇",    level: 28, hp: 1800, mp: 200, atk: 95, def: 50, spd: 22, icon: "🐍", description: "长达十米的魔力蟒蛇，缠绕力惊人" },
    ],
    4: [ // 霜皑冰原  Lv20~40
        { name: "冰原狼",      level: 20, hp: 1300, mp: 200, atk: 85, def: 45, spd: 25, icon: "🐺", description: "毛发如冰晶般的狼群首领" },
        { name: "小雪怪",      level: 25, hp: 1700, mp: 150, atk: 95, def: 60, spd: 12, icon: "❄️", description: "由积雪和魔力构成的低级雪怪" },
        { name: "冰元素",      level: 30, hp: 2000, mp: 500, atk: 110, def: 70, spd: 18, icon: "🧊", description: "纯粹的冰元素生物，触碰即冻伤" },
        { name: "冰霜巨熊",    level: 35, hp: 2500, mp: 200, atk: 130, def: 85, spd: 14, icon: "🐻", description: "冰原的霸主，一掌可碎巨石" },
        { name: "冰龙幼崽",    level: 40, hp: 3000, mp: 600, atk: 150, def: 95, spd: 20, icon: "🐉", description: "误入冰原的幼龙，已能喷吐冰息" },
    ],
    5: [ // 熔火深渊  Lv25~50
        { name: "火蜥蜴",      level: 25, hp: 1500, mp: 300, atk: 100, def: 55, spd: 20, icon: "🦎", description: "在岩浆边缘栖息的火属性蜥蜴" },
        { name: "熔岩史莱姆",  level: 30, hp: 1800, mp: 400, atk: 110, def: 80, spd: 10, icon: "🔥", description: "体内流淌着熔岩的灼热史莱姆" },
        { name: "炎魔",        level: 35, hp: 2200, mp: 550, atk: 135, def: 70, spd: 22, icon: "👹", description: "从熔岩中诞生的低级恶魔" },
        { name: "岩浆巨人",    level: 42, hp: 2800, mp: 300, atk: 160, def: 100, spd: 8,  icon: "🌋", description: "由凝固岩浆组成的巨型魔像" },
        { name: "地狱犬",      level: 48, hp: 3200, mp: 450, atk: 175, def: 85, spd: 28, icon: "🐕", description: "三头地狱犬的幼体，已能喷火" },
        { name: "红龙",        level: 50, hp: 3500, mp: 700, atk: 190, def: 110, spd: 18, icon: "🐲", description: "守护深渊入口的红龙" },
    ],
    6: [ // 幻梦镜界  Lv30~60
        { name: "镜妖",        level: 30, hp: 1600, mp: 500, atk: 105, def: 65, spd: 24, icon: "🪞", description: "从镜子中爬出的扭曲妖怪" },
        { name: "幻影刺客",    level: 38, hp: 2000, mp: 400, atk: 145, def: 55, spd: 35, icon: "👤", description: "由幻觉凝聚的刺客，虚实难辨" },
        { name: "梦境兽",      level: 45, hp: 2600, mp: 600, atk: 165, def: 80, spd: 26, icon: "🦄", description: "吞噬梦境的异界生物" },
        { name: "虚空之眼",    level: 52, hp: 3000, mp: 800, atk: 180, def: 90, spd: 22, icon: "👁️", description: "凝视它的人会陷入永恒的噩梦" },
        { name: "镜像勇者",    level: 55, hp: 3200, mp: 550, atk: 170, def: 100, spd: 28, icon: "🎭", description: "镜界制造的勇者复制品" },
        { name: "梦魇",        level: 60, hp: 3800, mp: 900, atk: 200, def: 110, spd: 30, icon: "😈", description: "操控梦境的上级恶魔" },
    ],
    7: [ // 死寂沙海  Lv35~70
        { name: "沙虫",        level: 35, hp: 2000, mp: 250, atk: 130, def: 70, spd: 18, icon: "🐛", description: "潜伏在沙下伺机而动的巨型沙虫" },
        { name: "木乃伊",      level: 42, hp: 2400, mp: 400, atk: 145, def: 90, spd: 12, icon: "🧟", description: "古代诅咒复活的干尸战士" },
        { name: "沙元素",      level: 48, hp: 2800, mp: 550, atk: 160, def: 100, spd: 20, icon: "🏜️", description: "由沙砾构成的元素生物" },
        { name: "蝎王",        level: 55, hp: 3200, mp: 350, atk: 185, def: 95, spd: 32, icon: "🦂", description: "拥有剧毒的沙漠蝎王" },
        { name: "法老亡灵",    level: 62, hp: 3600, mp: 700, atk: 195, def: 120, spd: 16, icon: "👑", description: "古代地下王国法老的亡灵" },
        { name: "沙海巨鲸",    level: 70, hp: 4500, mp: 500, atk: 220, def: 130, spd: 14, icon: "🐋", description: "在沙海中游弋的传说巨兽" },
    ],
    8: [ // 地下王城  Lv40~80
        { name: "石像鬼",      level: 40, hp: 2200, mp: 350, atk: 150, def: 100, spd: 22, icon: "🗿", description: "古代宫殿的守卫雕像突然活了过来" },
        { name: "亡灵骑士",    level: 48, hp: 2800, mp: 400, atk: 175, def: 115, spd: 20, icon: "💀", description: "效忠古代王国的亡灵骑士" },
        { name: "古代守卫",    level: 55, hp: 3200, mp: 500, atk: 190, def: 130, spd: 18, icon: "🛡️", description: "古代魔法强化的宫殿守卫" },
        { name: "暗影刺客",    level: 62, hp: 2800, mp: 450, atk: 210, def: 85, spd: 38, icon: "🥷", description: "潜伏在王城阴影中的暗杀者" },
        { name: "魔导傀儡",    level: 70, hp: 4000, mp: 800, atk: 230, def: 140, spd: 15, icon: "🤖", description: "古代魔导技术的最高杰作" },
        { name: "死亡骑士",    level: 78, hp: 4500, mp: 600, atk: 250, def: 150, spd: 22, icon: "⚔️", description: "统领亡灵军团的死亡骑士" },
        { name: "古代龙王",    level: 80, hp: 5000, mp: 900, atk: 260, def: 160, spd: 20, icon: "🐉", description: "古代王国的守护龙，沉睡了千年" },
    ],
    9: [ // 狂风苔原  Lv45~90
        { name: "风狼",        level: 45, hp: 2400, mp: 300, atk: 165, def: 80, spd: 35, icon: "🐺", description: "驾驭狂风的风元素狼群" },
        { name: "冰霜巨人",    level: 52, hp: 3200, mp: 400, atk: 190, def: 120, spd: 12, icon: "🧊", description: "身高五米的冰霜巨人" },
        { name: "风暴元素",    level: 58, hp: 3400, mp: 700, atk: 200, def: 100, spd: 40, icon: "🌪️", description: "纯粹风暴凝聚的元素生物" },
        { name: "雪女",        level: 65, hp: 3000, mp: 850, atk: 185, def: 95, spd: 32, icon: "👻", description: "在暴风雪中出现的神秘雪女" },
        { name: "雷神鹰",      level: 72, hp: 3600, mp: 600, atk: 220, def: 110, spd: 42, icon: "🦅", description: "羽翼带电的传说猛禽" },
        { name: "世界蛇",      level: 85, hp: 5000, mp: 800, atk: 260, def: 140, spd: 28, icon: "🐍", description: "盘踞在苔原深处的世界蛇遗种" },
        { name: "芬里尔",      level: 90, hp: 5500, mp: 700, atk: 280, def: 150, spd: 35, icon: "🐺", description: "传说中的魔狼，呼出的气息能冻结灵魂" },
    ],
    10: [ // 魔王宫殿  Lv50~100
        { name: "恶魔卫士",    level: 50, hp: 2800, mp: 400, atk: 175, def: 110, spd: 22, icon: "👿", description: "魔王宫殿的普通守卫" },
        { name: "黑暗骑士",    level: 60, hp: 3500, mp: 500, atk: 210, def: 135, spd: 20, icon: "🛡️", description: "身穿黑曜石铠甲的精英骑士" },
        { name: "深渊法师",    level: 70, hp: 3200, mp: 1000, atk: 230, def: 100, spd: 28, icon: "🧙", description: "钻研深渊魔法的宫廷法师" },
        { name: "魔龙",        level: 80, hp: 4800, mp: 800, atk: 270, def: 160, spd: 24, icon: "🐲", description: "臣服于魔王的强大魔龙" },
        { name: "堕天使",      level: 88, hp: 4500, mp: 950, atk: 260, def: 140, spd: 38, icon: "😇", description: "堕落的天界使者，拥有神圣与黑暗的双重力量" },
        { name: "混沌恶魔",    level: 95, hp: 5500, mp: 900, atk: 300, def: 170, spd: 30, icon: "👹", description: "从混沌中诞生的上级恶魔" },
        { name: "魔王亲卫队",  level: 100, hp: 6500, mp: 1000, atk: 320, def: 190, spd: 32, icon: "👑", description: "魔王直属的亲卫队队长，仅次于魔王的存在" },
    ]
};

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
window.BASIC_SHOP_ITEMS = [0, 1, 2, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 23, 31, 30, 40, 50, 70];


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
// 使用 cflag[920] 作为位掩码存储异常状态
// 使用 cflag[921-930] 存储各状态的持续回合
window.STATUS_AILMENT_DEFS = {
    curse: {
        id: 0, name: "诅咒", bit: 1,
        desc: "被黑暗力量缠绕，全属性大幅下降。只能通过城镇神官或特殊道具解除。",
        effect: { atkMod: -0.20, defMod: -0.20, spdMod: -0.20 },
        dot: { type: "none" },
        actionBlock: 0,
        cureMethods: ["town_priest", "special_item"],
        cureChance: { camp: 0, healer_event: 0, ally_healer: 0 }
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
    confusion: 929, charm: 930
};

// 治疗职业列表（用于队伍中自动恢复异常状态）
window.HEALER_CLASS_IDS = [202, 209]; // 神官、巫女

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
                北欧: {
                    family: ["埃里克森", "古斯塔夫松", "尼尔森", "安德森", "斯文森", "奥拉夫森", "哈康森", "弗雷德里克森", "比约恩森", "西格德森", "托尔斯坦森", "维京松", "拉格纳森", "阿斯加德", "约顿海姆"],
                    given: ["托尔", "埃里克", "古斯塔夫", "斯文", "奥拉夫", "哈康", "弗雷德里克", "比约恩", "西格德", "拉格纳", "维京", "奥丁", "洛基", "巴德尔", "弗雷"]
                },
                英美: {
                    family: ["史密斯", "约翰逊", "威廉姆斯", "布朗", "琼斯", "米勒", "戴维斯", "威尔逊", "摩尔", "泰勒", "安德森", "托马斯", "杰克逊", "怀特", "哈里斯"],
                    given: ["詹姆斯", "约翰", "罗伯特", "迈克尔", "威廉", "大卫", "理查德", "约瑟夫", "托马斯", "查尔斯", "丹尼尔", "马修", "安东尼", "马克", "保罗"]
                },
                东亚: {
                    family: ["李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高"],
                    given: ["伟", "强", "明", "浩", "杰", "勇", "磊", "军", "平", "刚", "鹏", "波", "宇", "飞", "峰"]
                },
                东方: {
                    family: ["慕容", "欧阳", "司徒", "南宫", "上官", "诸葛", "司马", "独孤", "皇甫", "尉迟", "轩辕", "令狐", "宇文", "长孙", "百里"],
                    given: ["天翔", "凌风", "云飞", "无痕", "墨渊", "星河", "苍穹", "玄武", "青龙", "白虎", "朱雀", "玄霄", "无尘", "惊鸿", "绝尘"]
                },
                日本: {
                    family: ["佐藤", "铃木", "高桥", "田中", "伊藤", "渡边", "山本", "中村", "小林", "加藤", "吉田", "山田", "佐佐木", "山口", "松本"],
                    given: ["健太", "翔", "拓也", "大和", "光", "海斗", "莲", "苍太", "悠真", "凛", "飒太", "葵", "阳向", "奏太", "望"]
                }
            }
        },
        female: {
            namePrefix: "",
            namePools: {
                北欧: {
                    family: ["埃里克森", "古斯塔夫松", "尼尔森", "安德森", "斯文森", "奥拉夫森", "哈康森", "弗雷德里克森", "比约恩森", "西格德森", "托尔斯坦森", "维京松", "拉格纳森", "阿斯加德", "约顿海姆"],
                    given: ["芙蕾雅", "希尔德", "英格丽德", "阿斯特丽德", "西格丽德", "拉格娜", "布伦希尔德", "薇尔丹蒂", "诗蔻蒂", "乌尔德", "伊登", "丝卡蒂", "南娜", "芙拉", "艾拉"]
                },
                英美: {
                    family: ["史密斯", "约翰逊", "威廉姆斯", "布朗", "琼斯", "米勒", "戴维斯", "威尔逊", "摩尔", "泰勒", "安德森", "托马斯", "杰克逊", "怀特", "哈里斯"],
                    given: ["艾米莉", "艾玛", "奥利维亚", "索菲亚", "伊莎贝拉", "米娅", "夏洛特", "阿米莉亚", "哈珀", "伊芙琳", "阿比盖尔", "伊丽莎白", "维多利亚", "格蕾丝", "克洛伊"]
                },
                东亚: {
                    family: ["李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高"],
                    given: ["芳", "敏", "静", "丽", "雪", "婷", "娜", "琳", "欣", "怡", "慧", "萍", "霞", "燕", "颖"]
                },
                东方: {
                    family: ["慕容", "欧阳", "司徒", "南宫", "上官", "诸葛", "司马", "独孤", "皇甫", "尉迟", "轩辕", "令狐", "宇文", "长孙", "百里"],
                    given: ["芷若", "灵儿", "梦瑶", "婉儿", "清漪", "紫萱", "月华", "倾城", "流萤", "落雁", "凝香", "素心", "琉璃", "璎珞", "芊芊"]
                },
                日本: {
                    family: ["佐藤", "铃木", "高桥", "田中", "伊藤", "渡边", "山本", "中村", "小林", "加藤", "吉田", "山田", "佐佐木", "山口", "松本"],
                    given: ["樱", "爱", "美咲", "由衣", "结衣", "凛", "葵", "阳菜", "琴音", "芽衣", "明日香", "绫波", "真希", "雪乃", "诗音"]
                }
            }
        }
    }
};


// ========== 精英怪物类型定义 ==========
window.ELITE_TYPE_DEFS = {
    chief: {
        name: "首领",
        levelMod: 0,        // 等级 = 楼层最大等级
        statMult: 1.05,     // 属性 × 1.05
        namePrefix: "首领·",
        dropRarityBonus: 1, // 稀有度保底+1
        dropFloorOffset: 0, // 掉落装备楼层偏移
        icon: "👑",
        descSuffix: "【首领级】"
    },
    overlord: {
        name: "霸主",
        levelMod: 5,        // 等级 = 楼层最大等级 + 5
        statMult: 1.10,     // 属性 × 1.10
        namePrefix: "霸主·",
        dropRarityBonus: 2, // 稀有度保底+2
        dropFloorOffset: 1, // 有概率掉落下一楼层装备
        icon: "💀",
        descSuffix: "【霸主级】"
    }
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
    3: { name: "回城恢复", icon: "🏥", desc: "返回城镇恢复伤势" }
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

// 职业相性基础值 (0-100) — 使用 cflag[950] 的英雄职业ID
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
