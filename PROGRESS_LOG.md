# ERA Maou EX — 复刻项目进度日志

> **此文件记录复刻项目当前进度，供AI助手继续开发时参考。**  
> **创建时间:** 2026-04-17  
> **原始游戏:** eraMaouEx-master (Emuera引擎, ~253 ERB文件)  
> **复刻版本:** v0.1.0 网页重构版 (纯HTML/JS/CSS)  
> **复刻目录:** `D:\KZ PROJECT`  
> **原始目录:** `E:\SSTM\eraa\era\eraMaouEx-master`  

---

## 一、项目架构总览

### 1.1 原始游戏架构 (Emuera)
```
eraMaouEx-master/
├── CSV/           # 数据定义 (Abl/Talent/Item/Train/Mark/Palam/Source/Chara/Str/Config)
├── ERB/           # 游戏逻辑脚本 (~253个文件)
├── resources/     # 图片/UI素材
├── sav/           # 存档目录
├── Emuera1824cn.exe  # 游戏引擎
└── README.md      # 版本: eraMaou ver0.92 / Ex 2.1
```

### 1.2 复刻版本架构 (Web)
```
D:\KZ PROJECT/
├── index.html              # 入口HTML + CSS样式
├── js/
│   ├── main.js             # 程序入口: UI.init() → new Game() → setState('TITLE')
│   ├── engine/
│   │   ├── EmueraCore.js   # Emuera全局函数模拟 (RAND/LIMIT/MAX/MIN等)
│   │   ├── Game.js         # 游戏主控制器 + 状态机
│   │   ├── Character.js    # 角色数据模型 (平行数组架构)
│   │   └── SaveManager.js  # localStorage存档系统 (8档位)
│   ├── data/
│   │   ├── Definitions.js  # ABL/TALENT/PALAM/EXP/MARK/ITEM/TRAIN/SOURCE/ABLUP全量定义
│   │   └── CharaTemplates.js  # 43个角色模板
│   ├── systems/
│   │   ├── TrainSystem.js      # 训练指令执行 + Source计算 + 后处理
│   │   ├── DialogueSystem.js   # 口上/对话调度系统
│   │   └── ShopSystem.js       # 商店 + 日夜结束处理
│   ├── ui/
│   │   └── UI.js               # 所有界面渲染 (标题/主菜单/训练/ABLUP/商店/存档等)
│   └── dialogues/
│       ├── _index.js           # 对话注册表
│       ├── _loader.js          # 对话加载器
│       ├── personality/        # 19种性格对话 (K0-K19)
│       │   ├── K0.js  (慈爱)
│       │   ├── K1.js  (自信家)
│       │   ├── K2.js  (懦弱)
│       │   ├── K3.js  (高贵)
│       │   ├── K4.js  (冷静)
│       │   ├── K5.js  (魔王/マオ)
│       │   ├── K6.js  (恶女)
│       │   ├── K7.js  (红桃)
│       │   ├── K8.js  (黑桃)
│       │   ├── K9.js  (方块)
│       │   ├── K10.js (梅花)
│       │   ├── K11.js (莉莉)
│       │   ├── K12.js (知的)
│       │   ├── K13.js (庇护者)
│       │   ├── K14.js (贵公子)
│       │   ├── K15.js (伶俐)
│       │   └── K19.js (菲娅)
│       ├── exclusive/          # 专属角色对话
│       │   ├── K903.js (嘉德)
│       │   └── K904.js (菲娅)
│       └── mods/               # (空, 预留)
├── tools/
│   ├── extract-dialogue.js     # 口上文本提取工具
│   └── fix_reactions.py
├── FUNCTION_GAP_ANALYSIS.md    # 功能差距分析文档 (详细版)
└── PROGRESS_LOG.md             # ← 本文件
```

---

## 二、功能模块对比总表

| 大类 | 原始文件数 | 复刻状态 | 完成度 | 关键缺失 |
|------|-----------|---------|--------|---------|
| **核心引擎/入口** | ~12 | 🟡 框架完整 | ~60% | CONFIG, DEBUG, 扩展命令 |
| **训练循环** | ~11 | 🟡 可运行 | ~50% | 自动调教, 命令重排, EVENTCOMEND |
| **训练指令** | ~89 | ✅ 基本补全 | ~98% | 避孕套逻辑, 部分高级判定 |
| **角色系统** | ~27 | 🟡 基础可用 | ~15% | 身体生成, 自定义, 家族, 职业变更 |
| **能力/等级** | ~27 | 🟡 UI可用 | ~10% | ABLUP独立处理(27文件), LVUP |
| **商店/经济** | ~15 | 🟡 基础买卖 | ~25% | 实验室/裁缝/怪物店, 税收, 视频/奶贩卖 |
| **地牢/战斗** | ~15 | ❌ 未开始 | ~3% | 全部缺失 |
| **侵略/征服** | ~9 | ❌ 未开始 | 0% | 全部缺失 |
| **事件系统** | ~25 | 🟡 基础框架 | ~20% | 月末/安息日/成瘾/满月/离开 |
| **口上/对话** | ~25 | 🟡 框架+部分文本 | ~20% | 大量性格文本待提取 |
| **妊娠系统** | ~2 | ❌ 未开始 | 0% | 全部缺失 |
| **特殊系统** | ~20 | ❌ 大部分缺失 | ~5% | 处刑/博物馆/NTR/肉便器/装备 |
| **结局系统** | ~3 | ❌ 未开始 | 0% | 全部缺失 |
| **MOD扩展** | ~4 | ❌ 未开始 | 0% | 全部缺失 |

---

## 三、详细功能对比

### 3.1 核心引擎/入口 (12 ERB → 4 JS)

| 原始文件 | 原始功能 | 复刻文件 | 复刻状态 | 备注 |
|---------|---------|---------|---------|------|
| `TITLE.ERB` | 标题画面 (新游戏/读档) | `UI.renderTitle()` | ✅ | 已实现 |
| `SYSTEM.ERB` | 系统核心入口 (EVENTFIRST/EVENTTURNEND/EVENTLOAD) | `Game.eventFirst()` / `eventTurnEnd()` | 🟡 | 简化版，缺开场剧情 |
| `SHOP.ERB` | 主菜单/商店界面 | `UI.renderShop()` | 🟡 | 基础按钮已覆盖 |
| `TRAIN_MAIN.ERB` | 调教主循环 | `Game.eventTrain()` | 🟡 | 简化版，缺复杂状态管理 |
| `USERCOM.ERB` | 用户通用指令 (过滤器/信息/切换助手) | `UI._renderTrainCommands()` | 🟡 | 过滤器已实现，缺信息面板 |
| `COMABLE.ERB` | 命令可用性判定 (~4500行) | `UI._checkComAble()` | 🟡 | 主要条件已覆盖，缺复杂判定 |
| `COMORDER.ERB` | 命令排序 | — | ❌ | 未实现 |
| `COM_REGISTER.ERB` | 调教菜单登录 (自动调教序列) | — | ❌ | 未实现 |
| `EXCOM.ERB` | 扩展命令系统 | — | ❌ | 未实现 |
| `CONFIG.ERB` | 游戏配置 | — | ❌ | 未实现 |
| `TEST.ERB` | 调试/测试功能 | — | ❌ | 未实现 |
| `DATA_FIX.ERB` | 数据兼容性修复 | — | ❌ | 未实现 |

**状态机流转:** `TITLE` → `FIRST` → `SHOP` → `TRAIN` → `AFTERTRAIN` → `ABLUP` → `TURNEND` → `SHOP`

### 3.2 训练指令 (89 COMF*.ERB → TrainSystem.js)

**执行方法映射:**
| Category | 原始 | 复刻方法 | 状态 |
|---------|------|---------|------|
| 爱抚 (0-9,122,135) | COMF0~COMF9, COMF122, COMF135 | `_execCaress()` | ✅ |
| 道具 (10-19) | COMF10~COMF19 | `_execTool()` | ✅ |
| 阴道 (20-24,120-134) | COMF20~COMF24, COMF120~COMF134 | `_execVagina()` | ✅ |
| 肛门 (25-29) | COMF25~COMF29 | `_execAnal()` | ✅ |
| 侍奉 (30-38,123-126) | COMF30~COMF38, COMF123~COMF126 | `_execService()` | ✅ |
| SM (40-49) | COMF40~COMF49 | `_execSM()` | ✅ |
| 特殊道具 (50-59) | COMF50~COMF59 | `_execItem()` | ✅ |
| 助手 (60-71) | COMF60~COMF71 | `_execAssistant()` | ✅ |
| 美容 (72-73) | COMF72~COMF73 | `_execCosmetic()` | ✅ |
| 过激 (80-90,111,124,127) | COMF80~COMF90, COMF111, COMF124, COMF127 | `_execRough()` | ✅ |
| 触手 (100) | COMF100 | `_execMonster()` | ✅ |
| 穿衣脱衣 (110) | COMF110 | `_execSpecial()` | ✅ |
| 自由调教 (150) | COMF150 | `_execFree()` | ✅ |
| 斗技场 (200,208) | COMF200, COMF208 | `_execArena()` | ✅ |
| 兽奸 (89,202-207) | COMF89, COMF202~COMF207 | — | ⬜ 跳过 |

**指令解锁系统 (`TRAIN_UNLOCK`):**
| 等级 | 名称 | 所需经验 | 解锁指令范围 |
|------|------|---------|------------|
| 0 | 新手调教师 | 0 | 爱抚/接吻/对话/什么都不做等基础指令 |
| 1 | 入门调教师 | 5 | 手淫/口交/素股/打屁股/基础道具/SM等 |
| 2 | 熟练调教师 | 15 | 振动道具/标准性交/泡沫舞/助手基础/场景play等 |
| 3 | 进阶调教师 | 30 | 肛门系列/高级SM/多人/触手/高级派生命令等 |
| 4 | 专家调教师 | 50 | 拳头性交/复杂组合技/SP系列等 |
| 5 | 大师调教师 | 80 | 自由调教/斗技场等特殊模式 |

解锁条件检查: `UI._shouldHideCommand()` 中检查 `TRAIN_UNLOCK` 的 rank/items/targetAbl/targetExp/targetTalent/forbiddenTalent 条件，未满足时自动隐藏指令按钮。
魔王经验: `Game.masterExp` 每执行一个调教指令+1，存档/读档已包含。

**TEQUIP 映射表:**
| TEQUIP索引 | 含义 | 相关指令 | toggle状态 |
|-----------|------|---------|-----------|
| 10 | 眼罩 | 43 | ✅ 可toggle |
| 11 | 绳索 | 44 | ✅ 可toggle |
| 12 | 口球 | 45 | ✅ 可toggle |
| 13 | 肛门蠕虫 | 12 | ✅ 可toggle |
| 14 | 阴蒂夹 | 13 | ✅ 可toggle |
| 15 | 乳头夹 | 14 | ✅ 可toggle |
| 16 | 搾乳器 | 15 | ✅ 可toggle |
| 17 | 淋浴 | 17 | ✅ 可toggle |
| 19 | 肛门珠 | 18/19 | ✅ 插入/拉出 |
| 20 | 润滑液 | 50 | ❌ 一次性 |
| 21 | 媚药 | 51 | ❌ 一次性 |
| 22 | 利尿剂 | 52 | ❌ 一次性 |
| 46 | 灌肠+栓 | 46 | ✅ 可toggle |
| 47 | 束缚装 | 47 | ✅ 可toggle |
| 49 | 肛门电极 | 49 | ✅ 可toggle |
| 54 | 野外play | 54 | ❌ 场景切换 |
| 57 | 羞耻play | 57 | ❌ 场景切换 |
| 58 | 浴室play | 58 | ❌ 场景切换 |
| 59 | 新婚play | 59 | ❌ 场景切换 |
| 85 | 放尿标记 | 85 | ❌ 状态标记 |
| 87 | 穿环 | 87 | ✅ 可toggle |
| 90 | 触手召唤 | 100 | ❌ 召唤标记 |
| 110 | 穿衣状态 | 110/111 | ✅ 穿衣↔脱衣↔撕破 |

### 3.3 角色系统 (27 ERB → Character.js)

**数据结构 (完整Emuera平行数组):**
```javascript
class Character {
    no: number           // 模板ID
    name/callname/nickname: string
    base[30]             // HP/MP/体力等
    maxbase[30]          // 上限
    abl[110]             // 能力等级
    talent[1000]         // 素质 (0=无, >0=有)
    palam[120]           // 实时参数
    exp[100]             // 经验计数
    cflag[1000]          // 角色标记
    juel[120]            // 升级用珠子
    mark[20]             // 刻印
    equip[30]            // 装备
    tequip[100]          // 训练装备/状态
    cstr[100]            // 字符串存储
    relation[200]        // 关系
    source[30]           // 训练来源累积
}
```

**快捷属性:** `hp`, `mp`, `stamina`, `level`, `atk`, `def`

| 原始文件 | 功能 | 复刻状态 | 备注 |
|---------|------|---------|------|
| `CHARA_MAKE.ERB` | 角色创建核心 | 🟡 | 仅43个静态模板 |
| `CHARA_BODY.ERB/B` | 身体生成 | ❌ | 未实现 |
| `CHARA_CUSTOM*.ERB` | 角色自定义 | ❌ | 未实现 |
| `CHARA_INFO*.ERB` | 角色信息界面 | 🟡 | 极简显示 |
| `CHARA_JOB_CHANGE.ERB` | 职业变更 | ❌ | 未实现 |
| `CHARA_FAMILY.ERB` | 家族系统 | ❌ | 未实现 |
| `CHARA_NAME*.ERB` | 命名系统 | 🟡 | 静态模板名 |
| `LOOK.ERB` | 外貌系统 | ❌ | 未实现 |
| `FUNC_CLOTH.ERB` | 服装功能 | ❌ | 未实现 |
| `RELATION*.ERB` | 关系系统 | ❌ | 未实现 |

### 3.4 能力/等级系统 (27 ERB)

| 原始文件 | 功能 | 复刻状态 | 备注 |
|---------|------|---------|------|
| `ABL.ERB` | 能力显示界面 | 🟡 | `UI.renderAblUp()` 可用 |
| `ABLUP0~ABLUP100.ERB` | 各能力独立升级逻辑 (27文件) | ❌ | 仅通用成本表 |
| `LVUP.ERB` | 等级提升 | ❌ | 未实现 |
| `GET_SPECIALTALENT.ERB` | 特殊素质获取 | ❌ | 未实现 |

**当前ABLUP:** 通用成本表 `ABLUP_COST_TABLE = [1,20,100,500,2000,8000,30000,100000,300000,1000000]`

### 3.5 商店/经济系统 (15 ERB)

| 原始文件 | 功能 | 复刻状态 | 备注 |
|---------|------|---------|------|
| `SHOP.ERB` | 主商店 | 🟡 | `UI.renderShop()` |
| `SHOP_ITEM.ERB` | 道具商店 | 🟡 | 基础购买 |
| `SHOP_TRAP.ERB` | 陷阱商店 | 🟡 | 有定义 |
| `SHOP_CHARA.ERB` | 角色买卖 | 🟡 | 卖出简化估价 |
| `SHOP_2/LABO/MONSTER/TAILOR` | 扩展商店 | ❌ | 未实现 |
| `SELL_CHARA*.ERB` | 角色贩卖/估价 | 🟡 | `_estimatePrice()` 简化 |
| `SELL_VIDEO/MILK/FIGHTMONEY/MATURO` | 各种贩卖 | ❌ | 未实现 |
| `TAX.ERB` | 税收系统 | ❌ | 未实现 |

### 3.6 地牢/战斗系统 (15 ERB)

**全部未实现。** 关键文件:
- `DUNGEON.ERB` — 地下城核心逻辑 (~1091行)
- `DUNGEON_BATLLE.ERB/B` — 战斗系统
- `DUNGEON_PARTY.ERB` — 队伍系统
- `DUNGEON_TRAP.ERB` — 陷阱系统
- `MONSTER_DATA.ERB` — 怪物数据
- `ENTER_ENEMY.ERB` — 敌人入场

### 3.7 侵略/世界征服 (9 ERB + 子目录)

**全部未实现。** 关键文件:
- `侵略/INVASION.ERB` — 侵略主逻辑
- `侵略/GROUP_BATTLE.ERB` — 军团战
- `侵略/ARCANA_BATTLE.ERB` — Arcana卡牌战斗
- `侵略/AGENT/*.ERB` — 特工系统
- `侵略/CAMPAIGN/*.ERB` — 战役系统

### 3.8 事件系统 (25 ERB)

| 原始文件 | 功能 | 复刻状态 | 备注 |
|---------|------|---------|------|
| `EVENT_BEFORETRAIN.ERB` | 调教前事件 | 🟡 | `onTrainStart()` |
| `EVENT_AFTERTRAIN.ERB` | 调教后事件 | 🟡 | `onTrainEnd()` |
| `EVENT_TRAIN_MESSAGE_A/B` | 训练消息 | 🟡 | 简化叙述 |
| `EVENT_NEXTDAY.ERB` | 翌日事件 (~2411行) | ❌ | 未实现 |
| `EVENT_NEXTMONTH.ERB` | 月末事件 | ❌ | 未实现 |
| `EVENT_TURNEND.ERB` | 回合结束事件 | 🟡 | 简化体力恢复+TEQUIP清除 |
| `EVENT_PREGNANCY.ERB` | 妊娠事件 | ❌ | 未实现 |
| `EVENT_SABBATH.ERB` | 安息日事件 | ❌ | 未实现 |
| `EVENT_ADDICT.ERB` | 成瘾事件 | ❌ | 未实现 |
| `EVENT_CHARA_LEAVE.ERB` | 角色离开 | ❌ | 未实现 |
| `FULLMOON.ERB` | 满月事件 | ❌ | 未实现 |

### 3.9 口上/对话系统 (25 ERB)

**架构:** `DialogueSystem` + `DialogueLoader` 三层优先级:
1. 专属角色对话 (CFLAG:900+chara.no → K903/K904)
2. 性格对话 (TALENT:160-179 → K0-K19)
3. MOD对话 (预留)

**事件触发点:**
- `onTrainStart()` — 训练开始
- `onCommand(target, comId)` — 指令执行
- `onTrainEnd()` — 训练结束
- `onPalamCng(target, type)` — 参数变化 (绝顶)
- `onMarkCng(target, type)` — 刻印变化
- `narrateAction()` — 动作叙述 (TRAIN_MESSAGE_B)
- `narrateResult()` — 结果叙述 (TRAIN_MESSAGE_A)

**状态桶:** `first` → `default` → `yield1~3` → `lewd/love/rebel/broken`

| 性格 | 原始文件 | 复刻文件 | 文本状态 |
|------|---------|---------|---------|
| 慈爱 | EVENT_K0 | K0.js | 🟡 框架+提取文本 (~215KB) |
| 自信家 | EVENT_K1 | K1.js | 🟡 框架+提取文本 (~202KB) |
| 懦弱 | EVENT_K2 | K2.js | 🟡 框架+提取文本 (~163KB) |
| 高贵 | EVENT_K3 | K3.js | 🟡 框架+提取文本 (~233KB) |
| 冷静 | EVENT_K4 | K4.js | 🟡 框架+提取文本 (~76KB) |
| 魔王 | EVENT_K5 | K5.js | 🟡 框架+提取文本 (~272KB) |
| 恶女 | EVENT_K6 | K6.js | 🟡 框架+提取文本 (~255KB) |
| 红桃 | EVENT_K7 | K7.js | 🟡 框架+提取文本 (~327KB) |
| 黑桃 | EVENT_K8 | K8.js | 🟡 框架+提取文本 (~265KB) |
| 方块 | EVENT_K9 | K9.js | 🟡 框架+提取文本 (~256KB) |
| 梅花 | EVENT_K10 | K10.js | 🟡 框架+提取文本 (~234KB) |
| 莉莉 | EVENT_K11 | K11.js | 🟡 框架+提取文本 (~630KB) |
| 知的 | EVENT_K12 | K12.js | 🟡 框架+提取文本 (~64KB) |
| 庇护者 | EVENT_K13 | K13.js | 🟡 框架+提取文本 (~36KB) |
| 贵公子 | EVENT_K14 | K14.js | 🟡 框架+提取文本 (~8KB) |
| 伶俐 | EVENT_K15 | K15.js | 🟡 框架+提取文本 (~79KB) |
| 菲娅 | EVENT_K19 | K19.js | 🟡 框架+提取文本 (~213KB) |
| 嘉德 | EVENT_K903 | K903.js | 🟡 专属对话 (~97KB) |
| 菲娅 | EVENT_K904 | K904.js | 🟡 专属对话 (~213KB) |

**注意:** 从文件大小看，大量文本已填充，但`DialogueSystem`的调度逻辑可能尚未完全利用所有文本。需要验证 `_loader.js` 是否正确加载所有对话数据。

### 3.10 妊娠系统 (2 ERB)

| 原始文件 | 功能 | 复刻状态 |
|---------|------|---------|
| `NINSIN.ERB` | 妊娠主系统 | ❌ 未实现 |
| `EVENT_PREGNANCY.ERB` | 妊娠事件 | ❌ 未实现 |

### 3.11 特殊系统 (20 ERB)

| 原始文件 | 功能 | 复刻状态 |
|---------|------|---------|
| `EXECUTION.ERB` | 处刑系统 | 🟡 按钮有，无逻辑 |
| `PUBLIC_EXECUTION.ERB` | 公开处刑 | ❌ |
| `BENKI.ERB` | 肉便器 | ❌ |
| `NAEDOKO.ERB` | 苗床 | ❌ |
| `MUSEUM.ERB` | 博物馆 | ❌ |
| `NTR.ERB` | NTR系统 | ❌ |
| `TATOO.ERB` | 纹身 | ❌ |
| `EQUIP.ERB` | 装备系统 | ❌ |
| `MAGIC.ERB` | 魔法系统 | ❌ |
| `MAOUNET.ERB` | 魔王网络 | ❌ |
| `INFRASTRUCTURE.ERB` | 基建系统 | ❌ |
| `LABO*.ERB` | 秘密实验室 | ❌ |
| `LOVERS.ERB` | 恋爱系统 | ❌ |
| `MARRIAGE_DAY.ERB` | 结婚/婚姻 | ❌ |
| `GROTESQUE.ERB` | 猎奇内容 | ❌ |
| `SELL_VIDEO/MILK` | 贩卖系统 | ❌ |

### 3.12 结局系统 (3 ERB)

| 原始文件 | 功能 | 复刻状态 |
|---------|------|---------|
| `ENDING.ERB` | 结局系统 (~1064行) | ❌ |
| `ENDINGDATA*.ERB` | 结局数据 | ❌ |

结局类型: ENDING_1(征服世界好结局), ENDING_2(魔王城陷落GameOver), ENDING_3(征服精灵领域), ENDING_4(征服龙族山脉), ENDING_5(征服天界)

---

## 四、关键数据结构映射

### 4.1 能力 (ABL)
```javascript
ABL_DEFS = {
    0: "阴蒂感觉", 1: "胸部感觉", 2: "阴道感觉", 3: "肛门感觉", 4: "口腔感觉",
    10: "顺从", 11: "欲望", 12: "技巧", 13: "侍奉技术", 14: "性交技术", 15: "话术", 16: "侍奉精神", 17: "露出癖",
    20: "抖Ｓ气质", 21: "抖Ｍ气质", 22: "百合气质", 23: "搞基气质",
    30: "性交中毒", 31: "自慰中毒", 32: "精液中毒", 33: "百合中毒", 34: "卖春中毒", 35: "兽奸中毒", 36: "露出中毒", 37: "ＢＬ中毒",
    100: "学习能力", 101: "运动能力", 102: "战斗能力", 103: "感受性"
}
```

### 4.2 参数 (PALAM)
```javascript
PALAM_DEFS = {
    0: "阴蒂快感", 1: "阴道快感", 2: "肛门快感", 3: "润滑",
    4: "顺从", 5: "欲情", 6: "屈服", 7: "习得", 8: "羞耻",
    9: "痛苦", 10: "恐惧", 11: "反感", 12: "不快", 13: "抑郁",
    14: "胸部快感", 15: "口腔快感", 100: "否定"
}
```

### 4.3 刻印 (MARK)
```javascript
MARK_DEFS = {
    0: "苦痛刻印", 1: "快乐刻印", 2: "屈服刻印", 3: "反抗刻印",
    4: "恐怖刻印", 5: "淫乱刻印", 6: "反发刻印", 7: "哀伤刻印"
}
// Max Lv.3
```

### 4.4 Source → PALAM 转换
- Source在指令执行时累积到 `target.source[]`
- `_postProcess()` 中先应用TEQUIP持续效果，再将Source加到PALAM
- 绝顶阈值: PALAM > 10000 → 触发绝顶，扣除5000，获得绝顶经验
- 刻印判定: 痛苦>5000→苦痛刻印, 欲情>8000→快乐刻印, 屈服>6000→屈服刻印

---

## 五、UI渲染方法清单

| 方法 | 状态 | 说明 |
|------|------|------|
| `UI.renderTitle()` | ✅ | 标题画面 |
| `UI.renderShop(game)` | 🟡 | 主菜单 (SHOP状态) |
| `UI.renderTrain(game)` | 🟡 | 训练界面 |
| `UI._renderTrainStatus(target)` | 🟡 | 训练状态栏 (HP/MP/PALAM) |
| `UI._renderTrainCommands(game)` | 🟡 | 指令按钮网格 + 过滤器 |
| `UI.renderAfterTrain(game)` | 🟡 | 训练结束后界面 |
| `UI.renderAblUp(game)` | 🟡 | 能力升级界面 |
| `UI.renderCharaList(game)` | 🟡 | 角色列表 (极简) |
| `UI.renderSellList(game)` | 🟡 | 卖出角色列表 |
| `UI.renderExecutionList(game)` | 🟡 | 处刑列表 (有按钮无逻辑) |
| `UI.renderItemShop(game, type)` | 🟡 | 道具商店 |
| `UI.renderSaveLoad(game, mode)` | ✅ | 存档/读档界面 |
| `UI.renderConfig(game)` | ❌ | 配置界面 (未实现) |
| `UI.renderTurnEnd(game)` | 🟡 | 回合结束画面 |

---

## 六、已确认跳过的内容

按用户要求，以下兽奸相关内容已跳过:
- COMF89_獣姦プレイ (指令89)
- COMF202_最下層民 (指令202)
- COMF203_カビ犬 (指令203)
- COMF204_オーク (指令204)
- COMF205_腐れ豚 (指令205)
- COMF206_トロル (指令206)
- COMF207_媚薬スライム (指令207)

---

## 七、继续开发优先级建议

### Phase 1: 口上文本丰富化 (短期)
- [ ] 验证 `_loader.js` 是否正确加载所有对话数据
- [ ] 检查对话状态桶逻辑是否完整
- [ ] 补充缺失的对话触发分支

### Phase 2: 训练体验打磨 (短期)
- [ ] 实现 `COMF_CONDOM.ERB` 的避孕套逻辑
- [ ] 丰富 `narrateAction/narrateResult` 的叙述文本
- [ ] 完善 `_checkComAble` 的复杂判定条件

### Phase 3: ABLUP独立处理 (中期)
- [ ] 为每个能力编写独立的升级处理逻辑 (参考ABLUP0~ABLUP100.ERB)
- [ ] 实现 `LVUP.ERB` 的等级提升系统

### Phase 4: 角色深度 (中期)
- [ ] `CHARA_MAKE.ERB` → 完整角色创建流程
- [ ] `CHARA_INFO.ERB` → 详细角色信息界面
- [ ] `CHARA_BODY.ERB` → 身体生成系统

### Phase 5: 地牢/战斗系统 (长期)
- [ ] `DUNGEON.ERB` → 地下城探索引擎
- [ ] `DUNGEON_BATLLE.ERB` → 回合制战斗
- [ ] `MONSTER_DATA.ERB` → 怪物数据

### Phase 6: 世界层 (长期)
- [ ] `侵略/INVASION.ERB` → 侵略系统
- [ ] `NINSIN.ERB` → 妊娠系统
- [ ] `ENDING.ERB` → 结局系统

---

## 八、参考文件

- **本文件:** `D:\KZ PROJECT\PROGRESS_LOG.md`
- **详细差距分析:** `D:\KZ PROJECT\FUNCTION_GAP_ANALYSIS.md`
- **原始游戏目录:** `E:\SSTM\eraa\era\eraMaouEx-master`
- **原始ERB目录:** `E:\SSTM\eraa\era\eraMaouEx-master\ERB`
- **原始CSV目录:** `E:\SSTM\eraa\era\eraMaouEx-master\CSV`
