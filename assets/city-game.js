const townKey="jiang-an-model-town-v1";
const landscape={"dawn-tree":"水杉","cherry-tree":"樱花树","stone-path":"石板步道","river-lamp":"江边路灯"};
const plotCols=9,plotRows=9;
const matchVenue={k:"packing",c:4,r:4,a:0};
function isPlaza(c,r){return c===matchVenue.c && r===matchVenue.r;}
function riverTile(c,r){return r===plotRows-1;}
// Keep the event square fixed. Migrate older boards without moving surrounding lots.
function aroundPlaza(items){
  const movable=items.filter(o=>o.k!==matchVenue.k);
  const displaced=movable.find(o=>isPlaza(o.c,o.r));
  if(!displaced)return movable;
  const candidates=[];
  for(let r=0;r<plotRows;r++)for(let c=0;c<plotCols;c++){
    if(isPlaza(c,r)||movable.some(o=>o.c===c&&o.r===r))continue;
    const bridge=["bridge","gutian","parrot","yangsi"].includes(displaced.k);
    if(!riverTile(c,r)||bridge)candidates.push({c,r,rank:Math.abs(c-matchVenue.c)+Math.abs(r-matchVenue.r)+(bridge&&!riverTile(c,r)?20:0)});
  }
  const next=candidates.sort((a,b)=>a.rank-b.rank)[0];
  if(next){displaced.c=next.c;displaced.r=next.r;return movable;}
  return movable.filter(o=>o!==displaced);
}
function citySave(state){
  let archived;try{archived=JSON.parse(localStorage.getItem(townKey));}catch{}
  const route=state.city||{}, cache=archived||{};
  const latest=(Number(cache.revision)||0)>(Number(route.revision)||0)?cache:route;
  const stamps=Object.assign(Object.create(null),cache.stamps,route.stamps);
  for(const k of Object.keys(stamps))if(!places[k]?.art||!Number.isFinite(stamps[k]))delete stamps[k];
  const initial=[{k:"dawn-tree",c:0,r:1,a:0},{k:"cherry-tree",c:5,r:5,a:0},{k:"stone-path",c:4,r:5,a:1}];
  const seen=new Set();
  function validLayout(raw,trial){seen.clear();return aroundPlaza(raw.filter(o=>{
    if(!o||!(Object.hasOwn(landscape,o.k)||(trial?places[o.k]?.art:stamps[o.k]))||!Number.isInteger(o.c)||o.c<0||o.c>=plotCols||!Number.isInteger(o.r)||o.r<0||o.r>=plotRows)return false;
    const key=o.c+","+o.r;if(seen.has(key))return false;seen.add(key);return true;
  }).map(o=>({k:o.k,c:o.c,r:o.r,a:((Number(o.a)||0)%4+4)%4})));
  }
  const items=validLayout(Array.isArray(latest.items)?latest.items:initial,false);
  const practice=Array.isArray(latest.practice)?validLayout(latest.practice,true):null;
  state.city={stamps,items,practice,revision:Number(latest.revision)||0};return state.city;
}
function saveCity(state,persist){
  state.city.revision=Date.now();
  try{localStorage.setItem(townKey,JSON.stringify(state.city));}catch{}
  persist();
}
function initCity(state,persist,go){
  const $=id=>document.getElementById(id),canvas=$("cityBoard"),ctx=canvas.getContext("2d");
  let town=citySave(state), tab="open", tool=null, selected=null, undo=[], hover=null, press=null;
  const sheets=new Map(), cells=[], keys=Object.keys(places).filter(k=>places[k].art);
  for(let r=0;r<plotRows;r++)for(let c=0;c<plotCols;c++)cells.push({c,r});
  cells.sort((a,b)=>a.c+a.r-b.c-b.r||a.r-b.r);
  const focusId=new URLSearchParams(location.search).get("id");
  const personal=town;
  const trial=new URLSearchParams(location.search).get("leaf")==="practice";
  const favourites=["tower","opticstreet","wutong","jh","qsbank","skp","dream","whtlib","library","guishan","custom","optic","qc","baotong","guiyuan","wheel","zhimin","packing","red","whu","hust","hustgate","grain"];
  if(trial){
    const sample=[["tower",2,1],["custom",6,3],["bridge",4,8],["zhimin",3,2],["qc",2,4],["wheel",5,1],["guishan",0,4],["dawn-tree",0,1],["cherry-tree",5,5],["stone-path",4,5],["dawn-tree",4,0],["river-lamp",3,7],["oldlib",7,1],["baotong",1,5],["hustgate",6,6],["cherry-tree",7,5]];
    const ids=keys.filter(k=>iconArt[k]?.includes("landmarkModel")).sort((a,b)=>(favourites.includes(a)?favourites.indexOf(a):99)-(favourites.includes(b)?favourites.indexOf(b):99));
    town={items:personal.practice||sample.map(([k,c,r])=>({k,c,r,a:0})),stamps:Object.fromEntries(ids.map(k=>[k,1]))};
    document.querySelector(".cityHeading h1").textContent="自由试摆";
    document.querySelector(".cityTabs").hidden=true;$("switchTown").textContent="回到我的沙盘";
  }else if(focusId!==matchVenue.k && town.stamps[focusId])tool=focusId;
  $("centerVenue").onclick=()=>go("venue",matchVenue.k);
  $("switchTown").onclick=()=>go("city",undefined,trial?undefined:"practice");
  let W=0,H=0,tw=0,th=0,ox=0,oy=0,dragPos=null;
  const name=k=>landscape[k]||places[k]?.n||"";
  const bridges=new Set(["bridge","gutian","parrot","yangsi"]);
  function canPlace(k,c,r){return !isPlaza(c,r)&&(!riverTile(c,r)||bridges.has(k));}
  function stash(){undo.push(town.items.map(o=>({...o})));if(undo.length>35)undo.shift();}
  function record(){if(trial)personal.practice=town.items;saveCity(state,persist);updatePanel();draw();}
  function msg(t){$("cityGuide").textContent=t;}
  function center(c,r){return [ox+(c-r)*tw/2,oy+(c+r)*th/2];}
  function polygon(points,fill,stroke){
    ctx.beginPath();for(const [i,[x,y]] of points.entries())i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function line(x1,y1,x2,y2,col,width=1){ctx.strokeStyle=col;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.lineWidth=1;}
  function oval(x,y,rx,ry,col){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function tile(item){
    const {c,r}=item,[x,y]=center(c,r),w=tw/2,h=th/2,thick=Math.max(6,tw*.09);
    const wet=riverTile(c,r);
    if(c===plotCols-1)polygon([[x+w,y],[x,y+h],[x,y+h+thick],[x+w,y+thick]],wet?"#769b95":"#aea183");
    if(r===plotRows-1)polygon([[x-w,y],[x,y+h],[x,y+h+thick],[x-w,y+thick]],wet?"#8baea9":"#c0b399");
    const hot=hover&&hover.c===c&&hover.r===r;
    const chosen=selected&&selected.c===c&&selected.r===r;
    const paint=wet?["#89b7ba","#8fbdbe"][(r+c)%2]:["#d9dfbc","#dfe2c4","#d4dcba"][(c*5+r*3)%3];
    const pts=[[x,y-h],[x+w,y],[x,y+h],[x-w,y]];
    polygon(pts,hot?(tool&&!canPlace(tool,c,r)?"#dfb5a1":"#f1d7a5"):isPlaza(c,r)?"#98bfc9":paint,wet?"#93bdbd":"#c0c9a8");
    if(wet){
      for(let j=0;j<3;j++){const dx=(j-1)*w*.34;line(x+dx-w*.09,y+(j%2?-.14:.14)*h,x+dx+w*.09,y+(j%2?-.14:.14)*h,"#b9d6cc",1.4);}
    }else{
      const n=(c*7+r*13)%5;
      for(let j=0;j<n;j++){const xx=x+Math.sin(c+r+j*3)*w*.43,yy=y+Math.cos(c+r+j*2)*h*.38;line(xx,yy,xx+1.6,yy-1.4,"#b0bf98");}
    }
    if(r===plotRows-2){
      polygon([[x,y+h],[x-w,y],[x-w*.85,y-h*.15],[x+w*.15,y+h*.85]],"#c4ad8e");
      line(x-w,y-2,x,y+h-2,"#8b8270",1.5);
      line(x-w*.5,y+h*.5-2,x-w*.5,y+h*.5-5,"#8b8270",1.2);
    }
    if((c===matchVenue.c||r===matchVenue.r)&&!wet&&!isPlaza(c,r)){
      const sign=c===matchVenue.c?-1:1;
      polygon([[x-sign*w*.59,y-h*.59],[x-sign*w*.43,y-h*.69],[x+sign*w*.59,y+h*.59],[x+sign*w*.43,y+h*.69]],"#cbbda4");
    }
    if(chosen||hot){ctx.lineWidth=2;polygon(pts,null,chosen?"#82603d":"#ad8551");ctx.lineWidth=1;}
  }
  function landscapeAt(k,x,y,s,angle){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    if(k==="stone-path"){
      for(let i=-2;i<=2;i++){const xx=i*4,yy=i*(angle%2?2:-2);polygon([[xx-5,yy],[xx,yy-2.6],[xx+5,yy],[xx,yy+2.6]],"#bab5a1","#dcd6c1");}
    }else if(k==="river-lamp"){
      oval(0,0,5,2,"#aeb398");line(0,0,0,-20,"#4e645d",1.6);line(0,-19,6,-20,"#4e645d",1.4);oval(6,-18,2.8,2.4,"#f7cf72");
    }else{
      for(const i of [-1,0,1]){
        const xx=i*6,dy=(i+1)%2*3,k1=k==="dawn-tree";
        oval(xx+2,dy,5,2,"#a4b293");line(xx,dy,xx,dy-13,"#7d7158",1.9);
        if(k1){for(let h=0;h<3;h++)polygon([[xx,dy-24-h*2],[xx-5.8+h,dy-6-h*4],[xx+5.8-h,dy-6-h*4]],["#6a886c","#749675","#8fa481"][h]);}
        else{oval(xx,dy-14,5.6,5.5,"#c99697");oval(xx-1.1,dy-16,5.1,4.6,"#e6b4b1");oval(xx-2.4,dy-17.6,2.5,2,"#ebc7ba");}
      }
    }ctx.restore();
  }
  function sheet(k){if(!sheets.has(k)){const img=new Image();sheets.set(k,img);img.onload=draw;img.src="assets/model-turns/"+k+".webp";}return sheets.get(k);}
  function figure(it,at){
    const [x,y]=at||center(it.c,it.r);
    if(Object.hasOwn(landscape,it.k)){landscapeAt(it.k,x,y,tw/45,it.a);return;}
    const im=sheet(it.k);if(!im.naturalWidth)return;
    const w=tw*(it.k===matchVenue.k?1.10:.96),h=w*240/288;
    // Four uniformly framed renders sit on one transparent sheet.
    ctx.drawImage(im,it.a*288,0,288,240,x-w/2,y-h+th*.23,w,h);
  }
  function draw(){
    if(!W)return;
    ctx.clearRect(0,0,W,H);
    const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,"#f3f0df");gradient.addColorStop(1,"#dfe7d6");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
    const sh=Math.max(6,tw*.10);
    polygon([[ox,oy-th/2+sh],[ox+tw*4.5,oy+th*4+sh],[ox,oy+th*8.5+sh*1.6],[ox-tw*4.5,oy+th*4+sh]],"#bec9b3");
    for(const cell of cells)tile(cell);
    const sorted=[...town.items,matchVenue].sort((a,b)=>(a.c+a.r)-(b.c+b.r));
    for(const o of sorted)if(!dragPos||press?.item!==o)figure(o);
    const [cx,cy]=center(matchVenue.c,matchVenue.r);ctx.save();ctx.font="bold 12px Microsoft YaHei, sans-serif";ctx.textAlign="center";
    const title="平和打包厂 · 赛场",labelWidth=ctx.measureText(title).width+14,ly=cy+th*.27;
    ctx.fillStyle="#234f63";ctx.beginPath();ctx.roundRect(cx-labelWidth/2,ly-9,labelWidth,19,8);ctx.fill();ctx.fillStyle="#fff8e8";ctx.fillText(title,cx,ly+5);ctx.restore();
    if(dragPos&&press?.item){ctx.globalAlpha=.83;figure(press.item,dragPos);ctx.globalAlpha=1;}
  }
  function resize(){
    W=canvas.clientWidth;H=canvas.clientHeight;if(!W||!H)return;const d=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);
    tw=Math.min((W-16)/plotCols,(H-44)/4.8);th=tw*.50;ox=W/2;oy=(H-th*(plotRows-1))/2+tw*.13;draw();
  }
  function grid(x,y){
    const dx=(x-ox)/tw,dy=(y-oy)/th,c=Math.round(dx+dy),r=Math.round(dy-dx);
    return c>=0&&r>=0&&c<plotCols&&r<plotRows?{c,r}:null;
  }
  const find=(c,r)=>town.items.find(o=>o.c===c&&o.r===r);
  function onCell(pos,item){
    if(!pos){msg("选一块沙盘里的地。");return;}
    const {c,r}=pos;
    if(isPlaza(c,r)){msg(tool||item?"中央是赛事广场，请选旁边的空地。":"平和打包厂是现场接单观赛点。点「看中心场馆」可走进模型。");return;}
    if(item){
      if(!canPlace(item.k,c,r)||find(c,r)&&find(c,r)!==item){msg("这块地放不下，换一块空地试试。");return;}
      if(c!==item.c||r!==item.r){stash();item.c=c;item.r=r;record();}
      selected=item;tool=null;msg("已选中"+name(item.k)+"。拖到空地可移动。");
    }else if(find(c,r)){
      selected=find(c,r);tool=null;msg("已选中"+name(selected.k)+"。可以拖动、转向或收起。");
    }else if(tool){
      if(!canPlace(tool,c,r)){msg("这里是江面，可以在这里放桥。");return;}
      stash();selected={k:tool,c,r,a:0};town.items.push(selected);msg("已放置"+name(tool)+"。拖动可挪位。");tool=null;record();
    }else if(selected){
      onCell(pos,selected);return;
    }else msg("先在模型匣选一件，再点空地放下。");
    updatePanel();draw();
  }
  function xy(e){const rect=canvas.getBoundingClientRect();return [e.clientX-rect.left,e.clientY-rect.top];}
  function hit(x,y){
    const base=grid(x,y);if(base&&isPlaza(base.c,base.r))return null;const occupied=base&&find(base.c,base.r);if(occupied)return occupied;
    const ordered=town.items.slice().sort((a,b)=>b.c+b.r-a.c-a.r);
    return ordered.find(o=>{const [cx,cy]=center(o.c,o.r),w=Object.hasOwn(landscape,o.k)?tw*.55:tw*.70;
      return Math.abs(x-cx)<w*.36 && y<cy && y>cy-w*.65;});
  }
  canvas.onpointerdown=e=>{const [x,y]=xy(e);const item=tool?null:hit(x,y);press={x,y,item};canvas.setPointerCapture(e.pointerId);canvas.focus();};
  canvas.onpointermove=e=>{const [x,y]=xy(e);hover=grid(x,y);if(press?.item&&Math.hypot(x-press.x,y-press.y)>5)dragPos=[x,y];draw();};
  canvas.onpointerleave=()=>{if(!press){hover=null;draw();}};
  canvas.onpointercancel=()=>{press=null;dragPos=null;draw();};
  canvas.onpointerup=e=>{
    if(!press)return;const [x,y]=xy(e),item=press.item;
    const pos=dragPos?grid(x,y):item?{c:item.c,r:item.r}:grid(x,y);
    press=null;dragPos=null;onCell(pos,item);
  };
  canvas.onkeydown=e=>{
    const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];hover=hover||{...matchVenue};
    if(d){e.preventDefault();hover={c:Math.max(0,Math.min(plotCols-1,hover.c+d[0])),r:Math.max(0,Math.min(plotRows-1,hover.r+d[1]))};draw();}
    if(e.key==="Enter"||e.key===" "){e.preventDefault();onCell(hover);}
  };
  function updatePanel(){
    $("cityTurn").disabled=!selected;$("cityRemove").disabled=!selected;$("cityUndo").disabled=!undo.length;
    const count=Object.keys(town.stamps).length;$("stampCount").textContent=count+" / "+keys.length+" 处打卡";
    const built=new Set(town.items.filter(o=>places[o.k]).map(o=>o.k)).size;
    $("cityChallenge").textContent=count<3?"江岸夜灯  ·  "+count+" / 3":built<3?"三处地标  ·  "+built+" / 3":"三镇初成";
    $("challengeTip").textContent=count<3?"打卡三个地点，模型匣会多一盏江边路灯。":built<3?"选三座不同的地标，摆出自己的武汉天际线。":"江边路灯已解锁，可以继续扩建。";
    if(trial){
      $("stampCount").textContent=count+" 款地标";
      $("cityChallenge").textContent="自由试摆";$("challengeTip").textContent="这块沙盘单独保存。回到「建设我的武汉」可摆放自己打卡的模型。";
    }
    for(const b of $("cityPalette").children)b.setAttribute("aria-pressed",String(b.dataset.k===tool&&tab==="open"));
  }
  function palette(){
    const ids=tab==="locked"?keys.filter(k=>!town.stamps[k]):[...Object.keys(town.stamps).sort((a,b)=>town.stamps[b]-town.stamps[a]),...Object.keys(landscape).filter(k=>k!=="river-lamp"||Object.keys(town.stamps).length>=3)];
    const popular=["tower","guishan","custom","optic","qc","baotong","guiyuan","wheel","zhimin","packing","red","whu","hust"];
    if(tab==="locked")ids.sort((a,b)=>(popular.includes(a)?popular.indexOf(a):99)-(popular.includes(b)?popular.indexOf(b):99));
    const term=$("modelQuery").value.trim().toLowerCase();
    const matches=ids.filter(k=>k!==matchVenue.k).filter(k=>[name(k),places[k]?.modelGroup||"",places[k]?.aliases||""].join(" ").toLowerCase().includes(term));
    $("noModels").hidden=matches.length>0;
    $("cityPalette").replaceChildren(...matches.map(k=>{
      const b=document.createElement("button");b.type="button";b.dataset.k=k;b.title=tab==="locked"?"去"+name(k)+"的地点页":name(k);
      if(places[k]){const im=document.createElement("span");im.className="townThumb";im.style.backgroundImage='url("assets/model-turns/'+k+'.webp")';b.append(im);}
      else{const c=document.createElement("canvas");c.width=98;c.height=65;const other=c.getContext("2d");
        drawLandscapeIcon(other,k);b.append(c);}
      const span=document.createElement("span");span.textContent=name(k);b.append(span);
      b.onclick=()=>{if(tab==="locked")go("venue",k);else{selected=null;tool=k;msg("点空地放置"+name(k)+"。");updatePanel();draw();}};return b;
    }));updatePanel();
  }
  function drawLandscapeIcon(x,k){
    const centerX=49,baseY=53;x.fillStyle="#c1c7ab";x.beginPath();x.ellipse(centerX,baseY,25,6,0,0,Math.PI*2);x.fill();
    if(k==="stone-path"){for(let i=-2;i<=2;i++){x.fillStyle=i%2?"#a9a58f":"#b7b197";x.fillRect(42+i*7,43-i*3,12,6);}return;}
    if(k==="river-lamp"){x.fillStyle="#576e61";x.fillRect(47,15,3,38);x.fillRect(47,15,15,2);x.fillStyle="#e7ba67";x.fillRect(57,18,8,6);return;}
    for(const j of [-1,0,1]){const cx=centerX+j*15,cy=baseY-(j===0?6:0);x.fillStyle="#776a50";x.fillRect(cx-1,cy-20,3,20);
      if(k==="dawn-tree"){for(let i=0;i<3;i++){x.fillStyle=["#728f72","#849e7b","#98ad86"][i];x.beginPath();x.moveTo(cx,cy-39-i);x.lineTo(cx-9+i,cy-9-6*i);x.lineTo(cx+9-i,cy-9-6*i);x.fill();}}
      else{x.fillStyle="#d29f9c";x.beginPath();x.ellipse(cx,cy-23,11,10,0,0,7);x.fill();x.fillStyle="#e7b9b3";x.beginPath();x.ellipse(cx-3,cy-27,8,7,0,0,7);x.fill();}}
  }
  for(const b of document.querySelectorAll("[data-shelf]"))b.onclick=()=>{tab=b.dataset.shelf;document.querySelectorAll("[data-shelf]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));palette();};
  $("cityTurn").onclick=()=>{if(!selected)return;stash();selected.a=(selected.a+1)%4;msg(name(selected.k)+"已转向。");record();};
  $("cityRemove").onclick=()=>{if(!selected)return;stash();town.items=town.items.filter(o=>o!==selected);selected=null;tool=null;msg("模型已收起，还可以从模型匣放回。");record();};
  $("cityUndo").onclick=()=>{if(!undo.length)return;town.items=undo.pop();selected=null;tool=null;msg("已撤销上一步。");record();};
  let library,viewer=null;
  const dialog=$("townVisit"),stage=$("town3d");
  function loadLibrary(){
    if(!library)library=(async()=>{
      for(const file of ["three.min","neighbourhoods","street-model","city-models","building-plans","building-collection","street-studies","architecture"]){
        await new Promise((ok,fail)=>{const s=document.createElement("script");s.src="assets/"+file+".js";s.onload=ok;s.onerror=fail;document.head.append(s);});
      }
    })().catch(e=>{library=null;throw e;});
    return library;
  }
  $("visitTown3d").onclick=async()=>{
    dialog.showModal();stage.textContent="正在搭建立体沙盘…";
    try{
      await loadLibrary();if(!dialog.open)return;stage.replaceChildren();
      viewer=WuhanArchitecture.view(stage,"town",{town:[...town.items,matchVenue],interactive:true,shadows:false});
    }catch{stage.textContent="这台设备当前使用平面沙盘。返回后可以继续摆放和转向。";}
  };
  $("town3dLeft").onclick=()=>viewer?.orbit(-Math.PI/6,0);
  $("town3dRight").onclick=()=>viewer?.orbit(Math.PI/6,0);
  $("town3dReset").onclick=()=>viewer?.reset();
  $("closeTown3d").onclick=()=>dialog.close();
  dialog.onclose=()=>{viewer?.dispose();viewer=null;stage.replaceChildren();};
  msg(trial?"按住模型拖动位置，或从模型匣添一座地标。":tool?"点空地放置"+name(tool)+"。":"选模型放到空地，按住已摆好的物件可以拖动。");
  $("modelQuery").oninput=palette;
  palette();new ResizeObserver(resize).observe(canvas);resize();
}
