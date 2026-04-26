/**
 * RouteStageEvents.js - Stage 3/4/5 special events for 5 routes
 * Generated based on personality × race × faction
 */

// Route names
const ROUTE_NAMES = ['顺从', '欲望', '痛苦', '露出', '支配'];
const ROUTE_COLORS = ['#61afef', '#e06c75', '#c678dd', '#e5c07b', '#98c379'];

// Stage event names
const STAGE_EVENT_NAMES = {
    0: { 3: '屈服之誓', 4: '绝对服从', 5: '至高侍奉' },
    1: { 3: '欲火沉沦', 4: '快感深渊', 5: '欲望之源' },
    2: { 3: '痛苦觉醒', 4: '痛觉升华', 5: '苦痛之神' },
    3: { 3: '羞耻绽放', 4: '公开之花', 5: '展露真我' },
    4: { 3: '支配觉醒', 4: '绝对掌控', 5: '万王之王' }
};

// Personality groups (id -> group)
const PERSONALITY_GROUPS = {
    10: 'kind', 164: 'kind', 168: 'kind',      // 慈爱/守护/正义
    11: 'proud', 13: 'proud', 165: 'proud',    // 自信/高贵/贵公子
    14: 'calm', 163: 'calm', 166: 'calm',      // 冷静/知的/伶俐
    12: 'hatred', 171: 'hatred',                // 憎恨/深渊
    15: 'maou',                                 // 魔王
    16: 'villain',                              // 恶女
    17: 'passion', 170: 'passion',              // 红桃/烈焰
    18: 'deep', 169: 'deep',                    // 黑桃/幽灵
    162: 'pure', 167: 'pure',                   // 莉莉/菲娅
    160: 'other', 161: 'other', 172: 'other', 173: 'other', 174: 'other', 175: 'other', 176: 'other', 177: 'other', 178: 'other', 179: 'other'
};

// Race map (talent[314] -> race code)
function getRaceCode(chara) {
    if (!chara || !chara.talent) return 'human';
    const raceId = chara.talent[314];
    const raceMap = { 1: 'human', 2: 'elf', 3: 'orc', 4: 'dwarf', 5: 'demon', 6: 'angel', 7: 'dragon', 8: 'sea', 9: 'vampire', 10: 'halfdemon' };
    return raceMap[raceId] || 'human';
}

function getRaceName(chara) {
    const code = getRaceCode(chara);
    const names = { human: '人类', elf: '精灵', orc: '兽人', dwarf: '矮人', demon: '魔族', angel: '天使', dragon: '龙人', sea: '海族', vampire: '吸血鬼', halfdemon: '恶魔混血' };
    return names[code] || '人类';
}

function getPersonalityGroup(chara) {
    if (!chara || !chara.personality) return 'other';
    const mainId = chara.personality.main;
    return PERSONALITY_GROUPS[mainId] || 'other';
}

function getPersonalityName(chara) {
    if (!chara || !chara.personality) return '普通';
    const mainId = chara.personality.main;
    if (typeof MAIN_PERSONALITY !== 'undefined' && MAIN_PERSONALITY[mainId]) {
        return MAIN_PERSONALITY[mainId].name;
    }
    return '普通';
}

// Core text generators per route+stage
const ROUTE_STAGE_TEXTS = {
    0: { // 顺从
        3: (c, race, pers, faction) => {
            const intros = {
                kind: `${c.name}温柔地低下了头，眼中没有恐惧，只有一种奇异的平静。`,
                proud: `${c.name}咬紧了嘴唇，高傲的头颅第一次主动低了下去——不是因为屈服，而是因为一种她自己都无法理解的渴望。`,
                calm: `${c.name}冷静地分析着现状，然后做出了最理性的选择：臣服。`,
                hatred: `${c.name}的憎恨并未消散，但她发现，将这份情感献给魔王，比徒劳的反抗更令人满足。`,
                maou: `${c.name}的眼中闪烁着认同的光芒——终于，遇到了值得追随的强者。`,
                villain: `${c.name}狡黠地笑着，她选择侍奉，只因这能带来更大的权力。`,
                passion: `${c.name}热情地投入其中，仿佛侍奉魔王是世界上最幸福的事。`,
                deep: `${c.name}在黑暗中找到了归属，那深渊般的臣服让她感到前所未有的安宁。`,
                pure: `${c.name}的天真让她轻易地交出了信任，这份纯粹比任何誓言都更加珍贵。`,
                other: `${c.name}静静地接受了这一切，仿佛命运本该如此。`
            };
            const raceFlavors = {
                human: `身为${faction}的${race}，${c.name}放弃了曾经的信仰，将灵魂献给了魔王。`,
                elf: `长寿的${race}曾见证过无数王朝的兴衰，而${c.name}确信，魔王将是最终的赢家。`,
                orc: `强悍的${race}崇尚力量，${c.name}的臣服是发自内心的敬意。`,
                dwarf: `固执的${race}极少改变立场，但${c.name}的忠诚一旦交付，便坚如磐石。`,
                demon: `同为魔族，${c.name}的臣服更像是血脉中的本能回归。`,
                angel: `从天堂坠落的${race}，${c.name}的翅膀虽仍洁白，眼中却只有魔王一人的倒影。`,
                dragon: `骄傲的${race}从未低头，但${c.name}自愿弯下了龙颈。`,
                sea: `来自深海的${race}习惯了随波逐流，而${c.name}终于找到了值得停泊的港湾。`,
                vampire: `永生的${race}看淡了世间一切，但${c.name}愿意为魔王献上永恒的侍奉。`,
                halfdemon: `混血的身份让${c.name}一直漂泊无依，而现在，她找到了归属。`
            };
            const endings = {
                kind: `「请让我...留在您身边。」`,
                proud: `「我...承认您的支配。」`,
                calm: `「这是最优解。我将效忠于您。」`,
                hatred: `「我的恨意...现在只为您而燃烧。」`,
                maou: `「有趣...让我们一同征服这个世界吧。」`,
                villain: `「我会让您看到，我的侍奉价值连城。」`,
                passion: `「我已经...无法离开您了！」`,
                deep: `「请...将我完全吞噬吧。」`,
                pure: `「我会听话的...只要是您的命令。」`,
                other: `「从今以后，我是您的。」`
            };
            return `${intros[pers] || intros.other}\n\n${raceFlavors[race] || raceFlavors.human}\n\n${endings[pers] || endings.other}`;
        },
        4: (c, race, pers, faction) => {
            return `${c.name}的顺从已深入骨髓。${getRaceName(c)}的生理特征与侍奉本能完美融合，她开始主动预判魔王的需求。\n\n「不需要命令...我知道您想要什么。」`;
        },
        5: (c, race, pers, faction) => {
            return `${c.name}成为了侍奉的极致化身。她的存在本身就是对魔王最虔诚的献礼，每一个动作都诠释着绝对的服从与深沉的爱。\n\n「我的灵魂、身体、意志...全部属于您，直至永恒。」`;
        }
    },
    1: { // 欲望
        3: (c, race, pers, faction) => {
            const intros = {
                kind: `${c.name}发现，给予快乐比接受快乐更令人满足。`,
                proud: `${c.name}曾经用高傲武装自己，如今却在快感面前丢盔弃甲。`,
                calm: `${c.name}理性地分析了快感的来源，然后决定全身心投入。`,
                hatred: `${c.name}的仇恨在欲火中燃烧、融化，最终化作了对快感的渴求。`,
                maou: `${c.name}的欲望如渊似海，而现在，她找到了能填满它的存在。`,
                villain: `${c.name}将欲望当作武器，但这一次，她心甘情愿地被自己的欲望俘虏。`,
                passion: `${c.name}如烈火般燃烧，每一根神经都在渴望着更多的刺激。`,
                deep: `${c.name}在快感的深渊中下沉，越深的地方，越是让她感到安宁。`,
                pure: `${c.name}懵懂地追寻着身体深处陌生的渴望，像一只迷途的羔羊。`,
                other: `${c.name}的身体诚实地回应着每一次触碰，再也无法伪装。`
            };
            const endings = {
                kind: `「请...给我更多...我想让您快乐...」`,
                proud: `「该死...这种快感...我戒不掉了...」`,
                calm: `「数据表明...这是最愉悦的状态...继续。」`,
                hatred: `「恨您...但更想要您...」`,
                maou: `「再来...更多...不要停...！」`,
                villain: `「呵呵...我上瘾了呢...都是您的错...」`,
                passion: `「啊...啊...好棒...我还要...！！」`,
                deep: `「沉沦吧...让我在这快感中彻底消失...」`,
                pure: `「这是什么感觉...好奇怪...但是...好舒服...」`,
                other: `「求您了...再给我一点...」`
            };
            return `${intros[pers] || intros.other}\n\n身为${faction}的${getRaceName(c)}，${c.name}放下了所有矜持，将身体交给了最原始的欲望。\n\n${endings[pers] || endings.other}`;
        },
        4: (c, race, pers, faction) => {
            return `${c.name}已彻底沦为快感的俘虏。她的身体被调教得无比敏感，每一个触碰都能引发剧烈的颤抖。\n\n「已经...回不去了...我只需要...快感...」`;
        },
        5: (c, race, pers, faction) => {
            return `${c.name}成为了欲望的化身。她的存在本身就是诱惑，每一寸肌肤都散发着令人疯狂的魅力。\n\n「来吧...让我带您进入...极乐的深渊...」`;
        }
    },
    2: { // 痛苦
        3: (c, race, pers, faction) => {
            const intros = {
                kind: `${c.name}温柔地承受着痛苦，因为她知道，这份痛苦是魔王赐予的礼物。`,
                proud: `${c.name}骄傲地昂着头，即使痛苦让她浑身颤抖，她也不肯发出一声求饶。`,
                calm: `${c.name}冷静地感受着痛苦转化为快感的奇妙过程，记录着每一个数据点。`,
                hatred: `${c.name}的憎恨与痛苦交织，形成了更强烈的快感漩涡。`,
                maou: `${c.name}享受着痛苦带来的力量感——越是痛苦，她越是强大。`,
                villain: `${c.name}狡猾地利用痛苦，将其转化为操控他人的武器。`,
                passion: `${c.name}在痛苦中燃烧，她的热情让每一次鞭打都变成了爱的抚摸。`,
                deep: `${c.name}在痛苦的最深处找到了真实的自己，那是一种令人战栗的解放。`,
                pure: `${c.name}困惑地感受着痛苦带来的异样快感，她的纯真让这份感受更加强烈。`,
                other: `${c.name}的身体学会了将痛苦翻译为快乐，这是一种全新的语言。`
            };
            const endings = {
                kind: `「请...再用力一点...这是您的恩赐...」`,
                proud: `「哼...就这点程度吗...再来啊...！」`,
                calm: `「有趣...痛觉神经的反馈模式发生了改变...继续。」`,
                hatred: `「痛吧...越痛我越兴奋...！」`,
                maou: `「啊哈哈哈...太棒了...这种痛苦...让我上瘾！」`,
                villain: `「您以为您在惩罚我？不，您在奖励我...」`,
                passion: `「啊...好烫...好痛...好舒服...！！」`,
                deep: `「撕碎我吧...让我在痛苦中重生...」`,
                pure: `「好痛...但是...为什么我会觉得...舒服...？」`,
                other: `「不要停...让我记住这份痛苦...」`
            };
            return `${intros[pers] || intros.other}\n\n身为${faction}的${getRaceName(c)}，${c.name}颠覆了种族对痛苦的认知。在她的世界里，痛苦不再是警告，而是邀请。\n\n${endings[pers] || endings.other}`;
        },
        4: (c, race, pers, faction) => {
            return `${c.name}已完全掌握了痛苦的奥秘。她的身体成为了一座桥梁，将每一次打击都转化为极乐的浪潮。\n\n「痛苦...就是...快乐...我已经...分不清了...」`;
        },
        5: (c, race, pers, faction) => {
            return `${c.name}超越了痛苦与快乐的界限。在她的感知中，两者已融为一体，成为一种更高级的存在体验。\n\n「来...给予我更多...让我在这无尽的痛苦与欢愉中...永眠...」`;
        }
    },
    3: { // 露出
        3: (c, race, pers, faction) => {
            const intros = {
                kind: `${c.name}温柔地褪去了最后的遮掩，因为她相信，魔王会温柔地守护她的裸露。`,
                proud: `${c.name}高傲地展示着自己的身体，仿佛这是一件值得炫耀的艺术品。`,
                calm: `${c.name}理性地分析了露出行为的风险与收益，然后决定：值得。`,
                hatred: `${c.name}的羞耻心与自尊心在观众的注视下崩塌，而这种崩塌带来了解脱的快感。`,
                maou: `${c.name}如同女王般展示着自己的躯体，命令所有人欣赏。`,
                villain: `${c.name}狡黠地利用自己的身体作为诱饵，享受着被注视的权力。`,
                passion: `${c.name}热情地展示自己的每一处，她的勇气点燃了所有人的欲望。`,
                deep: `${c.name}在暴露中找到了真实的自我，那层遮掩下的灵魂比肉体更加赤裸。`,
                pure: `${c.name}天真地不明白自己行为的含义，但这种无知让她更加诱人。`,
                other: `${c.name}的心跳加速，羞耻感与兴奋感在她的血管中赛跑。`
            };
            const endings = {
                kind: `「请...看着我...全部...」`,
                proud: `「看吧...这就是你们永远无法拥有的...」`,
                calm: `「根据计算，当前行为的愉悦指数达到峰值...」`,
                hatred: `「看着我...然后在嫉妒中燃烧吧...」`,
                maou: `「跪下！然后仰望我的身体！」`,
                villain: `「呵呵...你们的眼神...让我兴奋起来了...」`,
                passion: `「怎么样...我的身材...很棒吧...？！」`,
                deep: `「这才是...真实的我...没有伪装...没有谎言...」`,
                pure: `「为什么要躲起来呢...这样不舒服吗...？」`,
                other: `「好害羞...但是...好刺激...」`
            };
            return `${intros[pers] || intros.other}\n\n${getRaceName(c)}的身体在灯光下展露无遗，${faction}的教养与矜持在这一刻化为乌有。\n\n${endings[pers] || endings.other}`;
        },
        4: (c, race, pers, faction) => {
            return `${c.name}已完全沉醉于被注视的快感。她主动寻求着展示的机会，每一次暴露都让她更加兴奋。\n\n「再多一些人...看着我...我想要所有人...都看着我...！」`;
        },
        5: (c, race, pers, faction) => {
            return `${c.name}成为了 exhibitionism 的极致体现。她的裸体不再是一种状态，而是一种宣言——对自由的宣言，对欲望的宣言。\n\n「来看吧...这就是我的全部...毫无遮掩...毫无保留...」`;
        }
    },
    4: { // 支配
        3: (c, race, pers, faction) => {
            const intros = {
                kind: `${c.name}温柔地握住了支配的权杖，她的统治充满了慈爱与关怀。`,
                proud: `${c.name}高傲地俯视着脚下，这份支配权是她应得的荣耀。`,
                calm: `${c.name}冷静地分析着支配的最佳策略，效率即是她的温柔。`,
                hatred: `${c.name}将憎恨化为支配的力量，越是痛苦，她的控制越是牢固。`,
                maou: `${c.name}与魔王并立，两位支配者的共鸣让整个世界为之颤抖。`,
                villain: `${c.name}狡黠地编织着支配的网络，每一个棋子都在她的算计之中。`,
                passion: `${c.name}热情地主导着一切，她的支配如同烈火般不可阻挡。`,
                deep: `${c.name}在支配的深渊中找到了自己的王座，那黑暗中的权力让她沉醉。`,
                pure: `${c.name}天真地行使着支配权，她的纯真让这份权力更加危险。`,
                other: `${c.name}握紧了拳头，感受着力量在血管中奔涌。`
            };
            const endings = {
                kind: `「让我来引导你...温柔地...」`,
                proud: `「跪下。这是你的荣幸。」`,
                calm: `「最优解是服从我的指挥。不要质疑。」`,
                hatred: `「我会让你明白，反抗的代价是什么。」`,
                maou: `「有趣...让我们看看，谁才是真正的支配者。」`,
                villain: `「你已经成为我的棋子了...还不自知吗？」`,
                passion: `「来吧！服从我！让我听到你的臣服！」`,
                deep: `「在这黑暗中...我是唯一的光...也是唯一的王。」`,
                pure: `「听话的孩子...会有奖励的哦...？」`,
                other: `「从现在起，你属于我。」`
            };
            return `${intros[pers] || intros.other}\n\n身为${faction}的${getRaceName(c)}，${c.name}颠覆了传统的从属关系。她不再是被支配者，而是支配者本身。\n\n${endings[pers] || endings.other}`;
        },
        4: (c, race, pers, faction) => {
            return `${c.name}的支配力已无可匹敌。她的气场让所有人本能地想要臣服，甚至连魔物都会在她的目光下低头。\n\n「不需要命令...他们自然会跪下...这就是...王者的力量。」`;
        },
        5: (c, race, pers, faction) => {
            return `${c.name}达到了支配的极致。她不仅是魔王的手下，更是独立的支配者——一个能与魔王并肩而立的存在。\n\n「来吧...让我们一同...支配这个世界...」`;
        }
    }
};

function generateRouteStageEvent(chara, routeId, stage) {
    if (!chara || routeId < 0 || routeId > 4 || stage < 3 || stage > 5) return null;
    const race = getRaceCode(chara);
    const pers = getPersonalityGroup(chara);
    const faction = (typeof UI !== 'undefined' && UI._getFactionName) ? UI._getFactionName(chara) : '未知势力';

    const generator = ROUTE_STAGE_TEXTS[routeId] && ROUTE_STAGE_TEXTS[routeId][stage];
    if (!generator) return null;

    const text = generator(chara, race, pers, faction);
    const routeColor = ROUTE_COLORS[routeId];
    const eventName = STAGE_EVENT_NAMES[routeId][stage];
    const routeName = ROUTE_NAMES[routeId];

    return {
        name: eventName,
        routeName,
        routeColor,
        stage,
        text: text.replace(/\n/g, '<br>'),
        rawText: text
    };
}

function triggerRouteStageEvent(chara, routeId, stage) {
    if (!chara) return null;
    // Track triggered events to prevent duplicates
    if (!chara._routeStageEventsTriggered) chara._routeStageEventsTriggered = {};
    const key = `${routeId}_${stage}`;
    if (chara._routeStageEventsTriggered[key]) return null;

    const evt = generateRouteStageEvent(chara, routeId, stage);
    if (!evt) return null;

    chara._routeStageEventsTriggered[key] = true;

    // Apply permanent small bonus based on route+stage
    if (!chara._routeStageBonuses) chara._routeStageBonuses = {};
    const bonusKey = `${routeId}_${stage}`;
    if (!chara._routeStageBonuses[bonusKey]) {
        chara._routeStageBonuses[bonusKey] = true;
        // Small permanent palam mod bonus
        if (!chara._permPalamMods) chara._permPalamMods = {};
        const routePalamMap = { 0: 4, 1: 5, 2: 9, 3: 8, 4: 20 };
        const pid = routePalamMap[routeId];
        if (pid !== undefined) {
            chara._permPalamMods[pid] = (chara._permPalamMods[pid] || 0) + (stage === 3 ? 0.05 : stage === 4 ? 0.08 : 0.12);
        }
    }

    return evt;
}

window.ROUTE_STAGE_EVENTS = ROUTE_STAGE_TEXTS;
window.STAGE_EVENT_NAMES = STAGE_EVENT_NAMES;
window.generateRouteStageEvent = generateRouteStageEvent;
window.triggerRouteStageEvent = triggerRouteStageEvent;
