function initTowerLab(host,getViewer){
  const el=id=>document.getElementById(id);
  const stories=[
    ["一层","白云黄鹤","围着最宽的底层回廊转一圈。真正的一楼大厅里，陶瓷壁画《白云黄鹤》讲述了仙人驾鹤的传说。"],
    ["二层","楼的来历","二楼可以读到阎伯理的《黄鹤楼记》。从这一层起，外廊和层层挑出的屋檐一起勾出楼的轮廓。"],
    ["三层","诗人登楼","《人文荟萃》把历代登楼的诗人聚在一起。想象站到回廊边，崔颢诗里的晴川与汉阳树就在江的另一侧。"],
    ["四层","书画与回廊","四楼以书画为主题。单独取出这一层，看看外廊怎样绕过四面，檐角又怎样向上挑起。"],
    ["五层","江天浩瀚","数到最上层，屋顶在这里收尖。五楼的《江天浩瀚》是一组长江主题壁画，回到外廊则能远眺两江。"]
  ];
  el("floorLab").hidden=false;
  let level=-1;
  const gap=el("floorGap"),keys=el("floorKeys");
  const choices=[["全楼",-1],...stories.map((row,i)=>[row[0],i])];
  const buttons=choices.map(([label,i])=>{
    const b=document.createElement("button");b.type="button";b.textContent=label;
    b.onclick=()=>{level=i;update();};keys.append(b);return b;
  });
  function update(){
    const t=Number(gap.value)/100,viewer=getViewer();
    if(viewer.spread)viewer.spread(t,level);
    else{
      const img=host.querySelector(".modelTurn");if(img){
        const frame=level<0?"gap"+Math.round(t*4):"floor"+(level+1);
        img.style.backgroundImage='url("assets/model-turns/tower-'+frame+'.webp")';
      }
    }
    buttons.forEach((b,i)=>b.setAttribute("aria-pressed",String(i-1===level)));
    el("floorNote").textContent=level<0?(t?"五层已经分开。点层号取出一层，或拖动模型观察飞檐下方。":"拖动滑杆分开五层，点层号单独把玩。"):stories[level][1]+" · "+stories[level][2];
    if(level>=0)document.dispatchEvent(new CustomEvent("host-cue",{detail:"我们来看"+stories[level][0]+"的「"+stories[level][1]+"」。"}));
    el("toggleFloors").textContent=t>0||level>=0?"合回整楼":"展开五层";
  }
  el("toggleFloors").onclick=()=>{gap.value=Number(gap.value)>0||level>=0?0:100;level=-1;update();};
  gap.oninput=()=>{level=-1;update();};
  host.addEventListener("webglcontextlost",()=>requestAnimationFrame(update),true);
  update();
}
