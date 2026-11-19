/* Locally modelled architectural miniatures. All dimensions are illustrative. */
window.WuhanArchitecture = (() => {
  const T = THREE;
  const boxGeo = new T.BoxGeometry(1,1,1);
  const roundGeo = new T.CylinderGeometry(.5,.5,1,16);
  const leafGeo = new T.IcosahedronGeometry(.55,1);
  const stone="#eee2c7", slate="#505960", brick="#a25a47", glass="#48636b", dark="#354849";

  class Model {
    constructor(){
      this.group=new T.Group(); this.batches=new Map(); this.labels=[]; this.pose=new T.Object3D();
    }
    part(geo,x,y,z,w,h,d,color,rx=0,ry=0,rz=0){
      const key=geo.uuid+color;
      if(!this.batches.has(key))this.batches.set(key,{geo,color,transforms:[]});
      const obj=this.pose;obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.rotation.set(rx,ry,rz);obj.updateMatrix();
      this.batches.get(key).transforms.push(obj.matrix.clone());
    }
    box(x,y,z,w,h,d,col,ry=0){this.part(boxGeo,x,y,z,w,h,d,col,0,ry);}
    cyl(x,y,z,w,h,col){this.part(roundGeo,x,y,z,w,h,w,col);}
    mesh(vertices,indices,color){
      const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(vertices.flat(),3));g.setIndex(indices);g.computeVertexNormals();
      this.group.add(new T.Mesh(g,new T.MeshStandardMaterial({color,side:T.DoubleSide,flatShading:true})));
    }
    rod(a,b,r,col){
      const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start),mid=start.clone().lerp(end,.5);
      const rot=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());
      const e=new T.Euler().setFromQuaternion(rot);this.part(roundGeo,mid.x,mid.y,mid.z,r,v.length(),r,col,e.x,e.y,e.z);
    }
    plaque(text,x,y,z,w,h,ink,bg,angle=0){
      const can=document.createElement("canvas");can.width=768;can.height=Math.round(768*h/w);
      const ctx=can.getContext("2d");ctx.fillStyle=bg;ctx.fillRect(0,0,can.width,can.height);
      ctx.fillStyle=ink;ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="bold "+Math.round(Math.min(can.height*.75,can.width/(text.length+.5)))+"px SimSun, serif";
      ctx.fillText(text,384,can.height*.53);
      const tex=new T.CanvasTexture(can);tex.colorSpace=T.SRGBColorSpace;
      const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));mesh.position.set(x,y,z);mesh.rotation.y=angle;this.group.add(mesh);
    }
    tree(x,z,h=2.3){
      this.cyl(x,h*.31,z,.16,h*.62,"#72634f");
      this.part(leafGeo,x,h*.78,z,h*.53,h*.65,h*.58,"#769575");
      this.part(leafGeo,x-h*.15,h*.70,z+.1,h*.35,h*.48,h*.39,"#8da47a");
    }
    base(w,d){
      this.box(0,-.45,0,w,.72,d,"#ad9c82");this.box(0,-.11,0,w+.08,.26,d+.08,"#d9cab0");
      this.box(0,.025,0,w-.28,.08,d-.28,"#ddd8c5");
    }
    finish(){
      for(const {geo,color,transforms} of this.batches.values()){
        const mesh=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color,roughness:.94}),transforms.length);
        transforms.forEach((m,i)=>mesh.setMatrixAt(i,m));this.group.add(mesh);
      }
      this.group.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
      return this;
    }
  }
  function hip(m,x,y,z,w,d,rise,col) {
    const h=w/2,b=d/2, ridge=Math.max(.05,h-b*.75);
    m.mesh([[x-h,y,z-b],[x+h,y,z-b],[x+h,y,z+b],[x-h,y,z+b],[x-ridge,y+rise,z],[x+ridge,y+rise,z]],
      [0,4,5,0,5,1,1,5,2,2,5,4,2,4,3,3,4,0],col);
    m.rod([x-ridge,y+rise,z],[x+ridge,y+rise,z],.15,"#a29783");
    for(const side of [-1,1])for(let i=1;i<Math.floor(w/.45);i++){
      const t=i/Math.floor(w/.45), ex=x-h+w*t;
      m.rod([ex,y+.025,z+side*b],[x-ridge+2*ridge*t,y+rise+.025,z],.046,col);
    }
  }
  function building(m,x,z,w,d,levels,facade,roof,flat=false){
    const storey=1.48,h=levels*storey;
    m.box(x,h/2,z,w,h,d,facade);
    m.box(x,.19,z,w+.23,.36,d+.23,"#b8ad98");
    for(let l=1;l<=levels;l++)m.box(x,l*storey-.07,z,w+.19,.13,d+.19,stone);
    for(const side of [-1,1]){
      const front=z+side*(d/2+.025),edge=x+side*(w/2+.025);
      const cols=Math.max(2,Math.floor(w/1.35)), rows=Math.max(2,Math.floor(d/1.4));
      for(let l=0;l<levels;l++){
        const y=.76+l*storey;
        for(let k=0;k<cols;k++){
          const xx=x+w*((k+.5)/cols-.5),ww=Math.min(.90,w/cols*.65);
          m.box(xx,y,front,ww+.14,.99,.09,stone);
          m.box(xx,y,front+side*.06,ww,.82,.05,glass);
          m.box(xx,y,front+side*.095,.054,.83,.04,stone);
          m.box(xx,y+.16,front+side*.095,ww,.055,.04,stone);
        }
        for(let k=0;k<rows;k++){
          const zz=z+d*((k+.5)/rows-.5);
          m.box(edge,y,zz,.08,.96,.75,stone);m.box(edge+side*.06,y,zz,.05,.80,.60,dark);
        }
      }
    }
    if(flat){
      m.box(x,h+.06,z,w,.12,d,"#c29383");
      for(const s of [-1,1]){m.box(x,h+.22,z+s*d/2,w,.35,.13,stone);m.box(x+s*w/2,h+.22,z,.13,.35,d,stone);}
    } else hip(m,x,h+.03,z,w+.35,d+.35,Math.min(w,d)*.24,roof);
    return h;
  }
  function street(m,w,d) {
    m.box(0,.092,d/2-.9,w-.3,.05,1.50,"#8c9291");
    for(let x=-w/2+1;x<w/2-1;x+=1.7)m.box(x,.125,d/2-.84,.9,.02,.07,"#ece4d0");
  }
  function community(m) {
    m.base(24,20); street(m,24,20);
    building(m,-6.4,2.4,6.6,4.6,3,brick,"#a45142");
    building(m,-6.4,4.95,3.1,.8,2,"#b27962","#ac6352",true);
    for(const sx of [-8.8,-4.0]){
      m.box(sx,4.95,1.8,.52,1.08,.58,brick);m.box(sx,5.54,1.8,.65,.14,.72,stone);
    }
    building(m,-1.25,-3.05,8,5.3,3,"#8c8780",slate);
    building(m,-4.15,.30,2.2,1.7,2,"#a09587",slate,true);
    building(m,1.4,.30,2.2,1.7,2,"#a09587",slate,true);
    building(m,7.45,-5.3,4.8,4.7,3,"#ada99a",slate);
    building(m,8.2,-.9,3.3,4.0,2,"#a39d90",slate,true);
    building(m,6.05,4,5.2,3.0,2,"#aa9d8a","#635e55");
    building(m,-.1,5.43,4.25,3.2,2,"#b58067",slate,true);
    for(let k=0;k<4;k++)m.box(-1.2,.11+k*.09,1.73-k*.21,2.9,.15,.32,"#bab1a1");
    for(const [x,z] of [[-1.1,4.65],[1.05,5.9],[7.3,-.15]]){m.box(x,3.17,z,1.08,.32,.32,"#697a5b");}
    for(const [x,z] of [[-10,-5],[-8,-6.5],[3,-8],[5,-8],[10,5.8],[-9,6]])m.tree(x,z);
    for(let i=0;i<4;i++){m.box(-3+i*.95,.20,2.0,.70,.26,.24,"#94745c");}
    for(const [x,z,w] of [[-6.4,4.73,6.6],[-1.25,-.34,7.95],[6.05,5.55,5.2]]){
      for(let j=0;j<=5;j++){const xx=x+w*(j/5-.5);m.box(xx,1.45,z,.11,2.72,.16,"#b3a691");}
      m.box(x,2.82,z,w,.11,.23,"#c2b7a3");}

    for(const [k,x,y,z] of [["A1",-6.4,5.95,2.4],["A2",7.45,5.9,-5.3],["A3",-1.25,6.2,-3.05],["A4",6.05,4.2,4],["A5",-.1,3.65,5.43]])m.labels.push([k,x,y,z]);
  }
  function factory(m){
    m.base(22,16);street(m,22,16);
    building(m,-1.7,2.4,13,4.0,4,"#a75e49","#696863",true);
    building(m,1.55,-4.15,14,4.25,3,"#b46f54","#655e50");
    building(m,7.25,2.4,3.0,4.0,3,"#995142","#706359",true);
    for(let j=0;j<8;j++){
      const x=-8.05+j*1.81;
      m.box(x,3.01,4.48,.23,5.8,.2,"#bb7b62");
    }
    for(let j=0;j<7;j++){
      const x=-7.2+j*1.81;
      for(let i=0;i<9;i++){
        const a=i*Math.PI/8;
        m.part(boxGeo,x+.48*Math.cos(a),5.43+.42*Math.sin(a),4.51,.18,.15,.16,"#d0a389",0,0,a);
      }
    }
    for(const z of [.39,4.49])for(let j=0;j<8;j++){
      const x=-7.46+j*1.62;m.box(x,6.12,z,.43,.36,.27,"#a96850");
      for(let l=0;l<3;l++)m.box(x,1.15+l*1.48,z,.075,.7,.12,"#655c52");
    }
    m.box(2.7,3.55,-.6,2.1,.38,3.5,"#716b60");
    for(const x of [1.72,3.68]){m.box(x,4.15,-.6,.08,.08,3.5,dark);for(const z of [-2,-1,0,.9])m.box(x,3.9,z,.07,.65,.06,dark);}
    for(let i=0;i<13;i++)m.box(6.1+i*.20,.16+i*.16,5.1,.42,.26,.85,"#a49f92");
    for(const [x,z] of [[-9,-3],[-9,1],[9,-5]])m.tree(x,z,2.35);
    m.plaque("平和打包厂",-1.8,2.0,4.56,3.2,.68,"#392f28","#e0c8aa");
    m.labels.push(["临街厂房",-2,6.45,2.4],["连廊",2.7,4.5,-.6]);
  }
  function gate(m){
    m.base(19,9);
    m.box(0,.10,-.1,18.7,.09,8.55,"#afa99c");
    m.box(0,.18,.7,10.5,.18,4.8,"#8b9f67");
    m.box(0,.80,-.35,10.32,1.12,1.10,"#677f4f");
    m.box(0,.88,.3,9.85,1.45,1.05,"#8e8279");
    m.box(0,1.56,.3,9.82,.15,1.1,"#b8ab98");
    m.plaque("华中科技大学",.20,1.00,.852,8.82,.88,"#e3c786","#685957");
    m.plaque("HUAZHONG UNIVERSITY OF SCIENCE AND TECHNOLOGY",.20,.42,.852,8.65,.25,"#e4d2ae","#685957");
    for(const x of [-7.25,7.25]){
      m.box(x,.78,-1.6,1.85,1.5,1.75,"#cbbfae");m.box(x,1.13,-.70,1.46,.55,.1,glass);
      m.box(x,1.65,-1.6,2.15,.24,2,dark);
    }
    for(const sg of [-1,1]){
      for(let j=0;j<4;j++)m.box(sg*(5.6+j*.86),.165,2.75,.37,.023,1.29,"#d6cfbb");
      for(const z of [-3.35,-2])m.tree(sg*8.36,z,2.48);
    }
    m.mesh([[.04,4.43,-2.59],[1.21,4.26,-2.53],[1.16,3.70,-2.46],[.04,3.86,-2.59]],[0,1,2,0,2,3],"#b24c3c");
    m.box(0,.19,-2.6,.83,.27,.83,stone);m.cyl(0,2.3,-2.6,.082,4.4,"#bcb9a9");
  }
  function grain(m){
    m.base(16,16);
    m.box(0,.06,0,4.4,.12,15.6,"#b4aa91");
    for(let j=0;j<8;j++)m.box(0,.13,-6.6+j*1.9,4.5,.02,.045,"#a59882");
    const colors=["#b18564","#bd9b75","#a48e7d","#ad816c","#bc9777","#9b8c77"];
    for(let s=0;s<2;s++)for(let i=0;i<3;i++){
      const sign=s?1:-1,x=sign*4.84,z=-4.7+i*4.25;
      building(m,x,z,3.7,4.18,(i+s)%3===1?3:2,colors[s*3+i],"#686e69",true);
      const awning=s?"#b35c41":"#758b7d";
      m.box(sign*2.75,1.60,z,1.25,.19,3.95,awning);
      for(let j=0;j<7;j++)m.box(sign*2.72,1.7,z-1.7+j*.56,1.20,.04,.22,"#e2ca9c");
      m.box(sign*3,2.07,z,.16,.66,3.94,awning);
      m.plaque(["早点","热干面","茶铺","烧麦","豆皮","汤包"][s*3+i],sign*2.89,2.08,z,3.65,.57,"#fff3c8",awning,-sign*Math.PI/2);
      m.box(sign*2.59,.57,z,.78,1.04,2.48,"#cba67c");
      m.box(sign*2.35,.99,z,.60,.11,2.65,stone);
      m.cyl(sign*2.20,1.15,z,.47,.24,"#a77a45");
    }
    for(const side of [-1,1])for(let j=0;j<3;j++){
      const z=-4.6+j*4.2;for(let k=0;k<5;k++)m.box(side*2.91,2.10,z-1.21+k*.62,.93,.09,.27,k%2?"#e0c59e":"#9e614a");
      m.rod([side*2.55,1.86,z-1.3],[side*3.31,2.36,z-1.3],.053,dark);}

    m.cyl(-2,2.55,6.5,.19,5.10,dark);m.box(-.4,4.65,6.54,4.5,1.16,.18,"#417669");
    m.plaque("粮道街",-.4,4.65,6.65,4.35,1.06,"#fff0ca","#397062");
    for(const [x,z] of [[1.45,5.55],[-1.43,.20],[1.5,-2.5]]){
      m.box(x,.39,z,.85,.73,1.18,"#ac754d");m.box(x,.82,z,.99,.14,1.26,stone);
      for(let i=0;i<3;i++)m.cyl(x,.97+i*.16,z,.65,.15,"#c79255");
    }
    for(const [x,z,col] of [[.3,4.0,"#af5640"],[.7,3.4,"#587b85"],[-.8,-1.5,"#c39965"]]){
      m.cyl(x,.28,z,.22,.42,dark);m.cyl(x,.78,z,.39,.63,col);m.part(leafGeo,x,1.23,z,.31,.37,.31,"#bd947a");
    }
  }
  function tower(m){
    m.base(10.6,10.6);
    for(let i=0;i<3;i++)m.box(0,.18+i*.17,0,9.5-i*.48,.22,9.5-i*.48,"#d4c9af");
    for(const s of [-1,1]){
      for(let j=-4;j<=4;j++){
        if(Math.abs(j)<1)continue;
        for(const [x,z] of [[j*1.02,s*4.20],[s*4.20,j*1.02]]){
          m.box(x,.88,z,.18,.63,.18,"#ebdfbd");m.part(leafGeo,x,1.24,z,.27,.24,.27,stone);
        }
      }
      for(const v of [-2.59,2.59]){
        m.box(v,.96,s*4.20,3.12,.13,.13,"#e5d6b6");m.box(s*4.20,.96,v,.13,.13,3.12,"#e5d6b6");
      }
    }
    const main=m;main.floors=[];
    for(let tier=0;tier<5;tier++){
      m=new Model();
      const y=.5+tier*2.02,r=[3.42,2.75,2.63,2.49,2.34][tier], e=r+.89;
      m.box(0,y+.67,0,r*1.67,1.38,r*1.67,"#9e4436");
      if(tier<4)m.box(0,y+1.57,0,r*1.22,.94,r*1.22,"#774a38");
      m.box(0,y+.09,0,2*r+.22,.21,2*r+.22,"#c4a16d");
      for(const sign of [-1,1]){
        for(let k=-2;k<=2;k++){
          const pos=k*r*.44;m.cyl(pos,y+.70,sign*r*.97,.14,1.36,"#993b29");m.cyl(sign*r*.97,y+.70,pos,.14,1.36,"#993b29");
          if(k<2){m.box(pos+r*.22,y+.79,sign*r*.846,r*.29,.70,.09,"#4a4338");m.box(sign*r*.846,y+.79,pos+r*.22,.09,.70,r*.29,"#4a4338");}
        }
        m.box(0,y+.42,sign*r,2*r,.075,.10,"#bc5937");m.box(sign*r,y+.42,0,.10,.075,2*r,"#bc5937");
        for(let j=-5;j<=5;j++){m.box(r*j/5,y+.27,sign*r,.06,.32,.07,"#b76e48");m.box(sign*r,y+.27,r*j/5,.07,.32,.06,"#b76e48");}
        m.box(0,y+1.29,sign*r,2*r,.17,.16,"#465c4c");m.box(sign*r,y+1.29,0,.16,.17,2*r,"#465c4c");
        for(const k of [-.8,-.4,0,.4,.8]){
          m.rod([k*r,y+.98,sign*r],[k*r,y+1.52,sign*(r+.42)],.12,"#8e5037");
          if(tier===0)m.part(leafGeo,k*r,y+1.08,sign*(r+.18),.27,.33,.27,"#c85933");
        }
      }
      // The concave tiled faces rise at their four outer corners; successive decks remain broad.
      const outer=y+1.42,inner=tier===4? .18:r*.67,peak=tier===4?1.54:.72;
      const transform=(side,u,v,h)=>[[u,h,v],[v,h,-u],[-u,h,-v],[-v,h,u]][side];
      for(let side=0;side<4;side++){
        const verts=[],tri=[],steps=16,bands=5;
        for(let row=0;row<=bands;row++)for(let col=0;col<=steps;col++){
          const t=row/bands, n=col/steps*2-1, radius=e+(inner-e)*t;
          const height=outer+peak*t*t+.66*Math.pow(Math.abs(n),5)*(1-t);
          verts.push(transform(side,n*radius,radius,height));
          if(row&&col){const a=row*(steps+1)+col;tri.push(a,a-1,a-steps-2,a,a-steps-2,a-steps-1);}
        }
        m.mesh(verts,tri,side%2?"#cf913e":"#e4a749");
        const apron=[],faces=[];
        for(let i=0;i<=steps;i++){const [x,h,z]=verts[i];apron.push([x,h,z],[x*.965,h-.16,z*.965]);
          if(i){const a=i*2;faces.push(a-2,a-1,a,a,a-1,a+1);}}
        m.mesh(apron,faces,"#65432a");
        // Each face has a projecting central pavilion. Its two horns and the outer corner
        // give the characteristic twelve eave tips around each floor.
        const front=[],indices=[];
        for(let row=0;row<=3;row++)for(let k=0;k<=12;k++){
          const n=k/6-1,t=row/3;
          front.push(transform(side,n*e*.56*(1-.22*t),e+.49-t*.98,outer+.19+.46*t*t+.62*Math.pow(Math.abs(n),5)*(1-t)));
          if(row&&k){const a=row*13+k;indices.push(a,a-1,a-14,a,a-14,a-13);}
        }
        m.mesh(front,indices,"#dc9d48");
        for(let k=0;k<12;k++){m.rod(front[k],front[k+1],.14,"#74492a");}
        for(let k=0;k<=12;k+=2)m.rod(front[k],front[39+k],.055,"#e6af57");
        for(let j=0;j<steps;j++)m.rod(verts[j],verts[j+1],.095,"#a45c2c");
        for(let col=0;col<=steps;col+=2)for(let row=0;row<bands;row++){
          const j=row*(steps+1)+col;m.rod(verts[j],verts[j+steps+1],.053,"#eaba60");
        }
      }
      // Carved brackets underneath the roof and the exposed floor underside.
      m.box(0,y+.015,0,2*r+.12,.11,2*r+.12,"#905d3b");
      for(const sign of [-1,1])for(const k of [-.85,-.42,0,.42,.85]){
        m.box(k*r,y+1.32,sign*(r+.12),.26,.13,.44,"#bd8a58");
        m.box(sign*(r+.12),y+1.32,k*r,.44,.13,.26,"#bd8a58");
      }
      for(let side=0;side<4;side++)for(let j=-2;j<=2;j++){
        const a=side*Math.PI/2,v=j*r*.42;
        const pos=(u,w)=>[Math.cos(a)*u+Math.sin(a)*w,-Math.sin(a)*u+Math.cos(a)*w];
        const [x,z]=pos(v,r*1.04);
        m.box(x,y+1.22,z,.42,.13,.28,"#3d6660",a);
        m.box(x,y+1.37,z,.63,.12,.37,"#b08a4b",a);
        for(const sg of [-1,1]){const [xx,zz]=pos(v+sg*.18,r*.868);m.box(xx,y+.79,zz,.041,.66,.05,"#a9754b",a);}
      }
      if(tier===4){
        m.box(0,9.43,2.45,2.35,.83,.16,"#bf9653");m.plaque("黄鹤楼",0,9.43,2.54,2.16,.65,"#f6d382","#4e3530");
        m.cyl(0,11.76,0,.16,.54,"#c39247");
      }
      m.finish();main.group.add(m.group);main.floors.push(m.group);
    }
  }
  function customs(m){
    m.base(12,9);building(m,0,.05,8.8,5.0,4,"#b8b2a0","#69695f",true);
    const top=5.94;
    for(const x of [-3.6,-2.15,-.72,.72,2.15,3.6]) {
      m.cyl(x,3.45,2.98,.34,3.7,"#ded7c1");m.box(x,1.6,2.98,.49,.19,.48,stone);
      m.box(x,5.32,2.98,.53,.2,.52,stone);
    }
    m.box(0,5.56,2.87,9.3,.42,.9,stone);m.plaque("江汉关",0,5.56,3.34,2.15,.34,"#48473b","#d2c7a9");
    m.box(0,top+1.35,-.12,2.18,2.7,2.05,"#b5af9d");
    for(let x of [-.81,-.31,.31,.81])m.box(x,top+1.35,.92,.19,1.9,.12,dark);
    m.box(0,top+2.75,-.1,2.65,.28,2.45,stone);m.box(0,top+3.78,-.1,2.40,1.91,2.2,"#aaa594");
    for(let side=0;side<4;side++){
      const a=side*Math.PI/2,ray=new T.Vector3(Math.sin(a),0,Math.cos(a));
      const at=ray.clone().multiplyScalar(side%2?1.22:1.12);at.z-=.1;at.y=top+3.8;
      const disc=new T.Mesh(new T.CircleGeometry(.67,28),new T.MeshBasicMaterial({color:"#f6e8c8"}));disc.rotation.y=a;disc.position.copy(at);m.group.add(disc);
      const xy=(u,v)=>[at.x+Math.cos(a)*u+ray.x*.03,at.y+v,at.z-Math.sin(a)*u+ray.z*.03];
      for(let j=0;j<12;j++){const s=Math.sin(j*Math.PI/6),c=Math.cos(j*Math.PI/6);m.rod(xy(s*.52,c*.52),xy(s*.61,c*.61),.055,dark);}
      m.rod(xy(0,0),xy(.25,.28),.075,dark);m.rod(xy(0,0),xy(-.43,.12),.06,dark);
    }
    for(const x of [-1.16,1.16])for(const z of [-1.12,.92]){m.box(x,top+3.77,z,.18,1.92,.18,stone);m.box(x,top+1.48,z,.18,2.44,.18,stone);}
    for(const x of [-3.6,-2.15,-.72,.72,2.15,3.6])for(let j=0;j<8;j++){
      const a=j*Math.PI/4;m.cyl(x+.16*Math.cos(a),3.45,2.98+.16*Math.sin(a),.055,3.40,"#c1bba7");}

    m.box(0,top+4.77,-.1,2.6,.2,2.46,stone);for(const x of [-.74,.74])for(const z of [-.73,.53])m.cyl(x,top+5.29,z,.2,.84,"#b3a58b");
    m.cyl(0,top+5.34,-.1,1.2,.85,"#716e61");
    const cap=new T.Mesh(new T.SphereGeometry(1.17,24,12,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:"#6c7069"}));
    cap.scale.y=.63;cap.position.set(0,top+5.75,-.1);m.group.add(cap);
    m.cyl(0,top+5.74,-.1,2.42,.14,stone);m.cyl(0,top+6.87,-.1,.09,.85,slate);
  }
  function riverBridge(m,garden){
    m.base(19,9);m.box(0,.08,0,18.75,.12,8.7,"#94b6ae");
    for(const x of [-6.7,-.1,6.5]){m.box(x,1.48,-.55,1.1,2.85,2.05,"#bdb09a");m.box(x,2.78,-.55,1.5,.24,2.35,"#cbbfa9");}
    m.box(0,2.96,-.55,18.8,.24,2.30,"#56665f");m.box(0,4.45,-.55,18.8,.22,2.48,"#86857b");
    for(const z of [-1.58,.49]){
      for(let k=0;k<12;k++){
        const x=-9.35+k*1.56;
        m.rod([x,3.06,z],[x+.78,4.32,z],.105,"#4b625d");m.rod([x+.78,4.32,z],[x+1.56,3.06,z],.105,"#4b625d");
        m.rod([x,3.03,z],[x,4.35,z],.085,"#5c716a");m.box(x,4.68,z,.06,.4,.06,dark);
      }
      m.box(0,4.84,z,18.7,.07,.07,"#61736a");
    }
    for(const x of [-7.3,7.3]){
      m.box(x,2.63,-.55,1.08,5.14,2.94,"#c4b9a4");
      for(const z of [-2.02,.92]){m.box(x,2.50,z,.42,3.48,.09,"#717c77");m.box(x,4.58,z,.52,.24,.15,stone);}
      m.box(x,5.25,-.55,1.48,.27,3.17,stone);
      hip(m,x,5.43,-.55,1.46,3.04,.54,"#717668");}

    if(garden){
      m.box(-5,.46,2.9,8.7,.82,2.85,"#c3b298");m.tree(-7,3.4,2);m.tree(-4.6,3,1.8);
      for(let k=0;k<4;k++)m.box(-.8+k*.32,.13+(3-k)*.1,2.95,.55,.28,2.2,stone);
      for(const x of [-3.45,-2.35])for(const z of [2.75,3.62])m.cyl(x,1.64,z,.14,1.42,brick);
      hip(m,-2.9,2.37,3.2,2,1.8,.59,"#705e50");
    }
  }
  const makers={zhimin:community,packing:factory,tower,hustgate:gate,grain,custom:customs,bridge:m=>riverBridge(m,false),hym:m=>riverBridge(m,true)};
  if(typeof buildCityModels==="function") Object.assign(makers,buildCityModels({T,Model,hip,building,tower,stone,brick,slate,dark,leafGeo}));
  if(typeof makeBuildingCollection==="function")Object.assign(makers,makeBuildingCollection({T,hip,stone,dark}));
  const studies=typeof makeStreetStudies==="function"?makeStreetStudies({T,hip,building}):{};
  Object.assign(makers,studies);
  function buildTown(m,items){
    const step=4,cache=new Map();m.base(plotCols*step+.4,plotRows*step+.4);
    for(let row=0;row<plotRows;row++)for(let col=0;col<plotCols;col++){
      const water=riverTile(col,row);
      if(isPlaza(col,row))m.box(0,.18,0,4.04,.14,4.04,"#6799aa");
      m.box((col-matchVenue.c)*step,.13,(row-matchVenue.r)*step,3.98,.13,3.98,water?"#8ab5b7":(row+col)%2?"#c5d2ac":"#d4d9b6");
    }
    const shore=(plotRows-2-matchVenue.r)*step+1.5;
    m.box(0,.24,shore,plotCols*step,.16,.88,"#ccb99a");
    m.box(0,.59,shore+.39,plotCols*step,.075,.075,"#7e8275");
    for(let i=-17;i<=17;i+=2)m.box(i,.41,shore+.39,.09,.44,.09,"#877c6b");
    for(let i=-16;i<=16;i+=4){
      m.box(i,.24,0,3.97,.07,.58,"#d9c9ac");
      m.box(0,.24,i,.58,.07,3.97,"#d9c9ac");
      m.box(i,.25,shore+2.05,.98,.035,.065,"#b8d9d7");
    }
    for(const {k,c,r,a} of items){
      const x=(c-matchVenue.c)*step,z=(r-matchVenue.r)*step;
      if(!cache.has(k)){
        const child=new Model();
        if(k==="dawn-tree"||k==="cherry-tree"){
          for(const [xx,zz] of [[-1,0],[.9,.5],[0,-.8]]){
            child.cyl(xx,.53,zz,.14,1.07,"#796853");
            if(k==="dawn-tree")for(let j=0;j<3;j++){
              const g=new T.ConeGeometry(.66-j*.1,1.7,8);child.part(g,xx,1.5+j*.29,zz,1,1,1,["#68876c","#789776","#8aa383"][j]);
            }else for(const [dx,dy,co] of [[0,1.48,"#d09e98"],[-.2,1.62,"#e5b8b4"],[.25,1.62,"#e1afa8"]])child.part(leafGeo,xx+dx,dy,zz,.99,1.0,.96,co);
          }
        }else if(k==="stone-path"){
          for(let i=-2;i<=2;i++)child.box(.25*(i%2),.06,i*.58,1,.09,.43,"#b8ad97");
        }else if(k==="river-lamp"){
          child.cyl(0,1.28,0,.14,2.5,dark);child.rod([0,2.45,0],[.78,2.55,0],.12,dark);child.box(.76,2.37,0,.38,.3,.38,"#ddbb73");
        }else if(makers[k])makers[k](child);else buildStreetModel(child,k,T);
        child.finish();const bounds=new T.Box3().setFromObject(child.group),size=bounds.getSize(new T.Vector3()),mid=bounds.getCenter(new T.Vector3());
        const scale=places[k]?3.52/Math.max(size.x,size.z):1;
        const inner=new T.Group();child.group.scale.setScalar(scale);child.group.position.set(-mid.x*scale,-bounds.min.y*scale,-mid.z*scale);
        inner.add(child.group);cache.set(k,inner);
      }
      const copy=cache.get(k).clone(true);copy.position.set(x,.205,z);copy.rotation.y=a*Math.PI/2;m.group.add(copy);
    }
  }
  function view(host,key,settings={}){
    const m=new Model();
    if(settings.town)buildTown(m,settings.town);
    else if(makers[key]) makers[key](m); else buildStreetModel(m,key,T);
    m.finish();
    const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:!!settings.export});
    renderer.shadowMap.enabled=settings.shadows!==false;renderer.shadowMap.type=T.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
    renderer.outputColorSpace=T.SRGBColorSpace;host.append(renderer.domElement);
    const scene=new T.Scene();scene.add(m.group);
    scene.add(new T.HemisphereLight(0xfffbef,0xa5b5ba,1.65));
    const sun=new T.DirectionalLight(0xffedd1,2.28);sun.position.set(-14,26,21);sun.castShadow=true;
    Object.assign(sun.shadow.camera,{left:-18,right:18,top:17,bottom:-17,near:1,far:75});
    sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.022;sun.shadow.bias=-.00015;scene.add(sun);
    const camera=new T.OrthographicCamera(-1,1,1,-1,.01,260);
    const box=new T.Box3().setFromObject(m.group),center=box.getCenter(new T.Vector3());
    const preset=(settings.area ? [.52,.75] : null) || ({opticstreet:[.25,.28],wutong:[.22,.40],bagong:[.66,.35],qintaiart:[.53,.55],jh:[.31,.32],hzau:[.19,.28],skp:[.18,.24],dream:[.44,.34],whtlib:[.35,.36],wuguang:[.38,.33],library:[.45,.33],zhimin:[.46,.65],packing:[.46,.43],tower:[.22,.11],hustgate:[.13,.27],grain:[.23,.56],custom:[.34,.24],town:[.73,.66],optic:[.37,.22],guishan:[.43,.28],bridge:[.34,.29],hym:[.34,.34],red:[.12,.13],qc:[.48,.35],guiyuan:[.48,.54],baotong:[.56,.46],hust:[.35,.35],whu:[.17,.20],oldlib:[.58,.4],castle:[.14,.34],yingroad:[-.62,.36]}[key]) || (studies[key]?[.37,.42]:[.52,.54]);
    let yaw=preset[0],pitch=preset[1],zoom=1,frame=null,focusPoint=null;
    const labels=m.labels.map(([name,x,y,z])=>{
      if(!settings.labels)return null;
      const el=document.createElement("span");el.className="buildingLabel";el.textContent=name;host.append(el);
      return {el,at:new T.Vector3(x,y,z)};
    }).filter(Boolean);
    const pts=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])pts.push(new T.Vector3(x,y,z));
    function spread(amount,active=-1){
      if(!m.floors)return;
      m.floors.forEach((g,i)=>{g.position.y=i*amount*2.20;g.visible=active===-1||active===i;});
      for(const child of m.group.children)if(!m.floors.includes(child))child.visible=active===-1;
      m.group.updateMatrixWorld(true);
      const bounds=active===-1?box.clone():new T.Box3().setFromObject(m.floors[active]);
      if(active===-1)bounds.max.y=12.15+amount*8.8;
      bounds.getCenter(center);
      pts.length=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])pts.push(new T.Vector3(x,y,z));
      render();
    }
    function render(){
      const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
      renderer.setSize(w,h,false);
      const dir=new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
      const target=focusPoint||center;
      camera.position.copy(target).addScaledVector(dir,75);camera.lookAt(target);camera.updateMatrixWorld();
      const p=pts.map(v=>v.clone().applyMatrix4(camera.matrixWorldInverse));
      const xs=p.map(v=>v.x),ys=p.map(v=>v.y);
      const xx=(Math.max(...xs)-Math.min(...xs))/2,yy=(Math.max(...ys)-Math.min(...ys))/2;
      const extent=Math.max(yy,xx*h/w)*1.04/zoom;
      camera.top=extent;camera.bottom=-extent;camera.right=extent*w/h;camera.left=-camera.right;camera.updateProjectionMatrix();
      renderer.render(scene,camera);
      for(const {el,at} of labels){const q=at.clone().project(camera);el.style.left=(q.x+1)*50+"%";el.style.top=(1-q.y)*50+"%";}
    }
    function invalidate(){if(frame===null)frame=requestAnimationFrame(()=>{frame=null;render();});}
    function magnify(f){zoom=Math.max(.7,Math.min(2.75,zoom*f));invalidate();}
    function orbit(x,y){yaw+=x;pitch=Math.max(.08,Math.min(1.29,pitch+y));invalidate();}
    if(settings.interactive){
      const canvas=renderer.domElement, touches=new Map();let gap=0;
      const distance=()=>{const [a,b]=touches.values();return Math.hypot(a.x-b.x,a.y-b.y);};
      canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2)gap=distance();};
      canvas.onpointermove=e=>{
        const old=touches.get(e.pointerId);if(!old)return;
        touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(touches.size===2){const d=distance();if(gap>1)magnify(d/gap);gap=d;}else orbit(-(e.clientX-old.x)*.012,(e.clientY-old.y)*.008);
      };
      canvas.onlostpointercapture=canvas.onpointercancel=canvas.onpointerup=e=>touches.delete(e.pointerId);
      canvas.addEventListener("wheel",e=>{e.preventDefault();magnify(Math.exp(-e.deltaY*.0015));},{passive:false});
    }
    const observer=new ResizeObserver(invalidate);observer.observe(host);render();
    function dispose(){
      observer.disconnect();if(frame!==null)cancelAnimationFrame(frame);
      const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});
      for(const g of geos)if(g!==boxGeo&&g!==roundGeo&&g!==leafGeo)g.dispose();
      for(const mat of mats){if(mat.map)mat.map.dispose();mat.dispose();}
      renderer.dispose();renderer.forceContextLoss();host.replaceChildren();
    }
    return {orbit,magnify,render,spread,dispose,reset(){focusPoint=null;yaw=preset[0];pitch=preset[1];zoom=1;invalidate();},
      focus([x,y,z,scale]){focusPoint=new T.Vector3(x,y,z);yaw=.16;pitch=.24;zoom=scale;render();},
      setAngle(a,e){if(focusPoint)zoom=1;focusPoint=null;yaw=a;pitch=e;render();},snapshot(){render();return renderer.domElement.toDataURL();}};
  }
  return {view, study:key=>Object.hasOwn(studies,key), detailed:key=>Object.hasOwn(makers,key)};
})();
