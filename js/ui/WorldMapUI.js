// ========== World Map UI Module ==========
window.WorldMapUI = {
    render: function(game) {
        const ui = window.UI;
        try {
        ui.hideTrainStatus();
        ui.clearText();
        if (ui.textArea) ui.textArea.style.display = 'block';
        ui.appendText('【世界地图】\n', 'accent');
        ui.appendText('点击城市、要塞或势力区域查看详情。鼠标滚轮缩放，拖拽平移。');
        ui.appendDivider();

        const mapId = 'wm-cvs-' + Date.now();
        const infoId = 'wm-info-' + Date.now();
        ui.textArea.innerHTML += '<div style="position:relative;width:100%;height:520px;overflow:hidden;background:#0b1220;border-radius:8px;border:1px solid var(--border);" id="' + mapId + '-w"></div>';
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
                if(isSel){ctx.beginPath();ctx.arc(c.x,c.y,sz+8,0,Math.PI*2);ctx.fillStyle='rgba(233,69,96,0.3)';ctx.fill();}
                ctx.beginPath();
                if(c.type==='capital'){for(let i=0;i<5;i++){const ang=(Math.PI*2*i/5)-Math.PI/2,rr=i%2===0?sz:sz/2;const px=c.x+Math.cos(ang)*rr,py=c.y+Math.sin(ang)*rr;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();}
                else if(c.type==='major'){ctx.moveTo(c.x,c.y-sz);ctx.lineTo(c.x+sz,c.y);ctx.lineTo(c.x,c.y+sz);ctx.lineTo(c.x-sz,c.y);ctx.closePath();}
                else if(c.type==='church'){ctx.moveTo(c.x,c.y-sz);ctx.lineTo(c.x+sz*0.7,c.y+sz);ctx.lineTo(c.x-sz*0.7,c.y+sz);ctx.closePath();}
                else{ctx.arc(c.x,c.y,sz,0,Math.PI*2);}
                ctx.fillStyle=RACE_COL[c.race]||'#fff';ctx.fill();ctx.strokeStyle=isSel?'#e94560':'rgba(255,255,255,0.9)';ctx.lineWidth=isSel?2.2:1.2;ctx.stroke();
                // City label
                ctx.fillStyle='rgba(0,0,0,0.55)';ctx.font='bold 11px sans-serif';const tl2=ctx.measureText(c.name).width;ctx.fillRect(c.x-tl2/2-3,c.y+sz+4,tl2+6,16);
                ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c.name,c.x,c.y+sz+12);
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
            const zf=e.deltaY<0?1.15:0.87;
            const ns=Math.max(0.2,Math.min(4,sc*zf));
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
