export const pieces = [
  { width:2.26, depth:.87, color:[226,219,207] },
  { width:3.18, depth:1.50, color:[21,91,101] },
  { width:4.08, depth:2.13, color:[210,193,165] },
  { width:4.96, depth:2.76, color:[77,79,82] }
];

function contour(width,depth,radius,height) {
  const points=[];
  for (let corner=0;corner<4;corner++) {
    const cx=(corner===0||corner===3?1:-1)*(width/2-radius);
    const cz=(corner<2?1:-1)*(depth/2-radius);
    for (let segment=0;segment<=8;segment++) {
      const angle=(corner+segment/8)*Math.PI/2;
      points.push([cx+Math.cos(angle)*radius,height,cz+Math.sin(angle)*radius]);
    }
  }
  return points;
}

function buildMesh(piece,index) {
  const inner=pieces[index-1];
  const inset=inner?(piece.depth-inner.depth-.13)/2:.17;
  const radius=Math.max(piece.depth*.19,inset+.065);
  const shape={width:piece.width,depth:piece.depth,radius};
  const opening={width:shape.width-2*inset,depth:shape.depth-2*inset,radius:radius-inset};
  const thickness=[.34,.39,.44,.52][index];
  return buildBands(shape,opening,inner?3:2,thickness,!inner);
}

function buildBands(shape,opening,bands,thickness,solidCore=false,gap=.023) {
  const upper=thickness/2;
  const lower=-upper;
  const vertices=[];
  function quad(points,normal,level,cavity=0) {
    for (const i of [0,1,2,0,2,3]) vertices.push(...points[i],...normal,level,cavity);
  }
  function rim(outside,inside,level) {
    const bevel=Math.min(.032,thickness*.22,outside.radius*.4,opening?(shape.depth-opening.depth)/(bands*8):.032);
    const top=contour(outside.width-2*bevel,outside.depth-2*bevel,outside.radius-bevel,upper);
    const shoulder=contour(outside.width,outside.depth,outside.radius,upper-bevel);
    const base=contour(outside.width,outside.depth,outside.radius,lower);
    const holeTop=inside&&contour(inside.width+2*bevel,inside.depth+2*bevel,inside.radius+bevel,upper);
    const holeShoulder=inside&&contour(inside.width,inside.depth,inside.radius,upper-bevel);
    const holeBase=inside&&contour(inside.width,inside.depth,inside.radius,lower);
    for (let i=0;i<top.length;i++) {
      const j=(i+1)%top.length;
      const dx=shoulder[j][0]-shoulder[i][0],dz=shoulder[j][2]-shoulder[i][2];
      const length=Math.hypot(dx,dz);
      const nx=dz/length,nz=-dx/length;
      quad([shoulder[i],shoulder[j],base[j],base[i]],[nx,0,nz],level);
      quad([top[i],top[j],shoulder[j],shoulder[i]],[nx,.9,nz],level);
      if (inside) {
        quad([top[i],top[j],holeTop[j],holeTop[i]],[0,1,0],level);
        quad([base[i],base[j],holeBase[j],holeBase[i]],[0,-1,0],level);
        quad([holeTop[i],holeTop[j],holeShoulder[j],holeShoulder[i]],[-nx,.9,-nz],level,.48);
        quad([holeShoulder[i],holeShoulder[j],holeBase[j],holeBase[i]],[-nx,0,-nz],level,1);
      } else {
        vertices.push(0,upper,0,0,1,0,level,0,...top[i],0,1,0,level,0,...top[j],0,1,0,level,0);
        for (const point of [[0,lower,0],base[i],base[j]]) vertices.push(...point,0,-1,0,level,0);
      }
    }
  }
  if (!opening) {
    rim(shape,null,0);
    return new Float32Array(vertices);
  }
  const interpolate=(t,offset)=>({
    width:shape.width+(opening.width-shape.width)*t+offset*2,
    depth:shape.depth+(opening.depth-shape.depth)*t+offset*2,
    radius:shape.radius+(opening.radius-shape.radius)*t+offset
  });
  for (let band=0;band<bands;band++) {
    const level=band/(solidCore?bands:Math.max(1,bands-1));
    rim(interpolate(band/bands,band===0?0:-gap),
      interpolate((band+1)/bands,band===bands-1?0:gap),level);
  }
  if (solidCore) rim(interpolate(1,-gap*1.87),null,1);
  return new Float32Array(vertices);
}

export const coarse=matchMedia("(pointer: coarse)");

export function createArt(art,models=pieces) {
  const gl=art.getContext("webgl",{alpha:true,antialias:true,depth:true});
  if (!gl) return null;
  function shader(type,source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  const vertexSource=`
    attribute vec3 vertex;
    attribute vec3 normal;
    attribute float band, cavity;
    uniform vec2 viewport;
    uniform vec2 origin;
    uniform vec3 position;
    uniform float orthographic, growth, baseY;
    uniform float scale, pyramid, terrace, stretch, bobPhase, ripple;
    varying vec3 surfaceNormal, surfacePosition;
    varying float innerWall, localHeight;
    void main() {
      vec3 p=vertex+position;
      p.y=position.y+baseY+(vertex.y-baseY)*growth;
      float rise=0.31+0.69*band*band;
      float radialPosition=(terrace*3.0+band*2.0)/11.0;
      float waveHeight=ripple*sin(bobPhase+radialPosition*5.4);
      float heroOffset=pyramid*(terrace*0.39+band*0.105);
      p.y+=heroOffset+stretch*rise+waveHeight;
      float u=p.x*0.808027+p.z*0.589145;
      float v=-p.x*0.589145+p.z*0.808027;
      float depth=p.y*0.548024+v*0.836463;
      float w=1.0-(1.0-orthographic)*depth/13.0;
      vec2 center=vec2(2.0*origin.x/viewport.x-1.0,1.0-2.0*origin.y/viewport.y);
      vec2 offset=vec2(u*2.0*scale/viewport.x,(p.y*0.836463-v*0.548024)*2.0*scale/viewport.y);
      gl_Position=vec4(center*w+offset,-depth/10.0,w);
      surfaceNormal=normal;
      innerWall=cavity;
      localHeight=vertex.y;
      surfacePosition=p;
    }
  `;
  const fragmentSource=`
    precision mediump float;
    uniform vec3 color;
    uniform float time, opacity;
    varying vec3 surfaceNormal, surfacePosition;
    varying float innerWall, localHeight;
    void main() {
      vec3 n=normalize(surfaceNormal);
      vec3 key=normalize(vec3(-.58,.76,.32));
      vec3 fill=normalize(vec3(.72,.54,-.38));
      vec3 view=normalize(vec3(-.32,.55,.76));
      float warm=max(dot(n,key),0.0);
      float cool=max(dot(n,fill),0.0);
      float wash=smoothstep(-2.5,2.5,surfacePosition.x+surfacePosition.z*.54);
      float rim=pow(max(dot(n,normalize(key+view)),0.0),18.0);
      float bounce=pow(max(dot(n,normalize(fill+view)),0.0),11.0);
      float occlusion=mix(1.0,mix(.43,.88,smoothstep(-.15,.15,localHeight)),innerWall);
      vec3 light=color*(.38+warm*.59+cool*.20)*occlusion;
      light+=vec3(1.0,.79,.55)*(.085*warm*(1.0-wash)+.16*rim);
      light+=vec3(.22,.61,.72)*(.16*cool*wash+.12*bounce)*(1.0+.1*sin(time*.65));
      gl_FragColor=vec4(light*opacity,opacity);
    }
  `;
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const vertex=gl.getAttribLocation(program,"vertex");
  const normal=gl.getAttribLocation(program,"normal");
  const band=gl.getAttribLocation(program,"band");
  const cavity=gl.getAttribLocation(program,"cavity");
  const uniforms=Object.fromEntries(["viewport","origin","scale","pyramid","terrace","stretch","bobPhase","ripple","color","time","position","orthographic","opacity","growth","baseY"].map(name=>[name,gl.getUniformLocation(program,name)]));
  const meshes=models.map((piece,index)=>{
    const data=piece.mesh??buildMesh(piece,index);
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    return {buffer,count:data.length/8,color:piece.color.map(channel=>channel/255)};
  });
  gl.enable(gl.DEPTH_TEST);
  gl.enableVertexAttribArray(vertex);
  gl.enableVertexAttribArray(normal);
  gl.enableVertexAttribArray(band);
  gl.enableVertexAttribArray(cavity);
  gl.clearColor(0,0,0,0);
  let width,height,ratio;
  return {
    clear(surface) {
      const currentRatio=Math.min(devicePixelRatio||1,coarse.matches?1.25:2);
      if (width!==surface.width||height!==surface.height||ratio!==currentRatio) {
        width=surface.width;
        height=surface.height;
        art.style.width=width+"px";
        art.style.height=height+"px";
        ratio=currentRatio;
        art.width=Math.round(width*ratio);
        art.height=Math.round(height*ratio);
        gl.viewport(0,0,art.width,art.height);
        gl.uniform2f(uniforms.viewport,width,height);
      }
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    },
    render(scale,poses,time,orthographic=false) {
      if (scale<=0||!width||!height) return;
      gl.uniform2f(uniforms.origin,width*.5,height*.5);
      gl.uniform1f(uniforms.scale,scale);
      gl.uniform1f(uniforms.time,time);
      gl.uniform1f(uniforms.orthographic,Number(orthographic));
      if (orthographic) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); }
      meshes.forEach(({buffer,count,color},index)=>{
        const pose=poses[index];
        if (pose.opacity===0) return;
        gl.uniform3fv(uniforms.position,pose.position??[0,0,0]);
        gl.uniform2f(uniforms.origin,width*(pose.origin??.5),height*.5);
        gl.uniform1f(uniforms.opacity,pose.opacity??1);
        gl.uniform1f(uniforms.growth,pose.growth??1);
        gl.uniform1f(uniforms.baseY,pose.baseY??0);
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.vertexAttribPointer(vertex,3,gl.FLOAT,false,32,0);
        gl.vertexAttribPointer(normal,3,gl.FLOAT,false,32,12);
        gl.vertexAttribPointer(band,1,gl.FLOAT,false,32,24);
        gl.vertexAttribPointer(cavity,1,gl.FLOAT,false,32,28);
        gl.uniform1f(uniforms.pyramid,poses[index].pyramid);
        gl.uniform1f(uniforms.terrace,3-index);
        gl.uniform1f(uniforms.bobPhase,poses[index].bobPhase);
        gl.uniform1f(uniforms.ripple,poses[index].ripple);
        gl.uniform1f(uniforms.stretch,poses[index].stretch);
        gl.uniform3fv(uniforms.color,color);
        gl.drawArrays(gl.TRIANGLES,0,count);
      });
    }
  };
}


function insideTriangle(x,y,a,b,c) {
  const cross=(p,q)=> (q[0]-p[0])*(y-p[1])-(q[1]-p[1])*(x-p[0]);
  const ab=cross(a,b),bc=cross(b,c),ca=cross(c,a);
  return (ab>=0&&bc>=0&&ca>=0)||(ab<=0&&bc<=0&&ca<=0);
}

const hitMeshes=pieces.map(buildMesh);
export function pickHeroPiece(x,y,scale,pyramid) {
  if (!scale||Math.abs(x)>scale*3.3||Math.abs(y)>scale*2.2) return -1;
  let hit=-1,closest=-Infinity;
  hitMeshes.forEach((mesh,index)=>{
    const terrace=3-index;
    function project(at) {
      const px=mesh[at],py=mesh[at+1]+pyramid*(terrace*.39+mesh[at+6]*.105),pz=mesh[at+2];
      const u=px*.808027+pz*.589145;
      const v=-px*.589145+pz*.808027;
      const depth=py*.548024+v*.836463;
      const perspective=scale/(1-depth/13);
      return [u*perspective,(v*.548024-py*.836463)*perspective,depth];
    }
    for (let at=0;at<mesh.length;at+=24) {
      const a=project(at),b=project(at+8),c=project(at+16);
      if (Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))<.001) continue;
      if (insideTriangle(x,y,a,b,c)) {
        const depth=(a[2]+b[2]+c[2])/3;
        if (depth>closest) { closest=depth;hit=index; }
      }
    }
  });
  return hit;
}

for (const selector of document.querySelectorAll("[data-specialty-selector]")) {
  const slot=selector.querySelector(".selector-visual");
  const canvas=slot.querySelector("canvas");
  let renderer;
  try { renderer=createArt(canvas); } catch (error) { console.warn("Portfolio WebGL:",error); }
  if (!renderer) { slot.hidden=true;continue; }
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const cards=[...selector.querySelectorAll("[data-piece]")];
  let active=-1,focused=-1,hovered=-1,visible=false,frame=0,last=0,scale=0,surface;
  const heights=pieces.map(()=>0);
  function draw(now) {
    frame=0;
    if (!visible||!surface) return;
    const elapsed=last?now-last:16;
    if (!last||elapsed>=(coarse.matches?30:15)) {
      last=now;
      const time=reduced.matches?0:now/1000;
      const blend=reduced.matches?1:1-Math.exp(-elapsed/115);
      renderer.clear(surface);
      renderer.render(scale,pieces.map((_,i)=>{
        heights[i]+=((active===i?.62:0)-heights[i])*blend;
        return {pyramid:0,stretch:heights[i],bobPhase:time*.78,ripple:reduced.matches?0:.06};
      }),time);
    }
    if (!reduced.matches) frame=requestAnimationFrame(draw);
  }
  const queue=()=>{if (visible&&!frame)frame=requestAnimationFrame(draw);};
  function select() {
    active=hovered>=0?hovered:focused;
    cards.forEach(card=>card.classList.toggle("is-previewed",Number(card.dataset.piece)===active));
    queue();
  }
  for (const card of cards) {
    const index=Number(card.dataset.piece);
    card.addEventListener("pointerenter",event=>{if(event.pointerType!=="touch"){hovered=index;select();}});
    card.addEventListener("pointerleave",()=>{hovered=-1;select();});
    card.addEventListener("focus",()=>{focused=index;select();});
    card.addEventListener("blur",()=>{focused=-1;select();});
  }
  new ResizeObserver(([entry])=>{
    const {width,height}=entry.contentRect;
    scale=Math.min(width/6.65,height/4.25);
    surface={width:Math.max(1,Math.ceil(scale*6.65)),height:Math.max(1,Math.ceil(scale*4.25))};
    last=0;
    queue();
  }).observe(slot);
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    last=0;
    queue();
  }).observe(slot);
  reduced.addEventListener("change",()=>{last=0;queue();});
}


const chalk=[226,208,175];
const petrol=[39,108,118];
const stone=[200,181,150];

function solid(width,depth,height,radius) {
  return buildBands({width,depth,radius},null,1,height);
}

function sleeve(size,wall,height,radius) {
  return buildBands(
    {width:size,depth:size,radius},
    {width:size-2*wall,depth:size-2*wall,radius:radius-wall},
    1,height
  );
}

function upright(mesh) {
  for (let offset=0;offset<mesh.length;offset+=8) {
    const y=mesh[offset+1], ny=mesh[offset+4];
    mesh[offset+1]=mesh[offset+2];
    mesh[offset+2]=-y;
    mesh[offset+4]=mesh[offset+5];
    mesh[offset+5]=-ny;
  }
  return mesh;
}

function trainingModels() {
  return [.55,1.02,1.65].flatMap((height,stage)=>{
    const x=(stage-1)*1.95;
    return [
      [sleeve(1.45,.14,height,.25),chalk,height],
      [sleeve(1.07,.13,height+.17,.20),petrol,height+.17],
      [solid(.70,.70,height+.34,.14),chalk,height+.34]
    ].map(([mesh,color,h],layer)=>({mesh,color,stage,layer,baseY:-h/2,origin:.5,position:[x,h/2-1.12,0]}));
  });
}

const systemCenters=[-4.05,-1.9,.60,3.65];

function systemModels() {
  const scene=[];
  const phases=[0,0,0,0];
  const add=(stage,mesh,color,x,y,z)=>scene.push({
    stage,layer:phases[stage]++,mesh,color,origin:.5,position:[systemCenters[stage]+x,y-.27-(stage===3?.17:0),z]
  });
  const plate=(stage,width,height,depth,color,x,y,z,radius=.1)=>{
    add(stage,upright(solid(width,height,depth,radius)),color,x,y,z);
  };
  const cube=(stage,x,y,z,size)=>add(stage,solid(size,size,size,.075),petrol,x,y,z);
  const token=(stage,x,y,z,size)=>{
    cube(stage,x,y,z+.08,size*.53);
    add(stage,upright(sleeve(size,size*.16,.17,size*.24)),chalk,x,y,z);
  };
  const card=(stage,x,y,z,size)=>{
    plate(stage,size*1.65,size*.90,.18,petrol,x,y,z,size*.14);
    token(stage,x-size*.42,y,z+.16,size*.61);
    plate(stage,size*.51,size*.09,.08,chalk,x+size*.31,y+size*.12,z+.12,.035);
    plate(stage,size*.38,size*.08,.08,chalk,x+size*.25,y-size*.11,z+.12,.03);
  };
  cube(0,0,-.17,0,.58);
  token(1,0,-.17,0,.92);
  card(2,0,-.17,0,1.04);
  plate(3,2.0,1.75,.22,stone,0,.1,0,.16);
  card(3,-.23,.15,.18,.8);
  plate(3,.36,.40,.12,chalk,.74,.19,.21,.08);
  plate(3,1.62,.24,.12,petrol,0,-.53,.18,.08);
  for (let stage=0;stage<systemCenters.length;stage++) {
    const group=scene.filter(model=>model.stage===stage);
    let front=-Infinity,back=Infinity;
    for (const {mesh,position} of group) for (let i=2;i<mesh.length;i+=8) {
      const z=mesh[i]+position[2];
      front=Math.max(front,z);
      back=Math.min(back,z);
    }
    const middle=(front+back)/2;
    group.forEach(model=>{model.position[2]-=middle;});
  }
  return scene;
}

function systemFootprints(models) {
  const groups=systemCenters.map((_,stage)=>models.filter(model=>model.stage===stage));
  return groups.map(group=>{
    let base=Infinity,left=Infinity,right=-Infinity;
    const vertices=[];
    for (const {mesh,position} of group) for (let i=0;i<mesh.length;i+=8) {
      const x=mesh[i]+position[0], y=mesh[i+1]+position[1], z=mesh[i+2]+position[2];
      const projectedX=x+z*.589145/.808027;
      left=Math.min(left,projectedX);
      right=Math.max(right,projectedX);
      base=Math.min(base,y);
      vertices.push([x,y,z]);
    }
    const bottom=vertices.filter(([,y])=>y<=base+.035);
    const middle=axis=>{
      const values=bottom.map(point=>point[axis]);
      return (Math.min(...values)+Math.max(...values))/2;
    };
    return {left,right,center:[middle(0),base,middle(2)],radius:(right-left)*.44+.06};
  });
}

function doorwayMesh() {
  const outer=[],inner=[],vertices=[];
  const spring=.82,outerRadius=.46,innerRadius=.31,depth=.085;
  outer.push([0,-outerRadius]);
  inner.push([0,-innerRadius]);
  for (let i=0;i<=24;i++) {
    const angle=Math.PI*(1-i/24);
    outer.push([spring+Math.sin(angle)*outerRadius,Math.cos(angle)*outerRadius]);
    inner.push([spring+Math.sin(angle)*innerRadius,Math.cos(angle)*innerRadius]);
  }
  outer.push([0,outerRadius]);
  inner.push([0,innerRadius]);
  const point=(x,[y,z])=>[x,y,z];
  function quad(points,normal,cavity=0) {
    for (const i of [0,1,2,0,2,3]) vertices.push(...points[i],...normal,0,cavity);
  }
  for (let i=0;i<outer.length-1;i++) {
    const j=i+1;
    for (const x of [-depth,depth]) {
      quad([point(x,outer[i]),point(x,outer[j]),point(x,inner[j]),point(x,inner[i])],[Math.sign(x),0,0]);
    }
    for (const [profile,sign,cavity] of [[outer,1,0],[inner,-1,.75]]) {
      const p=profile[i],q=profile[j],dy=q[0]-p[0],dz=q[1]-p[1];
      const length=Math.hypot(dy,dz);
      quad([point(-depth,p),point(depth,p),point(depth,q),point(-depth,q)],
        [0,sign*dz/length,-sign*dy/length],cavity);
    }
  }
  for (const i of [0,outer.length-1]) {
    quad([point(-depth,outer[i]),point(depth,outer[i]),point(depth,inner[i]),point(-depth,inner[i])],[0,-1,0]);
  }
  return new Float32Array(vertices);
}

function behavioralModels() {
  const ground=-.98;
  const arch=doorwayMesh();
  const doors=[[-3,0],[-.75,0],[2.35,-1.30],[2.35,0],[2.35,1.30]];
  const models=doors.map(([x,z],index)=>({mesh:arch,color:index===4?petrol:chalk,
    stage:index<2?index:2,origin:.5,position:[x,ground,z]}));
  const paver=solid(.32,.38,.09,.055);
  for (let i=0;i<16;i++) {
    const x=-3.38+i*.40;
    const t=Math.max(0,Math.min(1,(x+.75)/3.1));
    const curve=1.30*t*t*(3-2*t);
    const stagger=(i%2===0?-1:1)*.085;
    const z=curve+stagger;
    models.push({mesh:paver,color:x<-.75?chalk:petrol,stage:0,delay:230+i*96,
      origin:.5,position:[x,ground+.045,z]});
  }
  return models;
}

function focusModels() {
  return [
    [sleeve(1.88,.19,.16,.45),chalk,-.57],
    [sleeve(1.27,.14,.17,.33),petrol,-.41],
    [solid(.59,.59,.19,.22),chalk,-.23]
  ].map(([mesh,color,y],stage)=>({mesh,color,stage,origin:.5,position:[0,y+.22,-.20]}));
}

for (const canvas of document.querySelectorAll("[data-branch-canvas]")) {
  const kind=canvas.dataset.branchCanvas;
  const training=kind==="training",behavioral=kind==="behavioral",focus=kind==="focus",systems=kind==="systems";
  const models=training?trainingModels():behavioral?behavioralModels():focus?focusModels():systemModels();
  const footprints=systems?systemFootprints(models):null;
  const parent=canvas.parentElement;
  const floor=parent.querySelector(".scene-floor");
  const shadows=[...floor.querySelectorAll(".scene-shadow")];
  const labels=[floor.querySelector(".scene-back"),floor.querySelector(".scene-front")];
  const masks=[...floor.querySelectorAll("clipPath rect")];
  const focusDot=floor.querySelector(".focus-dot");
  const connectors=parent.querySelector(".system-connectors");
  const tracks=connectors?[...connectors.querySelectorAll(".system-track")]:[];
  const fills=connectors?[...connectors.querySelectorAll(".system-fill")]:[];
  const pulse=connectors?.querySelector(".system-pulse");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let renderer, frame=0, started=0, visible=false, captionWidth=0;
  const captionBounds=[];
  const duration=focus?3400:behavioral?2130:training?2170:3000;
  function draw(now) {
    frame=0;
    if (!visible) return;
    const {clientWidth:width,clientHeight:height}=parent;
    if (!width||!height) return;
    started ||= now;
    const elapsed=now-started;
    const scale=Math.min(width/(training?6.9:behavioral?8.5:focus?7.3:9.8),height/5.25);
    const project=(x,y,z)=>[
      width/2+(x*.808027+z*.589145)*scale,
      height/2+((-x*.589145+z*.808027)*.548024-y*.836463)*scale
    ];
    renderer.clear({width,height});
    renderer.render(scale,models.map(model=>{
      const delay=model.delay??(training?model.stage*470+model.layer*155
        :systems?model.stage*580+model.layer*101
        :model.stage*(focus?190:370));
      const progress=reduced.matches?1:Math.min(1,Math.max(0,(elapsed-delay)/(training?870:systems?490:420)));
      const remaining=1-progress;
      const settled=1-remaining**3;
      const eased=progress*progress*progress*(progress*(progress*6-15)+10);
      const drift=1-eased;
      const [x,y,z]=model.position;
      const growth=training?Math.max(.015,1-3.5*remaining**3+2.5*remaining**2)
        :systems?Math.max(.06,eased):1;
      return {
        origin:model.origin,
        position:systems?[x+drift*.18,y+drift*.24,z+drift*.29]
          :[x,y-(training?0:remaining*.16),z],
        opacity:training||systems?Number(progress>0):settled,
        growth,baseY:model.baseY??0,pyramid:0,stretch:0,bobPhase:0,ripple:0
      };
    }),0,true);
    floor.setAttribute("viewBox",`0 0 ${width} ${height}`);
    floor.style.setProperty("--scene-type",Math.max(26,Math.min(110,width*.135))+"px");
    const fontSize=Math.max(26,Math.min(110,width*.135));
    labels.forEach((label,index)=>{
      let [x,y]=focus&&index===1?project(-.23,-1.13,1.78):project(index===0?-.72:.72,-1.12,index===0?-2.55:2.44);
      if (!focus) {
        label.setAttribute("transform",`matrix(.808 -.323 .589 .443 ${x} ${y})`);
        return;
      }
      if (width!==captionWidth||!captionBounds[index]?.width) {
        const length=width*(index===0?.64:.75);
        const [base,ink]=label.querySelectorAll("text");
        for (const text of [base,ink]) {
          text.setAttribute("textLength",length);
          text.setAttribute("lengthAdjust","spacingAndGlyphs");
        }
        const bounds=base.getBBox();
        captionBounds[index]=bounds.width?bounds:{x:-length/2,y:-fontSize,width:length,height:fontSize*1.2};
      }
      const bounds=captionBounds[index];
      const right=bounds.x+bounds.width, bottom=bounds.y+bounds.height;
      const corners=[[bounds.x,bounds.y],[right,bounds.y],[bounds.x,bottom],[right,bottom]];
      const projectedX=corners.map(([u,v])=>.808*u+.589*v);
      const projectedY=corners.map(([u,v])=>-.323*u+.443*v);
      const left=Math.min(...projectedX), farRight=Math.max(...projectedX);
      const top=Math.min(...projectedY), low=Math.max(...projectedY);
      const margin=Math.min(20,width*.05);
      const fit=Math.min(1,(width-2*margin)/(farRight-left),(height-2*margin)/(low-top));
      x=Math.max(margin-left*fit,Math.min(width-margin-farRight*fit,x));
      y=Math.max(margin-top*fit,Math.min(height-margin-low*fit,y));
      label.setAttribute("transform",`matrix(${.808*fit} ${-.323*fit} ${.589*fit} ${.443*fit} ${x} ${y})`);

      const time=index===0?(elapsed-180)/1160:(elapsed-1680)/1600;
      const ratio=reduced.matches?1:Math.max(0,Math.min(1,time));
      const progress=ratio*ratio*(3-2*ratio);
      const inkPadding=4;
      masks[index].setAttribute("x",bounds.x-inkPadding);
      masks[index].setAttribute("y",bounds.y-inkPadding);
      masks[index].setAttribute("width",(bounds.width+2*inkPadding)*progress);
      masks[index].setAttribute("height",bounds.height+2*inkPadding);
      if ((index===0&&elapsed<1680)||(index===1&&elapsed>=1680)||reduced.matches&&index===1) {
        const final=index===1&&ratio===1;
        const along=bounds.x+bounds.width*progress+(final?fontSize*.11:0);
        const lift=final?-fontSize*.05:-fontSize*.22-Math.sin(ratio*Math.PI)*fontSize*.09;
        focusDot.setAttribute("transform",`translate(${x+(.808*along+.589*lift)*fit} ${y+(-.323*along+.443*lift)*fit})`);
        focusDot.style.visibility=!reduced.matches&&elapsed<180?"hidden":"visible";
      }
    });
    captionWidth=width;
    const ground=training?[[-1.95,-1.12,0],[0,-1.12,0],[1.95,-1.12,0]]:footprints?.map(item=>item.center);
    shadows.forEach((shadow,index)=>{
      const [x,y]=project(...ground[index]);
      const radius=training?.88:footprints[index].radius;
      shadow.setAttribute("cx",x+.05*scale);
      shadow.setAttribute("cy",y+.04*scale);
      shadow.setAttribute("rx",radius*scale);
      shadow.setAttribute("ry",.23*scale);
      shadow.setAttribute("transform",`rotate(-18 ${x} ${y})`);
    });
    if (connectors) {
      connectors.setAttribute("viewBox",`0 0 ${width} ${height}`);
      pulse.style.visibility="hidden";
      tracks.forEach((track,index)=>{
        const start=footprints[index].right+.17;
        const end=footprints[index+1].left-.17;
        const [x1,y1]=project(start,-.44,0), [x2,y2]=project(end,-.44,0);
        const path=end>start?`M${x1},${y1} L${x2},${y2}`:"";
        const elapsedRatio=reduced.matches?1:Math.max(0,Math.min(1,(elapsed-270-index*580)/310));
        const progress=elapsedRatio*elapsedRatio*(3-2*elapsedRatio);
        track.setAttribute("d",path);
        fills[index].setAttribute("d",path);
        fills[index].style.strokeDashoffset=1-progress;
        if (end>start&&progress>0&&progress<1) {
          pulse.setAttribute("transform",`translate(${x1+(x2-x1)*progress} ${y1+(y2-y1)*progress})`);
          pulse.style.visibility="visible";
        }
      });
    }
    if (!reduced.matches&&elapsed<duration) frame=requestAnimationFrame(draw);
  }
  function queue() {
    if (visible&&renderer&&!frame) frame=requestAnimationFrame(draw);
  }
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (visible&&!renderer) {
      try { renderer=createArt(canvas,models); } catch(error) { console.warn("Portfolio 3D:",error); }
      if (!renderer) { parent.classList.add("is-3d-unavailable");return; }
    }
    started=0;
    queue();
  }).observe(parent);
  new ResizeObserver(queue).observe(parent);
  if (focus) document.fonts?.ready.then(()=>{captionWidth=0;queue();});
  reduced.addEventListener("change",queue);
}
