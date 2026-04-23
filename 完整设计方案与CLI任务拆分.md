# ERA Maou EX — 完整设计方案与CLI任务拆分

## 一、项目现状与改造范围

### 现有代码结构（需兼容改造）
- `js/engine/Character.js` — 并行数组架构（abl[110], talent[1000], exp[100], palam[30], cflag[999]）
- `js/engine/Game.js` — 回合流程、eventAfterTrain、checkAutoTalents
- `js/engine/TrainSystem.js` — 指令执行、addPalam/addSource逻辑
- `js/data/CharaTemplates.js` — 角色生成模板
- `js/data/ItemTable.js` / `SkillTable.js` — 道具与技能
- UI层 — 现有renderTrain显示PALAM数值

### 改造原则
1. **向后兼容**：保留原有数组索引，新增属性挂在Character对象上
2. **增量叠加**：原有PALAM系统作为"底层数据源"，新系统在其上封装
3. **分阶段实施**：数据定义 → 角色实体 → 调教逻辑 → UI渲染

---

## 二、完整模块清单（整合三份文档）

| 模块 | 来源文档 | 核心内容 |
|------|---------|---------|
| **体力×气力双条** | V2.0 | 奴隶专属体力/气力、气力状态机(清醒→崩溃)、自然衰减 |
| **UI精简** | V2.0 | 魔王零显示、助手单行、主奴完整面板、副奴简化面板、HP隐藏 |
| **助手系统** | V2.0 | 陷落资格判定、常驻Buff(5路线)、代行/参与模式、临时体力条 |
| **五大路线素质树** | V2.0+V3.0 | 顺从/欲望/痛苦/露出/支配、Stage0-5、刻印钥匙+宝珠消耗 |
| **性格系统** | V3.0 | 22主性格+12辅性格+16副性格+12隐藏特质、蓄力反应、数值修正 |
| **Talent数值化** | V3.0 | 所有talent的palamMods/refuseMod/staminaMod/energyMod/orgasmMod |
| **路线加速素质** | V3.0 | Stage1-4每级附送加速、Stage5助手专用增益 |
| **8部位高潮进度条** | 高潮文档 | C/V/A/B/N/O/W/P、部位快感值→总高潮槽、8种绝顶类型 |
| **扶她/多阴茎** | 高潮文档 | genitalConfig、阴茎数组(最多3根)、独立射精槽、肉体改造接口 |
| **蓄力与协同绝顶** | 高潮文档 | Charge1-3/Overcharge、22性格蓄力反应、魔王4技能、双/三/全身/极乐觉醒 |
| **复合性格标签** | V2.0 | 1主+2辅组合命名、双/三路线协同加成 |

---

## 三、CLI任务拆分（按优先级与依赖关系）

### 🔴 P0 — 数据地基（第一批，无依赖，可并行）

**任务1：路线与素质树数据**
- **新建文件**：`js/data/TalentTree.js`
- **内容**：
  - `TALENT_ROUTES`：5条路线定义（name/juelType/markType/cflagId/color）
  - `TALENT_TREE`：所有素质节点（id/name/route/stage/req{abl,mark,routeLv,juel,exp,preTalent}）
  - 函数：`checkTalentTreeUnlock(chara, node)` / `tryUnlockTalent(chara, node)`
- **注意**：Stage5素质改为assistantOnly=true（助手专用增益），与V3.0第六章对齐

**任务2：性格与隐藏特质数据**
- **新建文件**：`js/data/PersonalitySystem.js`
- **内容**：
  - `MAIN_PERSONALITY`（22个）：含palamMods/refuseMod/specialMode触发条件
  - `SUB_PERSONALITY`（12个）：影响幅度为主性格的60%
  - `MINOR_TRAITS`（16个）：影响幅度为主性格的25%
  - `HIDDEN_TRAITS`（12个）：含50%效果/100%效果/unlockLine
  - 函数：`generatePersonality()` / `getPersonalityEffects(chara, context)` / `revealHiddenTrait(chara)`

**任务3：Talent数值影响数据**
- **新建文件**：`js/data/TalentEffects.js`
- **内容**：
  - `TALENT_EFFECTS`：以talent ID为键，定义所有现有talent的数值修正
  - 覆盖：性格类(10~18,19~31,160~171)、体质类(30~37)、陷落类(85,86,182)、路线类
  - 函数：`applyTalentEffects(chara, context)` 返回总修正值+activeModes列表（含uiColor）

**任务4：路线加速与助手增益数据**
- **新建文件**：`js/data/RouteAccelerators.js`
- **内容**：
  - Stage1-4加速素质：5路线×4阶段=20个（id/name/route/stage/effectDesc/applyFunc）
  - Stage5助手增益：5个（assistantOnly:true，明确"作为助手时生效"）
  - 函数：在路线升级时自动赋予对应阶段素质

---

### 🟠 P1 — 角色实体改造（第二批，依赖P0）

**任务5：Character类全面重构**
- **修改文件**：`js/engine/Character.js`
- **保留兼容**：原有abl/talent/exp/palam/cflag数组继续存在，新增属性挂对象上
- **新增属性**：
  - 体力/气力：`stamina`（映射cflag[15]扩展）/ `energy`（新增cflag[16]）
  - 高潮系统：`partGauge[8]`（C/V/A/B/N/O/W/P）/ `totalOrgasmGauge` / `orgasmCooldown[8]` / `lastOrgasmType`
  - 蓄力状态：`isCharging` / `chargeLevel` / `chargeTurns`
  - 性格：`personality{main,sub,minors[],hidden{traitId,revealed}}`
  - 生殖器：`genitalConfig{hasVagina,hasWomb,penises[],orgasmSystem}`
  - 路线：`routeExp[5]` / `routeLevel[5]` / `trainLevel` / `routePoints`
- **新增方法**：
  - `addRouteExp()` / `addTrainExp()` / `allocateRoutePoint()` / `checkTalentTree()`
  - `getEnergyState()` / `getEnergyMultiplier()` / `getPersonalityEffects()`
  - `addPartGain(partCode, value)` / `decayUnstimulatedParts()` / `getDominantPart()`
  - `isQualifiedAssistant()` / `getAssistantBuff()` / `getFallenDepth()`
  - `checkHiddenTraitUnlock()` / `revealHiddenTrait()`
- **注意**：`generateRandomSlave()`和`generateHero()`需调用`generatePersonality()`

---

### 🟡 P2 — 指令与调教逻辑（第三批，依赖P1）

**任务6：指令定义改造**
- **修改文件**：`js/data/TrainDefs.js`（或现有指令定义位置）
- **每个指令增加字段**：
  - `staminaCost:{target:number, bystander:number}`
  - `energyCost:{target:number, bystander:number}`
  - `routeTags:{obedience,desire,pain,shame,dominance}`
  - `stimulatedParts:["C","V",...]`（8部位代码子集）
  - `ejaculationParts:["C","V",...]`（关联阴茎的部位）
  - `affectsBystander:boolean`
- **新增指令**：
  - 989【强制绝顶】/ 990【释放许可】/ 991【边缘控制】/ 992【强制蓄力】（魔王技能）
  - 998【安抚】/ 999【休息】（恢复类）
  - 900【让助手代行】/ 901【让助手参与】（助手指令）

**任务7：TrainSystem执行逻辑重构**
- **修改文件**：`js/engine/TrainSystem.js`
- **核心改造**：
  - `execute()`不再直接`chara.palam[x]+=value`，而是：
    1. 遍历指令`stimulatedParts`，调用`chara.addPartGain(code, baseValue×修正)`
    2. 计算多部位协同加成（2部位+10%/3+20%/4++25%）
    3. 调用`chara.decayUnstimulatedParts(stimulatedArray)`（未刺激部位衰减8%）
    4. 计算总高潮槽：`calculateTotalGauge(chara)`
    5. 检查绝顶：`checkOrgasm(chara)`（返回绝顶类型+级别+协同组合）
    6. 若有阴茎：遍历`genitalConfig.penises`，计算各阴茎射精槽，检查`checkEjaculation()`
    7. 若同时绝顶+射精：触发【同步快感】（快乐×2.5）
    8. 应用绝顶效果：`applyOrgasm(chara, result)`（重置部位值+进入冷却）
  - 保留原有`addPalam/addSource`作为兼容层（用于旧版存档过渡）

**任务8：Game类回合流程重构**
- **修改文件**：`js/engine/Game.js`
- **改造点**：
  - 新增`bystander`属性（副奴隶索引，默认-1）
  - 修改`startTrain(target, assi, bystander)`支持副奴隶参数
  - 重写`eventAfterTrain()`：
    - 结算路线经验（根据source计算5路线，调用addRouteExp）
    - 结算调教等级（调用addTrainExp，奖励路线点数）
    - 结算气力自然衰减（主奴-2，副奴-1）
    - 结算蓄力中的性格反应（每回合额外PALAM/事件）
    - 素质解锁检查（先checkTalentTree，后旧兜底）
  - 新增`processBystander()`：
    - 副奴获得主奴20%旁观PALAM（转化为对应部位快感值的20%）
    - 副奴固定-3体力，-1气力
    - 检查副奴状态（脸红/移开视线/请求参与）
  - 新增4个魔王技能处理函数
  - 重写`checkAutoTalents(chara)`：先调用素质树系统，再走旧版兜底

---

### 🟢 P3 — 高潮系统专项（第四批，依赖P1，可与P2并行）

**任务9：高潮系统核心逻辑**
- **新建文件**：`js/data/OrgasmSystem.js`
- **内容**：
  - `ORGASM_PARTS`：8部位定义（code/name/baseSensitivity/palamSource/ablId/uiColor/weight）
  - `ORGASM_TYPES`：8种绝顶效果（快乐JUEL/经验/体力消耗/气力消耗/后续效果）
  - `CHARGE_LEVELS`：蓄力等级定义（1-3/Overcharge的代价与风险）
  - `CHARGE_REACTIONS`：22种性格的蓄力反应（每回合额外PALAM/事件概率/释放修正）
  - `COMBO_ORGASMS`：
    - 双部位组合8种×3蓄力等级=24条目
    - 三部位组合5种
    - 四部位【全身共鸣】/五+【极乐觉醒】（获得【全觉之体】素质）
  - `EJACULATION_TYPES`：8种射精类型（对应8部位）
  - 函数：`calculatePartGain()` / `calculateTotalGauge()` / `checkOrgasm()` / `applyOrgasm()` / `checkEjaculation()` / `applyEjaculation()` / `checkComboPreview()`

**任务10：生殖器配置系统**
- **新建文件**：`js/data/GenitalConfig.js`
- **内容**：
  - `GENITAL_TYPES`：female/male/futa/cuntboy/neuter基础配置
  - `PENIS_TEMPLATE`：默认阴茎数据结构（id/name/ejaculationGauge/sensitivity/linkedParts）
  - 函数：`createGenitalConfig(type)` / `addPenis(chara, options)` / `modifyPenisLink(chara, penisId, parts)`
  - 肉体改造接口定义（阴茎移植/第二第三阴茎/敏感度强化/子宫植入）

---

### 🔵 P4 — UI全面改造（第五批，依赖P2+P3）

**任务11：调教界面UI重构**
- **修改文件**：`js/engine/UI.js`（或`UI.renderTrain`，根据现有项目结构）
- **改造清单**：
  - **移除**：魔王面板、所有角色的HP显示
  - **助手顶栏**：单行显示`助手: {名字} [{Buff标签}{♥/♥♥/♥♥♥}] 效果: {简述}`
  - **主奴隶面板**：
    - 体力条+气力条并排（数值显示）
    - 总高潮进度条（大号，0-100%，≥100%变色+⚡C1/C2/C3）
    - 8个部位子进度条（彩色小条，百分比，≥80%闪烁，≥500金色）
    - 状态标签：气力状态（清醒/动摇/恍惚/崩解/坏掉）+ 特殊模式彩色标签（最多3个）
    - 若蓄力中：显示性格反应描述（"莉莉正在咬牙忍耐..."）+ 每回合额外消耗
    - 刻印显示、装备列表、PALAM数值（次要显示，兼容旧版）
    - 隐藏特质显示：未解锁"???"，解锁后显示完整名称
  - **副奴隶面板**：
    - 体力条+气力条
    - 总高潮进度条（简化，只显示百分比）
    - 主导部位显示
    - 状态标签+最高2个PALAM
    - 标注"旁观中"
  - **指令面板**：
    - 基础指令一行（爱抚/鞭子/口交/性交/道具/露出/安抚/休息）
    - 助手指令两行（代行/参与）
    - 魔王技能区域（强制蓄力/边缘控制/释放许可/强制绝顶）
  - **回合预览**：显示主奴/副奴/助手的体力-? 气力-?
  - **释放预览弹窗**：选择释放时弹出，显示预计触发的协同组合、倍率、性格修正、台词预览
  - **射精槽显示**：有阴茎角色在绝顶槽旁显示射精槽（多阴茎用不同边框色）

---

### 🟣 P5 — 扩展与细节（第六批，依赖前面全部）

**任务12：复合性格标签与路线协同**
- **新建/修改**：`js/data/TalentTree.js` 或新建 `js/data/ComboSystem.js`
- **内容**：
  - 复合标签生成规则：`[主路线核心词]+[辅A修饰]+[辅B点缀]`
  - 双路线协同加成表（20种组合，如顺从+欲望=献身淫娃）
  - 三路线协同加成表（6种组合）
  - 函数：`generateCompoundLabel(chara)` / `applyRouteSynergy(chara, context)`

**任务13：特殊事件与台词系统**
- **新建文件**：`js/data/SpecialEvents.js`
- **内容**：
  - 蓄力中的性格反应事件（22种性格的每回合随机事件及概率）
  - 绝顶触发台词库（8种绝顶类型 × 22种性格 = 176条基础台词，可复用）
  - 极乐觉醒特殊事件（金色CG触发、全觉之体获取动画）
  - 破处仪式/胎动/眼镜play/失禁等一次性事件定义
  - 函数：`getChargeEvent(chara)` / `getOrgasmLine(chara, type)` / `getSpecialEvent(chara, eventId)`

---

## 四、关键依赖关系图

```
P0 数据地基（任务1-4）
  ↓
P1 角色实体（任务5）← 依赖P0的数据定义
  ↓
P2 调教逻辑（任务6-8）← 依赖P1的Character新方法
P3 高潮专项（任务9-10）← 依赖P1的Character新属性
  ↓
P4 UI渲染（任务11）← 依赖P2的Game流程 + P3的OrgasmSystem
  ↓
P5 扩展细节（任务12-13）← 依赖前面全部
```

---

## 五、向后兼容注意事项

1. **旧版存档**：原有`palam[]`数组继续存在，新系统在其上封装。加载旧存档时，初始化`partGauge`为0，`genitalConfig`根据性别talent推断。
2. **旧版UI**：若新UI未完全实现，保留旧PALAM显示作为fallback。
3. **旧版素质**：`checkAutoTalents()`保留兜底逻辑，确保旧素质仍能触发。
4. **指令兼容**：`stimulatedParts`未定义的指令默认只刺激C部位（避免报错）。

---

## 六、验证清单（CLI每批次完成后自检）

- [ ] P0完成后：能`console.log`出所有数据对象，无undefined键
- [ ] P1完成后：能生成新角色并打印出`personality`/`genitalConfig`/`partGauge`结构
- [ ] P2完成后：执行一次调教回合，部位快感值正确增减，总槽正确计算
- [ ] P3完成后：总槽≥100%时正确进入蓄力，释放时正确触发绝顶/射精/协同
- [ ] P4完成后：UI渲染无报错，各面板数据显示正确
- [ ] P5完成后：复合标签正确生成，特殊事件正确触发

---

**以上13个任务覆盖了三份设计方案的全部内容。建议按P0→P1→P2/P3→P4→P5的顺序分6批发给CLI执行。**
