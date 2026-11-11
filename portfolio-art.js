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
  const shape={width:piece.width,depth:piece.depth,radius:piece.depth*.19};
  const opening=inner
    ? {width:inner.width+.012,depth:inner.depth+.012,radius:inner.depth*.19+.006}
    : {width:1.16,depth:.35,radius:.075};
  const vertices=[];
  function quad(points,normal,level) {
    for (const i of [0,1,2,0,2,3]) vertices.push(...points[i],...normal,level);
  }
  function rim(outside,inside,level) {
    const bevel=.009;
    const top=contour(outside.width-2*bevel,outside.depth-2*bevel,outside.radius-bevel,.15);
    const shoulder=contour(outside.width,outside.depth,outside.radius,.15-bevel);
    const base=contour(outside.width,outside.depth,outside.radius,-.15);
    const holeTop=inside&&contour(inside.width+2*bevel,inside.depth+2*bevel,inside.radius+bevel,.15);
    const holeShoulder=inside&&contour(inside.width,inside.depth,inside.radius,.15-bevel);
    const holeBase=inside&&contour(inside.width,inside.depth,inside.radius,-.15);
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
        quad([holeTop[i],holeTop[j],holeShoulder[j],holeShoulder[i]],[-nx,.9,-nz],level);
        quad([holeShoulder[i],holeShoulder[j],holeBase[j],holeBase[i]],[-nx,0,-nz],level);
      } else {
        vertices.push(0,.15,0,0,1,0,level,...top[i],0,1,0,level,...top[j],0,1,0,level);
        for (const point of [[0,-.15,0],base[i],base[j]]) vertices.push(...point,0,-1,0,level);
      }
    }
  }
  const interpolate=(t,offset)=>({
    width:shape.width+(opening.width-shape.width)*t+offset*2,
    depth:shape.depth+(opening.depth-shape.depth)*t+offset*2,
    radius:shape.radius+(opening.radius-shape.radius)*t+offset
  });
  const bands=inner?3:2;
  for (let band=0;band<bands;band++) {
    const level=band/(inner?bands-1:bands);
    rim(interpolate(band/bands,band===0?0:-.002),
      interpolate((band+1)/bands,band===bands-1?0:.002),level);
  }
  if (!inner) rim(interpolate(1,-.008),null,1);
  return new Float32Array(vertices);
}

export const coarse=matchMedia("(pointer: coarse)");

export function createArt(art) {
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
    attribute float band;
    uniform vec2 viewport;
    uniform vec2 origin;
    uniform float scale, pyramid, terrace, stretch, bobPhase, ripple;
    varying vec3 surfaceNormal, surfacePosition;
    void main() {
      vec3 p=vertex;
      float rise=0.31+0.69*band*band;
      float radialPosition=(terrace*3.0+band*2.0)/11.0;
      float waveHeight=ripple*sin(bobPhase+radialPosition*5.4);
      float heroOffset=pyramid*(terrace*0.39+band*0.105);
      p.y+=heroOffset+stretch*rise+waveHeight;
      float u=p.x*0.808027+p.z*0.589145;
      float v=-p.x*0.589145+p.z*0.808027;
      float depth=p.y*0.548024+v*0.836463;
      float w=1.0-depth/13.0;
      vec2 center=vec2(2.0*origin.x/viewport.x-1.0,1.0-2.0*origin.y/viewport.y);
      vec2 offset=vec2(u*2.0*scale/viewport.x,(p.y*0.836463-v*0.548024)*2.0*scale/viewport.y);
      gl_Position=vec4(center*w+offset,-depth/10.0,w);
      surfaceNormal=normal;
      surfacePosition=p;
    }
  `;
  const fragmentSource=`
    precision mediump float;
    uniform vec3 color;
    uniform float time;
    varying vec3 surfaceNormal, surfacePosition;
    void main() {
      vec3 n=normalize(surfaceNormal);
      vec3 light=normalize(vec3(-0.45+0.30*sin(time*0.64),0.84,0.35));
      float diffuse=max(0.0,dot(n,light));
      float sweep=smoothstep(-0.95,0.95,sin(surfacePosition.x*0.93+surfacePosition.z*0.52+sin(time*0.71)*1.5));
      float glint=sweep*(0.04+0.12*max(n.y,0.0));
      gl_FragColor=vec4(color*(0.46+diffuse*0.67)+glint*vec3(0.54,0.62,0.65),1.0);
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
  const uniforms=Object.fromEntries(["viewport","origin","scale","pyramid","terrace","stretch","bobPhase","ripple","color","time"].map(name=>[name,gl.getUniformLocation(program,name)]));
  const meshes=pieces.map((piece,index)=>{
    const data=buildMesh(piece,index);
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    return {buffer,count:data.length/7,color:piece.color.map(channel=>channel/255)};
  });
  gl.enable(gl.DEPTH_TEST);
  gl.enableVertexAttribArray(vertex);
  gl.enableVertexAttribArray(normal);
  gl.enableVertexAttribArray(band);
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
    render(scale,poses,time) {
      if (scale<=0||!width||!height) return;
      gl.uniform2f(uniforms.origin,width*.5,height*.5);
      gl.uniform1f(uniforms.scale,scale);
      gl.uniform1f(uniforms.time,time);
      meshes.forEach(({buffer,count,color},index)=>{
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.vertexAttribPointer(vertex,3,gl.FLOAT,false,28,0);
        gl.vertexAttribPointer(normal,3,gl.FLOAT,false,28,12);
        gl.vertexAttribPointer(band,1,gl.FLOAT,false,28,24);
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
    for (let at=0;at<mesh.length;at+=21) {
      const a=project(at),b=project(at+7),c=project(at+14);
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
