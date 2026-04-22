# ERA Maou EX — Function Gap Analysis

**Analysis Date:** 2026-04-17  
**Original Game:** eraMaouEx-master (~253 ERB files)  
**Current Web Version:** v0.1.0 Reconstruction  

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Core logic present and functional |
| 🟡 Partial | Framework exists but incomplete |
| ❌ Missing | Not yet implemented |
| ⬜ N/A | Out of scope for current phase |

---

## 1. Core System (~12 ERB files)

| Feature | Original Files | Status | Notes |
|---------|---------------|--------|-------|
| Game initialization | `SYSTEM.ERB` | 🟡 | `eventFirst()` exists but minimal |
| Data management | `SYSTEM_DATA.ERB` | 🟡 | Save/Load works, no compatibility patches |
| Source calculation engine | `SYSTEM_SOURCE.ERB` + SUB1/SUB2 | 🟡 | Simplified Source→PALAM in `TrainSystem._postProcess()` |
| Title screen | `TITLE.ERB` | 🟡 | Basic title with start/load buttons |
| Configuration | `CONFIG.ERB` | ❌ | No settings UI implemented |
| Data compatibility fixes | `DATA_FIX.ERB` | ❌ | No version migration needed yet |
| Debug/test functions | `TEST.ERB` | ❌ | No debug console |
| Main menu drawing | `_DRAW_MAINMENU.ERB` | 🟡 | `UI.renderShop()` covers basics |
| Extended command rendering | `_DRAW_EXT_COMM.ERB` | ❌ | No extended command UI |

---

## 2. Training System Loop (~11 ERB files)

| Feature | Original Files | Status | Notes |
|---------|---------------|--------|-------|
| Main training loop | `TRAIN_MAIN.ERB` | 🟡 | `Game.eventTrain()` exists but simplified |
| User command interface | `USERCOM.ERB` | 🟡 | Filters work, no info displays |
| Command availability checks | `COMABLE.ERB` | ✅ | `_checkComAble()` + `_shouldHideCommand()` 覆盖主要条件 + 解锁条件 |
| Command ordering | `COMORDER.ERB` | ❌ | No command reordering |
| Extended command handling | `EXCOM.ERB` | ❌ | No extended commands |
| Command registration | `COM_REGISTER.ERB` | ❌ | Commands are hardcoded |
| Jump/redirect logic | `COMF_JUMP.ERB` | ❌ | No jump logic |
| Pre-training events | `EVENT_BEFORETRAIN.ERB` | 🟡 | `onTrainStart()` covers basics |
| Post-training events | `EVENT_AFTERTRAIN.ERB` | 🟡 | `onTrainEnd()` + day end simplified |
| Auto-training | `EVENT_AUTOTRAIN.ERB` | ❌ | Not implemented |
| Training messages A/B | `EVENT_TRAIN_MESSAGE_A/B.ERB` | 🟡 | `narrateAction/Result()` are simplified |
| Fainting handling | `PASSOUT.ERB` | 🟡 | HP<=0 triggers faint, no complex logic |
| Post-command event | `EVENT1.ERB` | ❌ | No `@EVENTCOMEND` equivalent |

---

## 3. Training Commands (~89 COMF*.ERB files)

### 3.1 Caress (0-9, 122, 135) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 0 | Caress / 爱抚 | ✅ | Full Source calc |
| 1 | Cunnilingus / 舔阴 | ✅ | Full Source calc |
| 2 | Anal caress | ✅ | Full Source calc |
| 3 | Masturbation | ✅ | Full Source calc |
| 4 | Give fellatio | ✅ | Basic |
| 5 | Breast caress | ✅ | Full Source calc |
| 6 | Kiss | ✅ | Full Source calc |
| 7 | Spread pussy | ✅ | Shame-focused |
| 8 | Finger insertion | ✅ | Virgin check present |
| 9 | Anal licking | ✅ | A-focused |
| 122 | 龟头顶住 | ✅ | C-focused |
| 135 | 自我舔阴 | ✅ | Shame + C |

**Completion: 100%**

### 3.2 Toys & Tools (10-19) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 10 | Vibrating jewel | ✅ | C-focused |
| 11 | Vibrating wand (vibrator) | ✅ | V-focused |
| 12 | Anal worm | ✅ | TEQUIP toggle |
| 13 | Clitoris cap | ✅ | TEQUIP toggle |
| 14 | Nipple cap | ✅ | TEQUIP toggle |
| 15 | Milking machine | ✅ | TEQUIP toggle, milk talent check |
| 16 | Onahole | ✅ | Basic |
| 17 | Shower | ✅ | TEQUIP toggle |
| 18 | Anal beads (insert) | ✅ | TEQUIP set |
| 19 | Anal beads (pull) | ✅ | TEQUIP remove |

**Completion: 100%**

### 3.3 Intercourse — Vaginal/Anal (20-29) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 20 | Normal position (vaginal) | ✅ | Virgin loss logic |
| 21 | Doggy style | ✅ | Basic |
| 22 | Face-to-face sitting | ✅ | Basic |
| 23 | Reverse sitting | ✅ | Basic |
| 24 | Reverse rape | ✅ | Basic |
| 25 | Reverse anal rape | ✅ | Position modifiers |
| 26 | Normal anal | ✅ | Lubrication check |
| 27 | Doggy anal | ✅ | Position modifiers |
| 28 | Face-to-face anal | ✅ | Position modifiers |
| 29 | Reverse sitting anal | ✅ | Position modifiers |

**Completion: 100%**

### 3.4 Service (30-38, 123-126) — 9 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 30 | Handjob | ✅ | Full |
| 31 | Fellatio | ✅ | Full |
| 32 | Paizuri | ✅ | Full |
| 33 | Sumata (thigh sex) | ✅ | Full |
| 34 | Cowgirl | ✅ | Full |
| 35 | Foam dance | ✅ | Soap + water effect |
| 36 | Cowgirl anal | ✅ | A-focused |
| 37 | Anal service (rimming) | ✅ | Basic |
| 38 | Footjob | ✅ | Full |
| 123 | 乳交口交 | ✅ | Combined |
| 125 | 口交自慰 | ✅ | Combined |
| 126 | 手淫口交 | ✅ | Combined |

**Completion: 100%**

### 3.5 SM / BDSM (40-49) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 40 | Spanking | ✅ | Full |
| 41 | Whip | ✅ | Full |
| 42 | Needle | ✅ | Full |
| 43 | Blindfold | ✅ | TEQUIP toggle |
| 44 | Rope bondage | ✅ | TEQUIP toggle |
| 45 | Ball gag | ✅ | TEQUIP toggle |
| 46 | Enema + plug | ✅ | TEQUIP toggle |
| 47 | Bondage suit | ✅ | TEQUIP toggle |
| 48 | Trampling | ✅ | Basic |
| 49 | Anal electrode | ✅ | TEQUIP toggle |

**Completion: 100%**

### 3.6 Items / Play Modes (50-59) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 50 | Lotion | ✅ | TEQUIP set |
| 51 | Aphrodisiac | ✅ | PALAM boost |
| 52 | Diuretic | ✅ | TEQUIP set |
| 53 | Crystal ball | ✅ | Shame boost |
| 54 | Outdoor play | ✅ | TEQUIP set |
| 55 | Do nothing | ✅ | Basic |
| 56 | Conversation | ✅ | Basic |
| 57 | Humiliation play | ✅ | TEQUIP set |
| 58 | Bath play | ✅ | TEQUIP set |
| 59 | Newlywed play | ✅ | TEQUIP set |

**Completion: 100%**

### 3.7 Assistant / Multi-character (60-71) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 60 | Kiss assistant | ✅ | Full logic |
| 61 | Force cunnilingus on assistant | ✅ | Full logic |
| 62 | Violate assistant | ✅ | Full logic |
| 63 | Tribadism | ✅ | Full logic |
| 64 | 3P | ✅ | Full logic |
| 65 | Make assistant violate target | ✅ | Full logic |
| 66 | Two-penis fellatio | ✅ | Full logic |
| 67 | Footjob assistant | ✅ | Full logic |
| 68 | Double fellatio | ✅ | Full logic |
| 69 | Sixty-nine | ✅ | Full logic |
| 70 | Double sumata | ✅ | Full logic |
| 71 | Double paizuri | ✅ | Full logic |

**Completion: 100%**

### 3.8 Double / Cosmetic (72-73) — 4 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 72 | Shave pubic hair | ✅ | TEQUIP set |
| 73 | Change hairstyle | ✅ | TEQUIP set |

**Completion: 100%**

### 3.9 Hard / Extreme (80-90, 111, 124, 127) — 11 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 80 | Deep throat / Iruma | ✅ | Full |
| 81 | Vaginal fisting | ✅ | Virgin check, V expansion |
| 82 | Anal fisting | ✅ | A expansion |
| 83 | Both-hole fisting | ✅ | Combined |
| 84 | G-spot torture | ✅ | V-focused |
| 85 | Urination | ✅ | TEQUIP set |
| 87 | Piercing | ✅ | TEQUIP toggle |
| 90 | Nipple fuck | ✅ | Full |
| 111 | Tear clothes | ✅ | TEQUIP toggle |
| 124 | Deep throat | ✅ | Full |
| 127 | Vacuum fellatio | ✅ | Full |
| 89 | Bestiality | ⬜ | Skipped per user request |

**Completion: 100% (skipped 89)**

### 3.10 Special / Clothing / Advanced (100, 110-135) — 19 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 100 | Summon tentacles | ✅ | Full |
| 110 | Dress/undress | ✅ | TEQUIP toggle |
| 120 | Insert G-spot torture | ✅ | V-focused |
| 121 | Insert cervix torture | ✅ | V-focused + pain |
| 128 | Normal position + kiss | ✅ | Love bonus |
| 129 | Normal position + breast caress | ✅ | B bonus |
| 130 | Normal position SP | ✅ | Enhanced |
| 131 | Doggy style + breast caress | ✅ | B bonus |
| 132 | Doggy style + spanking | ✅ | Pain bonus |
| 133 | Standing doggy | ✅ | Shame bonus |
| 134 | Doggy style SP | ✅ | Enhanced |

**Completion: 100%**

### 3.11 Special Training Modes (150, 200-208) — 10 files

| ID | Command | Status | Notes |
|----|---------|--------|-------|
| 150 | Free training | ✅ | Basic |
| 200 | Colosseum | ✅ | Generic arena |
| 208 | Tentacle arena | ✅ | Tentacle variant |
| 202-207 | Monster battles | ⬜ | Skipped (bestiality-related) |

**Completion: 100% (skipped 202-207)**

### 3.12 Helper Command Files

| File | Status | Notes |
|------|--------|-------|
| `COMF_ANALSEX.ERB` | 🟡 | Shared logic in `_execAnal()` |
| `COMF_VAGINASEX.ERB` | 🟡 | Shared logic in `_execVagina()` |
| `COMF_CONDOM.ERB` | ❌ | No condom logic |

---

## 4. Character System (~27 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Character creation | 🟡 | Templates from CSVs (43 chars) |
| Inheritance (NEW GAME+) | ❌ | Not implemented |
| Cross-save import | ❌ | Not implemented |
| Body generation | ❌ | Templates are static |
| Character customization | ❌ | Not implemented |
| Family/relationship generation | ❌ | Not implemented |
| Character info display | 🟡 | `UI.renderCharaList()` is minimal |
| Job/class change | ❌ | Not implemented |
| Marriage system | ❌ | Not implemented |
| Name generation/management | 🟡 | Static from templates |
| Temptation/seduction | ❌ | Not implemented |
| Visual description system | ❌ | Not implemented |
| Self-referential pronouns | ❌ | Not implemented |
| Hair/appearance functions | ❌ | Not implemented |
| Clothing functions | ❌ | Not implemented |
| Special talent acquisition | ❌ | Not implemented |
| Relationship system | ❌ | Not implemented |

---

## 5. Ability & Level System (~27 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Ability display/selection | 🟡 | `UI.renderAblUp()` works |
| Individual ABLUP handlers | ❌ | Only generic cost table |
| Level-up processing | ❌ | No LVUP system |
| Magic/spell system | ❌ | Not implemented |

**Key missing ABLUP files:**
- ABLUP0 (Obedience), ABLUP1 (Desire), ABLUP2 (Technique)
- ABLUP3-6 (Sensation C/V/A/B)
- ABLUP7 (Service), ABLUP8 (Exhibitionism)
- ABLUP9-10 (Lesbian/BL), ABLUP11 (Masochism)
- ABLUP12-15 (Addictions)
- ABLUP16-17 (Pain/Pleasure marks)
- ABLUP20-23 (Combat)
- ABLUP30-33 (Singing/Cooking/Photography/Medical)
- ABLUP37-40 (Work/Gathering/Special)
- ABLUP99-100 (Special/Elite)

---

## 6. Shop System (~9 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Main shop handler | 🟡 | `UI.renderShop()` covers basics |
| Extended shop functions | ❌ | Not implemented |
| Shop utility functions | ❌ | Not implemented |
| Character management in shop | 🟡 | Sell/view only |
| Item shop | 🟡 | Basic buy only |
| Laboratory shop | ❌ | Not implemented |
| Monster shop/management | ❌ | Not implemented |
| Tailor/clothing shop | ❌ | Not implemented |
| Trap shop/management | 🟡 | Listed but minimal |

---

## 7. Dungeon & Combat System (~15 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Dungeon engine | ❌ | Not implemented |
| Dungeon initialization | ❌ | Not implemented |
| Party formation | ❌ | Not implemented |
| Turn-based combat | ❌ | Not implemented |
| Trap system | ❌ | Not implemented |
| Room events | ❌ | Not implemented |
| Town events | ❌ | Not implemented |
| Quest handling | ❌ | Not implemented |
| Daily dungeon events | ❌ | Not implemented |
| Post-dungeon processing | ❌ | Not implemented |
| Capture/enslavement | ❌ | Not implemented |
| Prostitution/brothel | ❌ | Not implemented |
| Monster data | ❌ | Not implemented |
| Monster skills | ❌ | Not implemented |
| Monster summoning | 🟡 | Listed in ITEM_DEFS |

---

## 8. Invasion / World Conquest System (~9 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| World map conquest | ❌ | Not implemented |
| Territory management | ❌ | Not implemented |
| Invasion events | ❌ | Not implemented |
| Post-invasion enslavement | ❌ | Not implemented |
| Enemy hero data | ❌ | Not implemented |
| Group/army battles | ❌ | Not implemented |
| Arcana card battle | ❌ | Not implemented |
| Arcana fortress | ❌ | Not implemented |
| Agent/spy system | ❌ | Not implemented |
| Campaign scenarios | ❌ | Not implemented |

---

## 9. Event System (~25 ERB files)

### 9.1 Time Events

| Feature | Status | Notes |
|---------|--------|-------|
| Daily events | 🟡 | `DayEndSystem.process()` is minimal |
| Monthly events | ❌ | Not implemented |
| End-of-turn processing | 🟡 | Part of `eventTurnEnd()` |
| Pregnancy-related events | ❌ | Not implemented |
| Sabbath events | ❌ | Not implemented |
| Addiction processing | ❌ | Not implemented |
| Character departure | ❌ | Not implemented |
| Full moon events | ❌ | Not implemented |
| Wedding day events | ❌ | Not implemented |

### 9.2 Dialogue System (口上)

| Personality | File | Status | Notes |
|-------------|------|--------|-------|
| Benevolence (慈爱) | `EVENT_K0` | 🟡 | Framework + extracted lines |
| Confident (自信家) | `EVENT_K1` | 🟡 | Framework + extracted lines |
| Timid (気弱) | `EVENT_K2` | 🟡 | Framework + extracted lines |
| Noble (高貴) | `EVENT_K3` | 🟡 | Framework + extracted lines |
| Cold (冷徹) | `EVENT_K4` | 🟡 | Framework + extracted lines |
| Mao (マオ) | `EVENT_K5` | 🟡 | Framework + extracted lines |
| Villainess (悪女) | `EVENT_K6` | 🟡 | Framework + extracted lines |
| Heart | `EVENT_K7` | 🟡 | Framework + extracted lines |
| Spade | `EVENT_K8` | 🟡 | Framework + extracted lines |
| Diamond | `EVENT_K9` | 🟡 | Framework + extracted lines |
| Club | `EVENT_K10` | 🟡 | Framework + extracted lines |
| Lily (リリィ) | `EVENT_K11` | 🟡 | Framework + extracted lines |
| Intellectual (知的) | `EVENT_K12` | 🟡 | Framework + extracted lines |
| Protector (庇護者) | `EVENT_K13` | 🟡 | Framework + extracted lines |
| Noble Prince (貴公子) | `EVENT_K14` | 🟡 | Framework + extracted lines |
| Clever (伶俐) | `EVENT_K15` | 🟡 | Framework + extracted lines |
| Fia (菲娅) | `EVENT_K19` | 🟡 | Framework + extracted lines |
| Jiadé (嘉德) | `EVENT_K903` | 🟡 | Full exclusive dialogue |
| Fia variant | `EVENT_K904` | 🟡 | Full exclusive dialogue |

**Dialogue completion: ~20%** (framework for all, text extracted for K0-K15, K19, K903, K904)

---

## 10. Pregnancy System (~2 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Pregnancy detection | ❌ | Not implemented |
| Due date tracking | ❌ | Not implemented |
| Childbirth | ❌ | Not implemented |
| Nursery | ❌ | Not implemented |
| Father identification | ❌ | Not implemented |

---

## 11. Special Systems (~20 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Private execution | 🟡 | Button exists, no logic |
| Public execution | ❌ | Not implemented |
| Banishment/exile | ❌ | Not implemented |
| Museum | ❌ | Not implemented |
| NTR system | ❌ | Not implemented |
| Toilet/urinal system | ❌ | Not implemented |
| Breeding ground | ❌ | Not implemented |
| Grotesque content | ❌ | Not implemented |
| Character value estimation | 🟡 | Simplified in `ShopSystem._estimatePrice()` |
| Colosseum earnings | ❌ | Not implemented |
| Sold character fates | ❌ | Not implemented |
| Sell milk (lactation) | ❌ | Not implemented |
| Sell training videos | ❌ | Not implemented |
| Equipment management | ❌ | Not implemented |
| Special item usage | ❌ | Not implemented |
| Tattoo system | ❌ | Not implemented |
| Semen marker system | ❌ | Not implemented |
| Lover/romance system | ❌ | Not implemented |
| Dungeon infrastructure | ❌ | Not implemented |
| Tax collection | ❌ | Not implemented |
| Network feature (MAOUNET) | ❌ | Not implemented |
| Laboratory functions | ❌ | Not implemented |

---

## 12. Ending System (~3 ERB files)

| Feature | Status | Notes |
|---------|--------|-------|
| Ending handler | ❌ | Not implemented |
| Ending conditions check | ❌ | Not implemented |
| Good ending (world conquest) | ❌ | Not implemented |
| Bad ending (defeated by hero) | ❌ | Not implemented |
| Additional endings (DLC) | ❌ | Not implemented |

---

## 13. MOD Files

| Feature | Status | Notes |
|---------|--------|-------|
| MOD toggle system | ❌ | Not implemented |
| Demon world bank | ❌ | Not implemented |
| Part-time job system | ❌ | Not implemented |
| Debug tools | ❌ | Not implemented |

---

## Overall Completion Summary

| Category | Total Files | Implemented | Partial | Missing | Completion |
|----------|-------------|-------------|---------|---------|------------|
| Core System | 12 | 0 | 5 | 7 | ~20% |
| Training Loop | 11 | 0 | 5 | 6 | ~25% |
| **Training Commands** | **89** | **~87** | **~2** | **~0** | **~98%** |
| Character System | 27 | 0 | 3 | 24 | ~5% |
| Ability/Level | 27 | 0 | 1 | 26 | ~2% |
| Shop System | 9 | 0 | 4 | 5 | ~20% |
| Dungeon/Combat | 15 | 0 | 1 | 14 | ~3% |
| Invasion/Conquest | 9 | 0 | 0 | 9 | 0% |
| Events/Dialogue | 25 | 0 | 4 | 21 | ~10% |
| Pregnancy | 2 | 0 | 0 | 2 | 0% |
| Special Systems | 20 | 0 | 2 | 18 | ~5% |
| Endings | 3 | 0 | 0 | 3 | 0% |
| **TOTAL** | **~253** | **~87** | **~27** | **~139** | **~22%** |

---

## Recommended Implementation Priority

### Phase 1: Core Training Experience ✅ DONE (~98%)
- All Caress, Tool, Vaginal, Anal, Service, SM, Item, Assistant, Cosmetic commands implemented
- TEQUIP toggle logic for all applicable commands
- TEQUIP persistent effects applied during post-process
- Command availability checks (COMABLE) with major conditions + unlock rank system
- Skipped: bestiality-related commands (89, 202-207)

### Phase 2: Training Polish (Current → 40%)
1. **EVENT_TRAIN_MESSAGE_A/B** full text richness
2. **All 19 personalities dialogue** full text extraction
3. **Individual ABLUP handlers** — 27 files
4. **CONFIG settings UI**

### Phase 3: Character Depth (40% → 60%)
1. **Character creation** (CHARA_MAKE)
2. **Character info display** full
3. **Visual description** (LOOK.ERB)
4. **Relationship system**
5. **Job/class change**

### Phase 4: Dungeon & Combat (60% → 75%)
1. **Dungeon engine** (DUNGEON.ERB)
2. **Battle system** (DUNGEON_BATLLE)
3. **Monster system**
4. **Trap system**

### Phase 5: World Layer (75% → 90%)
1. **Invasion system**
2. **Pregnancy system**
3. **Special systems** (execution, NTR, etc.)
4. **Ending system**

### Phase 6: MODs & Extras (90% → 100%)
1. **MOD support**
2. **Network feature**
3. **Debug tools**
