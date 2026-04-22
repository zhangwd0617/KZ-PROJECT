global.window = {};
global.RAND = function(n){return Math.floor(Math.random()*n);};
require('./js/data/Definitions.js');
function Character(){this.name='Test';this.mark=new Array(20).fill(0);this.abl=new Array(110).fill(0);this.palam=new Array(120).fill(0);this.hp=100;this.maxHp=100;this.mp=100;this.maxMp=100;this.cflag=new Array(1000).fill(0);this.talent=new Array(1000).fill(0);this.base=[100,100,100];this.maxbase=[100,100,100];this.exp=new Array(100).fill(0);}
Character.prototype.addMark=function(id,v){var max=(global.MARK_DEFS&&global.MARK_DEFS[id]&&global.MARK_DEFS[id].max)||3;this.mark[id]=Math.min(max,(this.mark[id]||0)+v);};
var master=new Character();master.name='魔王';
var slave1=new Character();slave1.name='奴隶A';slave1.mark[0]=1;
var slave2=new Character();slave2.name='奴隶B';slave2.mark[0]=3;
var game={characters:[master,slave1,slave2],master:0,masterExp:0,money:1000,day:1,flag:new Array(1000).fill(0),invaders:[],prisoners:[],getMaster:function(){return this.characters[this.master];},getHeroFloor:function(){return 1;},getHeroProgress:function(){return 50;},getFacilityIncome:function(){return 0;},processHeroInvasion:function(){return null;},_processHeroEncounters:function(){return [];},_formHeroSquads:function(){},_formSlaveSquads:function(){},moveHeroDaily:function(){return {};},processSlaveExploreDaily:function(){return [];},_slaveMarketCandidates:null,delChara:function(){}};
require('./js/systems/EventSystem.js');
var es=new global.window.EventSystem(game);
console.log('=== Stress test: calling every handler directly ===');
var pool=es._getDailyEventPool();
var ok=0,fail=0;
var failList=[];
for(var i=0;i<pool.length;i++){
  var evt=pool[i];
  try{
    var r=evt.handler(game);
    if(r===undefined){
      console.log('UNDEFINED:',evt.id);
      failList.push(evt.id);
      fail++;
    } else {
      ok++;
    }
  }catch(e){
    console.log('ERROR:',evt.id,e.message);
    failList.push(evt.id);
    fail++;
  }
}
console.log('Daily events: ok='+ok+' fail='+fail);
if(failList.length>0) console.log('Failed:',failList.join(', '));
console.log('=== Dungeon events ===');
var dpool=es._getDungeonEventPool();
var dok=0,dfail=0;
var dfailList=[];
for(var j=0;j<dpool.length;j++){
  var devt=dpool[j];
  try{
    var hero=new Character();hero.name='勇者';hero.cflag[501]=1;hero.cflag[502]=50;
    var dr=devt.handler(game,hero);
    if(dr===undefined){console.log('UNDEFINED D:',devt.id);dfailList.push(devt.id);dfail++;}else{dok++;}
  }catch(e){
    console.log('ERROR D:',devt.id,e.message);
    dfailList.push(devt.id);
    dfail++;
  }
}
console.log('Dungeon events: ok='+dok+' fail='+dfail);
if(dfailList.length>0) console.log('Failed D:',dfailList.join(', '));
