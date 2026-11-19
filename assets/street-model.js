/* Convert each clipped OpenStreetMap feature into a local, navigable scale model. */
function buildStreetModel(m, id, T) {
  const features = neighbourhoods[id];
  m.base(20.2,20.2);
  function surface(points, y, height, color) {
    const shape = new T.Shape(points.map(([x,z]) => new T.Vector2(x,-z)));
    const geo = height ? new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false})
                       : new T.ShapeGeometry(shape);
    geo.rotateX(-Math.PI/2);
    const mesh = new T.Mesh(geo,new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:.94}));
    mesh.position.y=y; m.group.add(mesh);
  }
  function inside(x,z,poly){
    let hit=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const [a,b]=poly[i],[c,d]=poly[j];
      if((b>z)!==(d>z) && x<(c-a)*(z-b)/(d-b)+a)hit=!hit;
    }
    return hit;
  }
  const buildings=features.filter(f=>f[0]==="b");
  for(const [i,[kind,height,points]] of features.entries()){
    if(kind==="b"){
      surface(points,.105,height,["#c69d80","#d6c4a3","#c9b19c","#d6b69c"][i%4]);
      for(let j=0;j<points.length;j++){
        const a=points[j],b=points[(j+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
        if(len<.76)continue;const n=Math.min(8,Math.floor(len/.45)),rows=Math.min(6,Math.floor(height/.39));
        for(let col=0;col<n;col++)for(let floor=0;floor<rows;floor++){
          const t=(col+.5)/n;m.box(a[0]+dx*t,.29+floor*height/rows,a[1]+dz*t,Math.min(.22,len/n*.47),.15,.045,"#707e7c",-Math.atan2(dz,dx));}
      }
      surface(points,height+.105,.058,["#a88977","#a7aaa0","#aa9c8c"][i%3]);
    }else if(kind==="w"||kind==="g"){
      surface(points,kind==="g"?.09:.096,0,kind==="g"?"#acb693":"#88b2b4");
      if(kind==="g")for(let x=-9.1;x<10;x+=2.2)for(let z=-9.2;z<10;z+=2.7){
        const dx=x+.35*Math.cos(z+i), dz=z+.48*Math.sin(x+i);
        if(inside(dx,dz,points)&&!buildings.some(f=>inside(dx,dz,f[2])))m.tree(dx,dz,1.1+.22*Math.sin(x+z));
      }
    }else{
      for(let j=1;j<points.length;j++){
        const [x,z]=points[j-1],[xx,zz]=points[j],len=Math.hypot(xx-x,zz-z);
        if(len<.02)continue;
        const rail=kind==="r",w=rail?.18:height;
        m.box((x+xx)/2,rail?.159:.125,(z+zz)/2,len+.025,.035,w,rail?"#77786e":w>.48?"#aca99b":"#e9ddc2",-Math.atan2(zz-z,xx-x));
      }
    }
  }
}
