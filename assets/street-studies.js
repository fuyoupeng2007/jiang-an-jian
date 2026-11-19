/* Composed walking views. Landmarks on the same street are brought together for legibility. */
function makeStreetStudies({T,hip,building}){
  const cream="#e5d6b9", brick="#a85a46", tile="#5d6660", wood="#845d44", iron="#455453", glass="#729593", water="#83afae", moss="#84986c", gold="#d6a44e";
  function kit(m){
    const box=(...a)=>m.box(...a);
    function slab(x,z,w,d,color,y=.13){box(x,y,z,w,.11,d,color);}
    function sign(text,x,y,z,w,h,bg=iron,ink="#fff0cf"){m.plaque(text,x,y,z,w,h,ink,bg);}
    function roof(x,y,z,w,d,h,col=tile){hip(m,x,y,z,w,d,h,col);}
    function house(x,z,w,d,f,wall=brick,cap=tile){building(m,x,z,w,d,f,wall,cap);}
    function ell(x,y,z,rx,ry,rz,col){
      const g=new T.SphereGeometry(1,18,12);m.part(g,x,y,z,rx,ry,rz,col);
    }
    function path(points,width,color,y=.17,height=.09){
      for(let i=1;i<points.length;i++){
        const [a,b]=points[i-1],[c,d]=points[i];
        box((a+c)/2,y,(b+d)/2,Math.hypot(c-a,d-b)+.04,height,width,color,-Math.atan2(d-b,c-a));
      }
    }
    function fence(x,z,w,colour=iron,y=.20){
      for(let i=0;i<=Math.ceil(w/1.5);i++)box(x-w/2+i*w/Math.ceil(w/1.5),y+.49,z,.11,.97,.11,colour);
      box(x,y+.91,z,w,.095,.12,colour);box(x,y+.49,z,w,.07,.09,colour);
    }
    function stairs(x,z,w,n,col=cream){for(let i=0;i<n;i++)box(x,.13+i*.10,z-i*.34,w,.15+i*.19,.40,col);}
    function trees(points,h=2.7,col){for(const [x,z] of points){if(!col)m.tree(x,z,h);else{m.cyl(x,h*.43,z,.19,h*.85,wood);ell(x,h*.80,z,h*.37,h*.31,h*.40,col);ell(x-h*.18,h*.74,z+.27,h*.28,h*.21,h*.26,col);}}}
    function lamps(points){for(const [x,z] of points){m.cyl(x,1.15,z,.13,2.13,iron);box(x,2.35,z,.34,.44,.34,"#f2d39b");roof(x,2.58,z,.53,.53,.22,iron);}}
    function portico(x,z,w,h,count=6){for(let i=0;i<count;i++){const xx=x-w/2+i*w/(count-1);m.cyl(xx,h/2,z,.35,h,cream);box(xx,h-.14,z,.60,.25,.56,cream);}box(x,h+.09,z,w+.82,.32,.96,cream);}
    function arch(x,z,r,h,col,thick=.38,depth=.7){
      for(const side of [-1,1])box(x+side*(r+thick/2),h/2,z,thick,h,depth,col);
      const v=[],faces=[];
      for(let j=0;j<=20;j++){
        const a=Math.PI*j/20;for(const zz of [z-depth/2,z+depth/2])for(const rr of [r,r+thick])v.push([x+rr*Math.cos(a),h+rr*Math.sin(a),zz]);
        if(j){const i=j*4;for(const [a,b] of [[0,1],[1,3],[3,2],[2,0]])faces.push(i-4+a,i-4+b,i+b,i-4+a,i+b,i+a);}
      }m.mesh(v,faces,col);
    }
    function pagoda(x,z,w,levels,roofColour=tile,wall=brick){
      const step=w*.30;for(let i=0;i<levels;i++){
        const ww=w*(1-i*.105),y=.28+i*step;
        box(x,y+step*.39,z,ww*.73,step*.78,ww*.67,wall);roof(x,y+step*.70,z,ww,ww*.90,step*.42,roofColour);
        for(const s of [-1,1]){box(x+s*ww*.24,y+step*.40,z+ww*.339,.13,step*.57,.12,cream);}
      }m.rod([x,.26+levels*step,z],[x,levels*step+.9,z],.13,roofColour);
    }
    function pavilion(x,z,w,h,col=tile){
      box(x,.26,z,w+.27,.38,w*.76,cream);for(const s of [-1,1])for(const v of [-1,1])m.cyl(x+s*w*.34,h/2+.27,z+v*w*.25,.21,h,brick);
      roof(x,h+.21,z,w*1.12,w*.86,h*.49,col);
    }
    function arcade(x,z,n,wall=brick){for(let i=0;i<n;i++)arch(x+(i-(n-1)/2)*1.69,z,.63,1.12,wall,.24,.7);}
    function terrace(x,z,w,d,f,wall=cream){building(m,x,z,w,d,f,wall,tile,true);}
    function bench(x,z){box(x,.62,z,1.92,.16,.58,wood);for(const s of [-1,1])box(x+s*.64,.38,z,.17,.47,.34,iron);}
    function banner(text,x,z,w=4){box(x,1.05,z,w,.99,.23,wood);sign(text,x,1.07,z+.13,w*.94,.78,wood);for(const s of [-1,1])box(x+s*w*.40,.55,z,.13,.9,.12,iron);}
    function boat(x,z,w=3.7,ferry=false){
      const l=w*.28; m.mesh([[x-w*.62,.32,z],[x-w*.37,.27,z-l],[x+w*.45,.27,z-l],[x+w*.56,.29,z],[x+w*.43,.27,z+l],[x-w*.38,.27,z+l],[x,.10,z]],[0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6,0,5,4,0,4,2,0,2,1,2,4,3],iron);
      if(ferry){box(x,.64,z,w*.78,.62,l*1.53,cream);box(x,.74,z,w*.69,.29,l*1.57,glass);box(x,1.04,z,w*.82,.14,l*1.83,"#a85a49");}
      else{box(x,.33,z,w*.76,.15,l*1.54,"#938779");box(x-w*.28,.54,z,w*.19,.32,l*.97,cream);box(x-w*.28,.74,z,w*.23,.11,l*1.10,tile);for(const t of [-.07,.17])box(x+w*t,.46,z,w*.19,.17,l*1.11,"#786f61");}
    }
    function lantern(x,y,z){ell(x,y,z,.22,.29,.22,"#c34d39");box(x,y-.37,z,.05,.18,.05,gold);}
    function statue(x,z,size=1){
      const c="#66756c";box(x,.42,z,1.4*size,.66,1.28*size,"#999280");
      for(const s of [-1,1])m.rod([x+s*.15*size,.7,z],[x+s*.12*size,.7+.9*size,z],.20*size,c);
      ell(x,.72+1.14*size,z,.33*size,.49*size,.22*size,c);ell(x,.72+1.82*size,z,.20*size,.24*size,.20*size,c);
      m.rod([x-.24*size,.72+1.44*size,z],[x-.45*size,.72+.89*size,z+.1],.17*size,c);
      m.rod([x+.24*size,.72+1.44*size,z],[x+.43*size,.72+1.13*size,z+.21],.17*size,c);
    }
    function shore(z=1){slab(0,0,16,11.7,water);slab(0,(z-5.8)/2,16,z+5.8,"#c6c9ab",.21);path([[-8,z],[8,z]],.81,cream,.28);fence(0,z+.33,15.7,iron,.25);}
    function pool(x,z,w,d){slab(x,z,w+.32,d+.32,"#9b9a86",.17);slab(x,z,w,d,water,.245);}
    function blossom(x,z,w,col){trees([[x,z]],w,col);}
    function lotus(x,z){for(let j=0;j<9;j++){let a=j*2.4,r=.37*Math.sqrt(j);ell(x+Math.cos(a)*r,.32,z+Math.sin(a)*r,.31,.055,.26,"#7d9e72");}ell(x,.44,z,.16,.16,.13,"#dd9c9b");}
    return {m,box,sign,slab,path,stairs,trees,lamps,portico,arch,pagoda,pavilion,arcade,terrace,roof,house,bench,banner,boat,lantern,statue,shore,pool,blossom,lotus,fence,ell};
  }
  function guanggu(s){
    const {m,box,sign,slab,arch,lantern}=s;
    slab(0,1,15.4,9.4,"#c7a784");const x=-2.45,z=-.65;
    function goldEaves(y,w,d){
      const hx=w/2,hz=d/2, ridge=Math.max(.55,hx-hz*.73);
      const sides=[[[-hx,-hz],[hx,-hz],[-ridge,0],[ridge,0]],[[hx,-hz],[hx,hz],[ridge,0],[ridge,0]],[[hx,hz],[-hx,hz],[ridge,0],[-ridge,0]],[[-hx,hz],[-hx,-hz],[-ridge,0],[-ridge,0]]];
      for(const [a,b,c,e] of sides){
        const verts=[],indices=[];
        for(let j=0;j<=16;j++){
          const t=j/16,curve=.41*Math.pow(Math.abs(2*t-1),4);
          const ex=a[0]+t*(b[0]-a[0]),ez=a[1]+t*(b[1]-a[1]),rx=c[0]+t*(e[0]-c[0]),rz=c[1]+t*(e[1]-c[1]);
          for(let r=0;r<4;r++){const u=r/3;verts.push([x+ex*(1-u)+rx*u,y+curve*(1-u)*(1-u)+.84*u*u,z+ez*(1-u)+rz*u]);}
          const n=j*4;if(!j)continue;
          for(let r=0;r<3;r++)indices.push(n+r-4,n+r,n+r+1,n+r-4,n+r+1,n+r-3);
          m.rod(verts[n-4],verts[n],.14,"#f6cf74");
          if(j%2===0)for(let r=1;r<=3;r++)m.rod(verts[n+r-1],verts[n+r],.055,"#efbc65");
        }
        m.mesh(verts,indices,"#c58d37");
      }
      m.rod([x-ridge,y+.85,z],[x+ridge,y+.85,z],.16,"#eac16d");
    }
    for(let i=0;i<4;i++){
      const w=7.4-i*.78,d=5.2-i*.49,y=.26+i*1.46;
      box(x,y+.63,z,w,1.27,d,"#ad823d");box(x,y+.74,z+d*.505,w*.93,.91,.12,"#654a31");
      for(let j=0;j<6;j++){const xx=x+w*(j/5-.5)*.91;box(xx,y+.74,z+d*.527,.14,1.12,.19,"#f6ca68");}
      box(x,y+.21,z+d*.55,w,.20,.52,gold);
      for(let j=0;j<=14;j++)box(x+w*(j/14-.5)*.97,y+.43,z+d*.58,.083,.48,.10,"#efc46a");
      box(x,y+.65,z+d*.58,w,.095,.12,"#f2c779");goldEaves(y+1.16,w+.89,d+.80);
      for(const a of [-1,1])for(const b of [-1,1]){
        const ex=x+a*(w+.89)/2,ez=z+b*(d+.80)/2;lantern(ex-a*.28,y+.91,ez-b*.24);
      }
    }
    box(x,2.05,2.42,5.63,.98,.25,"#7a3c29");sign("中国黄金",x,2.07,2.56,5.55,.93,"#7a3c29","#ffdc80");
    s.house(4.2,-2.45,4.9,3.2,2,"#cb986f","#a95f40");arch(3.32,.1,1.14,1.67,"#bf7955",.51,1.03);arch(5.89,.1,.78,1.64,"#be7955",.44,1.03);
    s.lamps([[2.15,3.72],[6.48,3.7]]);s.banner("光谷步行街",3.85,4.30,4.55);
  }
  function courtyard(s){
    s.slab(0,0,15.7,11.45,"#b9b5a2");
    s.house(.8,-2.90,8.5,3.88,2,"#9c5747","#687068");s.house(-5.08,-.50,3.7,4.1,2,"#a66450","#616b65");
    s.box(.87,2.05,-.74,2.12,2.12,.48,"#c7bba9");s.box(.87,1.34,-.45,1.21,1.86,.13,iron);
    s.roof(.87,3.13,-.65,2.72,1.06,.62,tile);s.sign("明义楼",.87,2.73,-.395,1.52,.53,"#644a39");
    for(const x of [-.08,1.82])s.box(x,1.43,-.30,.24,2.53,.29,"#ab6e56");
    for(let j=0;j<5;j++)s.box(4.74,.22+j*.11,2.6-j*.46,4.00,.18+j*.19,.56,j%2?"#b0a893":"#c6beaa");
    s.slab(-.60,2.22,5.5,1.18,"#747976",.24);s.slab(-.60,2.22,5.25,.99,"#8daca7",.31);
    s.bench(-3.7,3.52);s.bench(1.1,3.53);
    for(const [x,z] of [[-6.3,2.3],[5.8,-.75]]){s.box(x,.37,z,1.7,.52,1.4,"#989587");s.trees([[x,z]],4.6,"#83956d");}
    s.box(-1.1,.99,4.79,6.25,1.4,.37,"#8b533d");s.sign("梧桐语问学中心",-1.1,1.02,4.99,5.98,1.12,"#86503b");
  }
  function redHall(s,wide){
    const z=wide?-3:-1.5;
    s.house(0,z,wide?10.8:13,3.7,2,"#a8493e","#845e4f");s.arcade(0,z+1.97,5,"#eed1ad");
    s.box(0,3.61,z,2.82,1.52,2.61,brick);s.roof(0,4.38,z,3.37,3.02,1.40,"#775747");
    s.stairs(0,z+3.64,5.30,4);s.statue(wide?-1.2:3.6,wide?1.2:3.6,wide?1.12:.74);
    if(wide){s.box(4.7,.57,2.8,1.98,.82,1.62,cream);s.box(4.7,1.83,2.8,1.08,2.0,.82,"#a49e89");s.sign("拜将台",4.7,1.92,3.22,.96,.68,"#a49e89",iron);}
    s.trees([[-6,2.9],[6,-2.7]],2.7);
  }
  function corner(s,avenue){
    const cx=avenue?-.9:0;
    s.terrace(cx-.5,-1.5,9.5,3.15,3,"#a35241");s.terrace(cx+2.65,.65,3.25,5.5,3,"#a35241");
    const radius=1.62,z=3.30;
    s.m.cyl(cx+2.65,2.26,z,radius*2,4.5,brick);
    for(let l=0;l<3;l++){s.m.cyl(cx+2.65,(l+1)*1.47,z,3.37,.12,"#d09d7b");
      for(let j=0;j<7;j++){let a=-1.10+j*.36;s.box(cx+2.65+radius*Math.sin(a),.86+l*1.46,z+radius*Math.cos(a),.43,.77,.09,iron,a);}}
    s.fence(cx-1.65,.21,5.1,"#64564b",2.95);s.lamps([[-5.9,3.5]]);
    if(avenue){s.path([[-7,4],[0,2.7],[7,5.0]],1.7,"#beb5a2");s.trees([[-6,-1],[6,2.4]],3.65);s.banner("黎黄陂路",-3.5,4.43,3.7);}
  }
  function market(s,{shops,colour,layout,food}){
    const offsets=layout==="lane"?[[-4.7,-2],[-.2,-3.1],[4.55,-1.65]]:[[-4.95,-1.5],[0,-1.5],[4.95,-1.5]];
    shops.forEach((text,i)=>{
      const [x,z]=offsets[i],w=4.52,bg=[colour,wood,iron][i];s.house(x,z,w,3.14,i===1&&layout==="lane"?2:1,i===1?"#c5a68b":"#d4bb9e");
      s.box(x,1.40,z+1.67,w*.91,.75,.32,bg);s.sign(text,x,1.43,z+1.85,w*.86,.65,bg);
      s.box(x,1.03,z+2.02,w*.90,.12,.64,i===1?"#bb784e":colour);
      s.box(x,.52,z+2.42,w*.76,.71,.70,wood);
      if(food==="noodle"||food==="breakfast"){for(let j=0;j<4;j++){s.m.cyl(x+(j-1.5)*.54,1,z+2.48,.42,.14,cream);s.m.cyl(x+(j-1.5)*.54,1.08,z+2.48,.32,.04,"#b58a4b");}}
      if(food==="grill"){for(let j=0;j<7;j++){s.m.rod([x-1+j*.32,.97,z+2.1],[x-.86+j*.32,.97,z+2.85],.055,cream);s.ell(x-.95+j*.32,1,z+2.55,.09,.10,.26,"#a35a37");}}
      if(food==="cloth"){for(let j=0;j<4;j++){s.box(x-1+j*.57,1.05,z+2.39,.49,.23,.57,["#af6450","#778c92","#cba459","#9f9579"][j]);}}
    });
    if(layout==="lantern")for(let i=0;i<7;i++)s.lantern(-6+i*2,2.13,.30);
    else if(layout==="lane")s.lamps([[-5.65,2.52],[5.82,3.62]]);
    else {s.bench(-3.25,3.45);s.bench(3.25,3.45);}
  }
  function workshop(s,garden){
    s.terrace(0,-1.45,12.4,4.9,2,brick);
    for(let i=0;i<4;i++){
      const x=-6.2+i*3.1;
      s.m.mesh([[x,3.02,-4],[x+3.1,3.02,-4],[x+3.1,4.14,-4],[x,3.02,1.15],[x+3.1,3.02,1.15],[x+3.1,4.14,1.15]],[0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4],tile);
      s.box(x+1.62,1.80,1.11,2.21,1.77,.10,glass);s.box(x+1.62,1.80,1.20,.09,1.77,.08,iron);
    }
    if(garden){s.path([[-5.8,3.8],[-1.5,2.6],[3.9,3.35]],.87,wood);s.trees([[-4.64,2.3],[3.5,2.6]],3.05);s.bench(.2,3.4);}
    else {s.m.cyl(-5.15,3.16,-2.84,1.02,6.34,"#9c604e");for(let i=0;i<4;i++)s.m.cyl(-5.15,3.86+i*.70,-2.84,1.08,.12,iron);s.m.rod([4.9,.36,3.2],[4.9,2.0,3.2],.28,tile);s.m.rod([4.9,2.0,3.2],[1.4,2.0,3.2],.28,tile);}
  }
  function station(s,elevated){
    const y=elevated?2.29:.31;
    for(let i=0;i<13;i++)s.box(-6+i,.20,-.25,.32,.12,2.45,wood);
    for(const z of [-1.05,.51])s.box(0,y,z,14.8,.13,.12,iron);
    if(elevated){s.box(0,2.10,-.25,15.5,.50,3.8,"#b9b5a4");for(let i=-1;i<=1;i++)s.box(i*5.4,1.05,-.25,.63,2.1,1.48,"#b1aca1");}
    const train=elevated?"#a3b9b5":"#436450";
    for(let i=0;i<2;i++){const x=-2.78+i*5.16;s.box(x,y+.72,-.27,4.94,1.15,1.71,train);s.box(x,y+1.34,-.27,5.04,.16,1.86,tile);
      for(let j=0;j<7;j++)s.box(x-2.0+j*.66,y+.82,.61,.44,.48,.055,"#c4d4cb");
      for(const a of [-1,1])s.m.cyl(x+a*1.63,y+.20,-.27,.70,.28,iron);
    }
    if(elevated){
      for(let i=0;i<9;i++){const x=-6.7+i*1.68;const v=[];for(let j=0;j<12;j++){const a=j*Math.PI/11;v.push([x,3.25+1.64*Math.sin(a),-.22+2.02*Math.cos(a)]);if(j)s.m.rod(v[j-1],v[j],.12,"#e4dfcb");}}
      s.box(0,4.89,-.22,13.7,.10,.79,glass);s.stairs(3.7,4.55,2.3,9);s.sign("循礼门",-.7,2.21,1.68,3.60,.67,iron);
    }else{s.pool(4.92,3.4,4.8,3);s.box(-5.4,1.66,2.5,.15,3.03,.15,iron);s.box(-5.4,2.91,2.5,.62,.88,.28,iron);s.ell(-5.4,3.08,2.69,.15,.15,.09,"#bb453b");}
  }
  function gates(s,label,three=false){
    for(const x of three?[-4.9,0,4.9]:[-4.7,4.7]){
      s.box(x,.38,0,1.53,.48,1.56,cream);s.box(x,2.0,0,1.14,3.14,1.23,"#ad9b81");s.box(x,3.64,0,1.55,.28,1.54,cream);
    }
    s.banner(label,0,3.52,5.12);
  }
  function historicBank(s,short){
    const w=short?6.15:11.60;s.terrace(short?-2:0,-1.45,w,4.2,3,"#b4afa1");const x=short?-2:0;
    for(let i=-2;i<=2;i++){let height=5.29-Math.abs(i)*.44;s.box(x+i*w*.096,height/2,.81,w*.065,height,.42,cream);}
    s.stairs(x,2.66,w*.70,4);s.lamps([[-5,3.1],[5,3.1]]);
    if(short){const oct=new T.CylinderGeometry(1,1,1,8);s.m.part(oct,4.2,2.78,-2.75,1.52,5.32,1.52,brick);
      for(let j=0;j<6;j++){s.m.part(oct,4.2,1+j*.88,-2.75,1.58,.11,1.58,cream);for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;s.box(4.2+1.42*Math.sin(a),.67+j*.88,-2.75+1.42*Math.cos(a),.36,.49,.09,iron,a);}}
      s.m.part(oct,4.2,5.48,-2.75,1.57,.34,1.57,tile);s.box(5.28,4.96,-2.03,.73,2.24,.83,brick);s.roof(5.28,6.11,-2.03,1.05,1.04,.54,tile);s.banner("江汉路",2.6,3.69,3.84);}
  }
  function waterGarden(s,id){
    s.shore(id==="moonlake"?-1.35:.80);
    if(id==="xibei"){
      for(const [x,h] of [[-5,4.10],[-1.6,3.55],[1.5,5.1],[4.8,4.0]]){s.box(x,h/2,-4.9,1.63,h,1.25,"#98a5a2");for(let j=.6;j<h;j+=.56)s.box(x,j,-4.22,1.41,.14,.06,glass);}
      s.trees([[-5,-.65],[-2.4,-.7],[.4,-.6],[3,-.67],[5.7,-.66]],2.65,"#d8a3ab");
    }else if(id==="qspark"){s.trees([[-5,-2],[-3.6,-3.5],[-2,-1],[.6,-2.5],[3,-3.2],[4,-.65]],3.6,"#b76547");s.banner("丽湖",4.86,.31,2.51);}
    else if(id==="moonlake"){s.lotus(-3.6,1.2);s.lotus(.25,2.6);s.lotus(3.25,.5);s.path([[-6,-1.1],[-2,-.2],[1,1.7],[5.4,2.42]],.72,wood,.38);s.trees([[-5,-3],[3.9,-3.6]],3.2);}
    else if(id==="sha"){s.pavilion(-3,-1.52,4.24,2.05);s.lotus(0,2.9);s.lotus(3.5,1.65);s.path([[5.4,-3.2],[5,.6],[3.8,2.0]],1,wood,.36);}
    else if(id==="tingtao"){s.pavilion(-.7,-2.7,4.68,2.75);s.roof(-.7,4.05,-2.7,3.04,2.80,.93);s.statue(-.65,.20,.91);s.trees([[-5.8,-1.1],[5,-2.1]],3.7);}
    else if(id==="zsp"){s.slab(0,1,7.4,4.8,moss,.32);s.terrace(.26,.17,4.36,2.68,2,"#e3ddc9");s.slab(.46,2.06,4.75,1.42,wood,.40);s.fence(.46,2.81,4.75,cream,.40);s.path([[-6,-1.24],[-4.5,.6],[-2.1,1.14]],.93,cream,.42);s.trees([[-4.9,-2.65],[4.8,-2.31]],3.5);}
    else if(id==="goose"){s.pavilion(2.9,-.95,3.75,2.38);s.box(2.9,1.17,-.88,1.19,1.97,.42,"#777970");s.sign("鹅",2.9,1.28,-.66,1.03,1.28,"#777970",cream);s.trees([[-5,-2.6],[-3,.12]],3.92);s.lotus(-3,2.33);}
  }
  function foodStreet(s,key){
    const configs={
      hubu:[["面窝","豆皮","热干面"],"#994e39","lane","breakfast"],
      cailin:[["拌面","蔡林记","过早"],"#804335","row","noodle"],
      shanhai:[["糯米包油条","面窝","豆皮"],"#6b8773","lane","breakfast"],
      dacheng:[["面窝","热干面","豆皮"],"#ae7c42","row","breakfast"],
      enshi:[["烧烤","恩施街","卤味"],"#77657c","lantern","grill"],
      xuesong:[["夜宵","小龙虾","烧烤"],"#ad4d37","lane","grill"],
      hanzheng:[["布匹","汉正街","服装"],"#526f80","lane","cloth"],
      jiqing:[["汉味小吃","吉庆街","民俗曲艺"],"#985039","lantern","noodle"]
    };
    const [shops,colour,layout,food]=configs[key];market(s,{shops,colour,layout,food});
    if(key==="hubu"){for(const x of [-3.0,3.0]){s.box(x,1.87,3.42,.91,3.57,.75,"#e6dfc9");s.lantern(x*.81,2.29,3.83);}s.box(0,3.28,3.42,6.8,.99,.77,"#e6dfc9");s.roof(0,3.80,3.42,7.57,1.37,.58,tile);s.sign("户部巷",0,3.27,3.83,3.38,.88,wood);}
    if(key==="cailin"){s.m.cyl(-.2,.57,3.44,2.40,.77,cream);s.m.cyl(-.2,1.01,3.44,2.20,.13,"#b98751");for(let j=0;j<8;j++)s.m.rod([-.96+j*.23,1.14,3.1],[-.75+j*.22,1.16,3.76],.088,"#d6aa58");for(const x of [.70,.93])s.m.rod([x,1.06,3.57],[x+.88,2.57,3.57],.10,wood);}
    if(key==="dacheng"){s.m.cyl(0,.40,3.14,2.07,.53,iron);for(let j=0;j<4;j++){let a=j*Math.PI/2;const ring=new T.TorusGeometry(.29,.11,8,20);s.m.part(ring,.53*Math.cos(a),.75,3.14+.53*Math.sin(a),1,1,1,gold,Math.PI/2);}}
    if(key==="shanhai"){s.banner("山海关路",-3.9,4.12,4.0);for(const x of [1.4,2.7])for(const z of [2.95,3.85]){s.m.cyl(x,.42,z,.71,.64,wood);s.m.cyl(x,.80,z,.89,.21,"#ae8d64");}}
    if(key==="hanzheng"){for(let j=0;j<6;j++)s.box(-4.2+(j%3)*.85,.44+Math.floor(j/3)*.62,3.6,.8,.58,.92,"#b1936e");s.banner("汉正街",2.49,3.85,4.62);}
    if(key==="jiqing"){s.statue(-1.59,3.18,.88);s.statue(1.31,2.87,.84);s.m.rod([1.56,1.72,3.13],[1.55,3.01,3.08],.065,wood);s.ell(1.55,1.51,3.20,.22,.19,.18,wood);}
    if(key==="enshi"){for(let j=0;j<5;j++)s.arch(-5+j*2.45,3.32,.91,1.70,["#b77d58","#6e969b","#a9819c"][j%3],.085,.10);}
    if(key==="xuesong"){s.bench(3.36,3.48);s.m.cyl(2.47,.72,2.64,1.87,.14,wood);for(let i=0;i<6;i++){const a=i*Math.PI/3;s.ell(2.47+.5*Math.cos(a),.9,2.64+.52*Math.sin(a),.18,.14,.27,"#b4412c");}}
  }
  function triangle(s,x,y,z,w,h,col){s.m.mesh([[x-w/2,y,z],[x+w/2,y,z],[x,y+h,z],[x,y,z-.65]],[0,1,2,0,2,3,3,2,1,0,3,1],col);}
  function dock(s,kind){
    s.shore(-.3);
    if(kind==="zhpier"){
      s.box(-1,1.11,-2.34,8.6,1.77,2.32,glass);
      s.m.mesh([[-6.4,3.22,-3.72],[-1,2.19,-4.72],[5,3.19,-3.4],[3.2,2.11,-.61],[-.9,2.06,-.22],[-5,2.18,-.68]],[0,1,4,0,4,5,1,2,4,2,3,4],cream);
      s.path([[-3,-.2],[-2.2,1.88],[-1.1,2.55]],1.02,tile,.41);s.boat(1.25,3.71,6.8,true);
    }else if(kind==="yuehan"){
      for(const x of [-4.5,3.15]){s.box(x,1.80,-1.9,1.39,3.32,1.57,"#b4ae98");s.box(x,3.52,-1.9,1.61,.34,1.82,cream);}
      for(let j=0;j<8;j++)s.box(-3.28+j*.77,.36,-2, .32,.13,2.10,wood);
      for(const z of [-2.62,-1.38])s.box(-.62,.45,z,6.19,.095,.12,iron);
      s.boat(3.2,3.42,5.41,true);s.banner("粤汉码头",-4.5,.91,3.75);
    }else if(kind==="qsbank"){
      const x=-2.5,z=-1.62;for(const a of [-1,1])for(const b of [-1,1])s.m.rod([x+a*1.35,.25,z+b*1.12],[x+a*.53,3.3,z+b*.51],.21,iron);
      s.box(x,3.30,z,2.31,.52,1.83,wood);s.box(x+.33,3.94,z,1.4,1,1.42,"#b18b4f");
      for(const b of [-.35,.35]){s.m.rod([x,3.42,z+b],[3.32,6.71,z+b],.17,"#91754b");s.m.rod([x,4.55,z+b],[3.32,6.71,z+b],.16,"#91754b");for(let j=1;j<6;j++)s.m.rod([x+j,3.42+j*.57,z+b],[x+j-.55,4.55+(j-.55)*.37,z+b],.09,iron);}
      s.m.rod([3.23,6.71,z],[3.23,2.24,z],.060,iron);s.boat(-.35,3.58,4.92);
    }else if(kind==="longwang"||kind==="nanan"){
      s.slab(0,0,15.9,11.65,water,.45);s.m.mesh([[-8,.53,-5.7],[8,.53,-5.7],[1.2,.53,2.54],[-3,.53,3.01]],[0,1,2,0,2,3],kind==="nanan"?moss:"#c4b69d");
      s.m.mesh([[-2,.51,5.71],[2.52,.51,.43],[8,.51,-5.52],[8,.51,5.71]],[0,1,2,0,2,3],"#719c9d");
      s.path([[-6,-4],[-3.2,-1],[-2.1,1.86],[.74,1.72],[5,-3.4]],.63,cream,.62);
      if(kind==="nanan")s.trees([[-5,-3.4],[-2.6,-2.12],[1.25,-3.32],[1.42,-1.27]],3.45);
      else{s.box(-2.2,1.22,-1.73,5.05,1.38,.56,"#a99076");s.sign("龙王庙",-2.2,1.38,-1.43,3.14,.78,wood);s.fence(-.62,1.43,3.73,iron,.54);}
      s.boat(kind==="nanan"?4.7:-4.55,3.72,3.58,true);
    }else if(kind==="hybank"){
      for(const x of [-5,4]){s.box(x,2.31,-3.65,.36,4.41,.36,"#c46e4c");for(const side of [-1,1])for(let j=1;j<=3;j++)s.m.rod([x,4.02+j*.12,-3.65],[x+side*(.62+j*.64),2.19,-3.65],.065,cream);}
      s.box(0,2.05,-3.65,15.2,.26,.74,tile);s.trees([[-5.4,-.9],[-2.2,-1.43]],2.30);s.bench(3.92,-1.2);
    }else if(kind==="wuchangbank"){
      for(let j=0;j<5;j++)s.box(0,.31+j*.14,1.68-j*.48,14.4,.25+j*.21,.55,"#c3b9a6");
      s.trees([[-4.6,-3],[-2.0,-3],[3.4,-2.43]],3);s.boat(-.2,4.17,5.11,true);
    }else {gates(s,"汉口江滩");s.stairs(0,2.29,6.05,4);s.trees([[-5,-3.4],[5,-3.4]],3.06);}
  }
  function atrium(s){
    for(let i=0;i<4;i++){const x=-5.6+i*3.7;for(const z of [-2.2,.12]){s.box(x,1.71,z,.71,3.06,.71,"#bfc5c0");s.box(x,2.98,z,1.12,.33,1.12,"#d1d1c9");}}s.box(0,3.34,-1.08,14,.19,3.79,"#d3d4ce");
    for(const z of [-1.92,1.45])s.box(0,2.45,z,14.3,.40,.32,"#ae5276");
    s.stairs(2.71,4.62,3.43,9);s.sign("积玉桥  ·  2 / 5",-.9,2.45,1.63,4.32,.65,"#823e62");
  }
  function conifer(s,x,z,h){
    s.m.cyl(x,h*.42,z,.17,h*.8,wood);
    for(let i=0;i<3;i++)s.m.part(new T.ConeGeometry(1,1,9),x,h*(.47+i*.19),z,h*(.23-i*.035),h*.56,h*(.23-i*.035),["#577a65","#678568","#819571"][i]);
  }
  function shelf(s,x,z,w,d,h,col){
    let last=null;
    for(let i=0;i<=12;i++){
      const t=i/12,ring=[];
      for(let j=0;j<48;j++){
        const a=2*Math.PI*j/48,ca=Math.cos(a),sa=Math.sin(a);
        const spread=1-t*.74,curve=1+.15*Math.cos(3*a+.48)-.13*Math.sin(2*a-.8);
        ring.push([x+w*.48*spread*curve*ca+t*.88,.34+h*t*(.88+.12*sa),z+d*.49*spread*curve*sa-.42*t]);
      }
      if(last){const verts=[],indices=[];
        for(let j=0;j<ring.length;j++){const p=last[j],q=ring[j];verts.push(p,[p[0],p[1]+.095,p[2]],q);}
        for(let j=0;j<ring.length;j++){const a=j*3,b=(a+3)%verts.length;indices.push(a,b,a+1,b,b+1,a+1,a+1,b+1,a+2,b+1,b+2,a+2);}
        s.m.mesh(verts,indices,i%3===0?col:"#d6d7c9");for(let j=0;j<48;j++)s.m.rod(last[j],last[(j+1)%48],.079,"#e9e7d7");
      }
      last=ring;
    }
    const crown=last.concat([[x+.85,.35+h*.87,z-.4]]),faces=[];
    for(let j=0;j<48;j++)faces.push(48,j,(j+1)%48);s.m.mesh(crown,faces,col);
  }
  const scenes={
    opticstreet:guanggu,wutong:courtyard,
    jh:s=>historicBank(s,true),siming:s=>historicBank(s,false),lhp:s=>corner(s,true),bagong:s=>corner(s,false),
    shouyi:s=>redHall(s,true),redhouse:s=>redHall(s,false),xhb:s=>station(s,true),simetang:s=>station(s,false),
    hanyangzao:s=>workshop(s,false),gardendao:s=>workshop(s,true),jiyu:atrium,
    tiandi(s){s.house(-3.65,-1.9,5.4,3.4,2,brick);s.terrace(3.84,-2.45,4.49,2.72,3,"#9caaa4");s.arch(-2.8,.25,1.21,1.42,cream);s.trees([[.27,1.24]],4.05);for(const x of [-4,3.72]){s.m.cyl(x,.76,3.26,1.56,.15,wood);s.m.cyl(x,.42,3.26,.15,.61,iron);s.bench(x,4.08);} },
    tan(s){for(let i=0;i<8;i++)s.box(-1.44,.2+i*.16,3.34-i*.85,3.5,.19+i*.28,.94,cream);s.house(-5.1,-.5,3.45,3.75,2,brick);s.house(3.87,-1.74,4.25,4.11,2,"#d8c7aa");triangle(s,3.8,2.89,.34,4.17,1.42,brick);s.sign("昙华林",3.86,2.30,.48,2.43,.71,wood);s.trees([[6,2.8]],3.2);},
    hanstreet(s){s.shore(.85);s.terrace(-2.6,-2.72,7.22,3.2,2,brick);s.arcade(-2.59,-.84,4,cream);s.m.cyl(4.77,1.94,-3.55,3.63,3.61,"#a34544");for(let i=0;i<20;i++){const a=i*Math.PI/10;s.m.rod([4.77+1.84*Math.cos(a),.23,-3.55+1.84*Math.sin(a)],[4.77+1.84*Math.cos(a+.46),3.69,-3.55+1.84*Math.sin(a+.46)],.08,"#d68169");}s.lamps([[-5,.3],[0,.3],[5,.3]]);},
    liberation(s){s.house(-1.55,-1.63,6.22,3.12,1,"#ac5843","#845247");s.box(-1.55,2.15,-1.71,2,1.32,1.78,brick);s.roof(-1.55,2.85,-1.71,2.5,2.02,.86,tile);for(let i=0;i<8;i++){const x=-4.5+(i*2.37)%8,z=1.28+(i*1.38)%3;s.ell(x,.4,z,.28,.21,.4,cream);s.ell(x+.14,.60,z+.16,.15,.17,.14,cream);}s.trees([[5,-2],[5.4,1.3],[-6,-2.7]],3.6);},
    greenway(s){s.slab(0,0,15.6,11.65,water);s.path([[-7,4.9],[-4.7,2.3],[-1.4,.78],[2.5,-.62],[7.42,-4.73]],3.3,moss,.24);s.path([[-7,4.9],[-4.7,2.3],[-1.4,.78],[2.5,-.62],[7.42,-4.73]],1.40,"#ba856b",.34);s.trees([[-4.8,1],[-.8,-.84],[4,-3.75]],2.6);s.banner("湖光序曲",-2.34,2.53,3.65);},
    sakura(s){s.pool(-2.74,2.78,7.06,3.7);s.pagoda(1.9,-1.35,4.44,5,"#6b665f","#ad6d56");s.trees([[-6,-2.8],[-4,-.5],[-2,-3.8],[5.65,1.88],[2.5,3.47]],3.05,"#e2acb2");},
    botanic(s){for(const [x,rx,h] of [[-2,4.36,3.54],[3.28,2.29,2.42]]){s.ell(x,.22,-1.39,rx,h,2.84,"#89b4ac");for(let j=-2;j<=2;j++){const t=j*.30,r=Math.sqrt(1-t*t);for(let l=1;l<=12;l++){const a=(l-1)*Math.PI/12,b=l*Math.PI/12;s.m.rod([x+rx*t,.25+h*r*Math.sin(a),-1.39+2.85*r*Math.cos(a)],[x+rx*t,.25+h*r*Math.sin(b),-1.39+2.85*r*Math.cos(b)],.080,cream);}}}for(let j=0;j<4;j++)s.slab(-4+j*2.7,3.46,2.18,1.66,["#9baf7d","#b7827e","#ddd09b","#93aa7a"][j]);},
    ccnu(s){s.house(0,-2.75,9.13,3.32,2,"#bc9c7f");s.portico(0,-.89,3.44,2.74,4);s.path([[-.2,4.6],[-.3,-1.1]],1.73,cream);s.trees([[-4.9,2.77],[-4.1,.46],[4.57,2.56],[4.74,-.72]],3.17,"#8b985f");s.banner("桂子山",2.12,4.12,3.11);},
    valley(s){const nodes=[];for(let i=0;i<=52;i++){const a=i*2*Math.PI/52;nodes.push([5.86*Math.cos(a),2.22+1.22*Math.sin(2*a)+.67*Math.cos(3*a),3.17*Math.sin(a)]);}
      for(let i=1;i<nodes.length;i++){const p=nodes[i-1],n=nodes[i];for(const off of [-.20,.20])s.m.rod([p[0]+off,p[1],p[2]],[n[0]+off,n[1],n[2]],.12,"#ad7748");if(i%2===0){s.m.rod([n[0]-.46,.24,n[2]],[n[0],n[1],n[2]],.14,wood);s.m.rod([n[0]+.46,.24,n[2]],[n[0],n[1],n[2]],.14,wood);}}s.banner("武汉欢乐谷",-.43,4.7,4.59);},
    forest(s){s.ell(-2.49,.06,-.45,5.11,1.73,4.1,moss);s.ell(3.32,.03,-2.2,3.8,1.16,2.68,"#92a37a");for(const [x,z,h] of [[-5,-2,3.75],[-3,-2.7,4.3],[-1.2,-2.12,3.60],[2.68,-2.2,3.06],[4.28,-1,3.75],[-5,1,3.69]])conifer(s,x,z,h);s.path([[-5.8,4.75],[-2.05,2.18],[2.6,1.82],[5.75,-.3]],.74,wood,.39);s.banner("吹笛景区",2.75,3.96,3.69);},
    luoyan(s){s.slab(0,0,15.9,11.65,water);const p=[[-7,-1.2],[-4.2,-1.2],[-4.2,2.0],[-.95,2.0],[-.95,-.95],[2.25,-.95],[2.25,1.72],[6.75,1.72]];s.path(p,.85,wood,.6);for(const [x,z] of p)s.box(x,.54,z,.25,.9,.25,wood);for(const [x,z] of [[-6,-3.7],[-3,-3.8],[.1,-3.7],[3.15,-3.25],[6,-2.75]])conifer(s,x,z,3.7);},
    plum(s){s.house(-1.85,-2,6.18,3.08,1,"#e6dece",tile);s.pavilion(3.34,-1.3,3.47,2.25);s.sign("一枝春",-1.85,1.29,-.38,2.20,.63,wood);for(const [x,z,c] of [[-5,1.68,"#cc7891"],[-2.26,2.72,"#d7a1a9"],[1.6,2.2,"#c08999"],[5.2,2.86,"#d5ac87"]])s.blossom(x,z,2.45,c);},
    expo(s){s.house(-4.45,-1.60,4.52,3.17,2,"#bdb9a8");s.house(3.64,-2.03,5.37,3.34,2,brick);s.arch(.06,.05,1.46,1.66,"#9e9684",.44,.85);s.roof(.07,3.68,.05,4.47,1.54,.73);s.sign("汉口里",.06,3.25,.51,2.51,.65,wood);s.lantern(-2.11,2.05,.52);s.lantern(2.29,2.05,.52);},
    hankouart(s){s.terrace(0,-1.62,11.95,4.69,3,"#b5afa0");s.portico(0,1.05,9.76,3.87,8);s.box(0,4.58,-1.57,12.35,.27,5.1,cream);s.stairs(0,3.81,9.4,5);},
    zoo(s){s.slab(0,0,15.9,11.4,moss);s.pool(3.93,-1.22,5.65,4.08);s.trees([[-6,-2.7],[-3.06,-3.74],[5.16,2.07]],3.28);
      for(const [x,z,h] of [[-1.43,1.48,1],[1.25,.77,.68]]){s.ell(x,.27+h,z,.79*h,.79*h,.64*h,cream);s.ell(x,.27+1.88*h,z+.18*h,.65*h,.59*h,.59*h,cream);for(const a of [-1,1]){s.ell(x+a*.45*h,.27+2.31*h,z+.11*h,.24*h,.25*h,.19*h,iron);s.ell(x+a*.26*h,.27+1.96*h,z+.65*h,.165*h,.18*h,.12*h,iron);s.ell(x+a*.57*h,.27+.67*h,z+.23*h,.31*h,.50*h,.32*h,iron);}}s.fence(-1,3.47,7.6,wood);},
    qintaiart(s){s.slab(0,0,15.9,11.65,water);s.slab(0,-.49,14.76,9.06,moss,.29);shelf(s,-.92,-1.02,11.22,6.8,2.97,"#a2b496");shelf(s,3.77,.98,5.41,3.63,1.76,"#afbea0");},
    dijiao(s){s.pool(-.56,1.04,13,6.46);s.pavilion(3.16,-1.63,4.17,2.31);s.box(-3.9,1.41,-1.95,5.88,2.63,.52,"#e1dece");s.roof(-3.9,2.81,-1.95,6.4,.94,.27);s.arch(-3.9,-1.54,.76,.72,tile,.14,.10);s.trees([[-5.5,1.82],[5.9,-2.31]],3.4,"#d8b2b5");},
    hzau(s){s.house(-4.15,-2.02,4.45,3.40,2,"#b69f87");s.house(4.15,-2.02,4.45,3.4,2,"#b69f87");s.house(0,-2.07,4.05,4.22,3,"#c2a58b");s.box(0,3.87,.25,4.04,.84,.28,wood);s.sign("华中农学院",0,3.87,.40,3.91,.78,wood,"#f7ce77");s.stairs(0,3.9,6.6,9);s.trees([[-6.18,.97],[6.37,1.44]],2.62);},
    xianan(s){for(const x of [-4.83,0,4.83]){s.house(x,-2.21,4.65,3.8,2,brick);s.box(x,1.24,-.22,1.93,2.30,.31,cream);s.box(x,1.17,-.03,1.39,1.96,.12,"#554c40");triangle(s,x,2.42,-.04,2.38,.53,cream);}s.path([[-7,1.97],[6.94,1.97]],1.60,"#a99e89");s.banner("咸安坊",3.81,3.62,3.33);},
    desheng(s){s.pagoda(.08,-3.5,3.6,5,gold,brick);for(const x of [-4.27,4.33]){s.house(x,-.55,3.39,3.12,1,"#a6a08b");s.house(x,2.64,3.09,2.97,1,"#bcac90");}s.path([[0,5],[.35,.13],[0,-3]],1.53,"#aca38f");},
    poem(s){s.pavilion(-1.73,.01,6.47,3.0);s.sign("搁笔亭",-1.73,2.88,2.16,2.86,.76,wood);s.box(3.90,1.67,-2.36,3.13,3.0,.48,cream);s.sign("昔人已乘黄鹤去",3.9,1.78,-2.10,2.82,.54,"#dacbb2",iron);s.trees([[-5.56,-2.47],[5.82,1.32]],3.29);},
    yuefei(s){s.box(-.95,.39,-.22,6.52,.53,3.34,"#a9a28e");s.statue(-1.68,-.12,1.56);const c="#657466";s.ell(.75,1.94,-.46,1.12,.62,.43,c);s.ell(1.63,2.56,-.46,.38,.71,.32,c);s.ell(1.96,3.02,-.40,.45,.25,.28,c);for(const x of [-.04,1.43])for(const z of [-.75,-.12])s.m.rod([x,.64,z],[x+.08,1.90,z],.15,c);s.stairs(-.83,2.70,5.78,3);s.trees([[-5.27,-2.78],[5.41,-2.48]],3.70);},
  };
  for(const k of ["hubu","cailin","shanhai","dacheng","enshi","xuesong","hanzheng","jiqing"])scenes[k]=s=>foodStreet(s,k);
  for(const k of ["zhpier","yuehan","qsbank","longwang","nanan","hybank","wuchangbank","jianghanmen"])scenes[k]=s=>dock(s,k);
  for(const k of ["xibei","qspark","moonlake","sha","tingtao","zsp","goose"])scenes[k]=s=>waterGarden(s,k);
  return Object.fromEntries(Object.entries(scenes).map(([id,draw])=>[id,m=>{m.base(16.5,12.3);draw(kit(m));
    if(id==="opticstreet"||id==="wutong")return;
    const label=places[id].n.split(" · ").pop();m.box(0,-.32,6.17,8.8,.69,.12,"#635744");m.plaque(label,0,-.31,6.24,8.54,.64,"#f9eaca","#635744");}]));
}
