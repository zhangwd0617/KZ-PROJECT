# ERA Maou EX — Agent Context

> 每次启动 CLI 时请先读取本文件，以了解项目背景与当前进度。

---

## 1. 项目元数据

| 项目 | 值 |
|------|-----|
| **GitHub** | `zhangwd0617/KZ-PROJECT` |
| **本地路径** | `D:\KZ PROJECT` |
| **技术栈** | Vite + 原生 JS，单文件构建（`vite-plugin-singlefile`） |
| **构建命令** | `npm run build`（产物在 `dist/index.html`） |
| **启动文件** | `ERA-Maou-EX.html`（双击即可浏览器运行） |
| **自动构建脚本** | `build.bat` / `build-and-launch.ps1` |
| **开发计划文档** | `C:\Users\admin\Desktop\调教系统重做文档3.txt` |

---

## 2. 核心架构

**Emuera 并行数组架构**：
```
base / maxbase / abl / talent / palam / exp / cflag / juel / mark / equip / tequip
```

**核心目录**：
- `src/data/` — 定义/系统数据（OrgasmSystem.js、GenitalConfig.js、PersonalitySystem.js、TrainCommandMeta.js 等）
- `src/engine/` — 角色/游戏核心（Game.js、Character.js、CharaTemplates.js 等）
- `src/systems/` — 训练逻辑（TrainSystem.js、DialogueSystem.js、ShopSystem.js 等）
- `src/ui/pages/` — 渲染（TrainPage.js、TitlePage.js 等）

---

## 3. 高潮系统（OrgasmSystem）关键设定

### 8 部位快感系统
| 代码 | 部位 | 基础敏感度 | 关联 PALAM | 关联 ABL |
|------|------|-----------|-----------|---------|
| C | 阴核 | 1.0 | palam[0] | abl[0] |
| V | 阴道 | 1.0 | palam[1] | abl[2] |
| A | 肛门 | 0.8 | palam[2] | abl[3] |
| B | 乳房 | 0.9 | palam[14] | abl[1] |
| N | 乳头 | 1.1 | palam[14] | abl[1] |
| O | 口腔 | 0.9 | palam[15] | abl[4] |
| W | 子宫 | 1.2 | palam[1] | abl[2] |
| P | 心理 | 0.7 | palam[6] | abl[11] |

- **总高潮槽**：0~1000，满 1000 触发绝顶
- **快感公式**：`finalValue = baseValue × baseSensitivity × ABL修正 × energyMult × personalityMod`
- **ABL 修正**：0级×0.6 / 1级×0.8 / 2级×1.0 / 3级×1.2 / 4级×1.4 / 5级×1.6
- **蓄力等级**：C1(1000)/C2(1500)/C3(2000)/OC(3000)，倍率 1.5/2.2/3.0/4.0

### 协同绝顶组合
- 双重：C+V(×1.6)、V+W(×1.7)、P+任意(×1.3) 等
- 三重：C+V+W(×3.0)、C+V+A(×3.2) 等
- **FULL**（4+部位）：×4.0 + 敏感度永久+0.03
- **ULTIMATE**（5+部位）：×5.0 + 全觉之体 `talent[291]` + 敏感度永久+0.15

### 不应期适应系统
- 基础 2 回合，浮点数支持
- 缩短条件：ABL≥3(-1.0)、ABL≥5(-1.5)、淫魔 `talent[272]`(-1.0)、全觉之体 `talent[291]`(-1.0)、多重绝顶 buff(-0.5)、连续绝顶 3+(-0.3/次)
- **最低 0.25 回合**

### 多阴茎射精系统
- 每根阴茎独立射精槽 0~1000
- 射精增量 = Σ(linkedParts 快感增量 × 阴茎敏感度 × 0.5)
- 8 种射精类型（与绝顶类型对应 C~P）
- **连续射精递减**：100%→70%→40%→20%（每 `eventTrain` 重置）
- **同步快感**：绝顶+射精同时触发 → 快乐 ×2.5

---

## 4. 22 种性格蓄力反应

定义在 `src/data/PersonalitySystem.js` 的 `CHARGE_REACTIONS` 中。

关键性格释放修正倍率：
- **×1.3**：自信家、高贵、贵公子、梅花（刚强）
- **×1.2**：憎恶（反抗）、魔王、恶女（腹黑）、红桃（热情）、菲娅、莉莉（天然）
- **×1.15**：莉莉、知的、伶俐
- **×1.1**：慈爱、庇护者、嘉德（直率/坦率）
- **×1.0**：方块（活泼）、烈焰（热血）、幽灵（孤僻/懦弱）、黑桃（阴沉）、普通
- **×0.95**：深渊（多疑）
- **×0.9**：冷静、幽灵（胆小）

---

## 5. 魔王技能（989-992）

| ID | 名称 | 效果 |
|----|------|------|
| 989 | 强制绝顶 | 全部位+500 快感，强制绝顶，但 **效果 ×0.8 打折** |
| 990 | 释放许可 | 允许释放蓄力快感，基础倍率 `1+C×0.5`，再乘以 **性格 releaseMult** |
| 991 | 边缘控制 | 将快感压在 **90%**，进入蓄力，**下回合全部位快感 +50%** |
| 992 | 强制蓄力 | 蓄力等级+1，进入蓄力状态 |

---

## 6. 开发进度

### 已完成 ✅
- **P0**：P 部位改为心理、快感公式补全、绝顶效果数值重写、绝顶后处理
- **P1**：协同绝顶组合表、蓄力代价（体力/气力/风险）、不应期适应系统、下回合效果（C+10%/W+100）、连续射精递减、多重绝顶 session buff
- **P2-1**：多阴茎射精系统扩展（maxGauge 1000、独立敏感度/linkedParts）
- **P2-2**：22 种性格蓄力反应（perTurn 额外效果 + 释放修正倍率）
- **P2-3**：同步快感 ×2.5、989 强制绝顶打折、991 边缘控制 90%+50%
- **P2-4**：UI 简洁化（点击主进度条展开 8 子进度条）

### 待办 / 未来方向
- **P3**：隐藏特质进度/解锁、路线 EXP 结算完善、助手 Stage5 buff 补全
- **P4**：副奴隶（bystander）系统完善、收藏馆/标本系统扩展
- **P5**：复合标签（compound label）与路线协同（route synergy）UI
- **长期**：更多训练指令、剧情事件、SLG 地下城设施深化

---

## 7. 修改规范

- 单文件构建：所有修改最终打包到 `dist/index.html`
- 最小变更原则：尽量复用现有结构，避免大规模重构
- 全局导出：核心函数通过 `window.xxx = xxx` 导出供跨模块调用
- 中文字符：直接在源码中使用 UTF-8 中文，不用 Unicode 转义
- 调试：构建后直接用 `ERA-Maou-EX.html` 在浏览器中测试

---

## 8. 快速命令

```powershell
cd "D:\KZ PROJECT"
npm run build                 # 构建
.\build-and-launch.ps1        # 构建并启动浏览器
```
