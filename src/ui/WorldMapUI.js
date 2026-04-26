// ========== World Map UI Module ==========
window.WorldMapUI = {
    render: function(game) {
        const ui = window.UI;
        try {
        ui.hideTrainStatus();
        ui.clearText();
        if (ui.textArea) ui.textArea.style.display = 'block';
        ui.appendText('【世界地图】\n', 'accent');
        const devilFame = game.flag[503] || 0;
        const devilMorale = game.devilMorale || 100;
        const devilBaseMorale = game.devilBaseMorale || 0;
        ui.appendText(`魔王军声望: ${devilFame} | 魔王军士气: ${devilMorale}${devilBaseMorale > 0 ? '+' + devilBaseMorale : ''}`);
        ui.appendText('点击城市、要塞或势力区域查看详情。鼠标滚轮缩放，拖拽平移。');
        ui.appendDivider();

        const mapId = 'wm-cvs-' + Date.now();
        ui.textArea.innerHTML += '<div style="position:relative;width:100%;height:540px;overflow:hidden;background:#0b1220;border-radius:8px;border:1px solid var(--border);" id="' + mapId + '-w"></div>';

        const wrap = document.getElementById(mapId + '-w');
        const cvs = document.createElement('canvas');
        cvs.id = mapId;
        cvs.width = wrap.clientWidth || 960;
        cvs.height = 520;
        cvs.style.cursor = 'crosshair';
        wrap.appendChild(cvs);

        const ctx = cvs.getContext('2d');
        const D = window.WORLD_MAP_DATA || {territories:[],cities:[],forts:[],grudges:[]};
        let sc = 1, ox = 0, oy = 0, drag = false, dsx, dsy, sel = null;

        const w2s = (x,y)=>({x:x*sc+ox,y:y*sc+oy});
        const s2w = (sx,sy)=>({x:(sx-ox)/sc,y:(sy-oy)/sc});
        const inPoly = (x,y,p)=>{let ins=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];const inter=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi);if(inter)ins=!ins;}return ins;};

        // Compute bounding box of all map content
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        D.territories.forEach(t => {
            t.path.forEach(p => {
                minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]);
                maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]);
            });
        });
        D.cities.forEach(c => { minX = Math.min(minX, c.x); minY = Math.min(minY, c.y); maxX = Math.max(maxX, c.x); maxY = Math.max(maxY, c.y); });
        D.forts.forEach(f => { minX = Math.min(minX, f.x); minY = Math.min(minY, f.y); maxX = Math.max(maxX, f.x); maxY = Math.max(maxY, f.y); });
        if (!isFinite(minX)) { minX = 0; minY = 0; maxX = cvs.width; maxY = cvs.height; }
        const pad = 50;
        const mapW = maxX - minX;
        const mapH = maxY - minY;
        if (mapW > 0 && mapH > 0) {
            sc = Math.min((cvs.width - pad * 2) / mapW, (cvs.height - pad * 2) / mapH);
            sc = Math.max(0.15, Math.min(3, sc));
            ox = (cvs.width - (minX + maxX) * sc) / 2;
            oy = (cvs.height - (minY + maxY) * sc) / 2;
        }

        const RACE_COL = {human:'#ff6b6b',dwarf:'#cd853f',elf:'#51cf66',orc:'#ff922b',church:'#ffd43b',frontier:'#868e96',angel:'#a29bfe'};

        function draw() {
            const W = cvs.width, H = cvs.height;
            ctx.clearRect(0,0,W,H);

            // Solid dark background
            ctx.fillStyle = '#0b1220';
            ctx.fillRect(0,0,W,H);

            ctx.save();
            ctx.translate(ox,oy);
            ctx.scale(sc,sc);

            // Territory solid color blocks
            D.territories.forEach(t=>{
                ctx.beginPath();ctx.moveTo(t.path[0][0],t.path[0][1]);for(let i=1;i<t.path.length;i++)ctx.lineTo(t.path[i][0],t.path[i][1]);ctx.closePath();
                ctx.fillStyle = t.color || 'rgba(120,120,120,0.3)';
                ctx.fill();
                ctx.strokeStyle = t.border || 'rgba(180,180,180,0.5)';
                ctx.lineWidth = 2 / sc;
                ctx.stroke();
                // Territory name centered
                let cx=0,cy=0;t.path.forEach(p=>{cx+=p[0];cy+=p[1];});cx/=t.path.length;cy/=t.path.length;
                ctx.fillStyle='rgba(0,0,0,0.45)';ctx.font='bold 13px sans-serif';const tw=ctx.measureText(t.name).width;
                ctx.fillRect(cx-tw/2-5,cy-12,tw+10,24);
                ctx.fillStyle=t.border || '#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.name,cx,cy);
            });

            // Grudge lines
            ctx.setLineDash([6,5]);
            D.grudges.forEach(gr=>{
                const fc=D.cities.find(c=>c.name===gr.from),tc=D.cities.find(c=>c.name===gr.to);
                if(fc&&tc){
                    ctx.beginPath();ctx.moveTo(fc.x,fc.y);ctx.lineTo(tc.x,tc.y);ctx.strokeStyle=gr.color;ctx.lineWidth=1.8/sc;ctx.globalAlpha=0.5;ctx.stroke();ctx.globalAlpha=1;
                    const mx=(fc.x+tc.x)/2,my=(fc.y+tc.y)/2;ctx.fillStyle='rgba(0,0,0,0.55)';ctx.font='bold 10px sans-serif';const tl=ctx.measureText(gr.label).width;ctx.fillRect(mx-tl/2-3,my-8,tl+6,16);ctx.fillStyle=gr.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(gr.label,mx,my+1);
                }
            });ctx.setLineDash([]);

            // Fort-to-city lines
            D.forts.forEach(f=>{
                const tgt=D.cities.find(c=>c.name===f.target);
                if(tgt){ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(tgt.x,tgt.y);ctx.strokeStyle='rgba(160,150,255,0.25)';ctx.lineWidth=1.2/sc;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);}
            });

            // Cities
            D.cities.forEach(c=>{
                const isSel=sel&&sel.name===c.name;const sz=c.type==='capital'?10:(c.type==='major'?7:4);
                // 获取城市防御耐久度
                let defenseDur = 100;
                let isRuined = false;
                if (game.factionStates && game.factionStates[c.race] && game.factionStates[c.race].cityStates[c.name]) {
                    defenseDur = game.factionStates[c.race].cityStates[c.name].defense;
                    isRuined = game.factionStates[c.race].cityStates[c.name].status === 'ruined';
                }
                if(isSel){ctx.beginPath();ctx.arc(c.x,c.y,sz+8,0,Math.PI*2);ctx.fillStyle='rgba(233,69,96,0.3)';ctx.fill();}
                ctx.beginPath();
                if(c.type==='capital'){for(let i=0;i<5;i++){const ang=(Math.PI*2*i/5)-Math.PI/2,rr=i%2===0?sz:sz/2;const px=c.x+Math.cos(ang)*rr,py=c.y+Math.sin(ang)*rr;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();}
                else if(c.type==='major'){ctx.moveTo(c.x,c.y-sz);ctx.lineTo(c.x+sz,c.y);ctx.lineTo(c.x,c.y+sz);ctx.lineTo(c.x-sz,c.y);ctx.closePath();}
                else if(c.type==='church'){ctx.moveTo(c.x,c.y-sz);ctx.lineTo(c.x+sz*0.7,c.y+sz);ctx.lineTo(c.x-sz*0.7,c.y+sz);ctx.closePath();}
                else{ctx.arc(c.x,c.y,sz,0,Math.PI*2);}
                // 根据耐久度调整颜色和透明度
                let baseColor = RACE_COL[c.race]||'#fff';
                if (isRuined) {
                    ctx.fillStyle = 'rgba(100,100,100,0.3)';
                    ctx.strokeStyle = 'rgba(150,150,150,0.4)';
                } else if (defenseDur <= 20) {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = isSel?'#e94560':'#ff4444';
                } else if (defenseDur <= 50) {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = isSel?'#e94560':'#ffaa44';
                } else {
                    ctx.fillStyle = baseColor;
                    ctx.strokeStyle = isSel?'#e94560':'rgba(255,255,255,0.9)';
                }
                ctx.globalAlpha = isRuined ? 0.4 : 1.0;
                ctx.fill();
                ctx.lineWidth=isSel?2.2:1.2;ctx.stroke();
                ctx.globalAlpha = 1.0;
                // City label
                ctx.fillStyle='rgba(0,0,0,0.55)';ctx.font='bold 11px sans-serif';const tl2=ctx.measureText(c.name).width;ctx.fillRect(c.x-tl2/2-3,c.y+sz+4,tl2+6,16);
                ctx.fillStyle = isRuined ? '#888' : '#fff';
                ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c.name + (isRuined ? ' [已沦陷]' : ''),c.x,c.y+sz+12);
            });

            // Forts
            D.forts.forEach(f=>{
                const isSel=sel&&sel.name===f.name;const sz=12;
                ctx.beginPath();ctx.moveTo(f.x,f.y-sz);ctx.lineTo(f.x+sz*0.85,f.y+sz*0.65);ctx.lineTo(f.x-sz*0.85,f.y+sz*0.65);ctx.closePath();
                ctx.fillStyle=isSel?'#e94560':'#a29bfe';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.8;ctx.stroke();
                ctx.fillStyle='rgba(0,0,0,0.55)';ctx.font='bold 10px sans-serif';const tl3=ctx.measureText(f.name).width;ctx.fillRect(f.x-tl3/2-3,f.y-sz-17,tl3+6,15);
                ctx.fillStyle='#a29bfe';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.name,f.x,f.y-sz-9);
            });

            ctx.restore();
        }

        function getEntity(mx,my){
            const w=s2w(mx,my);
            for(let ci=D.cities.length-1;ci>=0;ci--){const c=D.cities[ci];const s=c.type==='capital'?14:(c.type==='major'?10:7);const dx=w.x-c.x,dy=w.y-c.y;if(Math.sqrt(dx*dx+dy*dy)<s)return{type:'city',data:c};}
            for(let fi=D.forts.length-1;fi>=0;fi--){const f=D.forts[fi];const dx=w.x-f.x,dy=w.y-f.y;if(Math.sqrt(dx*dx+dy*dy)<14)return{type:'fort',data:f};}
            for(let ti=D.territories.length-1;ti>=0;ti--){const t=D.territories[ti];if(inPoly(w.x,w.y,t.path))return{type:'territory',data:t};}
            return null;
        }

        function updateInfoBar(entity){
            const bar=document.getElementById('wm-info-bar');
            if(!bar)return;
            if(!entity){bar.innerHTML='<span style="color:var(--text-dim)">点击地图上的标记查看详细信息...</span>';return;}
            const d=entity.data;
            let html='';
            if(entity.type==='city'){
                const tn={capital:'主城',major:'副城',town:'城镇',church:'教廷圣地'};
                const rn={human:'人类',dwarf:'矮人',elf:'精灵',orc:'兽人',church:'教廷',frontier:'边缘地带'};
                html='<strong style="color:var(--accent)">'+d.name+'</strong> ';
                html+='<span style="color:var(--text-dim)">|'+(tn[d.type]||d.type)+' | '+(rn[d.race]||d.race)+' | 人口:'+d.pop+'</span> ';
                // 显示防御值和耐久度
                if (game.factionStates && game.factionStates[d.race] && game.factionStates[d.race].cityStates[d.name]) {
                    const cityState = game.factionStates[d.race].cityStates[d.name];
                    const defStrength = game.getCityDefenseStrength ? game.getCityDefenseStrength(d.name) : 0;
                    if (cityState.status === 'ruined') {
                        html+='<span style="color:#888">| 已沦陷</span> ';
                    } else {
                        const durColor = cityState.defense > 50 ? '#44ff44' : (cityState.defense > 20 ? '#ffaa44' : '#ff4444');
                        html+=`<span style="color:var(--text-dim)">| 防御值:${defStrength}</span> <span style="color:${durColor}">| 耐久:${cityState.defense}%</span> `;
                    }
                }
                html+='<span style="color:var(--text-dim)">'+d.feature+'</span>';
                if(d.type==='capital'){const ft=D.forts.find(f=>f.target===d.name);if(ft)html+=' <span style="color:#a29bfe">| 监视要塞: '+ft.name+'（'+ft.direction+'）</span>';}
            }else if(entity.type==='fort'){
                html='<strong style="color:#a29bfe">'+d.name+'</strong> ';
                html+='<span style="color:var(--text-dim)">| 镇守:'+d.king+' | 驻军:'+d.garrison+' | 监视目标:'+d.target+'（'+d.direction+'）</span> ';
                html+='<span style="color:var(--text-dim)">'+d.desc+'</span>';
            }else if(entity.type==='territory'){
                html='<strong style="color:var(--accent)">'+d.name+'</strong> ';
                html+='<span style="color:var(--text-dim)">| 主导种族:'+d.race+' | 人口:'+d.pop+'（'+d.ratio+'）</span> ';
                // 显示势力声望和士气
                const factionId = d.id;
                if (game.factionStates && game.factionStates[factionId]) {
                    const rep = game.getFactionReputation ? game.getFactionReputation(factionId) : 0;
                    const morale = game.getFactionMorale ? game.getFactionMorale(factionId) : 100;
                    const surrender = game.getFactionSurrenderLevel ? game.getFactionSurrenderLevel(factionId) : 0;
                    const moraleColor = morale >= 120 ? '#44ff44' : (morale >= 80 ? '#fff' : '#ff4444');
                    html+=`<span style="color:var(--text-dim)">| 声望:${rep}</span> <span style="color:${moraleColor}">| 士气:${morale}</span>`;
                    if (surrender >= 3) html+=' <span style="color:#ff4444;font-weight:bold">| 已投降</span>';
                    else if (surrender >= 2) html+=' <span style="color:#ffaa44">| 副城全陷</span>';
                    else if (surrender >= 1) html+=' <span style="color:#ffcc44">| 城镇全陷</span>';
                }
                html+=' <span style="color:var(--text-dim)">'+d.desc+'</span>';
            }
            bar.innerHTML=html;
        }

        // Events
        cvs.addEventListener('mousemove',e=>{
            const rect=cvs.getBoundingClientRect();
            const mx=e.clientX-rect.left,my=e.clientY-rect.top;
            if(drag){ox+=mx-dsx;oy+=my-dsy;dsx=mx;dsy=my;draw();return;}
            const ent=getEntity(mx,my);
            cvs.style.cursor=ent?'pointer':'crosshair';
        });
        cvs.addEventListener('mousedown',e=>{
            const rect=cvs.getBoundingClientRect();
            dsx=e.clientX-rect.left;dsy=e.clientY-rect.top;drag=true;
        });
        cvs.addEventListener('mouseup',e=>{
            if(drag){
                const rect=cvs.getBoundingClientRect();
                const mx=e.clientX-rect.left,my=e.clientY-rect.top;
                if(Math.sqrt((mx-dsx)**2+(my-dsy)**2)<5){
                    const ent=getEntity(mx,my);
                    sel=ent?ent.data:null;updateInfoBar(ent);draw();
                }
            }drag=false;
        });
        cvs.addEventListener('mouseleave',()=>{drag=false;});
        cvs.addEventListener('wheel',e=>{
            e.preventDefault();
            const rect=cvs.getBoundingClientRect();
            const mx=e.clientX-rect.left,my=e.clientY-rect.top;
            const zf=e.deltaY<0?1.15:0.87;
            const ns=Math.max(0.2,Math.min(4,sc*zf));
            ox=mx-(mx-ox)*(ns/sc);oy=my-(my-oy)*(ns/sc);sc=ns;draw();
        });

        draw();
        ui.setButtons('<button class="back-btn-top" onclick="G.setState(\'SHOP\')">← 返回</button><span id="wm-info-bar" style="margin-left:12px;font-size:0.85rem;vertical-align:middle;"><span style="color:var(--text-dim)">点击地图上的标记查看详细信息...</span></span>');
        } catch (err) {
            ui.appendText('\n[地图渲染错误] ' + err.name + ': ' + err.message, 'danger');
            console.error('WorldMapUI render error:', err);
            ui.setButtons('<button class="back-btn-top" onclick="G.setState(\'SHOP\')">← 返回</button>');
        }
    }
};
