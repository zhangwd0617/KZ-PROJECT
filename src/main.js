// ERA Maou EX — ESM Entry Point
// 按原 <script> 加载顺序导入所有模块

// 1. Core engine base
import './engine/EmueraCore.js';

// 2. Data definitions
import './data/Definitions.js';
import './data/WorldSetting.js';
import './data/FallenRaces.js';
import './data/TalentTree.js';
import './data/PersonalitySystem.js';
import './data/TalentEffects.js';
import './data/RouteAccelerators.js';
import './data/OrgasmSystem.js';
import './data/GenitalConfig.js';
import './data/TrainCommandMeta.js';
import './data/ComboSystem.js';
import './data/SpecialEvents.js';
import './data/CharaTemplates.js';

// 3. Engine
import './engine/Character.js';
import './engine/SaveManager.js';

// 4. Dialogue defaults
import './dialogues/_defaults.js';

// 5. Personality dialogues
import './dialogues/personality/K0.js';
import './dialogues/personality/K1.js';
import './dialogues/personality/K2.js';
import './dialogues/personality/K3.js';
import './dialogues/personality/K4.js';
import './dialogues/personality/K5.js';
import './dialogues/personality/K6.js';
import './dialogues/personality/K6_akujo.js';
import './dialogues/personality/K7.js';
import './dialogues/personality/K8.js';
import './dialogues/personality/K9.js';
import './dialogues/personality/K10.js';
import './dialogues/personality/K11.js';
import './dialogues/personality/K12.js';
import './dialogues/personality/K13.js';
import './dialogues/personality/K15.js';

// 6. Exclusive dialogues
import './dialogues/exclusive/K903.js';
import './dialogues/exclusive/K904.js';

// 7. Dialogue index & loader
import './dialogues/_index.js';
import './dialogues/_loader.js';

// 8. Systems
import './systems/DialogueSystem.js';
import './systems/TrainSystem.js';
import './systems/ShopSystem.js';
import './systems/GearSystem.js';
import './systems/EventSystem.js';

// 9. Engine main
import './engine/Game.js';

// 10. UI
import './ui/WorldMapUI.js';
import './ui/UI.js';

// 11. Application bootstrap
window.addEventListener('DOMContentLoaded', () => {
    UI.init();
    window.G = new Game();
    G.setState('TITLE');
});
