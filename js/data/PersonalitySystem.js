/**
 * PersonalitySystem.js - Character Personality & Hidden Traits
 * Main: 22 | Sub: 12 | Minor: 16 | Hidden: 12
 */

// ========== 22 Main Personalities ==========
// Mapped to existing TALENT ids (10-18, 160-179) where applicable
const MAIN_PERSONALITY = {
    // TALENT 10-18: core personalities
    10: { id: 10, name: "\u6148\u7231", code: "kindness",
          palamMods: { 4: 0.10, 17: 0.15 }, refuseMod: -0.10, staminaMod: 0, energyMod: 0, orgasmMod: 0,
          specialMode: { name: "\u6bcd\u6027", condition: (c) => c.abl[10] >= 3, uiColor: "#98c379" },
          desc: "\u6e29\u67d4\u6148\u7231\uff0c\u987a\u4ece/\u5c48\u670dPALAM+\uff0c\u62d2\u7edd\u7387-\u3002\u9ad8\u987a\u4ece\u65f6\u89e6\u53d1\u6bcd\u6027\u6a21\u5f0f" },
    11: { id: 11, name: "\u81ea\u4fe1\u5bb6", code: "confidence",
          palamMods: { 8: 0.15, 5: 0.05 }, refuseMod: 0.15, staminaMod: 0, energyMod: -0.05, orgasmMod: 0,
          specialMode: { name: "\u50b2\u6162", condition: (c) => c.mark[3] >= 2, uiColor: "#e5c07b" },
          desc: "\u81ea\u4fe1\u8fc7\u5269\uff0c\u7f9e\u803bPALAM+\u4f46\u62d2\u7edd\u7387+\u3002\u53cd\u6297\u523b\u5370\u9ad8\u65f6\u89e6\u53d1\u50b2\u6162\u6a21\u5f0f" },
    12: { id: 12, name: "\u618e\u6068", code: "hatred",
          palamMods: { 11: 0.20, 10: 0.10 }, refuseMod: 0.25, staminaMod: 0, energyMod: 0, orgasmMod: -0.10,
          specialMode: { name: "\u6574\u590d", condition: (c) => c.mark[6] >= 2, uiColor: "#e06c75" },
          desc: "\u6ee1\u6000\u618e\u6068\uff0c\u53cd\u611f/\u6050\u60e7PALAM+\uff0c\u62d2\u7edd\u7387++\u3002\u53cd\u53d1\u523b\u5370\u9ad8\u65f6\u89e6\u53d1\u6574\u590d\u6a21\u5f0f" },
    13: { id: 13, name: "\u9ad8\u8d35", code: "noble",
          palamMods: { 8: 0.20 }, refuseMod: 0.20, staminaMod: 0, energyMod: -0.05, orgasmMod: 0,
          specialMode: { name: "\u96c5\u9177", condition: (c) => c.abl[10] >= 4, uiColor: "#61afef" },
          desc: "\u51fa\u8eab\u9ad8\u8d35\uff0c\u7f9e\u803bPALAM+\uff0c\u62d2\u7edd\u7387+\u3002\u9ad8\u987a\u4ece\u65f6\u89e6\u53d1\u96c5\u9177\u6a21\u5f0f" },
    14: { id: 14, name: "\u51b7\u9759", code: "calm",
          palamMods: { 10: -0.10, 11: -0.10 }, refuseMod: 0.05, staminaMod: -0.05, energyMod: -0.10, orgasmMod: 0,
          specialMode: { name: "\u51b7\u6de1", condition: (c) => c.abl[11] >= 3, uiColor: "#4c8ac9" },
          desc: "\u51b7\u9759\u6de1\u6cca\uff0c\u6050\u60e7/\u53cd\u611fPALAM-\uff0c\u6c14\u529b\u6d88\u8017-\u3002\u9ad8\u6b32\u671b\u65f6\u89e6\u53d1\u51b7\u6de1\u6a21\u5f0f" },
    15: { id: 15, name: "\u9b54\u738b", code: "maou",
          palamMods: { 20: 0.20, 5: 0.10 }, refuseMod: 0.30, staminaMod: 0, energyMod: 0.10, orgasmMod: 0.10,
          specialMode: { name: "\u9738\u6c14", condition: (c) => true, uiColor: "#c678dd" },
          desc: "\u9b54\u738b\u4e13\u5c5e\u6027\u683c\uff0c\u652f\u914d/\u6b32\u671bPALAM+\uff0c\u6c14\u529b\u6062\u590d+\uff0c\u62d2\u7edd\u7387++" },
    16: { id: 16, name: "\u6076\u5973", code: "villain",
          palamMods: { 11: 0.10, 5: 0.15 }, refuseMod: 0.10, staminaMod: 0, energyMod: 0, orgasmMod: 0.05,
          specialMode: { name: "\u8bf1\u60d1", condition: (c) => c.abl[11] >= 3, uiColor: "#e06c75" },
          desc: "\u90aa\u6076\u7f8e\u4e3d\uff0c\u6b32\u60c5/\u53cd\u611fPALAM+\uff0c\u9ad8\u6b32\u671b\u65f6\u89e6\u53d1\u8bf1\u60d1\u6a21\u5f0f" },
    17: { id: 17, name: "\u7ea2\u6843", code: "heart",
          palamMods: { 5: 0.20, 0: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.10,
          specialMode: { name: "\u70ed\u60c5", condition: (c) => c.palam[5] >= 3000, uiColor: "#e06c75" },
          desc: "\u70ed\u60c5\u5982\u706b\uff0c\u6b32\u60c5/C\u5feb\u611fPALAM+\uff0c\u7edd\u9876\u5f3a\u5ea6+" },
    18: { id: 18, name: "\u9ed1\u6843", code: "spade",
          palamMods: { 16: 0.15, 9: 0.10 }, refuseMod: 0.15, staminaMod: 0, energyMod: -0.05, orgasmMod: 0.05,
          specialMode: { name: "\u6df1\u6c89", condition: (c) => c.mark[0] >= 2, uiColor: "#4c4c8a" },
          desc: "\u6df1\u6c89\u5185\u655b\uff0c\u75db\u82e6PALAM+\uff0c\u62d2\u7edd\u7387+\u3002\u9ad8\u82e6\u75db\u523b\u5370\u65f6\u89e6\u53d1\u6df1\u6c89\u6a21\u5f0f" },

    // Extended personalities (mapped to 160-179 range conceptually)
    160: { id: 160, name: "\u65b9\u5757", code: "diamond",
           palamMods: { 5: 0.15, 17: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.05,
           specialMode: { name: "\u95ea\u8000", condition: (c) => c.abl[12] >= 3, uiColor: "#e5c07b" },
           desc: "\u5143\u6c14\u6ee1\u6ee1\uff0c\u6b32\u60c5/\u5c48\u670dPALAM+\uff0c\u6280\u5de7\u9ad8\u65f6\u89e6\u53d1\u95ea\u8000\u6a21\u5f0f" },
    161: { id: 161, name: "\u6885\u82b1", code: "club",
           palamMods: { 8: 0.15, 4: 0.10 }, refuseMod: 0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0,
           specialMode: { name: "\u575a\u97e7", condition: (c) => c.abl[10] >= 3, uiColor: "#98c379" },
           desc: "\u575a\u97e7\u4e0d\u62d4\uff0c\u7f9e\u803b/\u987a\u4ecePALAM+\uff0c\u9ad8\u987a\u4ece\u65f6\u89e6\u53d1\u575a\u97e7\u6a21\u5f0f" },
    162: { id: 162, name: "\u8389\u8389", code: "lily",
           palamMods: { 0: 0.15, 5: 0.10 }, refuseMod: -0.10, staminaMod: -0.05, energyMod: 0, orgasmMod: 0.10,
           specialMode: { name: "\u7eaf\u771f", condition: (c) => c.talent[0], uiColor: "#ffb6c1" },
           desc: "\u5929\u771f\u7eaf\u6d01\uff0cC\u5feb\u611f/\u6b32\u60c5PALAM+\uff0c\u5904\u5973\u65f6\u89e6\u53d1\u7eaf\u771f\u6a21\u5f0f" },
    163: { id: 163, name: "\u77e5\u7684", code: "wise",
           palamMods: { 7: 0.20, 19: 0.10 }, refuseMod: 0.10, staminaMod: 0, energyMod: -0.10, orgasmMod: 0,
           specialMode: { name: "\u7406\u6027", condition: (c) => c.abl[100] >= 3, uiColor: "#61afef" },
           desc: "\u7406\u6027\u6770\u51fa\uff0c\u4e60\u5f97/\u5b66\u4e60PALAM+\uff0c\u6c14\u529b\u6d88\u8017-\uff0c\u5b66\u4e60\u80fd\u529b\u9ad8\u65f6\u89e6\u53d1\u7406\u6027\u6a21\u5f0f" },
    164: { id: 164, name: "\u5e87\u62a4\u8005", code: "protector",
           palamMods: { 4: 0.15, 17: 0.10 }, refuseMod: -0.15, staminaMod: 0, energyMod: -0.05, orgasmMod: 0,
           specialMode: { name: "\u5b88\u62a4", condition: (c) => c.abl[10] >= 3, uiColor: "#98c379" },
           desc: "\u5b88\u62a4\u4ed6\u4eba\uff0c\u987a\u4ece/\u5c48\u670dPALAM+\uff0c\u62d2\u7edd\u7387--\uff0c\u9ad8\u987a\u4ece\u65f6\u89e6\u53d1\u5b88\u62a4\u6a21\u5f0f" },
    165: { id: 165, name: "\u8d35\u516c\u5b50", code: "prince",
           palamMods: { 8: 0.20, 11: 0.10 }, refuseMod: 0.20, staminaMod: 0, energyMod: 0, orgasmMod: 0,
           specialMode: { name: "\u9a84\u50b2", condition: (c) => c.mark[3] >= 1, uiColor: "#e5c07b" },
           desc: "\u9a84\u50b2\u7684\u8d35\u516c\u5b50\uff0c\u7f9e\u803b/\u53cd\u611fPALAM+\uff0c\u62d2\u7edd\u7387+\u3002\u53cd\u6297\u523b\u5370\u89e6\u53d1\u9a84\u50b2\u6a21\u5f0f" },
    166: { id: 166, name: "\u4f36\u4fd0", code: "clever",
           palamMods: { 7: 0.15, 19: 0.15 }, refuseMod: 0.05, staminaMod: 0, energyMod: -0.05, orgasmMod: 0,
           specialMode: { name: "\u673a\u7075", condition: (c) => c.abl[100] >= 3, uiColor: "#61afef" },
           desc: "\u673a\u7075\u4f36\u4fd0\uff0c\u4e60\u5f97/\u5b66\u4e60PALAM+\uff0c\u5b66\u4e60\u80fd\u529b\u9ad8\u65f6\u89e6\u53d1\u673a\u7075\u6a21\u5f0f" },
    167: { id: 167, name: "\u83f2\u5a05", code: "fia",
           palamMods: { 5: 0.15, 0: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.10,
           specialMode: { name: "\u5e7b\u68a6", condition: (c) => c.abl[11] >= 3, uiColor: "#c678dd" },
           desc: "\u68a6\u5e7b\u822c\u7684\u5b58\u5728\uff0c\u6b32\u60c5/C\u5feb\u611fPALAM+\uff0c\u9ad8\u6b32\u671b\u65f6\u89e6\u53d1\u5e7b\u68a6\u6a21\u5f0f" },
    168: { id: 168, name: "\u5609\u5fb7", code: "jade",
           palamMods: { 4: 0.15, 16: 0.10 }, refuseMod: -0.10, staminaMod: -0.05, energyMod: 0, orgasmMod: 0,
           specialMode: { name: "\u6b63\u4e49", condition: (c) => c.abl[10] >= 3, uiColor: "#4c8ac9" },
           desc: "\u575a\u5b88\u6b63\u4e49\uff0c\u987a\u4ece/\u75db\u82e6PALAM+\uff0c\u62d2\u7edd\u7387-\uff0c\u9ad8\u987a\u4ece\u65f6\u89e6\u53d1\u6b63\u4e49\u6a21\u5f0f" },
    169: { id: 169, name: "\u5e7d\u7075", code: "ghost",
           palamMods: { 10: -0.15, 11: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: -0.10, orgasmMod: 0,
           specialMode: { name: "\u865a\u65e0", condition: (c) => c.mark[7] >= 1, uiColor: "#8888a0" },
           desc: "\u5982\u5e7d\u7075\u822c\u96be\u4ee5\u634f\u6478\uff0c\u6050\u60e7/\u53cd\u611fPALAM-\uff0c\u6c14\u529b\u6d88\u8017-\uff0c\u54c0\u4f24\u523b\u5370\u89e6\u53d1\u865a\u65e0\u6a21\u5f0f" },
    170: { id: 170, name: "\u70c8\u7130", code: "blaze",
           palamMods: { 5: 0.25, 0: 0.15 }, refuseMod: 0.05, staminaMod: 0.10, energyMod: -0.05, orgasmMod: 0.15,
           specialMode: { name: "\u71c3\u70e7", condition: (c) => c.palam[5] >= 5000, uiColor: "#e06c75" },
           desc: "\u70c8\u7130\u822c\u7684\u70ed\u60c5\uff0c\u6b32\u60c5/C\u5feb\u611fPALAM++\uff0c\u7edd\u9876\u5f3a\u5ea6++\uff0c\u9ad8\u6b32\u60c5\u65f6\u89e6\u53d1\u71c3\u70e7\u6a21\u5f0f" },
    171: { id: 171, name: "\u6df1\u6e0a", code: "abyss",
           palamMods: { 10: 0.15, 11: 0.15 }, refuseMod: 0.20, staminaMod: 0, energyMod: 0.10, orgasmMod: -0.10,
           specialMode: { name: "\u5d1b\u8d77", condition: (c) => c.mark[6] >= 2, uiColor: "#4c4c8a" },
           desc: "\u6df1\u4e0d\u53ef\u6d4b\u7684\u6df1\u6e0a\uff0c\u6050\u60e7/\u53cd\u611fPALAM+\uff0c\u62d2\u7edd\u7387+\uff0c\u6c14\u529b\u6062\u590d+\uff0c\u53cd\u53d1\u523b\u5370\u9ad8\u65f6\u89e6\u53d1\u5d1b\u8d77\u6a21\u5f0f" },
    172: { id: 172, name: "\u666e\u901a", code: "normal",
           palamMods: {}, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0,
           specialMode: null,
           desc: "\u6ca1\u6709\u660e\u663e\u7684\u6027\u683c\u7279\u5f81\uff0c\u5404\u9879\u6570\u503c\u5e73\u8861" }
};

// ========== 12 Sub Personalities (60% main effect) ==========
const SUB_PERSONALITY = {
    200: { id: 200, name: "\u6e29\u67d4", code: "gentle",
           palamMods: { 4: 0.06, 17: 0.09 }, refuseMod: -0.06, desc: "\u6e29\u67d4\u4f53\u8d34\uff0c\u987a\u4ece/\u5c48\u670dPALAM\u5fae\u589e" },
    201: { id: 201, name: "\u50b2\u6162", code: "proud",
           palamMods: { 8: 0.09 }, refuseMod: 0.09, desc: "\u50b2\u6162\u81ea\u5927\uff0c\u7f9e\u803bPALAM\u5fae\u589e\uff0c\u62d2\u7edd\u7387\u5fae\u589e" },
    202: { id: 202, name: "\u5bb3\u7f9e", code: "shy",
           palamMods: { 8: 0.12, 5: 0.03 }, refuseMod: 0.03, desc: "\u5bb3\u7f9e\u5185\u5411\uff0c\u7f9e\u803bPALAM\u660e\u663e\u589e\u52a0" },
    203: { id: 203, name: "\u597d\u5947", code: "curious",
           palamMods: { 5: 0.09, 0: 0.03 }, refuseMod: -0.03, desc: "\u597d\u5947\u5fc3\u5f3a\uff0c\u6b32\u60c5PALAM\u5fae\u589e" },
    204: { id: 204, name: "\u50b2\u5a07", code: "tsundere",
           palamMods: { 11: 0.06, 5: 0.06 }, refuseMod: 0.06, desc: "\u53e3\u662f\u5fc3\u975e\uff0c\u53cd\u611f/\u6b32\u60c5PALAM\u5fae\u589e" },
    205: { id: 205, name: "\u5f3a\u6c14", code: "strong",
           palamMods: { 16: 0.06, 20: 0.06 }, refuseMod: 0.06, desc: "\u5f3a\u6c14\u5f3a\u786c\uff0c\u75db\u82e6/\u652f\u914dPALAM\u5fae\u589e" },
    206: { id: 206, name: "\u8c03\u76ae", code: "mischief",
           palamMods: { 5: 0.06, 7: 0.06 }, refuseMod: 0, desc: "\u53e4\u7075\u7cbe\u602a\uff0c\u6b32\u60c5/\u4e60\u5f97PALAM\u5fae\u589e" },
    207: { id: 207, name: "\u51b7\u6de1", code: "cold",
           palamMods: { 10: -0.06, 11: -0.06 }, refuseMod: 0.03, desc: "\u51b7\u6de1\u758f\u79bb\uff0c\u6050\u60e7/\u53cd\u611fPALAM\u5fae\u51cf" },
    208: { id: 208, name: "\u70ed\u60c5", code: "passionate",
           palamMods: { 5: 0.09, 0: 0.06 }, refuseMod: -0.03, desc: "\u70ed\u60c5\u6d0b\u6ea2\uff0c\u6b32\u60c5/C\u5feb\u611fPALAM\u5fae\u589e" },
    209: { id: 209, name: "\u602a\u5f02", code: "quirky",
           palamMods: { 7: 0.09, 19: 0.06 }, refuseMod: 0, desc: "\u602a\u5f02\u72ec\u7279\uff0c\u4e60\u5f97/\u5b66\u4e60PALAM\u5fae\u589e" },
    210: { id: 210, name: "\u5b89\u9759", code: "quiet",
           palamMods: { 4: 0.06, 10: -0.03 }, refuseMod: 0, desc: "\u5b89\u9759\u5c11\u8a00\uff0c\u987a\u4ecePALAM\u5fae\u589e" },
    211: { id: 211, name: "\u6d3b\u6cfc", code: "lively",
           palamMods: { 5: 0.06, 7: 0.06 }, refuseMod: -0.03, desc: "\u6d3b\u6cfc\u597d\u52a8\uff0c\u6b32\u60c5/\u4e60\u5f97PALAM\u5fae\u589e" }
};

// ========== 16 Minor Traits (25% main effect) ==========
const MINOR_TRAITS = {
    250: { id: 250, name: "\u5bb3\u6015\u75bc\u75db", code: "pain_fear",
           palamMods: { 16: -0.05 }, refuseMod: 0.03, desc: "\u5bb3\u6015\u75bc\u75db\uff0c\u75db\u82e6PALAM\u5fae\u51cf" },
    251: { id: 251, name: "\u5bb3\u7f9e\u5c3f", code: "shy_bladder",
           palamMods: { 8: 0.05 }, refuseMod: 0, desc: "\u5bb3\u7f9e\u5c3f\uff0c\u7f9e\u803bPALAM\u5fae\u589e" },
    252: { id: 252, name: "\u5bb9\u6613\u54ed", code: "crybaby",
           palamMods: { 10: 0.05 }, refuseMod: 0, desc: "\u5bb9\u6613\u54ed\u6ce3\uff0c\u6050\u60e7PALAM\u5fae\u589e" },
    253: { id: 253, name: "\u5bb9\u6613\u6655", code: "faint",
           palamMods: {}, staminaMod: -0.03, desc: "\u5bb9\u6613\u660f\u5012\uff0c\u4f53\u529b\u6d88\u8017\u5fae\u589e" },
    254: { id: 254, name: "\u5634\u5df4\u5f3a\u786c", code: "tsuyoki",
           palamMods: { 11: 0.03 }, refuseMod: 0.03, desc: "\u5634\u5df4\u5f88\u786c\uff0c\u53cd\u611fPALAM\u5fae\u589e" },
    255: { id: 255, name: "\u8eab\u4f53\u654f\u611f", code: "sensitive",
           palamMods: { 0: 0.03, 1: 0.03, 2: 0.03, 3: 0.03 }, refuseMod: 0, desc: "\u8eab\u4f53\u654f\u611f\uff0c\u5168\u90e8\u4f4d\u5feb\u611f\u5fae\u589e" },
    256: { id: 256, name: "\u5bb9\u6613\u5174\u594b", code: "excitable",
           palamMods: { 5: 0.05 }, refuseMod: -0.03, desc: "\u5bb9\u6613\u5174\u594b\uff0c\u6b32\u60c5PALAM\u5fae\u589e" },
    257: { id: 257, name: "\u602a\u529b", code: "strength",
           palamMods: {}, staminaMod: -0.05, desc: "\u602a\u529b\u60ca\u4eba\uff0c\u4f53\u529b\u6d88\u8017\u5fae\u51cf" },
    258: { id: 258, name: "\u597d\u8272", code: "lewd",
           palamMods: { 5: 0.05 }, refuseMod: -0.03, desc: "\u5929\u751f\u597d\u8272\uff0c\u6b32\u60c5PALAM\u5fae\u589e" },
    259: { id: 259, name: "\u61d2\u60f0", code: "lazy",
           palamMods: { 7: -0.03 }, staminaMod: 0.03, desc: "\u61d2\u60f0\u6210\u6027\uff0c\u4e60\u5f97PALAM\u5fae\u51cf" },
    260: { id: 260, name: "\u597d\u5f3a", code: "competitive",
           palamMods: { 20: 0.05 }, refuseMod: 0.03, desc: "\u4e89\u5f3a\u597d\u80dc\uff0c\u652f\u914dPALAM\u5fae\u589e" },
    261: { id: 261, name: "\u591a\u6101\u5584\u611f", code: "sentimental",
           palamMods: { 10: 0.03, 11: 0.03 }, refuseMod: 0, desc: "\u591a\u6101\u5584\u611f\uff0c\u6050\u60e7/\u53cd\u611fPALAM\u5fae\u589e" },
    262: { id: 262, name: "\u5bb3\u7f9e\u5c3f\u5c3f", code: "pee_shy",
           palamMods: { 8: 0.05 }, refuseMod: 0, desc: "\u5c3f\u610f\u5bb3\u7f9e\uff0c\u7f9e\u803bPALAM\u5fae\u589e" },
    263: { id: 263, name: "\u611f\u89c9\u8遲\u949f", code: "slow",
           palamMods: { 0: -0.03, 1: -0.03 }, orgasmMod: -0.05, desc: "\u611f\u89c9\u8遲\u949f\uff0c\u90e8\u4f4d\u5feb\u611f\u5fae\u51cf" },
    264: { id: 264, name: "\u65e9\u719f", code: "precocious",
           palamMods: { 7: 0.05 }, refuseMod: -0.03, desc: "\u5fc3\u667a\u65e9\u719f\uff0c\u4e60\u5f97PALAM\u5fae\u589e" },
    265: { id: 265, name: "\u611f\u6027", code: "emotional",
           palamMods: { 5: 0.03, 4: 0.03 }, refuseMod: -0.03, desc: "\u611f\u6027\u4e30\u5bcc\uff0c\u6b32\u60c5/\u987a\u4ecePALAM\u5fae\u589e" }
};

// ========== 12 Hidden Traits ==========
const HIDDEN_TRAITS = {
    280: { id: 280, name: "\u5929\u8d4b\u5feb\u611f", code: "gifted_pleasure",
           effect50: { orgasmMod: 0.10 }, effect100: { orgasmMod: 0.25 },
           unlockLine: "\u8eab\u4f53\u6df1\u5904\u4f3c\u4e4e\u9690\u85cf\u7740\u67d0\u79cd\u672a\u77e5\u7684\u5feb\u611f\u5929\u8d4b...",
           desc: "\u9690\u85cf\u7684\u5feb\u611f\u5929\u8d4b\uff0c\u89e3\u9501\u540e\u7edd\u9876\u5f3a\u5ea6\u5927\u5e45\u63d0\u5347" },
    281: { id: 281, name: "\u53cd\u6297\u4e4b\u5fc3", code: "rebel_heart",
           effect50: { refuseMod: 0.10 }, effect100: { refuseMod: -0.20, palamMods: { 4: 0.15 } },
           unlockLine: "\u5728\u62d2\u7edd\u4e0e\u987a\u4ece\u4e4b\u95f4\uff0c\u5979\u7684\u5fc3\u4f3c\u4e4e\u5728\u75db\u82e6\u5730\u640f\u52a8...",
           desc: "\u53cd\u6297\u4e4b\u5fc3\uff0c\u5b8c\u5168\u89e3\u9501\u540e\u8f6c\u5316\u4e3a\u987a\u4ece\u52a0\u6210" },
    282: { id: 282, name: "\u6df1\u6f5c\u7684\u5feb\u4e50", code: "deep_joy",
           effect50: { palamMods: { 5: 0.10 } }, effect100: { palamMods: { 5: 0.25, 0: 0.15 } },
           unlockLine: "\u5728\u6df1\u6f5c\u610f\u8bc6\u4e2d\uff0c\u5979\u4f3c\u4e4e\u65e9\u5df2\u63a5\u53d7\u4e86\u8fd9\u4efd\u5feb\u4e50...",
           desc: "\u6df1\u5c42\u5feb\u4e50\u6f5c\u8d28\uff0c\u89e3\u9501\u540e\u6b32\u60c5\u5feb\u611f\u5927\u5e45\u63d0\u5347" },
    283: { id: 283, name: "\u72fc\u7684\u672c\u80fd", code: "wolf_instinct",
           effect50: { palamMods: { 20: 0.10 } }, effect100: { palamMods: { 20: 0.25 }, staminaMod: -0.10 },
           unlockLine: "\u5979\u7684\u773c\u795e\u4e2d\u95ea\u8fc7\u4e00\u4e1d\u91ce\u517d\u822c\u7684\u5149\u8292...",
           desc: "\u91ce\u517d\u822c\u7684\u652f\u914d\u672c\u80fd\uff0c\u89e3\u9501\u540e\u652f\u914d\u5feb\u611f\u5927\u5e45\u63d0\u5347" },
    284: { id: 284, name: "\u5723\u5973\u7684\u5815\u843d", code: "saint_fall",
           effect50: { palamMods: { 8: 0.15 } }, effect100: { palamMods: { 8: 0.30, 5: 0.15 } },
           unlockLine: "\u5723\u6d01\u7684\u8868\u8c61\u4e0b\uff0c\u4f3c\u4e4e\u9690\u85cf\u7740\u53e6\u4e00\u5e45\u9762\u5b54...",
           desc: "\u5723\u5973\u7684\u5815\u843d\uff0c\u89e3\u9501\u540e\u7f9e\u803b/\u6b32\u60c5\u5feb\u611f\u5927\u5e45\u63d0\u5347" },
    285: { id: 285, name: "\u65e0\u5e95\u7684\u6df1\u6e0a", code: "bottomless",
           effect50: { energyMod: -0.05 }, effect100: { energyMod: -0.15, orgasmMod: 0.15 },
           unlockLine: "\u5979\u7684\u6c14\u529b\u4f3c\u4e4e\u6df1\u4e0d\u89c1\u5e95\uff0c\u5c31\u50cf\u5979\u5185\u5fc3\u7684\u67d0\u4e2a\u6df1\u6d1e...",
           desc: "\u6c14\u529b\u6df1\u4e0d\u53ef\u6d4b\uff0c\u89e3\u9501\u540e\u6c14\u529b\u6d88\u8017\u5927\u5e45\u964d\u4f4e" },
    286: { id: 286, name: "\u5feb\u611f\u5171\u9e23", code: "pleasure_resonance",
           effect50: { palamMods: { 0: 0.05, 1: 0.05 } }, effect100: { palamMods: { 0: 0.15, 1: 0.15, 2: 0.10, 3: 0.10 } },
           unlockLine: "\u5f53\u591a\u4e2a\u90e8\u4f4d\u540c\u65f6\u88ab\u523a\u6fc0\u65f6\uff0c\u5979\u7684\u8eab\u4f53\u4f3c\u4e4e\u4ea7\u751f\u4e86\u5947\u5f02\u7684\u5171\u9e23...",
           desc: "\u5feb\u611f\u5171\u9e23\uff0c\u89e3\u9501\u540e\u591a\u90e8\u4f4d\u534f\u540c\u7edd\u9876\u65f6\u989d\u5916\u52a0\u6210" },
    287: { id: 287, name: "\u82e5\u5373\u82e5\u79bb", code: "fragile",
           effect50: { staminaMod: 0.05 }, effect100: { staminaMod: -0.10, orgasmMod: 0.20 },
           unlockLine: "\u5979\u7684\u8eab\u4f53\u4f3c\u4e4e\u6781\u5176\u8106\u5f31\uff0c\u5374\u53c8\u56e0\u6b64\u5bf9\u5feb\u611f\u66f4\u52a0\u654f\u611f...",
           desc: "\u82e5\u5373\u82e5\u79bb\uff0c\u89e3\u9501\u540e\u4f53\u529b\u6d88\u8017\u964d\u4f4e\u4f46\u7edd\u9876\u5f3a\u5ea6\u5927\u5e45\u63d0\u5347" },
    288: { id: 288, name: "\u65e0\u5c3d\u7684\u6b32\u671b", code: "endless_desire",
           effect50: { palamMods: { 5: 0.10 } }, effect100: { palamMods: { 5: 0.25 }, staminaMod: 0.10 },
           unlockLine: "\u5979\u7684\u6b32\u671b\u4f3c\u4e4e\u6c38\u65e0\u6b62\u5883\uff0c\u65e0\u8bba\u600e\u4e48\u6ee1\u8db3\u90fd\u4e0d\u591f...",
           desc: "\u65e0\u5c3d\u6b32\u671b\uff0c\u89e3\u9501\u540e\u6b32\u60c5\u5feb\u611f\u5927\u5e45\u63d0\u5347" },
    289: { id: 289, name: "\u5fc3\u7075\u7684\u9501", code: "soul_lock",
           effect50: { refuseMod: 0.10 }, effect100: { refuseMod: -0.30, palamMods: { 4: 0.20 } },
           unlockLine: "\u5979\u7684\u5fc3\u4f3c\u4e4e\u88ab\u67d0\u79cd\u4e1c\u897f\u9501\u4f4f\u4e86\uff0c\u5374\u53c8\u5728\u67d0\u4e9b\u65f6\u523b\u4e3a\u4e4b\u677e\u52a8...",
           desc: "\u5fc3\u7075\u4e4b\u9501\uff0c\u89e3\u9501\u540e\u62d2\u7edd\u7387\u5927\u5e45\u4e0b\u964d\uff0c\u987a\u4ece\u5927\u5e45\u63d0\u5347" },
    290: { id: 290, name: "\u53cc\u91cd\u6027\u683c", code: "dual_personality",
           effect50: { palamMods: { 5: 0.05, 4: 0.05 } }, effect100: { palamMods: { 5: 0.15, 4: 0.15, 8: 0.10 } },
           unlockLine: "\u5979\u7684\u8868\u91cc\u4e4b\u95f4\u4f3c\u4e4e\u5b58\u5728\u7740\u5b8c\u5168\u4e0d\u540c\u7684\u53e6\u4e00\u4e2a\u5979...",
           desc: "\u53cc\u91cd\u6027\u683c\uff0c\u89e3\u9501\u540e\u6b32\u60c5/\u987a\u4ece/\u7f9e\u803b\u5feb\u611f\u5168\u9762\u63d0\u5347" },
    291: { id: 291, name: "\u6781\u81f4\u654f\u611f", code: "ultimate_sensitive",
           effect50: { palamMods: { 0: 0.05, 3: 0.05 } }, effect100: { palamMods: { 0: 0.15, 1: 0.15, 2: 0.15, 3: 0.15 } },
           unlockLine: "\u5979\u7684\u76ae\u80a4\u4e0b\u4f3c\u4e4e\u6709\u7740\u65e0\u6570\u672a\u77e5\u7684\u795e\u7ecf\u672b\u680e\u5728\u8df3\u52a8...",
           desc: "\u6781\u81f4\u654f\u611f\uff0c\u89e3\u9501\u540e\u5168\u90e8\u4f4d\u5feb\u611f\u5927\u5e45\u63d0\u5347" }
};

// ========== Personality Generation ==========

function generatePersonality(seedChara) {
    const mainIds = Object.keys(MAIN_PERSONALITY).map(Number);
    const subIds = Object.keys(SUB_PERSONALITY).map(Number);
    const minorIds = Object.keys(MINOR_TRAITS).map(Number);
    const hiddenIds = Object.keys(HIDDEN_TRAITS).map(Number);

    // Weighted random for main
    let mainId;
    if (seedChara && seedChara.talent) {
        // Try to match existing personality talent
        for (let i = 10; i <= 18; i++) if (seedChara.talent[i]) mainId = i;
        for (let i = 160; i <= 179; i++) if (seedChara.talent[i]) mainId = i;
    }
    if (!mainId) mainId = mainIds[RAND(mainIds.length)];

    // Pick 2 subs (different from main)
    const subPool = subIds.filter(id => id !== mainId);
    const sub1 = subPool.splice(RAND(subPool.length), 1)[0];
    const sub2 = subPool[RAND(subPool.length)];

    // Pick 2-3 minors
    const minorCount = 2 + RAND(2);
    const minors = [];
    const minorPool = [...minorIds];
    for (let i = 0; i < minorCount && minorPool.length > 0; i++) {
        minors.push(minorPool.splice(RAND(minorPool.length), 1)[0]);
    }

    // Pick 1 hidden (initially unrevealed)
    const hiddenId = hiddenIds[RAND(hiddenIds.length)];

    return {
        main: mainId,
        sub: [sub1, sub2],
        minors: minors,
        hidden: { traitId: hiddenId, revealed: false, progress: 0 }
    };
}

// ========== Effect Calculation ==========

function getPersonalityEffects(chara, context) {
    const p = chara.personality || { main: 172, sub: [], minors: [], hidden: { revealed: false } };
    const main = MAIN_PERSONALITY[p.main] || MAIN_PERSONALITY[172];
    const effects = {
        palamMods: {},
        refuseMod: 0,
        staminaMod: 0,
        energyMod: 0,
        orgasmMod: 0,
        activeModes: [],
        uiColors: []
    };

    // Helper to merge palamMods
    function mergePalamMods(src, mult) {
        for (const k in src) {
            const key = parseInt(k);
            effects.palamMods[key] = (effects.palamMods[key] || 0) + src[k] * mult;
        }
    }

    // Main personality (100%)
    if (main) {
        mergePalamMods(main.palamMods, 1.0);
        effects.refuseMod += main.refuseMod || 0;
        effects.staminaMod += main.staminaMod || 0;
        effects.energyMod += main.energyMod || 0;
        effects.orgasmMod += main.orgasmMod || 0;
        if (main.specialMode && main.specialMode.condition && main.specialMode.condition(chara)) {
            effects.activeModes.push(main.specialMode.name);
            effects.uiColors.push(main.specialMode.uiColor);
        }
    }

    // Sub personalities (60% each)
    for (const subId of (p.sub || [])) {
        const sub = SUB_PERSONALITY[subId];
        if (!sub) continue;
        mergePalamMods(sub.palamMods, 0.60);
        effects.refuseMod += (sub.refuseMod || 0) * 0.60;
        effects.staminaMod += (sub.staminaMod || 0) * 0.60;
        effects.energyMod += (sub.energyMod || 0) * 0.60;
        effects.orgasmMod += (sub.orgasmMod || 0) * 0.60;
    }

    // Minor traits (25% each)
    for (const minorId of (p.minors || [])) {
        const minor = MINOR_TRAITS[minorId];
        if (!minor) continue;
        mergePalamMods(minor.palamMods, 0.25);
        effects.refuseMod += (minor.refuseMod || 0) * 0.25;
        effects.staminaMod += (minor.staminaMod || 0) * 0.25;
        effects.energyMod += (minor.energyMod || 0) * 0.25;
        effects.orgasmMod += (minor.orgasmMod || 0) * 0.25;
    }

    // Hidden trait (50% or 100%)
    if (p.hidden && p.hidden.revealed) {
        const ht = HIDDEN_TRAITS[p.hidden.traitId];
        if (ht) {
            const hEffect = p.hidden.full ? ht.effect100 : ht.effect50;
            if (hEffect) {
                mergePalamMods(hEffect.palamMods || {}, p.hidden.full ? 1.0 : 0.5);
                effects.refuseMod += (hEffect.refuseMod || 0) * (p.hidden.full ? 1.0 : 0.5);
                effects.staminaMod += (hEffect.staminaMod || 0) * (p.hidden.full ? 1.0 : 0.5);
                effects.energyMod += (hEffect.energyMod || 0) * (p.hidden.full ? 1.0 : 0.5);
                effects.orgasmMod += (hEffect.orgasmMod || 0) * (p.hidden.full ? 1.0 : 0.5);
            }
        }
    }

    return effects;
}

// ========== Hidden Trait Unlock ==========

function checkHiddenTraitUnlock(chara) {
    if (!chara.personality || !chara.personality.hidden) return null;
    const h = chara.personality.hidden;
    if (h.revealed) return null;
    const ht = HIDDEN_TRAITS[h.traitId];
    if (!ht) return null;

    // Progress threshold: 50% partial reveal, 100% full reveal
    // Progress increases through special events / training intensity
    let threshold = h.full ? 999 : 50;
    if (h.progress >= threshold) {
        return revealHiddenTrait(chara);
    }
    return null;
}

function revealHiddenTrait(chara) {
    if (!chara.personality || !chara.personality.hidden) return null;
    const h = chara.personality.hidden;
    const ht = HIDDEN_TRAITS[h.traitId];
    if (!ht) return null;

    if (!h.revealed) {
        h.revealed = true;
        h.full = (h.progress >= 100);
        return {
            traitId: h.traitId,
            name: ht.name,
            full: h.full,
            msg: `【${chara.name}\u7684\u9690\u85cf\u7279\u8d28\u89e3\u9501\uff01\u300c${ht.name}\u300d${h.full ? "\uff08\u5b8c\u5168\u89e3\u9501\uff09" : "\uff08\u90e8\u5206\u89e3\u9501\uff09"}】`,
            unlockLine: ht.unlockLine
        };
    }
    // Already revealed, check if can upgrade to full
    if (!h.full && h.progress >= 100) {
        h.full = true;
        return {
            traitId: h.traitId,
            name: ht.name,
            full: true,
            msg: `【${chara.name}\u7684\u9690\u85cf\u7279\u8d28\u300c${ht.name}\u300d\u5b8c\u5168\u89e3\u9501\uff01】`,
            unlockLine: ht.unlockLine
        };
    }
    return null;
}

function addHiddenTraitProgress(chara, amount) {
    if (!chara.personality || !chara.personality.hidden) return;
    const h = chara.personality.hidden;
    if (h.full) return;
    h.progress = Math.min(100, (h.progress || 0) + amount);
}

window.MAIN_PERSONALITY = MAIN_PERSONALITY;
window.SUB_PERSONALITY = SUB_PERSONALITY;
window.MINOR_TRAITS = MINOR_TRAITS;
window.HIDDEN_TRAITS = HIDDEN_TRAITS;
window.generatePersonality = generatePersonality;
window.getPersonalityEffects = getPersonalityEffects;
window.checkHiddenTraitUnlock = checkHiddenTraitUnlock;
window.revealHiddenTrait = revealHiddenTrait;
window.addHiddenTraitProgress = addHiddenTraitProgress;
