with open('js/data/RouteAccelerators.js', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

old = '''const ASSISTANT_BUFFS = {
    // ===== Stage5 assistant-only buffs =====
    450: { id: 450, name: "\\u5949\\u4ed5\\u4e4b\\u5fc3", route: 0, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u4ee3\\u884c\\u6307\\u4ee4\\u6548\\u679c+20%\\uff0c\\u81ea\\u8eab\\u6c14\\u529b\\u6d88\\u8017-10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "delegate", power: 0.20, energyCost: -0.10 }; } },
    451: { id: 451, name: "\\u60c5\\u6b32\\u4e4b\\u706b", route: 1, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u53c2\\u4e0e\\u6a21\\u5f0f\\u4e0b\\u53cc\\u65b9\\u5feb\\u611f+15%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "participate", pleasureBoost: 0.15 }; } },
    452: { id: 452, name: "\\u75db\\u82e6\\u5171\\u9e23", route: 2, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0cSM\\u6307\\u4ee4\\u4ee3\\u884c\\u6548\\u679c+25%\\uff0c\\u4e3b\\u5974\\u75db\\u82e6\\u8f6c\\u5316\\u7387+10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "delegate", power: 0.25, painConvert: 0.10 }; } },
    453: { id: 453, name: "\\u7f9e\\u803b\\u5171\\u611f", route: 3, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u9732\\u51fa\\u573a\\u666fplay\\u6548\\u679c+20%\\uff0c\\u4e3b\\u5974\\u7f9e\\u803bPALAM+10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "participate", shameBoost: 0.20, targetShame: 0.10 }; } },
    454: { id: 454, name: "\\u652f\\u914d\\u5171\\u8c0b", route: 4, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u53cc\\u4eba\\u6307\\u4ee4\\u6548\\u679c+15%\\uff0c\\u4e3b\\u5974\\u62d2\\u7edd\\u7387-10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "participate", dualPower: 0.15, targetRefuse: -0.10 }; } }
};'''

new = '''const ASSISTANT_BUFFS = {
    // ===== Stage5 assistant-only buffs (V3.0 complex effects) =====
    // 顺从: 信仰传播者
    450: { id: 450, name: "\\u4fe1\\u4ef0\\u4f20\\u64ad\\u8005", route: 0, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u6bcf\\u56de\\u5408+50\\u606d\\u987aPALAM\\uff0c\\u5c48\\u670d\\u523b\\u5370\\u7ecf\\u9a8c\\u00d71.5\\uff0c\\u540c\\u8def\\u7ebf\\u7ecf\\u9a8c\\u00d71.3",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "delegate", power: 0.20,
                   perTurnPalam: { 4: 50 },      // 每回合+50恭顺PALAM
                   markExpMult: { 2: 1.5 },      // 屈服刻印经验\u00d71.5
                   sameRouteExpMult: 1.3         // 同路线经验\u00d71.3
               };
           } },
    // 欲望: 快感导师
    451: { id: 451, name: "\\u5feb\\u611f\\u5bfc\\u5e08", route: 1, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u5feb\\u4e50\\u00d71.25\\uff0c\\u6da6\\u6ed1\\u8d77\\u59cb+200\\uff0c\\u7edd\\u9876\\u540e\\u4e0b\\u56de\\u5408\\u5168PALAM+150",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "participate", pleasureBoost: 0.15,
                   joyMult: 1.25,                 // 快乐PALAM\u00d71.25
                   wetStart: 200,                 // 润滑起始+200
                   postOrgasmBoost: 150           // 绝顶后下回合全PALAM起始+150
               };
           } },
    // 痛苦: 苦痛代行者
    452: { id: 452, name: "\\u82e6\\u75db\\u4ee3\\u884c\\u8005", route: 2, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u75db\\u82e680%\\u8f6c\\u5feb\\u4e50\\uff0cSM\\u6307\\u4ee4\\u00d71.4\\uff0c\\u6050\\u60e7\\u4e0d\\u52a0\\u62d2\\u7edd\\u7387",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "delegate", power: 0.25,
                   painToJoy: 0.80,               // 痛苦80%转快乐
                   smMult: 1.40,                  // SM指令\u00d71.4
                   noFearRefuse: true             // 恐惧不加拒绝率
               };
           } },
    // 露出: 公开处刑人
    453: { id: 453, name: "\\u516c\\u5f00\\u5904\\u5211\\u4eba", route: 3, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u7f9e\\u803b\\u00d71.3\\uff0c\\u526f\\u5974\\u5728\\u573a\\u00d71.2\\uff0c\\u89e3\\u9501\\u534f\\u540c\\u6307\\u4ee4",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "participate", shameBoost: 0.20,
                   shameMult: 1.30,               // 羞耻\u00d71.3
                   bystanderShameMult: 1.20,      // 副奴在场羞耻\u00d71.2
                   unlockPublicShame: true        // 解锁协同指令\u201c\\u516c\\u5f00\\u7f9e\\u8fb1\u201d
               };
           } },
    // 支配: 代理支配者
    454: { id: 454, name: "\\u4ee3\\u7406\\u652f\\u914d\\u8005", route: 4, assistantOnly: true,
           effectDesc: "\\u4f5c\\u4e3a\\u52a9\\u624b\\u65f6\\uff0c\\u4e0d\\u5360\\u52a9\\u624b\\u69fd\\u4f4d\\uff0c\\u6bcf3\\u56de\\u5408\\u4ee3\\u4e3a\\u8c03\\u6559\\uff0c\\u53cd\\u611f50%\\u8f6c\\u606d\\u987a",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "participate", dualPower: 0.15,
                   noSlot: true,                  // 不占助手槽位
                   autoTeachEvery: 3,             // 每3回合代为调教
                   hateToObey: 0.50               // 反感50%转恭顺
               };
           } }
};'''

if old in content:
    content = content.replace(old, new)
    with open('js/data/RouteAccelerators.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK')
else:
    print('NOT FOUND')
