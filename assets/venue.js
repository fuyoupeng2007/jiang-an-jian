function initVenue(id, go, setPoint, state, persist) {
  const $ = name => document.getElementById(name);
  const place=places[id], event=id==="packing"||id==="zhimin";
  const detailed=WuhanArchitecture.detailed(id);
  const name=id==="packing"?"平和打包厂":id==="zhimin"?"智民里":place.n;
  const host=$("modelHost");document.body.dataset.model=id;
  const descriptions={
    tower:"沿每层的回廊转一圈，看看金瓦挑檐下面的朱柱与斗拱。拉开五层，点一层读一段楼里的故事。",
    red:"先看红墙的圆窗，再转到侧面。近处的墙、远处的蛇山和楼影会慢慢错开。这里取的是司门口黄鹤楼站 B 出口的圆窗景，模型压缩了墙与楼之间的距离。",
    custom:"沿着临江一面看柱廊，再绕着钟楼转一圈，找找四面钟盘。俯看时，钟楼和下方横向展开的办公楼就容易分辨了。",
    qc:"从江面一侧看，晴川阁的上下两层廊檐清晰可见。稍微抬高视角，可以顺着岸边石阶，找到通往阁前平台的位置。",
    guiyuan:"从山门向里看，黄墙只露出院落的一角。转到上方，山门、两侧殿宇和后方正殿才会一同出现。",
    baotong:"从武珞路一侧看，山门在前，洪山宝塔在后。把模型转到侧面，沿着台阶往上看，再数一数露出树冠的七层塔檐。",
    whu:"四根立柱围出三道门。先读正面的「国立武汉大学」，再把牌坊转过半圈，背面是「文法理工农医」。从上方的地点菜单还可以去看老图书馆、百步梯和凌波门。",
    hust:"沿林荫中轴看过去，南一楼的中段较高，两翼向两侧展开。转到斜侧面，能看清楼前雕像、步道与主楼之间的位置关系。",
    hustgate:"从校名墙正面开始，转到侧边看大门敞开的通行空间。想继续往校园里逛，可以切换到南一楼和醉晚亭。",
    gude:"圆通宝殿的玫瑰花窗在立面上，九座塔在屋顶。先从正面看花窗，再切到俯视，试着把九个塔顶都找出来。",
    packing:"先绕到临街一侧，观察红砖立面上连续的窗洞，再转到侧面看连廊和室外楼梯。12 月 18、19 日的现场接单观赛安排在这里，入场办法以官方通知为准。",
    zhimin:"红瓦的 A1、灰瓦的 A3 和转角的 A5，围出街边的公共空间。转到背面，可以看到 A2 与前排建筑之间的巷道。开幕活动设在智民里。"
  };
  const looks={
    red:["圆窗望楼","墙后蛇山"],custom:["钟楼正面","临江侧翼"],qc:["江面望阁","背面回廊"],
    guiyuan:["从山门看","绕到殿后"],baotong:["山门望塔","塔后看山门"],whu:["读正面校名","读背面题字"],
    hust:["沿中轴看","看南一楼背面"],hustgate:["校门正面","从校内看"],gude:["看玫瑰花窗","绕到殿后"]
  };
  const sourceUrls={
    tower:["黄鹤楼导览资料","https://www.wuchang.gov.cn/zjwc/wcly/you/zmjd/202005/t20200507_1241541.html"],
    red:["红墙圆窗","https://news.cjn.cn/zjzycsqpd/wh_20023/202606/t5300396.htm"],
    optic:["光谷广场与星河","https://www.wuhan.gov.cn/sy/whyw/202305/t20230516_2200771.shtml"],
    qc:["晴川阁","https://wlj.wuhan.gov.cn/zfxxgk/fdzdgknr/jgjj/zsdw/202008/t20200827_1437251.shtml"],
    whu:["武大牌坊","https://www.wuhan.gov.cn/sy/kwh/202404/t20240414_2388332.shtml"],
    hust:["华科校园","https://ses.hust.edu.cn/info/1027/1059.htm"],
    gude:["古德寺圆通宝殿","https://www.whda.org.cn/dawh/whjy/202512/t20251223_2699330.shtml"],
    museum:["湖北省博物馆","https://www.wuchang.gov.cn/zjwc/wcly/yu/bwg/202005/t20200507_1241999.html"],
    baotong:["武汉宗教场所","https://english.wuhan.gov.cn/religious4affairs/public4religious4venues/202110/t20211026_1819640.shtml"],
    guiyuan:["武汉宗教场所","https://english.wuhan.gov.cn/religious4affairs/public4religious4venues/202110/t20211026_1819640.shtml"]
  };
  $("venueName").textContent=name;document.title=name+" · 武汉立体导览";
  $("venueRole").textContent=event?(id==="packing"?"青岛路 · 现场接单观赛点":"胜利街 · SAIG 主会场"):place.t+"  /  "+(detailed?"地标微缩":"街区沙盘");
  $("venueStory").textContent=descriptions[id]||place.s;
  const source=$("venueSource");
  source.textContent=id==="zhimin"?"根据赛事资料包智民里 A1–A5 设计图制作。":detailed?"外观导览模型，比例和细部经过简化。":"街区按地图中的道路与轮廓建模。缺少记录的楼高和植被为示意。";
  const plan=typeof buildingPlans!=="undefined"&&buildingPlans[id];
  if(plan)source.textContent="按建筑地图轮廓制作。楼高、立面与屋顶部件为导览示意。";
  const study=studyGuide[id];
  if(study)source.textContent="街景按地点资料选取代表性景物。景物间距、季节和招牌比例为导览取景。";
  const ref=sourceUrls[id]||(plan&&["建筑轮廓 · © OpenStreetMap contributors","https://www.openstreetmap.org/way/"+plan.way])||(!detailed&&["© OpenStreetMap contributors","https://www.openstreetmap.org/copyright"]);
  if(ref){const a=document.createElement("a");a.href=ref[1];a.textContent=ref[0];a.target="_blank";a.rel="noopener";source.append(" ",a);}
  const citation=studyReferences[id];
  if(citation&&citation[1]!==ref?.[1]){
    const link=document.createElement("a");link.href=citation[1];link.textContent="查看地点资料";link.title=citation[0];link.target="_blank";link.rel="noopener";source.append(" ",link);
  }
  const select=$("modelSelect");
  const groups=new Map();
  for(const [k,p] of Object.entries(places)){
    if(!p.art)continue;
    if(!groups.has(p.t)){const group=document.createElement("optgroup");group.label=p.t;select.append(group);groups.set(p.t,group);}
    groups.get(p.t).append(new Option(p.n,k));
  }
  select.value=id;select.onchange=()=>go("venue",select.value);
  $("venueSwitch").hidden=!event;$("venueReception").hidden=!event;
  if(!event){document.querySelector('nav [data-nav=reception]').removeAttribute("aria-current");document.querySelector('nav [data-nav=index]').setAttribute("aria-current","page");}
  let controls;
  function fallback(){
    host.replaceChildren();$("angles").replaceChildren();
    let angle=0, scale=1, closeUp=false;
    const frame=document.createElement("div");frame.className="modelTurnFrame";
    const img=document.createElement("div");img.setAttribute("role","img");img.setAttribute("aria-label",name+"的四面模型");img.className="modelTurn";
    img.style.backgroundImage='url("assets/model-turns/'+id+'.webp")';frame.append(img);host.append(frame);
    function draw(){img.style.backgroundImage='url("assets/'+(closeUp?'study-details/':'model-turns/')+id+'.webp")';img.style.backgroundSize=closeUp?"contain":"";img.style.backgroundPosition=closeUp?"center":(angle*100/3)+"% center";frame.style.transform="translate(-50%,-50%) scale("+scale+")";}
    function rotate(d){closeUp=false;angle=(angle+4+(d<0?-1:1))%4;draw();}
    let start;host.onpointerdown=e=>{start=e.clientX;host.setPointerCapture(e.pointerId);};
    host.onpointerup=e=>{if(Math.abs(e.clientX-start)>22)rotate(start-e.clientX);};
    controls={orbit:rotate,magnify(f){scale=Math.max(.75,Math.min(2.2,scale*f));draw();},reset(){closeUp=false;angle=0;scale=1;draw();}};
    if(study){const button=document.createElement("button");button.textContent=study.label;button.onclick=()=>{closeUp=true;scale=1;draw();};$("angles").append(button);}
    $("modelHelp").textContent="当前设备使用四面模型图。左右滑动换面，＋ 可放大。";draw();
  }
  try{
    controls=WuhanArchitecture.view(host,id,{interactive:true,labels:event});
    host.querySelector("canvas").addEventListener("webglcontextlost",fallback,{once:true});
    const pair=looks[id]||["看正面","看背面"];
    const views=[[pair[1],Math.PI,.24],["俯看全景",.35,1.13]];
    if(study){const b=document.createElement("button");b.type="button";b.textContent=study.label;b.onclick=()=>controls.focus(study.point);$("angles").append(b);}
    else views.unshift([pair[0],0,id==="red"?.015:.16]);
    views.forEach(([title,yaw,pitch])=>{
      const b=document.createElement("button");b.type="button";b.textContent=title;
      b.onclick=()=>controls.setAngle(yaw,pitch);$("angles").append(b);
    });
    $("modelHelp").textContent="拖动环视，上下拖动改变高度。双指或滚轮可缩放。";
  }catch(e){console.warn("模型切换至四面视图",e.message);fallback();}
  $("rotateLeft").onclick=()=>controls.orbit(-Math.PI/6,0);
  $("rotateRight").onclick=()=>controls.orbit(Math.PI/6,0);
  $("zoomIn").onclick=()=>controls.magnify(1.2);$("zoomOut").onclick=()=>controls.magnify(1/1.2);
  $("resetView").onclick=()=>controls.reset();
  host.onkeydown=e=>{
    const action={ArrowLeft:"rotateLeft",ArrowRight:"rotateRight","+":"zoomIn","=":"zoomIn","-":"zoomOut",Home:"resetView"}[e.key];
    if(action){e.preventDefault();$(action).click();}
    if((e.key==="ArrowUp"||e.key==="ArrowDown")&&host.querySelector("canvas")){e.preventDefault();controls.orbit(0,e.key==="ArrowUp"?.12:-.12);}
  };
  for(const b of document.querySelectorAll("[data-venue]")){
    b.setAttribute("aria-pressed",b.dataset.venue===id);b.onclick=()=>{if(b.dataset.venue!==id)go("venue",b.dataset.venue);};
  }
  if(id==="tower") initTowerLab(host,()=>controls);
  const city=citySave(state);const stamp=$("checkIn");
  function paintStamp(){stamp.textContent=city.stamps[id]?"已打卡 · 去摆放":"打卡收藏";}
  stamp.onclick=()=>{
    if(city.stamps[id]){go("city",id);return;}
    city.stamps[id]=Date.now();document.dispatchEvent(new CustomEvent("host-cue",{detail:"记下了！"+name+"已经收进你的打卡册。"}));saveCity(state,persist);paintStamp();stamp.setAttribute("aria-live","polite");
  };
  paintStamp();$("visitCity").onclick=()=>go("city",city.stamps[id]?id:undefined);
  $("seePostcard").onclick=()=>go("postcard",id);
  $("venueRoute").onclick=()=>{setPoint(id,"end");go("index");};
  $("venueReception").onclick=()=>go("reception","saig","1");
}
