/**
 * Command Execution Threshold System
 * 指令执行阈值系统 —— 参考 eratoho 设计
 * 
 * 核心规则：
 * - 执行值 = 调教师力量 - 奴隶反抗 + d20骰子
 * - 执行值 >= 门槛 → 命令成功
 * - 执行值 < 门槛 → 奴隶拒绝，显示反抗文本
 * - 任意路线 Stage≥3 或 talent陷落 → 大幅降低反抗
 * 
 * 道具效果：
 * - 媚药/绳索/眼罩等降低奴隶反抗值
 * - 与现有TEQUIP的PALAM效果并存互补
 */

// ========== 命令类别门槛表 ==========
const CATEGORY_THRESHOLDS = {
    caress:   { base: 25, desc: "爱抚" },
    service:  { base: 30, desc: "侍奉" },
    tool:     { base: 35, desc: "器具" },
    vagina:   { base: 50, desc: "阴道" },
    anal:     { base: 55, desc: "肛门" },
    sm:       { base: 60, desc: "SM" },
    rough:    { base: 65, desc: "暴力" },
    monster:  { base: 70, desc: "异种" },
    arena:    { base: 40, desc: "公开" },
    special:  { base: 30, desc: "特殊" },
    item:     { base: 20, desc: "道具" },
    cosmetic: { base: 20, desc: "化妆" },
    assistant:{ base: 25, desc: "助手" },
    free:     { base: 45, desc: "自由" },
};

// ========== 道具对门槛的额外修正 ==========
const ITEM_THRESHOLD_MODS = {
    21: { categories: ['caress','service'], mod: -10, desc: "媚药降低爱抚/侍奉门槛" },
    20: { categories: ['vagina','anal','tool'], mod: -8, desc: "润滑液降低V/A/器具门槛" },
    11: { categories: ['sm','rough'], mod: -10, desc: "绳索降低SM/暴力门槛" },
};

// ========== 性格拒绝文本池 ==========
const REFUSE_TEXTS = {
    // key 对应 PersonalitySystem.js 中 MAIN_PERSONALITY 的 code 字段
    kindness: {
        mild:   { narration: "${target.name}微微颤抖，轻轻推开了你的手...", dialogue: "请、请不要这样..." },
        medium: { narration: "${target.name}紧紧抱住自己，眼中含着泪水，身体向后缩去...", dialogue: "求你了...放过我吧...那种事情...不行的..." },
        fierce: { narration: "${target.name}拼命挣扎，泪如雨下，声嘶力竭地抗拒着...", dialogue: "不要！我绝对不允许！你这恶魔！" },
    },
    confidence: {
        mild:   { narration: "${target.name}高傲地别过头去，发出一声冷哼...", dialogue: "哼，别碰我。你以为这种程度就能让我屈服？" },
        medium: { narration: "${target.name}用力拍开你的手，怒目而视，全身的傲气化为怒火...", dialogue: "你以为我是谁？别做梦了！我绝不会向你低头！" },
        fierce: { narration: "${target.name}奋力反抗，咬牙切齿，眼中的怒火几乎要将你焚烧...", dialogue: "肮脏的魔王！去死吧！我就算死也不会顺从你！" },
    },
    hatred: {
        mild:   { narration: "${target.name}恶狠狠地瞪了你一眼，身体僵硬地抗拒着...", dialogue: "别用你那脏手碰我...恶心..." },
        medium: { narration: "${target.name}激烈地扭动身体，眼中满是憎恨与厌恶...", dialogue: "我恨你...我恨你！为什么偏偏是你！" },
        fierce: { narration: "${target.name}爆发出惊人的力量挣脱开来，仿佛要将你生吞活剥...", dialogue: "去死吧魔王！我要诅咒你！诅咒你永堕地狱！" },
    },
    noble: {
        mild:   { narration: "${target.name}优雅地后退一步，维持着最后的尊严...", dialogue: "请你自重。这种粗鄙之事，实在不堪入目。" },
        medium: { narration: "${target.name}脸色苍白却强撑着高贵的姿态，声音微微发抖...", dialogue: "你...你怎么敢！我可是...呜...这种屈辱..." },
        fierce: { narration: "${target.name}终于崩溃，高傲的面具碎裂，却仍在做最后的抵抗...", dialogue: "住手！你不能这样对我！我的家族...我的尊严...啊啊！" },
    },
    calm: {
        mild:   { narration: "${target.name}冷静地避开你的触碰，如同避开一只飞虫...", dialogue: "请停止这种无意义的行为。" },
        medium: { narration: "${target.name}依然面无表情，但身体紧绷，用理智筑起高墙...", dialogue: "分析结果：你的行为效率极低。建议放弃。" },
        fierce: { narration: "${target.name}冷静的面具出现裂痕，呼吸急促，却仍试图理性分析...", dialogue: "数据...不对...心跳...不应该...可恶...快停下..." },
    },
    maou: {
        mild:   { narration: "${target.name}露出玩味的笑容，反而让你有些不安...", dialogue: "呵呵...就这点本事吗？魔王大人？" },
        medium: { narration: "${target.name}周身散发出恐怖的威压，连空气都变得凝重...", dialogue: "你似乎忘记了自己的身份。跪下，蝼蚁。" },
        fierce: { narration: "${target.name}的怒火化作实质的黑暗，整个空间都在颤抖...", dialogue: "很好...你成功惹怒了我。准备好承受魔王的怒火了吗？" },
    },
    villain: {
        mild:   { narration: "${target.name}妩媚地笑着，眼底却没有一丝温度...", dialogue: "哎呀，这么急吗？人家还没准备好呢~" },
        medium: { narration: "${target.name}的笑容渐渐消失，取而代之的是危险的寒意...", dialogue: "我劝你最好住手...不然会发生什么事，人家也不知道哦？" },
        fierce: { narration: "${target.name}彻底撕下伪装，邪恶的本性暴露无遗，令人胆寒...", dialogue: "你以为你在玩弄谁？我要让你后悔出生在这个世界上！" },
    },
    heart: {
        mild:   { narration: "${target.name}脸颊微红，轻轻推拒却没什么力道...", dialogue: "那个...现在还不行啦...再等等好不好..." },
        medium: { narration: "${target.name}满脸通红，心跳加速，却仍坚守着最后的防线...", dialogue: "不行不行！太快了！我们...我们才认识多久啊！" },
        fierce: { narration: "${target.name}虽然满脸通红，却异常坚定地推开了你...", dialogue: "就算我喜欢你...这种事情...也要等到结婚之后！" },
    },
    spade: {
        mild:   { narration: "${target.name}阴沉地看了你一眼，默默缩到角落...", dialogue: "...别管我。" },
        medium: { narration: "${target.name}抱紧双膝，将脸埋进臂弯，声音闷闷地传来...", dialogue: "反正...没有人会关心我的感受...随你便吧...但我不会配合的。" },
        fierce: { narration: "${target.name}突然爆发，将所有压抑的痛苦宣泄出来...", dialogue: "为什么是我！为什么总是我！你们都想伤害我！滚开！" },
    },
    diamond: {
        mild:   { narration: "${target.name}元气满满地躲开，还冲你做了个鬼脸...", dialogue: "嘿嘿~抓不到抓不到~" },
        medium: { narration: "${target.name}鼓起腮帮子，一副受了委屈的样子...", dialogue: "讨厌！魔王是大坏蛋！人家不依啦！" },
        fierce: { narration: "${target.name}真的生气了，眼泪在眼眶里打转却倔强地不让它落下...", dialogue: "呜...太过分了...人家真的生气了！再也不理你了！" },
    },
    club: {
        mild:   { narration: "${target.name}沉稳地挡开你的手，目光坚定...", dialogue: "请住手。我还有必须要完成的事。" },
        medium: { narration: "${target.name}咬紧牙关，强忍着恐惧挺起胸膛...", dialogue: "我不会屈服的。不管发生什么，我都不会放弃。" },
        fierce: { narration: "${target.name}虽然遍体鳞伤，眼中的火焰却从未熄灭...", dialogue: "来啊！有本事就杀了我！只要我还活着，就绝不会向你低头！" },
    },
    lily: {
        mild:   { narration: "${target.name}像受惊的小动物一样睁大眼睛，不知所措...", dialogue: "诶？那个...这是要做什么...？" },
        medium: { narration: "${target.name}眼中泛起泪光，小小的身体瑟瑟发抖...", dialogue: "好可怕...不要...求求你不要...我好害怕..." },
        fierce: { narration: "${target.name}爆发出惊人的哭声，纯真的心灵遭受了巨大的冲击...", dialogue: "呜啊啊啊——！妈妈！救救我！有怪物！" },
    },
    wise: {
        mild:   { narration: "${target.name}推了推不存在的眼镜，冷静地分析着状况...", dialogue: "根据我的计算，当前行为的预期收益为负。建议终止。" },
        medium: { narration: "${target.name}快速在脑中推演着各种可能性，试图找到最优解...", dialogue: "威胁评估：高。顺从概率：低。结论：抵抗。" },
        fierce: { narration: "${target.name}的所有计算都指向了同一个绝望的结论...", dialogue: "概率...归零了...不...一定还有办法...我绝不接受这种结局！" },
    },
    protector: {
        mild:   { narration: "${target.name}温柔却坚定地握住了你伸过来的手，轻轻放下...", dialogue: "请不要这样...伤害别人并不会让你快乐..." },
        medium: { narration: "${target.name}将需要保护的人（如果存在）挡在身后，张开双臂...", dialogue: "如果要伤害她/他，就先跨过我的尸体！" },
        fierce: { narration: "${target.name}爆发出守护者的力量，用身体筑起最后的防线...", dialogue: "我发过誓要保护大家！就算粉身碎骨，也不会让你得逞！" },
    },
    prince: {
        mild:   { narration: "${target.name}优雅地整理衣领，高傲地抬起下巴...", dialogue: "请保持适当的距离。我的身份不允许这种僭越。" },
        medium: { narration: "${target.name}终于放下优雅的面具，愤怒地盯着眼前这个'乡巴佬'...", dialogue: "放肆！你知道我是谁吗？我可是...呜...你这个无礼之徒！" },
        fierce: { narration: "${target.name}高贵的面容因愤怒而扭曲，王子的尊严被践踏得体无完肤...", dialogue: "我要处死你！不...我要让你生不如死！竟敢这样对待我！" },
    },
    clever: {
        mild:   { narration: "${target.name}眼珠一转，灵巧地躲开了你的动作...", dialogue: "哎呀~差点就被抓到了呢~魔王大人还需要多加练习哦~" },
        medium: { narration: "${target.name}虽然被困住，却仍试图用言语周旋，寻找脱身之机...", dialogue: "等等！我们可以谈谈！我可以帮你做很多事！比这个有价值多了！" },
        fierce: { narration: "${target.name}的所有计策都失败了，第一次露出了绝望的表情...", dialogue: "可恶...失算了...但这还不是结束...我绝对不会放弃..." },
    },
    fia: {
        mild:   { narration: "${target.name}朦胧地看着你，仿佛还未从梦境中醒来...", dialogue: "嗯...？是在做梦吗...好奇怪的梦..." },
        medium: { narration: "${target.name}终于意识到这不是梦，梦境般的气质被恐惧取代...", dialogue: "不对...这不是梦...请让我醒来...求你了...让我回到梦里..." },
        fierce: { narration: "${target.name}的美梦彻底破碎，现实的残酷将她拖入深渊...", dialogue: "不要！我的梦境...我的幻想...不要把它们都毁掉！" },
    },
    jade: {
        mild:   { narration: "${target.name}正义凛然地看着你，眼中满是不认同...", dialogue: "这种行为是错误的。请立刻停止。" },
        medium: { narration: "${target.name}握紧拳头，正义感与无力感在心中交战...", dialogue: "我绝不会认同你的做法！正义...正义一定会战胜邪恶！" },
        fierce: { narration: "${target.name}即使被邪恶压制，正义的光芒仍未熄灭...", dialogue: "你可以摧毁我的肉体，但永远无法摧毁我的信念！正义永存！" },
    },
    ghost: {
        mild:   { narration: "${target.name}如同幽灵般飘忽不定，你的身体穿过了虚影...", dialogue: "...（无声的凝视）" },
        medium: { narration: "${target.name}虽然看似虚无，却流露出一丝真实的悲伤...", dialogue: "反正...我已经没有什么可以失去的了...但请你...至少尊重我的存在..." },
        fierce: { narration: "${target.name}虚无的外表下爆发出惊人的执念，那是生前最后的牵挂...", dialogue: "我还有...还有必须要见的人...所以...我不能在这里结束...滚开！" },
    },
    blaze: {
        mild:   { narration: "${target.name}热情地笑着，却巧妙地躲开了你的触碰...", dialogue: "哈哈~现在还不行哦~再等一下下嘛~" },
        medium: { narration: "${target.name}的热情被浇了一盆冷水，火焰转为怒焰...", dialogue: "喂喂！太过分了吧！人家都这么热情地回应了，你就不能温柔一点吗！" },
        fierce: { narration: "${target.name}的怒火如同火山爆发，热情的化身变成了毁灭的化身...", dialogue: "好啊！你想玩硬的？奉陪到底！看看谁的火焰更旺！" },
    },
    abyss: {
        mild:   { narration: "${target.name}深不见底的眼眸中闪过一丝波澜，又迅速归于平静...", dialogue: "...随便你。反正我已经习惯了。" },
        medium: { narration: "${target.name}终于露出了一丝痛苦，深渊中似乎有什么在挣扎...", dialogue: "痛...好痛...但是...已经无所谓了...反正从来没有人会在乎..." },
        fierce: { narration: "${target.name}的深渊爆发了，那是被压抑到极致的绝望与愤怒的混合物...", dialogue: "你们都一样！所有人都要伤害我！那就来啊！看看谁先崩溃！" },
    },
    normal: {
        mild:   { narration: "${target.name}有些困扰地躲开了...", dialogue: "那个...能不能不要这样..." },
        medium: { narration: "${target.name}加大了挣扎的力度...", dialogue: "住手！我真的不喜欢这样！" },
        fierce: { narration: "${target.name}歇斯底里地反抗着...", dialogue: "不要！谁来救救我！" },
    },
};

// ========== 通用fallback文本（当性格没有定义时使用） ==========
const REFUSE_FALLBACK = {
    mild:   { narration: "${target.name}微微抗拒着...", dialogue: "不要...请住手..." },
    medium: { narration: "${target.name}挣扎着推开了你...", dialogue: "住手！我不会配合的！" },
    fierce: { narration: "${target.name}激烈地反抗着...", dialogue: "滚开！别碰我！" },
};

// ========== 执行值计算 ==========
function calculateExecutionValue(game, target, comId) {
    const master = game.getMaster ? game.getMaster() : null;
    const def = TRAIN_DEFS[comId];
    
    // 调教师力量
    let masterPower = 20;
    if (game.getMasterEffectiveLevel) {
        masterPower += game.getMasterEffectiveLevel() * 4;
    }
    if (game.getMasterRank) {
        masterPower += game.getMasterRank() * 10;
    }
    if (master && master.talent && master.talent[94]) {
        masterPower += 25; // 灭世魔王
    }
    
    // 奴隶反抗
    let slaveResistance = 0;
    
    // 1. 性格修正
    let pEff = { refuseMod: 0 };
    if (target.getPersonalityEffects) {
        pEff = target.getPersonalityEffects();
    }
    slaveResistance += Math.round((pEff.refuseMod || 0) * 200);
    
    // 2. 陷落减免
    const fallenDepth = target.getFallenDepth ? target.getFallenDepth() : 0;
    slaveResistance -= fallenDepth * 40;
    
    // 3. 刻印修正 — 所有刻印都降低反抗（刻印是调教成果的体现）
    slaveResistance -= (target.mark[0] || 0) * 12;  // 屈服
    slaveResistance -= (target.mark[1] || 0) * 10;  // 快乐
    slaveResistance -= (target.mark[2] || 0) * 10;  // 侍奉
    slaveResistance -= (target.mark[3] || 0) * 8;   // 反抗（M觉醒后的配合）
    slaveResistance -= (target.mark[4] || 0) * 8;   // 猎奇
    slaveResistance -= (target.mark[5] || 0) * 10;  // 淫乱
    slaveResistance -= (target.mark[6] || 0) * 8;   // 征服（被征服后的顺从）
    slaveResistance -= (target.mark[7] || 0) * 10;  // 悲恋（爱意转化为顺从）
    
    // 4. 性经历修正
    const isVA = def && (def.category === 'vagina' || def.category === 'anal');
    if (isVA && target.talent[0]) slaveResistance += 20;
    if (target.talent[36]) slaveResistance -= 10;
    const isExposure = def && (def.category === 'arena' || [54,57].includes(comId));
    if (isExposure && target.talent[35]) slaveResistance += 15;
    
    // 5. PALAM状态
    slaveResistance -= Math.min((target.palam[5] || 0) / 500, 20);
    slaveResistance += Math.min((target.palam[10] || 0) / 1000, 15);
    
    // 6. 体力状态
    if (target.maxHp > 0 && target.hp / target.maxHp < 0.3) slaveResistance += 10;
    
    // 6.5 上回合对话安抚效果
    if (target._nextTurnResistanceReduction) {
        slaveResistance -= target._nextTurnResistanceReduction;
    }
    
    // 7. 成瘾ABL效果（让成瘾系变得有用）
    slaveResistance -= (target.abl[30] || 0) * 3;  // 性交成瘾
    slaveResistance -= (target.abl[31] || 0) * 3;  // 自慰成瘾
    slaveResistance -= (target.abl[32] || 0) * 3;  // 精液成瘾
    slaveResistance -= (target.abl[36] || 0) * 3;  // 露出成瘾
    slaveResistance -= (target.abl[37] || 0) * 3;  // 同性成淫
    
    // 8. 道具效果（TEQUIP）
    if (target.tequip) {
        if (target.tequip[20]) slaveResistance -= 5;   // 润滑液
        if (target.tequip[21]) slaveResistance -= 15;  // 媚药
        if (target.tequip[22]) slaveResistance -= 3;   // 利尿剂
        if (target.tequip[10]) slaveResistance -= 8;   // 眼罩
        if (target.tequip[11]) slaveResistance -= 12;  // 绳索
        if (target.tequip[12]) slaveResistance -= 10;  // 口球
        if (target.tequip[47]) slaveResistance -= 15;  // 束缚装
        if (target.tequip[54]) slaveResistance -= 5;   // 野外
        if (target.tequip[57]) slaveResistance -= 8;   // 羞耻play
        if (target.tequip[58]) slaveResistance -= 5;   // 浴室
        if (target.tequip[59]) slaveResistance -= 10;  // 新婚play
    }
    
    slaveResistance = Math.max(0, slaveResistance);
    
    // 9. 随机波动 (d20，1-20)
    const dice = RAND(20) + 1;
    
    const baseValue = masterPower - slaveResistance;
    const executionValue = baseValue + dice;
    
    return {
        value: executionValue,
        baseValue: baseValue,
        dice: dice,
        masterPower: masterPower,
        slaveResistance: slaveResistance,
        fallenDepth: fallenDepth
    };
}

// ========== 门槛计算 ==========
function getCommandThreshold(target, comId) {
    const def = TRAIN_DEFS[comId];
    if (!def) return 999;
    
    const catInfo = CATEGORY_THRESHOLDS[def.category];
    if (!catInfo) return 50;
    
    let threshold = catInfo.base;
    
    // 处女修正（V/A命令）
    const isVA = def.category === 'vagina' || def.category === 'anal';
    if (isVA && target.talent && target.talent[0]) {
        threshold += 15;
    }
    
    // 首次调教修正
    const trainCount = target.getTotalTrainCount ? target.getTotalTrainCount() : 0;
    if (trainCount <= 1) {
        threshold += 15; // 首次调教更难
    } else if (trainCount <= 3) {
        threshold += 8;
    } else if (trainCount <= 5) {
        threshold += 3;
    }
    
    // 道具门槛修正
    if (target.tequip && ITEM_THRESHOLD_MODS) {
        for (const [tequipId, modInfo] of Object.entries(ITEM_THRESHOLD_MODS)) {
            if (target.tequip[parseInt(tequipId)] && modInfo.categories.includes(def.category)) {
                threshold += modInfo.mod;
            }
        }
    }
    
    return Math.max(5, threshold);
}

// ========== 执行检查（核心函数） ==========
function checkCommandExecution(game, target, comId) {
    const exec = calculateExecutionValue(game, target, comId);
    const threshold = getCommandThreshold(target, comId);
    const diff = threshold - exec.baseValue; // 用baseValue计算差距（不含骰子）
    
    const success = exec.value >= threshold;
    const reasons = [];
    
    if (!success) {
        if (exec.slaveResistance > 40) reasons.push("奴隶反抗心极强");
        else if (exec.slaveResistance > 25) reasons.push("奴隶反抗心较强");
        
        const def = TRAIN_DEFS[comId];
        if (def) {
            const catInfo = CATEGORY_THRESHOLDS[def.category];
            if (catInfo && catInfo.base >= 50) reasons.push(`命令难度高(${catInfo.desc})`);
        }
        
        if (exec.fallenDepth === 0) reasons.push("尚未陷落");
        if (target.talent[0] && (def?.category === 'vagina' || def?.category === 'anal')) {
            reasons.push("处女的抗拒");
        }
    }
    
    return {
        success,
        value: exec.value,
        baseValue: exec.baseValue,
        dice: exec.dice,
        threshold,
        diff,
        masterPower: exec.masterPower,
        slaveResistance: exec.slaveResistance,
        reasons,
        exec
    };
}

// ========== 获取拒绝文本 ==========
function getRefuseText(target, comId, diff) {
    // 获取性格key
    let pCode = 'normal';
    if (target.personality && target.personality.main) {
        const mainId = target.personality.main;
        const pDef = (typeof MAIN_PERSONALITY !== 'undefined') ? MAIN_PERSONALITY[mainId] : null;
        if (pDef && pDef.code) pCode = pDef.code;
    }
    
    // 选取级别
    let level = 'mild';
    if (diff > 40) level = 'fierce';
    else if (diff > 15) level = 'medium';
    
    // 获取文本
    const texts = REFUSE_TEXTS[pCode] || REFUSE_FALLBACK;
    const text = texts[level] || texts['mild'] || REFUSE_FALLBACK[level];
    
    // 插值变量
    const interpolate = (str) => {
        if (!str) return str;
        let result = str;
        result = result.replace(/\$\{target\.name\}/g, target.name || "奴隶");
        result = result.replace(/\$\{target\.callname\}/g, target.callname || target.name || "奴隶");
        let masterName = "魔王";
        if (typeof window !== 'undefined' && window.G && window.G.getMaster) {
            const m = window.G.getMaster();
            if (m) masterName = m.name;
        }
        result = result.replace(/\$\{master\.name\}/g, masterName);
        return result;
    };
    
    return {
        narration: interpolate(text.narration),
        dialogue: interpolate(text.dialogue),
        level: level
    };
}

// ========== 获取成功率（用于UI预览） ==========
function getSuccessRate(game, target, comId) {
    const exec = calculateExecutionValue(game, target, comId);
    const threshold = getCommandThreshold(target, comId);
    
    // 计算成功率（考虑d20骰子）
    // 需要骰子值 >= threshold - baseValue
    const needed = threshold - exec.baseValue;
    if (needed <= 1) return 100;
    if (needed > 20) return 0;
    // d20 >= needed 的概率
    const successFaces = Math.max(0, 21 - needed);
    return Math.round((successFaces / 20) * 100);
}

// ========== 导出 ==========
if (typeof window !== 'undefined') {
    window.checkCommandExecution = checkCommandExecution;
    window.calculateExecutionValue = calculateExecutionValue;
    window.getCommandThreshold = getCommandThreshold;
    window.getRefuseText = getRefuseText;
    window.getSuccessRate = getSuccessRate;
    window.CATEGORY_THRESHOLDS = CATEGORY_THRESHOLDS;
}
