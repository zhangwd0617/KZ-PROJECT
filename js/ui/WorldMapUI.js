// ========== World Map UI Module ==========
window.WorldMapUI = {
    render: function(game) {
        try {
        const ui = window.UI;
        ui.hideTrainStatus();
        ui.clearText();
        if (ui.textArea) ui.textArea.style.display = 'block';
        ui.appendText('【世界地图】\n', 'accent');
        ui.appendText('点击城市、要塞或势力区域查看详情。');
        ui.appendDivider();

        const mapId = 'wm-cvs-' + Date.now();
        const infoId = 'wm-info-' + Date.now();
        ui.textArea.innerHTML += '<div style="position:relative;width:100%;height:520px;overflow:hidden;background:#0a1525;border-radius:8px;border:1px solid var(--border);" id="' + mapId + '-w"></div>';
        ui.textArea.innerHTML += '<div id="' + infoId + '" style="margin-top:8px;padding:12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;min-height:60px;border:1px solid var(--border);"><span style="color:var(--text-dim)">点击地图上的标记查看详细信息...</span></div>';

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

        const TERRAIN = {
            human:{fill:'rgba(180,80,40,0.22)',label:'#ffaaaa'},
            elf:{fill:'rgba(40,140,40,0.22)',label:'#aaffaa'},
            dwarf:{fill:'rgba(140,120,80,0.22)',label:'#ffddaa'},
            orc:{fill:'rgba(180,100,20,0.22)',label:'#ffcc88'},
            church:{fill:'rgba(255,200,40,0.12)',label:'#ffee88'},
            frontier:{fill:'rgba(100,100,130,0.18)',label:'#bbbbcc'},
            desert:{fill:'rgba(200,170,80,0.18)',label:'#eedd88'}
        };
        const RACE_COL = {human:'#ff6b6b',dwarf:'#cd853f',elf:'#51cf66',orc:'#ff922b',church:'#ffd43b',frontier:'#868e96'};

        function draw() {
            const W = cvs.width, H = cvs.height;
            ctx.clearRect(0,0,W,H);

            // Ocean
            const g = ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,Math.max(W,H));
            g.addColorStop(0,'#1a3050');g.addColorStop(1,'#0a1525');
            ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
            ctx.strokeStyle='rgba(80,140,200,0.07)';
            for(let i=0;i<H;i+=28){
                ctx.beginPath();ctx.moveTo(0,i);
                for(let x=0;x<W;x+=12)ctx.lineTo(x,i+Math.sin(x*0.03+i*0.02)*5);
                ctx.stroke();
            }

            ctx.save();ctx.translate(ox,oy);ctx.scale(sc,sc);

            // Land mass outline
            ctx.beginPath();
            D.territories.forEach(t=>{ctx.moveTo(t.path[0][0],t.path[0][1]);for(let i=1;i<t.path.length;i++)ctx.lineTo(t.path[i][0],t.path[i][1]);ctx.closePath();});
            ctx.fillStyle='#1b2e1b';ctx.fill();

            // Territories with colors
            D.territories.forEach(t=>{
                const tc=TERRAIN[t.id]||TERRAIN.frontier;
                ctx.beginPath();ctx.moveTo(t.path[0][0],t.path[0][1]);for(let i=1;i<t.path.length;i++)ctx.lineTo(t.path[i][0],t.path[i][1]);ctx.closePath();
                ctx.fillStyle=tc.fill;ctx.fill();
                ctx.strokeStyle=tc.label;ctx.lineWidth=1.2;ctx.globalAlpha=0.35;ctx.stroke();ctx.globalAlpha=1;
                let cx=0,cy=0;t.path.forEach(p=>{cx+=p[0];cy+=p[1];});cx/=t.path.length;cy/=t.path.length;
                ctx.fillStyle='rgba(0,0,0,0.5)';ctx.font='bold 12px sans-serif';const tw=ctx.measureText(t.name).width;
                ctx.fillRect(cx-tw/2-4,cy-10,tw+8,20);ctx.fillStyle=tc.label;ctx.textAlign='center';ctx.fillText(t.name,cx,cy+4);
            });

            // Desert dunes
            const desert=D.territories.find(t=>t.id==='desert');
            if(desert){
                ctx.strokeStyle='rgba(220,190,100,0.2)';ctx.lineWidth=0.7;
                for(let i=0;i<35;i++){
                    const y=410+i*9;ctx.beginPath();ctx.moveTo(770,y);
                    for(let x=770;x<1110;x+=18)ctx.lineTo(x,y+Math.sin((x+i*60)*0.015)*6);
                    ctx.stroke();
                }
            }

            // Forest patches (elf area)
            ctx.fillStyle='rgba(60,180,60,0.12)';
            [[220,140,42],[320,180,38],[180,220,32],[380,120,30],[420,260,34],[280,280,26],[350,220,30],[250,180,24],[400,150,26],[360,80,32]].forEach(f=>{ctx.beginPath();ctx.arc(f[0],f[1],f[2],0,Math.PI*2);ctx.fill();});
            ctx.fillStyle='rgba(100,220,100,0.2)';
            for(let i=0;i<50;i++){const tx=170+Math.random()*300,ty=70+Math.random()*240;if(desert&&inPoly(tx,ty,desert.path))continue;ctx.beginPath();ctx.arc(tx,ty,1.5+Math.random()*3,0,Math.PI*2);ctx.fill();}

            // Grassland patches (orc area)
            ctx.fillStyle='rgba(170,190,70,0.1)';
            [[500,600,52],[600,700,62],[750,650,48],[550,800,58],[650,850,42],[450,700,48],[700,750,40],[800,800,34]].forEach(gp=>{ctx.beginPath();ctx.arc(gp[0],gp[1],gp[2],0,Math.PI*2);ctx.fill();});

            // Mountains (dwarf area)
            ctx.strokeStyle='rgba(110,110,110,0.55)';ctx.lineWidth=2;
            [[[520,270],[560,250],[600,260],[640,280],[600,300]],[[550,310],[590,290],[640,300],[670,320],[630,340]],[[580,350],[630,330],[670,340],[690,370],[650,390]]].forEach(m=>{
                ctx.beginPath();ctx.moveTo(m[0][0],m[0][1]);for(let i=1;i<m.length;i++)ctx.lineTo(m[i][0],m[i][1]);ctx.stroke();
                m.forEach((p,idx)=>{if(idx%2===0){ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]-5,p[1]-12);ctx.lineTo(p[0]+5,p[1]-12);ctx.closePath();ctx.fillStyle='rgba(140,140,140,0.45)';ctx.fill();}});
            });

            // Rivers
            ctx.strokeStyle='rgba(80,150,220,0.55)';ctx.lineWidth=2.5;
            [[[380,480],[480,520],[580,540],[680,570],[780,600],[880,620]],[[680,250],[730,300],[780,350],[830,400],[880,450],[930,500]],[[180,220],[230,260],[280,290],[330,330],[380,360]]].forEach(r=>{
                ctx.beginPath();ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++){const cpx=(r[i-1][0]+r[i][0])/2+(i%2===0?15:-15),cpy=(r[i-1][1]+r[i][1])/2;ctx.quadraticCurveTo(cpx,cpy,r[i][0],r[i][1]);}ctx.stroke();
            });

            // Coast glow
            ctx.strokeStyle='rgba(100,180,220,0.2)';ctx.lineWidth=4;
            D.territories.forEach(t=>{ctx.beginPath();ctx.moveTo(t.path[0][0],t.path[0][1]);for(let i=1;i<t.path.length;i++)ctx.lineTo(t.path[i][0],t.path[i][1]);ctx.closePath();ctx.stroke();});

            // Grudge lines
            ctx.setLineDash([5,4]);
            D.grudges.forEach(gr=>{
                const fc=D.cities.find(c=>c.name===gr.from),tc=D.cities.find(c=>c.name===gr.to);
                if(fc&&tc){
                    ctx.beginPath();ctx.moveTo(fc.x,fc.y);ctx.lineTo(tc.x,tc.y);ctx.strokeStyle=gr.color;ctx.lineWidth=1.5;ctx.globalAlpha=0.45;ctx.stroke();ctx.globalAlpha=1;
                    const mx=(fc.x+tc.x)/2,my=(fc.y+tc.y)/2;ctx.fillStyle='rgba(0,0,0,0.55)';ctx.font='10px sans-serif';const tl=ctx.measureText(gr.label).width;ctx.fillRect(mx-tl/2-2,my-7,tl+4,14);ctx.fillStyle=gr.color;ctx.textAlign='center';ctx.fillText(gr.label,mx,my+3);
                }
            });ctx.setLineDash([]);

            // Fort-to-city lines
            D.forts.forEach(f=>{
                const tgt=D.cities.find(c=>c.name===f.target);
                if(tgt){ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(tgt.x,tgt.y);ctx.strokeStyle='rgba(160,150,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);}
            });

            // Cities
            D.cities.forEach(c=>{
                const isSel=sel&&sel.name===c.name;const sz=c.type==='capital'?9:(c.type==='major'?6:3.5);
                if(isSel){ctx.beginPath();ctx.arc(c.x,c.y,sz+7,0,Math.PI*2);ctx.fillStyle='rgba(233,69,96,0.25)';ctx.fill();}
                ctx.beginPath();
                if(c.type==='capital'){for(let i=0;i<5;i++){const ang=(Math.PI*2*i/5)-Math.PI/2,rr=i%2===0?sz:sz/2;const px=c.x+Math.cos(ang)*rr,py=c.y+Math.sin(ang)*rr;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();}
                else if(c.type==='major'){ctx.moveTo(c.x,c.y-sz);ctx.lineTo(c.x+sz,c.y);ctx.lineTo(c.x,c.y+sz);ctx.lineTo(c.x-sz,c.y);ctx.closePath();}
                else if(c.type==='church'){ctx.moveTo(c.x,c.y-sz);ctx.lineTo(c.x+sz*0.7,c.y+sz);ctx.lineTo(c.x-sz*0.7,c.y+sz);ctx.closePath();}
                else{ctx.arc(c.x,c.y,sz,0,Math.PI*2);}
                ctx.fillStyle=RACE_COL[c.race]||'#fff';ctx.fill();ctx.strokeStyle=isSel?'#e94560':'#fff';ctx.lineWidth=isSel?2.5:1.2;ctx.stroke();
                ctx.fillStyle='rgba(0,0,0,0.5)';ctx.font='11px sans-serif';const tl2=ctx.measureText(c.name).width;ctx.fillRect(c.x-tl2/2-2,c.y+sz+3,tl2+4,14);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(c.name,c.x,c.y+sz+14);
            });

            // Forts
            D.forts.forEach(f=>{
                const isSel=sel&&sel.name===f.name;const sz=11;
                ctx.beginPath();ctx.moveTo(f.x,f.y-sz);ctx.lineTo(f.x+sz*0.85,f.y+sz*0.65);ctx.lineTo(f.x-sz*0.85,f.y+sz*0.65);ctx.closePath();
                ctx.fillStyle=isSel?'#e94560':'#a29bfe';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
                ctx.fillStyle='rgba(0,0,0,0.5)';ctx.font='10px sans-serif';const tl3=ctx.measureText(f.name).width;ctx.fillRect(f.x-tl3/2-2,f.y-sz-16,tl3+4,14);ctx.fillStyle='#a29bfe';ctx.textAlign='center';ctx.fillText(f.name,f.x,f.y-sz-5);
            });

            ctx.restore();
        }

        function getEntity(mx,my){
            const w=s2w(mx,my);
            for(let ci=D.cities.length-1;ci>=0;ci--){const c=D.cities[ci];const s=c.type==='capital'?13:(c.type==='major'?9:6);const dx=w.x-c.x,dy=w.y-c.y;if(Math.sqrt(dx*dx+dy*dy)<s)return{type:'city',data:c};}
            for(let fi=D.forts.length-1;fi>=0;fi--){const f=D.forts[fi];const dx=w.x-f.x,dy=w.y-f.y;if(Math.sqrt(dx*dx+dy*dy)<13)return{type:'fort',data:f};}
            for(let ti=D.territories.length-1;ti>=0;ti--){const t=D.territories[ti];if(inPoly(w.x,w.y,t.path))return{type:'territory',data:t};}
            return null;
        }

        function showInfo(entity){
            const box=document.getElementById(infoId);
            if(!entity){box.innerHTML='<span style="color:var(--text-dim)">点击地图上的标记查看详细信息...</span>';return;}
            const d=entity.data;
            let html='';
            if(entity.type==='city'){
                const tn={capital:'主城',major:'副城',town:'城镇',church:'教廷圣地'};
                const rn={human:'人类',dwarf:'矮人',elf:'精灵',orc:'兽人',church:'教廷',frontier:'边缘地带'};
                html='<h3 style="color:var(--accent);margin:0 0 6px 0;font-size:1rem;">'+d.name+'</h3>';
                html+='<p style="margin:2px 0"><strong>类型:</strong> '+(tn[d.type]||d.type)+' | <strong>种族:</strong> '+(rn[d.race]||d.race)+'</p>';
                html+='<p style="margin:2px 0"><strong>人口:</strong> '+d.pop+'</p>';
                html+='<p style="margin:2px 0;color:var(--text-dim)">'+d.feature+'</p>';
                if(d.type==='capital'){const ft=D.forts.find(f=>f.target===d.name);if(ft)html+='<p style="margin:4px 0;color:#a29bfe"><strong>监视要塞:</strong> '+ft.name+'（'+ft.direction+'）</p>';}
            }else if(entity.type==='fort'){
                html='<h3 style="color:#a29bfe;margin:0 0 6px 0;font-size:1rem;">'+d.name+'</h3>';
                html+='<p style="margin:2px 0"><strong>镇守:</strong> '+d.king+'</p>';
                html+='<p style="margin:2px 0"><strong>驻军:</strong> '+d.garrison+'</p>';
                html+='<p style="margin:2px 0"><strong>监视目标:</strong> '+d.target+'（'+d.direction+'）</p>';
                html+='<p style="margin:2px 0;color:var(--text-dim)">'+d.desc+'</p>';
            }else if(entity.type==='territory'){
                html='<h3 style="color:var(--accent);margin:0 0 6px 0;font-size:1rem;">'+d.name+'</h3>';
                html+='<p style="margin:2px 0"><strong>主导种族:</strong> '+d.race+'</p>';
                html+='<p style="margin:2px 0"><strong>人口:</strong> '+d.pop+'（'+d.ratio+'）</p>';
                html+='<p style="margin:2px 0;color:var(--text-dim)">'+d.desc+'</p>';
            }
            box.innerHTML=html;
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
                    sel=ent?ent.data:null;showInfo(ent);draw();
                }
            }drag=false;
        });
        cvs.addEventListener('mouseleave',()=>{drag=false;});
        cvs.addEventListener('wheel',e=>{
            e.preventDefault();
            const rect=cvs.getBoundingClientRect();
            const mx=e.clientX-rect.left,my=e.clientY-rect.top;
            const zf=e.deltaY<0?1.12:0.88;
            const ns=Math.max(0.3,Math.min(5,sc*zf));
            ox=mx-(mx-ox)*(ns/sc);oy=my-(my-oy)*(ns/sc);sc=ns;draw();
        });

        draw();
        ui.setButtons('<button class="back-btn-top" onclick="G.setState(\'SHOP\')">← 返回</button>');
        } catch (err) {
            ui.appendText('\n[地图渲染错误] ' + err.name + ': ' + err.message, 'danger');
            console.error('WorldMapUI render error:', err);
            ui.setButtons('<button class="back-btn-top" onclick="G.setState(\'SHOP\')">← 返回</button>');
        }
    }
};
