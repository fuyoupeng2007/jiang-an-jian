/* Architectural studies for the model viewer. Separate meshes keep courtyards,
   colonnades, openings and the backs of landmarks visible from any bearing. */
function buildCityModels({T,Model,hip,building,tower,stone,brick,slate,dark,leafGeo}) {
  const jade="#3e8883", ochre="#dbab58", lacquer="#ab5140", tile="#53616b";
  function assembly(m,make,x=0,y=0,z=0,scale=1,rotation=0){
    const child=new Model();make(child);child.finish();child.group.scale.setScalar(scale);
    child.group.position.set(x,y,z);child.group.rotation.y=rotation;m.group.add(child.group);
  }
  function prism(m,x,y,z,top,bottom,height,n,color){
    const g=new T.CylinderGeometry(top,bottom,height,n,1);
    const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color,flatShading:true}));
    mesh.position.set(x,y+height/2,z);mesh.rotation.y=Math.PI/n;m.group.add(mesh);
  }
  function steps(m,x,y,z,width,count,depth=.30,rise=.15){
    for(let i=0;i<count;i++)m.box(x,y+(i+1)*rise/2,z-i*depth,width,(i+1)*rise,depth+.025,"#d2c6ad");
  }
  function rail(m,x,y,z,w){
    for(let i=0;i<=Math.ceil(w);i++)m.box(x-w/2+i*w/Math.ceil(w),y+.27,z,.08,.56,.09,stone);
    m.box(x,y+.48,z,w,.09,.12,stone);
  }
  function archedWall(m,x,y,z,w,h,d,r,center,color,round=false){
    const shape=new T.Shape();shape.moveTo(-w/2,0);
    if(!round){shape.lineTo(-r,0);shape.lineTo(-r,center);shape.absarc(0,center,r,Math.PI,0,true);shape.lineTo(r,0);}
    shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
    if(round){const hole=new T.Path();hole.absarc(0,center,r,0,2*Math.PI,true);shape.holes.push(hole);}
    const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:28});
    const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color,side:T.DoubleSide}));mesh.position.set(x,y,z);m.group.add(mesh);
  }
  function eaves(m,x,y,z,w,d,rise,color){
    for(const side of [-1,1]){
      const vs=[],is=[],cols=18,rows=5;
      for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){
        const t=j/rows,a=2*k/cols-1;
        vs.push([x+a*(w/2-.57*t),y+rise*t*t+.39*Math.pow(Math.abs(a),5)*(1-t),z+side*d*(1-t)/2]);
        if(j&&k){const i=j*(cols+1)+k;is.push(i,i-1,i-cols-2,i,i-cols-2,i-cols-1);}
      }
      m.mesh(vs,is,color);
      for(let k=0;k<cols;k++)m.rod(vs[k],vs[k+1],.105,"#746f60");
      for(let k=0;k<=cols;k+=2)for(let j=0;j<rows;j++)m.rod(vs[j*(cols+1)+k],vs[(j+1)*(cols+1)+k],.055,color);
      for(const k of [0,cols])m.rod(vs[k],[vs[k][0]+Math.sign(vs[k][0]-x)*.18,vs[k][1]+.28,vs[k][2]],.11,color);
    }
    m.rod([x-w/2+.35,y+rise,z],[x+w/2-.35,y+rise,z],.16,"#a6997c");
  }
  function hall(m,x,y,z,w,d,levels,roof,wall=ochre) {
    m.box(x,y+.13,z,w+.45,.26,d+.45,"#c1b498");
    for(let i=0;i<levels;i++){
      const yy=y+i*2.10,ww=w-i*.65,dd=d-i*.68;
      m.box(x,yy+1.12,z,ww*.78,2.10,dd*.72,wall);
      if(i)m.box(x,yy+.1,z,ww+.4,.2,dd+.4,"#a87756");
      for(const s of [-1,1]){
        for(let j=0;j<=6;j++){
          const xx=x+ww*(j/6-.5)*.90;
          m.cyl(xx,yy+1.12,z+s*dd*.47,.18,2.05,lacquer);
          if(j<6){m.box(xx+ww*.074,yy+1.12,z+s*dd*.366,ww*.105,.97,.10,"#503e32");m.box(xx+ww*.074,yy+1.12,z+s*dd*.382,.07,1.0,.055,"#b2865b");}
        }
        m.box(x,yy+1.95,z+s*dd*.47,ww,.24,.20,"#687968");
        if(i)rail(m,x,yy+.1,z+s*dd*.48,ww*.94);
      }
      eaves(m,x,yy+2.03,z,ww+1.55,dd+1.2,i===levels-1?1.12:.70,roof);
    }
  }
  function tree(m,x,z,h=2.7,pink=false){
    if(!pink){m.tree(x,z,h);return;}
    m.cyl(x,h*.35,z,.15,h*.68,"#86684e");
    for(const [dx,dy,dz,col] of [[-.17,.75,.02,"#edb6bc"],[.13,.81,.10,"#f0ced2"],[.08,.67,-.13,"#dea8b0"]])
      m.part(leafGeo,x+dx*h,dy*h,z+dz*h,h*.56,h*.45,h*.54,col);
  }
  function red(m){
    m.base(16,14);m.part(leafGeo,0,.04,-3.0,13,.86,7.1,"#85946d");
    assembly(m,tower,0,.43,-3.7,.245);
    for(const [x,z] of [[-5,-2],[-4,-4],[4,-4],[5,-2],[-2.8,-2]])tree(m,x,z,2);
    archedWall(m,0,.08,2.6,13.5,3.85,.42,1.52,1.97,"#ad4938",true);
    m.box(0,3.99,2.81,13.8,.19,.75,"#604d43");
    for(const x of [-6.55,6.55])m.box(x,1.94,2.81,.34,3.86,.57,"#973f33");
    for(let i=0;i<7;i++)m.box(0,.091,3.55+.44*i,14.7,.04,.038,"#bbad98");
    for(let i=0;i<38;i++){const x=-6.74+i*.36;m.rod([x,4.12,2.48],[x,4.05,3.16],.13,"#655b50");}
    const rim=new T.Mesh(new T.TorusGeometry(1.53,.075,8,64),new T.MeshStandardMaterial({color:"#b19b7e"}));rim.position.set(0,2.05,3.06);m.group.add(rim);
    m.labels.push(["圆窗",0,3.65,2.7],["蛇山楼影",0,6.55,-3.7]);
  }
  function qingchuan(m){
    m.base(16,13);m.box(0,.095,4.8,15.6,.08,3.0,"#84aaa7");
    m.box(0,.48,-1.1,14.5,.9,8.9,"#b5a38b");m.box(0,1,-1.15,14.5,.18,8.9,stone);
    hall(m,0,1.12,-1.65,7.75,4.35,2,"#515e65","#8f4937");m.plaque("晴川阁",0,4.68,.15,1.7,.54,"#ebd397","#403c33");
    steps(m,0,.09,5.3,2.5,9,.27,.115);rail(m,-4,1.08,3.1,4.4);rail(m,4,1.08,3.1,4.4);
    for(const x of [-6.15,6.15])assembly(m,n=>tree(n,0,0,3),x,.95,-2);
    for(let i=-3;i<=3;i++){const x=i*1.03;m.box(x,3.04,.48,.63,.68,.11,"#455851");
      for(let j=-1;j<=1;j++)m.box(x+j*.18,3.04,.57,.038,.63,.036,"#c08750");}
    for(const x of [-4.1,4.1])for(let j=0;j<5;j++){const z=-3.75+j*.94;m.box(x,1.37,z,.10,.52,.11,stone);m.box(x,1.61,z,.10,.07,.93,stone);}
    m.labels.push(["江岸驳岸",4,1.5,3.15],["上层回廊",0,4.2,.25]);
  }
  function guiyuan(m){
    m.base(18,17);
    for(const s of [-1,1])m.box(s*7.6,.87,0,.32,1.77,13.1,ochre);
    archedWall(m,0,.09,4.55,14.9,2.4,.47,1.12,1.16,ochre);
    for(const x of [-4.75,4.75])eaves(m,x,2.50,4.8,5.7,1.1,.31,tile);
    m.box(0,3.25,4.81,4.55,2.00,.48,ochre);eaves(m,0,4.27,4.8,5.5,2.35,.83,"#485b57");
    for(const x of [-4.9,0,4.9]){
      const rr=x===0?1.03:.65,yy=x===0?1.20:.83;
      m.box(x,yy/2,5.065,rr*2,yy,.085,"#a6372e");
      const g=new T.CircleGeometry(rr,32,0,Math.PI),door=new T.Mesh(g,new T.MeshStandardMaterial({color:"#a6372e"}));door.position.set(x,yy,5.111);m.group.add(door);
      for(let j=0;j<17;j++){const a=j*Math.PI/16;m.box(x+Math.cos(a)*(rr+.066),yy+Math.sin(a)*(rr+.066),5.11,.17,.17,.13,stone);}
    }
    for(const x of [-1.68,1.68]){m.box(x,.26,5.88,.67,.48,.69,stone);m.part(leafGeo,x,.85,5.89,.55,.77,.57,"#b3b09a");m.part(leafGeo,x,1.19,6,.42,.42,.40,"#c4bea7");}
    m.plaque("归元禅寺",0,3.41,5.065,1.77,.55,"#edd596","#5b4033");
    for(const x of [-4.55,4.55])hall(m,x,.1,-1.2,3.15,4.0,1,tile);
    hall(m,0,.1,-4.9,6.9,3.5,1,tile);m.box(0,.14,.7,2.25,.10,7,"#c1b6a2");
    for(const [x,z] of [[-5.8,2.5],[5.9,2.1],[-6.4,-4.2],[6.4,-5]])tree(m,x,z,3.0);
    m.labels.push(["山门",0,3.8,4.6],["院落",0,.65,-.7]);
  }
  function baotong(m){
    m.base(17,17);
    for(let i=0;i<4;i++)m.box(0,.37+i*.65,-1.05-i*1.10,15-i*1.2,.73,11.3-i*1.08,["#bab799","#a6ab85","#a4a983","#98a17b"][i]);
    hall(m,-.7,.10,4.7,6.2,2.8,1,"#807351",ochre);hall(m,-2,1.48,.1,5.5,3.1,1,tile);
    steps(m,2.5,.1,3.4,1.6,13,.27,.15);
    for(let i=0;i<7;i++){
      const r=1.48-i*.116,y=2.81+i*.88;
      prism(m,2.7,y,-4.8,r*.93,r,.72,8,"#aa7860");prism(m,2.7,y+.67,-4.8,r*1.12,r*1.12,.13,8,"#774e3c");prism(m,2.7,y+.80,-4.8,r*.83,r*1.12,.18,8,"#b29a85");
      for(let k=0;k<8;k++){const a=k*Math.PI/4;m.box(2.7+Math.sin(a)*r*.91,y+.37,-4.8+Math.cos(a)*r*.91,.16,.36,.065,"#51453c",a);}
    }
    for(let i=0;i<7;i++){const r=1.48-i*.116,y=2.81+i*.88;
      prism(m,2.7,y+.54,-4.8,r*1.035,r*.99,.09,8,"#9b6855");for(let j=0;j<8;j++){const a=(j+.5)*Math.PI/4;
        m.cyl(2.7+Math.sin(a)*r*.96,y+.35,-4.8+Math.cos(a)*r*.96,.085,.65,"#ab755f");}}
    prism(m,2.7,9.03,-4.8,.10,.81,.67,8,"#826e5e");m.cyl(2.7,9.94,-4.8,.12,.63,"#786958");
    for(const [x,z,h] of [[-6,3,2.8],[6,2,3.3],[-6,-2,3],[5.8,-4,3]])assembly(m,n=>tree(n,0,0,h),x,z<0?1.9:.1,z);
    m.labels.push(["洪山宝塔",2.7,10,-4.8],["山门",-.8,3.3,4.7],["登高石阶",2.5,1.9,.4]);
  }
  function campus(m,key){
    m.base(17,14);
    if(key==="hust"){
      function block(x,z,w,d,levels){
        const h=levels*.93;m.box(x,h/2+.1,z,w,h,d,"#bcb8a8");m.box(x,h+.16,z,w+.22,.16,d+.22,"#bfbba9");
        for(const side of [-1,1]){
          for(let row=0;row<levels;row++)for(let col=0;col<Math.round(w/.71);col++){
            const xx=x+w*((col+.5)/Math.round(w/.71)-.5);m.box(xx,.67+row*.93,z+side*(d/2+.02),.34,.51,.05,"#626c6b");
          }
          for(let row=0;row<levels;row++)for(let col=0;col<4;col++)m.box(x+side*(w/2+.02),.67+row*.93,z+d*((col+.5)/4-.5),.05,.51,.33,"#68716d");
        }
      }
      block(0,-3,7.3,3.45,7);
      for(const s of [-1,1]){
        block(s*5.12,-3.13,2.93,3.15,5);
        for(let i=0;i<4;i++)tree(m,s*5.5,1.15+i*1.26,2.45+i*.10);
      }
      for(const x of [-1.2,0,1.2])m.box(x,1.2,-1.24,.73,1.95,.13,"#473f37");
      m.box(0,.12,3.8,4.1,.15,5.7,"#c5b8a3");
      m.box(0,.46,2.1,1.0,.78,1.0,"#b79172");m.cyl(0,1.18,2.1,.34,.79,"#e4ddc5");m.part(leafGeo,0,1.76,2.1,.25,.32,.23,stone);
      for(let j=0;j<6;j++)m.box(0,.18,-.36+j*.22,2.94,.20-j*.022,.26,"#aaa290");
      for(const x of [-2.2,-1.45,1.45,2.2])m.box(x,3.48,-1.25,.17,6.7,.18,"#d4cbbb");
      for(const sign of [-1,1])for(let i=0;i<5;i++)m.box(sign*2.5,.27,1.2+i*.93,.79,.39,.76,"#759265");
      m.labels.push(["南一楼",0,7.3,-2.65],["校园中轴",0,.3,5.1]);return;
    }
    if(key==="whu"){
      for(const x of [-5.4,-2.55,2.55,5.4]){
        const h=Math.abs(x)<3?5.45:3.9;prism(m,x,.05,0,.29,.33,h,8,"#d8d3bc");m.box(x,.35,0,.86,.60,.83,stone);
        prism(m,x,h+.03,0,.31,.39,.20,8,"#b6ab96");
      }
      for(const [x,y,w] of [[0,3.95,5.7],[-4,2.9,3.3],[4,2.9,3.3]]){
        m.box(x,y,0,w,.75,.52,"#d0cbb5");m.box(x,y-.7,0,w,.18,.41,stone);
        hip(m,x,y+.45,0,w+.45,.96,.3,jade);
      }
      m.plaque("国立武汉大学",0,3.96,.269,4.72,.64,"#344145","#d4ceb8");m.plaque("文法理工农医",0,3.96,-.269,4.72,.64,"#345047","#d4ceb8",Math.PI);
      for(const s of [-1,1]){tree(m,s*6,-2.7,3.1,true);tree(m,s*6,2.8,2.8,true);}
      for(const x of [-5.4,-2.55,2.55,5.4])for(const sg of [-1,1]){
        m.mesh([[x-.24,.17,sg*1.0],[x+.24,.17,sg*1.0],[x-.23,1.7,sg*.24],[x+.23,1.7,sg*.24],[x-.24,.17,sg*.21],[x+.24,.17,sg*.21]],[0,1,3,0,3,2,0,2,4,1,5,3],"#c7c3b1");
      }
      m.labels.push(["珞珈门",0,4.86,0]);return;
    }
    if(key==="oldlib"){
      // The library rises above its low wings. The entrance is a tall glazed bay.
      for(const side of [-1,1])building(m,side*4.55,-1.1,4.7,3.65,2,"#b6a786","#387968");
      m.box(0,2.57,0,4.55,5.0,4.24,"#b8a98d");
      for(const x of [-1.9,-1.4,-.9,.9,1.4,1.9])m.box(x,2.8,2.16,.22,4.65,.26,stone);
      m.box(0,2.85,2.19,2.9,2.37,.1,"#58716d");
      for(let i=-3;i<=3;i++)m.box(i*.42,2.86,2.26,.065,2.45,.09,"#baac8e");
      for(let i=0;i<4;i++)m.box(0,1.77+i*.64,2.28,2.95,.075,.07,stone);
      prism(m,0,4.98,-.2,2.36,2.36,1.03,8,"#c7b798");peaked(m,0,5.99,-.2,3.23,1.56,8,"#357760");
      prism(m,0,7.55,-.2,.27,.36,.27,8,"#9f8b61");steps(m,0,.09,4.1,4.18,6,.30,.14);
      m.labels.push(["八角屋顶",0,7.35,-.2],["正门",0,2.15,2.2]);return;
    }
    if(key==="castle"||key==="yingroad"){
      building(m,0,-3.5,8.8,3.25,2,"#bbad92",jade);
      prism(m,0,3.1,-3.4,1.63,1.63,2.0,8,"#cdbea0");prism(m,0,5.0,-3.4,.54,2.25,1.0,8,jade);
      hip(m,0,6.0,-3.4,1.8,1.2,.45,jade);
      for(const s of [-1,1])building(m,s*4.08,1.0,4.9,2.65,2,"#b3a990",jade);
      steps(m,0,.08,5.4,2.65,17,.40,.18);for(const s of [-1,1])for(let i=0;i<3;i++)tree(m,s*(3.1+i*1.7),4.5,2.3,true);
      if(key==="castle"){archedWall(m,0,.12,-.62,3.7,2.71,1.2,.86,1.12,"#b9ae96");for(const side of [-1,1])m.rod([side*1.54,.38,5.4],[side*1.54,3.63,-1.1],.14,stone);}
      if(key==="yingroad"){for(let j=0;j<6;j++)for(const side of [-1,1])tree(m,side*2.1,-1+j*1.16,2.9+.25*(j%2),true);}
      if(key==="oldlib"){for(let j=-2;j<=2;j++){m.box(j*.81,2.1,-1.8,.5,2.15,.13,"#546a68");m.box(j*.81,2.14,-1.68,.055,2.18,.04,stone);}m.plaque("图书馆",0,3.18,-1.73,1.56,.42,stone,dark);}

      m.labels.push(["八角塔楼",0,6.5,-3.4],["百步梯",0,1.45,2.55]);return;
    }
    building(m,0,-2.4,9.6,4.5,3,"#cec3a9",jade);hip(m,0,5.35,-2.4,6.4,3.8,1.1,jade);
    for(const x of [-1.2,0,1.2]){m.box(x,1.54,-.06,.78,2.57,.15,"#425454");m.box(x,2.52,.04,.76,.08,.07,stone);}
    for(const side of [-1,1])for(let i=0;i<7;i++)m.box(side*(1.4+i*.33),.15+(6-i)*.14,.48+i*.19,1.8,.25,.40,stone);
    m.box(0,.12,2.6,10,.1,4.6,"#90a079");for(const s of [-1,1])tree(m,s*6.1,2.7,3.2);
  }
  function peaked(m,x,y,z,r,h,n,col){
    const peak=[x,y+h,z];
    for(let j=0;j<n;j++){
      const a=(j+.5)*2*Math.PI/n,b=a+2*Math.PI/n;
      const corner=u=>[x+r*Math.cos(u),y+.23,z+r*Math.sin(u)];
      const l=corner(a),rr=corner(b),mid=[(l[0]+rr[0])/2,y,(l[2]+rr[2])/2];
      m.mesh([l,mid,rr,peak],[0,1,3,1,2,3],col);m.rod(l,peak,.09,"#877f67");m.rod(l,mid,.09,col);m.rod(mid,rr,.09,col);
      for(let t=1;t<6;t++){const u=t/6;m.rod([l[0]*(1-u)+rr[0]*u,y+.23*(2*u-1)**2,l[2]*(1-u)+rr[2]*u],peak,.045,col);}
    }
  }
  function pavilion(m,key){
    const broad=key==="changtian";m.base(broad?19:14,13);
    if(["xingyin","changtian","zuiwan","qintai"].includes(key))m.box(0,.10,4.25,broad?18.6:13.65,.1,4.0,"#88adaa");
    if(key==="zuiwan"){
      prism(m,0,.13,0,3.15,3.35,.36,6,"#a69e8b");
      for(let j=0;j<6;j++){const a=j*Math.PI/3;m.cyl(2.4*Math.cos(a),1.68,2.4*Math.sin(a),.22,2.38,lacquer);}
      peaked(m,0,2.89,0,3.55,1.52,6,"#d89938");m.cyl(0,4.55,0,.13,.38,ochre);steps(m,0,.1,3.8,2,3);tree(m,-4,-2,3.6);return;
    }
    if(key==="qintai"){
      hall(m,0,.14,-2.65,7.5,3.0,1,jade,"#eee5cf");
      archedWall(m,0,.1,2.2,4.7,2.8,.67,1.02,1.05,"#e9dfc8");
      for(const x of [-4,4]){m.box(x,1.08,2.55,3.6,2,.48,"#e2dcc9");m.box(x,1.22,2.82,1.45,.89,.08,dark);hip(m,x,2.15,2.55,3.75,.85,.3,tile);}
      hip(m,0,2.96,2.5,5.0,1.45,.64,jade);m.plaque("古琴台",0,2.46,2.92,1.43,.40,stone,dark);steps(m,0,.1,4,2.6,4);tree(m,-5,-1,3.8);return;
    }
    const levels={xingyin:3,changtian:2,whitecloud:3,chutian:5}[key];
    let y=.22;
    if(key==="chutian"){for(let j=0;j<3;j++)m.box(0,.25+j*.47,-1.1,12-j*1.1,.52,9-j*.85,"#aa937b");y=1.53;steps(m,0,.1,5.5,2.9,10,.27,.15);}
    const wide=broad?7.9:key==="xingyin"?4.0:6.75,depth=broad?3.3:key==="xingyin"?4.0:4.6;
    for(let j=0;j<levels;j++){
      const f=1-j*(key==="chutian"?.12:.095),w=wide*f,d=depth*f,z=-1.35;
      for(const side of [-1,1])for(let i=0;i<=4;i++){m.cyl((i/4-.5)*w,y+.72,z+side*d*.46,.17,1.46,lacquer);}
      m.box(0,y+.71,z,w*.76,1.4,d*.72,key==="whitecloud"?"#ab7554":"#a24d38");
      for(const side of [-1,1]){rail(m,0,y+.05,z+side*d*.49,w);for(let i=-2;i<=2;i++)m.box(i*w*.14,y+.82,z+side*d*.368,.34,.77,.08,"#4a443b");}
      m.box(0,y+.05,z,w+.45,.16,d+.45,stone);
      if(key==="xingyin")peaked(m,0,y+1.48,z,(w+1.45)*.707,j===levels-1?1.55:.86,4,"#477e67");
      else eaves(m,0,y+1.47,z,w+1.55,d+1.13,j===levels-1?1.17:.67,key==="chutian"?"#986737":key==="whitecloud"?"#6e584c":jade);
      y+=1.84;
    }
    if(broad){for(const sign of [-1,1]){for(let j=0;j<4;j++)m.cyl(sign*(4.3+.72*j),.81,-.12,.14,1.5,lacquer);
      hip(m,sign*5.6,1.58,-.62,3.8,1.6,.4,jade);peaked(m,sign*7.65,1.7,-.62,1.75,.77,4,jade);}}
    if(key==="xingyin"){m.box(0,.46,3.35,.93,.73,.82,stone);prism(m,0,.84,3.35,.18,.34,.96,8,"#9c978a");m.part(leafGeo,0,1.99,3.35,.36,.43,.34,"#aaa497");}
    tree(m,-5,-2.4,2.9);
  }
  function waterStudy(m,key){
    m.base(16,12);m.box(0,.10,0,15.7,.10,11.7,"#8baead");
    m.box(0,.27,4.37,15.65,.39,2.55,"#c7b99d");
    for(let j=0;j<16;j++){const x=-7.2+(j%8)*1.83,z=-4.9+Math.floor(j/8)*3.1+.3*Math.sin(j);m.box(x,.161,z,.48+.2*(j%3),.014,.034,"#a4c3ba");}
    if(key==="riverpark"){for(let i=0;i<17;i++){const x=-7.3+i*.86;m.cyl(x,.87,3.37,.08,.77,"#767e6f");}m.box(0,1.16,3.37,14.8,.065,.09,"#788172");}
    if(key==="whpier"){for(const x of [-5.4,-1.3])m.box(x,1.58,3.3,.65,3.0,.74,stone);m.box(-3.35,2.98,3.3,4.65,.63,.82,stone);m.plaque("武汉关码头",-3.35,2.99,3.75,3.55,.44,"#92483c",stone);}

    if(key==="lingbo"){
      for(const [x,z,w,d] of [[-.9,.7,.46,6.5],[1.8,-2.35,5.75,.46],[4.65,-.25,.46,4.6]])m.box(x,.44,z,w,.26,d,"#bdafa0");
      for(const z of [2,.7,-.6,-2])m.box(-.9,.24,z,.31,.4,.3,"#716f64");
    }else{
      for(let k=0;k<5;k++)m.box(0,.12+k*.07,2.30+k*.34,13.4,.12,.43,"#c2b6a0");
      for(const x of [-5.5,-2.2,1.5,5.3])assembly(m,n=>tree(n,0,0,2.4),x,.43,4.8);
      if(["whpier","zhpier","yuehan"].includes(key)){m.box(-2,.42,-.5,1.2,.25,5.9,"#8a8475");m.box(-1.95,.44,-3.25,5.4,.4,1.6,"#d0c7ac");m.box(-2,.93,-3.25,3.3,.67,1.0,"#597d78");}
    }
  }
  function ring(m,x,y,z,r,t,col,ry=0,rz=0){
    const mesh=new T.Mesh(new T.TorusGeometry(r,t,8,64),new T.MeshStandardMaterial({color:col}));mesh.position.set(x,y,z);mesh.rotation.set(0,ry,rz);m.group.add(mesh);
  }
  function wheel(m){
    m.base(14,9);
    for(const z of [-.36,.36])ring(m,0,5.27,z,4.6,.105,"#dee0d8");
    for(const sg of [-1,1]){ring(m,0,5.27,sg*.45,.47,.10,"#d7899a");}
    for(let j=0;j<28;j++){
      const a=2*j*Math.PI/28,x=Math.cos(a)*4.6,y=5.27+Math.sin(a)*4.6;
      for(const z of [-.32,.32])m.rod([0,5.27,-z],[x,y,z],.062,"#b8c4c3");
      m.rod([x,y,-.4],[x,y,.4],.09,stone);m.rod([x,y,0],[x,y-.25,0],.085,slate);
      m.part(leafGeo,x,y-.39,0,.69,.68,.8,"#d78797");m.box(x,y-.36,0,.49,.25,.60,"#718b91");m.box(x,y-.57,0,.51,.12,.63,"#e59daa");
    }
    for(const z of [-2.05,2.05])for(const x of [-2.45,2.45])m.rod([x,.15,z],[0,5.27,z*.26],.35,"#e6e3d9");
    m.box(0,.22,.8,3.5,.34,1.25,stone);tree(m,5.1,-2,2);tree(m,-5,-2.2,2.3);
  }
  function modern(m,key){
    m.base(15,12);
    if(key==="balloon"){
      const globe=new T.SphereGeometry(3.12,48,32);const colors=[];const pos=globe.attributes.position;
      for(let i=0;i<pos.count;i++){const v=pos.getY(i);const color=new T.Color(Math.abs(v)>1.38?"#d75137":"#f6ecda");colors.push(color.r,color.g,color.b);}
      globe.setAttribute("color",new T.Float32BufferAttribute(colors,3));const envelope=new T.Mesh(globe,new T.MeshStandardMaterial({vertexColors:true}));envelope.position.y=6.4;m.group.add(envelope);
      for(let i=0;i<8;i++){let a=i*Math.PI/4;m.rod([.74*Math.cos(a),2.9,.74*Math.sin(a)],[1.87*Math.cos(a),3.92,1.87*Math.sin(a)],.045,dark);}m.cyl(0,2.65,0,1.55,.56,"#a47950");
      for(const x of [-.68,.68])m.rod([x,2.91,.32],[x*2,4.3,.55],.055,dark);
      m.rod([0,.1,0],[0,2.4,0],.048,dark);m.cyl(0,.15,0,3.2,.2,"#8fa188");return;
    }
    if(key==="optic"){
      m.cyl(0,.10,0,11.65,.15,"#85877f");m.cyl(0,.20,0,9.48,.14,"#94a588");
      for(let i=0;i<40;i++){const a=i*Math.PI/20;m.box(5.25*Math.cos(a),.189,5.25*Math.sin(a),.31,.025,.062,stone,-a-Math.PI/2);}
      function ribbon(j,t){
        const a=j*2*Math.PI/96,amp=.5+.5*Math.cos(3*a-.5);
        const r=3.35+.52*Math.sin(2*a+.4)+t*(1.03+.48*Math.cos(3*a+.95));
        return [r*Math.cos(a),.32+amp*(3.05+1.06*Math.cos(a+.3))+t*(.72*Math.sin(3*a+.85)+.28),r*Math.sin(a)];
      }
      const vertices=[],faces=[];
      for(let j=0;j<=96;j++){
        for(const t of [-.5,.5])vertices.push(ribbon(j,t));
        if(j){const k=j*2;faces.push(k-2,k-1,k,k,k-1,k+1);}
        if(j%2===0)m.rod(ribbon(j,-.52),ribbon(j,.52),.055,"#777771");
      }
      m.mesh(vertices,faces,"#b8b6a9");
      for(const t of [-.5,-.25,0,.25,.5])for(let j=1;j<=96;j++)m.rod(ribbon(j-1,t),ribbon(j,t),.09,t===0?"#b2aca0":"#ddd5ba");
      for(let j=0;j<8;j++){const a=j*Math.PI/4; m.box(4.3*Math.cos(a),.27,4.3*Math.sin(a),.74,.11,.30,"#b1aa94",-a);}

      return;
    }
    if(key==="guishan"||key==="watertower"||key==="flood"){
      if(key==="watertower"){
        for(const x of [-1.30,1.30])for(const z of [-1.30,1.30]){m.box(x,3.4,z,.68,6.7,.68,brick);m.box(x,6.74,z,.75,.21,.75,stone);}
        for(let i=0;i<8;i++){const a=i*Math.PI/4;for(let j=0;j<5;j++){const r=2.12;m.box(Math.sin(a)*r,.77+j*1.08,Math.cos(a)*r,.54,.64,.09,"#4b4941",a);}}
        prism(m,0,.1,0,2.1,2.3,6.2,8,brick);for(let i=1;i<=5;i++)prism(m,0,i*1.08,0,2.27,2.29,.13,8,stone);prism(m,0,6.28,0,1.6,2.25,.7,8,slate);}
      else if(key==="flood"){m.box(0,.33,0,4.3,.58,3.1,stone);m.box(0,1.1,0,3.65,1.65,2.65,"#b9ad94");m.box(0,1.94,0,3.84,.19,2.84,stone);
        prism(m,0,2.03,0,.79,1.16,4.85,4,"#c6b99f");m.box(0,7.03,0,1.48,.35,1.45,stone);
        for(const z of [-1,1]){m.box(0,1.16,z*1.34,2.86,.9,.06,"#92785e");m.plaque("武汉防汛纪念碑",0,4.52,z*.74,1.06,.3,"#784e3a",stone,z<0?Math.PI:0);}
        const star=[];for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.23:.54;star.push([r*Math.cos(a),7.63+r*Math.sin(a),.07]);}for(let i=0;i<10;i++)m.mesh([[0,7.63,.19],star[i],star[(i+1)%10]],[0,1,2],"#aa4938");}
      else{m.part(leafGeo,-.2,.16,-.15,10,1.42,6.8,"#96a380");
        for(const [x,z,h] of [[-3.7,-.25,1.6],[-2.25,1.0,1.4],[3.0,-.55,1.75],[2.30,1.35,1.48],[-1.35,-1.8,1.7]])m.tree(x,z,h);
        prism(m,0,.34,0,1.55,1.92,.42,16,"#b9b19d");
        prism(m,0,.1,0,.36,1.1,7.6,16,"#b6b3a5");prism(m,0,6.6,0,1.54,1.02,.72,18,"#9c7466");prism(m,0,7.3,0,.65,1.55,.57,18,stone);for(let i=0;i<4;i++)prism(m,0,7.7+i*.52,0,.49-i*.08,.55-i*.08,.52,12,i%2?stone:"#a65e4d");
        for(let i=0;i<4;i++)m.cyl(0,10.06+i*.68,0,.15-i*.024,.69,i%2?stone:"#a65e4d");
        for(const [h,r] of [[6.72,1.30],[7.03,1.45],[7.35,1.50],[7.60,1.11]])prism(m,0,h,0,r,r,.09,24,"#d2d1c3");
        for(let i=0;i<18;i++){let a=i*Math.PI/9;m.box(Math.sin(a)*1.35,7.13,Math.cos(a)*1.35,.32,.22,.06,"#536971",a);}}
      return;
    }
    if(key==="parrot"||key==="yangsi"||key==="gutian"){
      m.box(0,.1,0,14.7,.1,11.7,"#86aaa6");m.box(0,1.75,0,14.8,.32,1.7,"#778783");
      const col=key==="parrot"?"#c65431":key==="yangsi"?"#d5a341":"#87aebe";
      const towers=key==="parrot"?[-5.1,0,5.1]:[-4.3,4.3];
      for(const x of towers){
        for(const z of [-1.02,1.02]){
          m.box(x,2.92,z,.37,5.3,.32,col);m.box(x,.57,z,.83,.89,.72,"#ada594");
          if(key==="gutian"){m.box(x,5.48,z,.69,.22,.6,col);prism(m,x,5.59,z,.09,.38,.42,4,col);}
        }
        m.box(x,5.18,0,.42,.36,2.23,col);
        if(key==="gutian")for(let j=0;j<10;j++){
          const a=j*Math.PI/10,b=(j+1)*Math.PI/10;m.rod([x,4.31+.61*Math.sin(a),Math.cos(a)],[x,4.31+.61*Math.sin(b),Math.cos(b)],.18,col);}
      }
      const ends=[-7.24,...towers,7.24];
      for(const z of [-.95,.95])for(let n=1;n<ends.length;n++){
        let prev=null;for(let j=0;j<=12;j++){const t=j/12,x=ends[n-1]*(1-t)+ends[n]*t;
          const left=n===1?2.03:5.12,right=n===ends.length-1?2.03:5.12;
          const y=left*(1-t)+right*t-(left>3&&right>3?10:2.4)*t*(1-t);
          if(prev)m.rod(prev,[x,y,z],.09,col);if(j%2===0)m.rod([x,1.89,z],[x,y,z],.045,col);prev=[x,y,z];}
      }
      if(key==="yangsi"){m.box(0,1.13,0,14.8,.19,1.76,col);for(const z of [-.84,.84])for(let j=0;j<28;j++){
        const x=-7.24+j*.52;m.rod([x,1.18,z],[x+.52,1.67,z],.069,col);m.rod([x,1.67,z],[x+.52,1.18,z],.069,col);}}
    }
  }
  function gudesi(m){
    m.base(14,14);m.box(0,.36,0,10.8,.62,9.6,stone);
    m.box(0,2.53,-.1,6.7,4.15,6.5,"#cbba9c");
    for(const side of [-1,1]){
      for(let k=-3;k<=3;k++){const x=k*1.38;m.box(x,1.72,side*3.9,.24,2.75,.29,stone);}
      m.box(0,3.15,side*3.9,9.1,.42,.44,stone);
      for(const x of [-2.25,0,2.25]){
        const r=x===0?.62:.38;
        const disc=new T.Mesh(new T.CircleGeometry(r,30),new T.MeshStandardMaterial({color:"#675f53",side:T.DoubleSide}));
        disc.position.set(x,3.83,side>0?3.17:-3.37);m.group.add(disc);
        ring(m,x,3.83,disc.position.z+side*.02,r,.055,stone);
        for(let i=0;i<8;i++){const a=i*Math.PI/4;m.rod([x,3.83,disc.position.z+side*.03],[x+r*Math.cos(a),3.83+r*Math.sin(a),disc.position.z+side*.03],.038,stone);}
      }
    }
    for(const x of [-2.85,0,2.85])for(const z of [-2.85,0,2.85]){
      const size=x===0&&z===0?1.30:.82;
      prism(m,x,4.61,z,size*.84,size*.95,.53,8,stone);prism(m,x,5.14,z,size*.33,size*.75,size*1.35,12,"#bca887");
      prism(m,x,5.14+size*1.35,z,.035,size*.31,size*.78,8,stone);
    }
    for(const side of [-1,1])for(const x of [-2.75,-1.38,0,1.38,2.75]){
      const z=side*3.95;for(const q of [-1,1])m.rod([x+q*.46,2.14,z],[x,2.85,z],.11,stone);
      m.box(x,3.14,z,.82,.16,.31,"#b99876");}

    m.labels.push(["圆通宝殿",0,6.8,0]);
  }
  function tiemenguan(m){
    m.base(15,12);archedWall(m,0,.08,-1.8,11.9,3.9,3.8,1.48,1.25,"#a87960");
    for(let x=-5.6;x<6;x+=.79)for(const z of [-1.82,1.92])m.box(x,4.23,z,.47,.54,.26,brick);
    for(let j=0;j<19;j++){const a=j*Math.PI/18;m.box(1.58*Math.cos(a),1.33+1.58*Math.sin(a),2.03,.26,.24,.18,"#cbbb9e");}

    hall(m,0,4.04,.05,5.6,2.65,2,tile,lacquer);m.plaque("铁门关",0,3.2,2.02,1.55,.52,"#382e26",stone);
  }
  function museum(m){
    m.base(18,16);
    for(const [x,z,w,d,l] of [[0,-3,8.1,3.8,2],[-5,2.4,4.6,3.2,1],[5,2.4,4.6,3.2,1]]){
      m.box(x,.38,z,w+1.2,.7,d+1.25,"#b0a28b");assembly(m,n=>building(n,0,0,w,d,l,"#bbab91",slate,true),x,.70,z);
      hip(m,x,.77+l*1.48,z,w+1.9,d+1.75,1.58,slate);
      for(const sign of [-1,1])for(let j=0;j<=6;j++)m.box(x+(j/6-.5)*w,.97+l*.63,z+sign*(d*.5+.13),.16,l*1.36,.23,"#a69679");

    }steps(m,0,.08,2.52,4.2,5);
  }
  const makers={gude:gudesi,tie:tiemenguan,museum,red,qc:qingchuan,guiyuan,baotong,wheel};
  for(const key of ["whu","hust","oldlib","castle","yingroad","lawn"])makers[key]=m=>campus(m,key);
  for(const key of ["xingyin","changtian","zuiwan","qintai","whitecloud","chutian"])makers[key]=m=>pavilion(m,key);
  for(const key of ["lingbo","whpier","riverpark"])makers[key]=m=>waterStudy(m,key);
  for(const key of ["balloon","optic","guishan","watertower","flood","parrot","yangsi","gutian"])makers[key]=m=>modern(m,key);
  return makers;
}
