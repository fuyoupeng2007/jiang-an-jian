/* Each envelope follows its mapped footprint. Dimensions above the footprint are illustrative. */
function makeBuildingCollection({T,hip,stone,dark}){
  // Height, facade courses, masonry and glazing, facade construction, roof/entrance study.
  const catalogue={
    skp:[4.2,4,"#b3b5aa","#788e8b","ribbon","clock"],
    dream:[4.1,6,"#dcc6a2","#556771","band","goldroof"],
    wuguang:[4.15,6,"#c9b49a","#687e84","band","retail"],
    yamao:[2.8,4,"#cec6b4","#668088","band","twins"],
    zhongyuan:[3.5,5,"#778e97","#4f7482","fin","screen"],
    qungu:[3.1,5,"#d5c4a1","#52676c","band","chicony"],
    guogg:[2.9,4,"#c3bfb2","#517e92","fin","offices"],
    dayang:[4.45,5,"#cbb5ad","#69696a","panel","shopfront"],
    wcwx:[3.85,4,"#bca98c","#8a958c","fin","canopy"],
    ikea:[2.45,2,"#295178","#517582","panel","yellow"],
    plaza66:[11.2,18,"#aebdc1","#577a87","curtain","crown"],
    whtlib:[2.0,3,"#d9d2bf","#738b90","window","fan"],
    library:[3.85,6,"#cbb997","#566c76","ribbon","book"],
    oldhblib:[2.5,2,"#d5c9b3","#686a67","window","pediment"],
    childlib:[4.3,5,"#c7b39a","#6b6e69","window","pilaster"],
    hustlib:[3.6,5,"#c7b7a2","#567680","window","readinghall"],
    ccnulib:[3.2,4,"#ded5bf","#556e79","window","portal"],
    cuglib:[4.4,6,"#bdae99","#6b8380","window","stair"],
    hubulib:[4.3,6,"#bfc2b7","#617a85","curtain","blade"],
    hbutlib:[3.35,5,"#d8d8cd","#63868e","band","waterfront"],
    witlib:[3.65,5,"#b6a78e","#7395a0","band","corner"],
    whuinfolib:[3.3,4,"#cbbfa4","#5d726d","window","tiled"],
    whuenglib:[3.52,4,"#cec4ac","#687971","window","stoneportal"],
    scilib:[3.15,5,"#c9bca4","#667f83","window","shade"],
    wanlin:[1.15,1,"#acaca4","#4f605e","glass","boulder"],
    opera:[3.2,3,"#bdab8b","#6d8384","curtain","opera"],
    concert:[2.85,3,"#b9ac96","#69868b","curtain","strings"],
    hanshow:[1.22,1,"#c0ac95","#6e6c66","glass","lantern"],
    industry:[.68,1,"#9c9182","#56636b","glass","suspended"],
    hbart:[3.15,2,"#cebdaf","#6b777a","panel","colonnade"],
    whmuseum:[2.9,3,"#ccbaaa","#717b7a","window","crystal"],
    yifu:[3.05,3,"#d1c4ae","#6a7d85","window","globe"],
    hbgallery:[3.55,2,"#e0ded3","#657779","panel","cutout"],
    hbtheatre:[3.25,4,"#afbab8","#61757d","band","marquee"],
    expohall:[3.3,4,"#d1cabc","#718b92","window","disc"],
    steel:[3.15,2,"#767775","#4f5b63","fin","steelbox"],
    swimmuseum:[3.0,3,"#c8b697","#738689","window","cupola"],
    songqing:[2.3,2,"#c6c4ac","#657f79","window","greenvault"],
    zall:[2.42,2,"#91a79a","#4e686e","glass","greenfold"],
    hongsport:[2.74,2,"#cbcfcc","#83929b","band","arena"],
    hustgym:[2.43,2,"#cbccbe","#667b80","window","vault"],
    youming:[2.51,2,"#c4b9a5","#5f747c","window","grandstand"]
  };
  function block(m,pts,low,high,color,factor=1){
    const outline=pts.map(([x,z])=>new T.Vector2(x*factor,-z*factor));
    const geo=new T.ExtrudeGeometry(new T.Shape(outline),{depth:high-low,bevelEnabled:false});geo.rotateX(-Math.PI/2);
    const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.78}));mesh.position.y=low;m.group.add(mesh);
  }
  function dome(m,x,y,z,rx,h,rz,col){
    const obj=new T.Mesh(new T.SphereGeometry(1,32,12,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:col}));obj.scale.set(rx,h,rz);obj.position.set(x,y,z);m.group.add(obj);
  }
  function facade(m,p,h,rows,body,glass,style,key){
    const step=h/rows;let front=null;
    for(let k=0;k<p.length;k++){
      const [ax,az]=p[k],[bx,bz]=p[(k+1)%p.length],dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);
      if(len<.18)continue;
      const a=-Math.atan2(dz,dx),x=(ax+bx)/2,z=(az+bz)/2;
      const score=(z+.35)*Math.min(len,5);if(!front||score>front.score)front={x,z,a,len,score};
      const cols=Math.max(1,Math.round(len/(style==="fin"?.55:.92)));
      for(let r=0;r<rows;r++){
        const y=.30+step*(r+.48);
        if(style==="ribbon"){
          const divisions=Math.max(2,Math.ceil(len/.44));
          const strip=[],faces=[];
          for(let j=0;j<=divisions;j++){
            const t=j/divisions,xx=ax+dx*t,zz=az+dz*t;
            const lift=Math.sin(xx*.61+zz*.20+r*.68)*step*.30;
            const half=step*(key==="skp"?.31:.20);
            strip.push([xx*1.014,y+lift-half,zz*1.014],[xx*1.020,y+lift+half,zz*1.020]);
            if(j){const n=j*2;faces.push(n-2,n-1,n,n,n-1,n+1);m.rod(strip[n-2],strip[n],.056,key==="skp"?"#8f7860":body);}
          }
          m.mesh(strip,faces,body);
        }else if(style==="band"||style==="curtain"||style==="glass"){
          m.box(x,y,z,len,.79*step,.073,glass,a);
          const trim=key==="wuguang"?"#64a7a7":body;
          m.box(x,.30+step*(r+.93),z,len+.015,key==="dream"?.16:.085,.115,trim,a);
        }else if(style==="window"){
          for(let j=0;j<cols;j++)m.box(ax+dx*(j+.5)/cols,y,az+dz*(j+.5)/cols,len/cols*.59,step*.64,.091,glass,a);
        }else if(style==="panel"){
          if(r===0)m.box(x,y,z,len*.90,step*.71,.085,glass,a);
          else if(key==="dayang"||key==="hbart"){
            for(let j=0;j<cols;j++){const t=(j+.5)/cols;m.box(ax+dx*t,y,az+dz*t,len/cols*(key==="hbart"?.29:.65),step*.52,.095,glass,a);}
          }
          if(r>0&&key==="ikea")m.box(x,y+step*.32,z,len,.047,.081,"#3e6480",a);
        }else if(style==="fin"){
          m.box(x,y-step*.29,z,len,.075,.105,body,a);
        }
      }
      if(["fin","curtain","band","glass"].includes(style)){
        for(let j=0;j<cols;j++){const t=(j+.5)/cols;m.box(ax+dx*t,.27+h*.50,az+dz*t,style==="fin"?.115:.05,h*.95,.10,body,a);}
      }
    }return front;
  }
  function landmark(m,key){
    const spec=catalogue[key],plan=buildingPlans[key],p=plan.outline,[h,rows,body,glass,style,feature]=spec;
    const xs=p.map(v=>v[0]),zs=p.map(v=>v[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
    const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
    // Centre the site on its plate, including polygons with asymmetric centroids.
    const sizeX=2*Math.max(Math.abs(x0),Math.abs(x1))+3.0,sizeZ=2*Math.max(Math.abs(z0),Math.abs(z1))+3.4;
    m.base(sizeX,sizeZ);
    const title=places[key].n;m.box(0,-.30,sizeZ/2+.02,9.1,.75,.16,"#635744");m.plaque(title,0,-.30,sizeZ/2+.111,8.95,.70,"#f9eaca","#635744");
    block(m,p,.09,.27,"#b6ae9a",1.018);block(m,p,.27,h+.27,style==="ribbon"||style==="fin"?glass:body);
    const front=facade(m,p,h,rows,body,glass,style,key),top=h+.27;
    block(m,p,top,top+.12,body,1.009);
    for(const [outline,height] of plan.parts)if(height>h+.45&&height<20)block(m,outline,h+.28,height,body);
    const box=(x,y,z,ww,hh,dd,col)=>m.box(cx+x,y,cz+z,ww,hh,dd,col);
    const canopy=(y,ww,col)=>{box(0,y,d*.45,ww,.14,1.30,col);for(const s of [-1,1])box(s*(ww/2-.22),y/2,d*.45+.49,.11,y,.12,stone);};
    const wings=(rise,col)=>{for(const s of [-1,1]){box(s*w*.28,top+rise/2,-d*.12,w*.22,rise,d*.50,col);for(let j=1;j<rise/.35;j++)box(s*w*.28,top+j*.35,-d*.12,w*.225,.055,d*.51,body);}};
    const portico=(height,roof=false)=>{
      box(0,height,d*.46,w*.49,.27,1.42,body);
      for(let i=0;i<6;i++)m.cyl(cx+w*(i/5-.5)*.43,height/2,cz+d*.46+.53,.20,height,stone);
      if(roof)hip(m,cx,height+.15,cz+d*.46,w*.51,1.52,.72,"#738575");
    };
    const risers=(n,ww)=>{for(let j=0;j<n;j++)box(0,.12+j*.057,d*.48+.85-j*.15,ww,.12+j*.106,.28,stone);};
    const vault=(col,rise)=>{
      const v=[],tri=[];for(let j=0;j<=20;j++){const t=j/20,y=top+rise*Math.sin(t*Math.PI);
        for(const x of [-1,1])v.push([cx+x*w*.47,y,cz+(t-.5)*d*.9]);if(j){const n=j*2;tri.push(n-2,n-1,n,n,n-1,n+1);}}
      m.mesh(v,tri,col);for(let i=0;i<9;i++){const x=cx+(i/8-.5)*w*.92;for(let j=1;j<=20;j++)m.rod([x,v[2*j-2][1]+.024,v[2*j-2][2]],[x,v[2*j][1]+.024,v[2*j][2]],.042,stone);}
    };
    if(feature==="clock"){
      const angle=front.a+(Math.cos(front.a)<0?Math.PI:0),nx=Math.sin(angle),nz=Math.cos(angle);
      const x=front.x+nx*.19,z=front.z+nz*.19;
      const xy=(u,v,depth)=>[x+Math.cos(angle)*u+nx*depth,top*.62+v,z-Math.sin(angle)*u+nz*depth];
      const face=(radius,color,depth)=>{const disk=new T.Mesh(new T.CircleGeometry(radius,48),new T.MeshStandardMaterial({color,side:T.DoubleSide}));disk.position.set(...xy(0,0,depth));disk.rotation.y=angle;m.group.add(disk);};
      face(.79,"#705647",0);face(.70,"#eee1bc",.018);
      for(let j=0;j<12;j++){const a=Math.PI*j/6;m.rod(xy(Math.sin(a)*.50,Math.cos(a)*.50,.037),xy(Math.sin(a)*.64,Math.cos(a)*.64,.037),.048,dark);}
      m.rod(xy(0,0,.05),xy(-.28,.31,.05),.068,dark);m.rod(xy(0,0,.05),xy(.42,.16,.05),.055,dark);
      for(let i=0;i<3;i++)box(w*(i-1)*.17,top+.16,-d*.12,w*.125,.10,d*.20,"#9eafa8");
    }else if(feature==="goldroof"){
      block(m,p,top+.12,top+.56,"#bb9457",.985);box(0,top+.59,0,w*.58,.10,d*.48,"#9ea795");
      for(let i=0;i<3;i++){let x=-w*.23+i*w*.22;box(x,top+.72,0,w*.13,.23,d*.32,"#86969b");for(let j=0;j<5;j++)box(x,top+.85,d*.064*(j-2),w*.13,.045,.055,"#d4c6ae");}canopy(1.0,w*.37,stone);
    }else if(feature==="retail"){canopy(.96,w*.76,"#c7ad83");block(m,p,top+.12,top+.42,"#b99876",.94);}
    else if(feature==="twins"){wings(4.15,"#669294");canopy(1.15,w*.75,body);}
    else if(feature==="screen"||feature==="shopfront"){box(0,top*.58,d*.45,w*.54,h*.41,.12,feature==="screen"?"#5b7389":"#a77c74");canopy(1,w*.62,stone);}
    else if(feature==="chicony"||feature==="offices"){
      const ht=feature==="chicony"?4.7:5.9;box(-w*.21,top+ht/2,-d*.12,w*.25,ht,d*.43,"#588997");
      for(let j=0;j<12;j++)box(-w*.21,top+(j+.4)*ht/12,-d*.12,w*.253,.055,d*.435,"#aabbb8");canopy(1.1,w*.49,body);
    }else if(feature==="canopy"){canopy(1.5,w*.69,"#b09570");box(w*.20,top+.15,0,w*.24,.29,d*.62,"#a7b29e");}
    else if(feature==="yellow"){box(-w*.29,1.22,d*.43,w*.28,1.96,.87,"#e4b537");canopy(1.16,w*.48,"#e1b13c");}
    else if(feature==="crown"){block(m,p,top+.13,top+.91,glass,.91);block(m,p,top+.91,top+1.12,body,.91);}
    else if(feature==="fan"){
      box(0,top+2.16,-d*.20,w*.70,4.30,d*.38,body);
      for(let i=0;i<13;i++)box((i/12-.5)*w*.65,top+2.18,-d*.005,.17,3.86,.12,glass);
      m.cyl(cx,top+.30,cz+d*.18,w*.61,.57,body);m.cyl(cx,top+.62,cz+d*.18,w*.56,.09,glass);
      m.cyl(cx,top+.73,cz+d*.18,w*.47,.15,body);dome(m,cx,top+.82,cz+d*.18,w*.145,.88,w*.15,glass);
      for(let j=0;j<15;j++){const a=j*Math.PI/14;m.box(cx+w*.306*Math.cos(a),top+.29,cz+d*.18+w*.306*Math.sin(a),.18,.39,.14,glass,-a);}
    }else if(feature==="book"){
      for(const sg of [-1,1]){const v=[],tri=[];for(let i=0;i<=16;i++){
        const t=i/16,x=cx+sg*w*(.02+.47*t),yy=top+.26+.48*Math.sin(t*Math.PI);
        v.push([x,yy,cz-d*.48],[x,yy,cz+d*.48]);if(i){let n=i*2;tri.push(n-2,n-1,n,n,n-1,n+1);}}
        m.mesh(v,tri,"#d7c8a2");}risers(6,w*.61);
    }else if(["pediment","stoneportal","pilaster","tiled","colonnade","readinghall"].includes(feature)){
      portico(h*.89,feature==="pediment"||feature==="tiled");risers(5,w*.44);
      if(feature==="readinghall")box(0,top+.54,-d*.1,w*.57,1.04,d*.55,body);
      if(feature==="tiled")hip(m,cx,top+.13,cz,w*.87,d*.76,.97,"#6e947f");
    }else if(feature==="portal"){for(const sg of [-1,1])box(sg*w*.20,top*.50,d*.44,.63,h,1,body);box(0,top*.87,d*.44,w*.45,.81,1,body);risers(4,w*.47);}
    else if(feature==="blade"){m.mesh([[cx-w*.5,top+1.55,cz-d*.4],[cx+w*.5,top+.18,cz-d*.4],[cx+w*.5,top+.18,cz+d*.32],[cx-w*.5,top+1.55,cz+d*.32]],[0,1,2,0,2,3],stone);canopy(1.1,w*.58,body);}
    else if(feature==="waterfront"){box(0,.09,d*.51+.38,w*.71,.07,.9,"#84acaa");canopy(1.19,w*.52,stone);}
    else if(feature==="corner"){box(-w*.34,top*.57,d*.26,w*.13,top*1.14,d*.24,body);canopy(.94,w*.65,glass);}
    else if(feature==="shade"||feature==="stair"){risers(6,w*.48);canopy(1.65,w*.45,feature==="shade"?glass:stone);}
    else if(feature==="boulder"||feature==="suspended"){
      const v=[[-.49,1.22,-.34],[-.28,4.06,-.45],[.40,4.7,-.36],[.5,2.26,.25],[.29,1.53,.44],[-.48,2.6,.35],[-.30,4.10,.37]].map(([x,y,z])=>[cx+x*w,y,cz+z*d]);
      m.mesh(v,[0,1,2,0,2,3,0,3,4,0,4,5,5,4,6,6,4,3,6,3,2,6,2,1,0,5,1,1,5,6],feature==="boulder"?"#c1c4c0":"#78828a");
      if(feature==="suspended")for(const sg of [-1,1])m.rod([cx+sg*w*.29,.15,cz+d*.16],[cx+sg*w*.17,2.1,cz+d*.26],.31,dark);
    }else if(feature==="opera"||feature==="strings"){
      const v=[],tri=[];for(let j=0;j<=24;j++){const t=j/24,x=cx+(t-.5)*w;
        v.push([x,top+.47+1.10*Math.sin(t*3.9),cz-d*.48],[x,top+.65+.86*Math.sin(t*4.1+.7),cz+d*.48]);
        if(j){const n=2*j;tri.push(n-2,n-1,n,n,n-1,n+1);}if(j%2===0)m.rod([x,.25,cz+d*.43],[x,v[v.length-1][1],cz+d*.46],feature==="strings"?.105:.15,"#ba9765");}
      m.mesh(v,tri,feature==="opera"?"#9b947e":"#beb198");
    }else if(feature==="lantern"){
      const r=Math.min(w,d)*.425,ht=4.1;const drum=new T.Mesh(new T.CylinderGeometry(r,r*.93,ht,64),new T.MeshStandardMaterial({color:"#943c39"}));drum.position.set(cx,top+ht/2,cz);m.group.add(drum);
      for(let j=0;j<42;j++){const a=j*Math.PI/21;for(let i=0;i<7;i++){const aa=a+i*.06,bb=aa+.06,at=(u,y)=>[cx+(r+.03)*Math.cos(u),top+y,cz+(r+.03)*Math.sin(u)];m.rod(at(aa,i*ht/7),at(bb,(i+1)*ht/7),.065,"#ca6760");}}
    }else if(feature==="crystal"||feature==="globe"){if(feature==="globe")dome(m,cx-w*.29,.23,cz+d*.41,1.54,1.59,1.5,"#a9b1b3");else{dome(m,cx,1.05,cz+d*.47,1.63,.94,1.21,glass);hip(m,cx,top+.12,cz,w*.55,d*.48,.98,"#68716d");}risers(4,w*.33);}
    else if(feature==="cutout"||feature==="steelbox"){box(-w*.22,top*.64,d*.44,w*.35,h*.53,.38,glass);box(w*.35,top*.79,d*.34,w*.18,h*.41,.59,body);}
    else if(feature==="marquee"){canopy(1.04,w*.77,glass);block(m,p,top,top+.24,body,1.03);}
    else if(feature==="disc"){const obj=new T.Mesh(new T.CylinderGeometry(1,1,.16,48),new T.MeshStandardMaterial({color:stone}));obj.position.set(cx,top+.54,cz+d*.26);obj.scale.set(w*.26,1,d*.33);m.group.add(obj);portico(h*.80);}
    else if(feature==="cupola"){portico(h*.83);box(0,top+.75,0,w*.39,1.43,d*.44,body);dome(m,cx,top+1.48,cz,w*.18,1.1,d*.2,"#8a8374");}
    else if(["greenvault","vault","arena"].includes(feature)){vault(feature==="greenvault"?"#507f68":"#b8c6c9",feature==="arena"?.64:1.61);risers(4,w*.53);}
    else if(feature==="greenfold"){hip(m,cx,top+.12,cz,w*.98,d*.98,1.71,"#496e66");canopy(1.19,w*.62,body);}
    else if(feature==="grandstand"){risers(7,w*.77);canopy(2.19,w*.81,stone);}
    const f=front,word=({skp:"SKP",dream:"武商梦时代",wuguang:"武商 MALL",ikea:"IKEA",library:"湖北省图书馆",whtlib:"武汉图书馆",hanshow:"汉秀",yamao:"武商亚贸",zhongyuan:"武商众圆",qungu:"群光广场",dayang:"大洋百货",wcwx:"武昌万象城",guogg:"光谷国际广场"})[key];
    if(word){const flip=Math.cos(f.a)<0?Math.PI:0,angle=f.a+flip;
      m.plaque(word,f.x*1.025+Math.sin(angle)*.09,h*.31+.27,f.z*1.025+Math.cos(angle)*.09,Math.min(2.8,Math.max(1.42,f.len*.67)),.41,"#f4e7ca",dark,angle);}
  }
  return Object.fromEntries(Object.keys(catalogue).map(k=>[k,m=>landmark(m,k)]));
}
