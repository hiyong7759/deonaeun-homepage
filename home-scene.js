const host = document.querySelector('.connection-scene');
const motion = window.DeonaeunMotion;

if (host && motion) {
  const ns = 'http://www.w3.org/2000/svg';
  const buttons = [...host.querySelectorAll('[data-node]')];
  const paths = [...host.querySelectorAll('.connection-scene__paths path')];
  const packetsLayer = host.querySelector('.connection-scene__packets');
  const waveLayer = host.querySelector('.connection-scene__waves');
  const core = host.querySelector('.connection-scene__core');
  const base = [[122,136],[458,116],[90,336],[516,310],[178,492],[427,489]];
  const controls = [[188,140,215,283],[385,130,397,264],[155,291,203,343],[448,366,373,274],[140,405,259,386],[477,390,354,393]];
  const nodes = base.map(([x,y])=>({x,y}));
  const pointer = { x:300,y:300,targetX:300,targetY:300,amount:0,targetAmount:0 };
  let width = 600, time = 0, field = null, coreEnergy = 0, packets = [], waves = [], lastHover = -1;
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  function make(name, attrs) {
    const node=document.createElementNS(ns,name);
    Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,value)); return node;
  }
  function cubic(i,t) {
    const p=nodes[i],b=base[i],c=controls[i],u=1-t;
    const cx=c[0]+(p.x-b[0])*.6,cy=c[1]+(p.y-b[1])*.6;
    return {x:u*u*u*p.x+3*u*u*t*cx+3*u*t*t*c[2]+t*t*t*300,y:u*u*u*p.y+3*u*u*t*cy+3*u*t*t*c[3]+t*t*t*300};
  }
  function ripple(x,y,strength=1) {
    if(motion.reduced || !runner.active)return;
    const ring=make('circle',{cx:x,cy:y,r:8,'stroke-width':.8,opacity:.5});waveLayer.append(ring);
    waves.push({x,y,start:time,ring,strength});
    if(waves.length>5)waves.shift().ring.remove();
    field?.impulse(x,y,time,strength);
  }
  function transmit(index,strong=true) {
    if(motion.reduced || !runner.active)return;
    const group=make('g',{});packetsLayer.append(group);
    const dots=Array.from({length:7},(_,i)=>{
      const dot=make('circle',{r:i===0?3.1:2.4-i*.23,class:i===0?'packet-head':'packet-trail',fill:i===0?'#fff3d6':'#f29a5a'});group.append(dot);return dot;
    });
    packets.push({index,start:time,group,dots,arrived:false,strong});
    if(packets.length>12)packets.shift().group.remove();
    if(strong){ripple(nodes[index].x,nodes[index].y,.8);buttons[index].classList.add('is-sending');}
    host.dataset.lastSignal=String(index);
  }
  function clearTransients() {
    packets.forEach(p=>p.group.remove());packets=[];
    waves.forEach(w=>w.ring.remove());waves=[];
    buttons.forEach(b=>b.classList.remove('is-sending'));
    pointer.targetAmount=0;pointer.amount=0;pointer.x=pointer.targetX=300;pointer.y=pointer.targetY=300;coreEnergy=0;
    core.style.setProperty('--core-energy','0');field?.clear();runner.invalidate();
  }
  function draw(state) {
    time=state.time;
    const blend=state.active?1-Math.exp(-state.delta*7):1;
    pointer.x+=(pointer.targetX-pointer.x)*blend;pointer.y+=(pointer.targetY-pointer.y)*blend;
    pointer.amount+=(pointer.targetAmount-pointer.amount)*blend;
    nodes.forEach((node,i)=>{
      const [bx,by]=base[i],dx=pointer.x-bx,dy=pointer.y-by;
      const influence=Math.max(0,1-Math.hypot(dx,dy)/230)*pointer.amount;
      const hoverX=Math.max(-19,Math.min(19,dx*.23))*influence;
      const hoverY=Math.max(-16,Math.min(16,dy*.23))*influence;
      const drift=state.active?Math.sin(time*.55+i*1.1)*2:0;
      node.x+=(bx+hoverX-node.x)*blend;node.y+=(by+hoverY+drift-node.y)*blend;
      buttons[i].style.translate=`${((node.x-bx)*width/600).toFixed(2)}px ${((node.y-by)*width/600).toFixed(2)}px`;
      const c=controls[i];
      paths[i].setAttribute('d',`M${node.x} ${node.y} C${c[0]+(node.x-bx)*.6} ${c[1]+(node.y-by)*.6} ${c[2]} ${c[3]} 300 300`);
      paths[i].style.strokeWidth=String(1+influence*.7);paths[i].style.opacity=String(.6+influence*.4);
    });
    packets=packets.filter(packet=>{
      const progress=(time-packet.start)/1.05;
      packet.dots.forEach((dot,j)=>{
        const t=Math.max(0,Math.min(1,progress-j*.024)),p=cubic(packet.index,t);
        dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);
        dot.setAttribute('opacity',Math.max(0,(1-j/8)*Math.min(1,progress*8)*Math.min(1,(1.2-progress)*5)));
      });
      if(progress>=1&&!packet.arrived){
        packet.arrived=true;coreEnergy=packet.strong?1:.5;
        ripple(300,300,packet.strong?1:.35);
        host.dataset.signalArrivals=String(Number(host.dataset.signalArrivals||0)+1);
      }
      if(progress>1.2){packet.group.remove();buttons[packet.index].classList.remove('is-sending');return false;}
      return true;
    });
    waves=waves.filter(wave=>{
      const age=(time-wave.start)/1.9;
      if(age>=1){wave.ring.remove();return false;}
      wave.ring.setAttribute('r',8+(1-Math.pow(1-age,2))*210);
      wave.ring.setAttribute('opacity',Math.pow(1-age,2)*.4*wave.strength);return true;
    });
    coreEnergy=Math.max(0,coreEnergy-state.delta*.8);core.style.setProperty('--core-energy',coreEnergy.toFixed(3));
    field?.draw(state,pointer);
  }
  const runner=motion.loop(host,draw);
  new ResizeObserver(()=>{width=host.getBoundingClientRect().width;field?.resize();runner.invalidate();}).observe(host);
  host.addEventListener('pointermove',event=>{
    if(!fine.matches||event.pointerType==='touch'||motion.reduced||!runner.active)return;
    const r=host.getBoundingClientRect();pointer.targetX=(event.clientX-r.left)/r.width*600;pointer.targetY=(event.clientY-r.top)/r.height*600;pointer.targetAmount=1;
  },{passive:true});
  host.addEventListener('pointerleave',()=>{pointer.targetAmount=0;pointer.targetX=300;pointer.targetY=300;lastHover=-1;});
  buttons.forEach((button,i)=>{
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&lastHover!==i){lastHover=i;transmit(i,false);}});
    button.addEventListener('focus',()=>transmit(i,false));
    button.addEventListener('click',()=>transmit(i));
    button.addEventListener('keydown',event=>{
      const shift={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[event.key];
      if(shift){event.preventDefault();buttons[(i+shift+6)%6].focus();}
    });
  });
  host.addEventListener('click',event=>{
    if(event.target.closest('button'))return;
    const r=host.getBoundingClientRect();ripple((event.clientX-r.left)/r.width*600,(event.clientY-r.top)/r.height*600);
  });
  motion.observe(host,({active})=>{if(!active)clearTransients();});

  async function createField() {
    let renderer,geometry,material;
    try {
      const T=await import('./assets/vendor/three.module.min.js');
      const mount=host.querySelector('.connection-scene__render');
      renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);
      renderer.domElement.setAttribute('aria-hidden','true');mount.append(renderer.domElement);
      const scene=new T.Scene();
      const camera=new T.OrthographicCamera(-3.15,3.15,3.15,-3.15,.1,30);camera.position.z=10;
      const group=new T.Group();group.rotation.set(.85,-.3,-.38);scene.add(group);
      const mobile=innerWidth<600, around=mobile?112:176,bands=mobile?36:52,count=around*bands;
      const positions=new Float32Array(count*3),colours=new Float32Array(count*3),seeds=new Float32Array(count),bandValues=new Float32Array(count);
      for(let i=0;i<around;i++)for(let j=0;j<bands;j++){
        const index=i*bands+j,a=i/around*Math.PI*2,b=j/bands*Math.PI*2;
        const radius=1.77+(.59+.08*Math.sin(a*3))*Math.cos(b),twist=.22*Math.sin(a*2);
        positions[index*3]=radius*Math.cos(a);
        positions[index*3+1]=radius*Math.sin(a);
        positions[index*3+2]=.66*Math.sin(b)+twist;
        const warm=(Math.sin(a-.6)+1)/2;
        colours[index*3]=.51+warm*.49;colours[index*3+1]=.76-warm*.16;colours[index*3+2]=.8-warm*.44;
        seeds[index]=(Math.sin(i*12.9898+j*78.233)*43758.5453)%1;seeds[index]=Math.abs(seeds[index]);bandValues[index]=b;
      }
      geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aColor',new T.BufferAttribute(colours,3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,1));geometry.setAttribute('aBand',new T.BufferAttribute(bandValues,1));
      const uniforms={uTime:{value:0},uReveal:{value:motion.reduced?1:0},uPointer:{value:new T.Vector2()},uHover:{value:0},uPulse:{value:new T.Vector3(0,0,-99)},uStrength:{value:1},uDpr:{value:renderer.getPixelRatio()}};
      material=new T.ShaderMaterial({
        uniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
        vertexShader:`
          attribute vec3 aColor; attribute float aSeed; attribute float aBand;
          uniform float uTime,uReveal,uHover,uStrength,uDpr; uniform vec2 uPointer; uniform vec3 uPulse;
          varying vec3 vColor; varying float vAlpha;
          void main(){
            vec3 p=position; float a=atan(p.y,p.x);
            float breath=sin(a*3.0+uTime*.45+aBand)*.075;
            p.z+=breath;
            float near=exp(-dot(p.xy-uPointer,p.xy-uPointer)*1.2)*uHover;
            p.z+=near*.68; p.xy+=(p.xy-uPointer)*near*.12;
            float age=uTime-uPulse.z, distance=length(p.xy-uPulse.xy);
            float wave=sin(distance*8.0-age*8.5)*exp(-pow((distance-age*1.65)/.72,2.0))*max(0.0,1.0-age/2.8)*step(0.0,age)*uStrength;
            p.z+=wave*.48;
            float emerge=smoothstep(aSeed*.2,aSeed*.2+.8,uReveal);
            p*=mix(1.18,1.0,emerge);
            vec4 mv=modelViewMatrix*vec4(p,1.0);
            gl_Position=projectionMatrix*mv;
            gl_PointSize=(1.4+aSeed*.9+near*.75+abs(wave)*.4)*uDpr;
            vColor=mix(aColor,vec3(1.0,.8,.58),near*.35+abs(wave)*.35);
            vAlpha=(.4+aSeed*.45+near*.2+abs(wave)*.25)*(.8+.2*sin(aBand))*emerge;
          }`,
        fragmentShader:`varying vec3 vColor; varying float vAlpha; void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=(1.0-smoothstep(.08,.5,r))*vAlpha;gl_FragColor=vec4(vColor,a);}`
      });
      const points=new T.Points(geometry,material);group.add(points);
      const resize=()=>{const r=mount.getBoundingClientRect();renderer.setSize(r.width,r.height,false);};resize();
      let alive=true;
      const result={
        resize,
        impulse(x,y,at,strength){uniforms.uPulse.value.set((x-300)/600*6.3,-(y-300)/600*6.3,at);uniforms.uStrength.value=strength;},
        clear(){uniforms.uPulse.value.z=-99;uniforms.uHover.value=0;},
        draw(state,pointer){
          if(!alive)return;
          uniforms.uTime.value=state.time;
          uniforms.uReveal.value=state.reduced?1:Math.min(1,uniforms.uReveal.value+state.delta*.62);
          uniforms.uPointer.value.set((pointer.x-300)/600*6.3,-(pointer.y-300)/600*6.3);uniforms.uHover.value=pointer.amount;
          const blend=state.active?1-Math.exp(-state.delta*3):1;
          group.rotation.x+=(.85+(pointer.y-300)/300*.2*pointer.amount-group.rotation.x)*blend;
          group.rotation.y+=(-.3+(pointer.x-300)/300*.25*pointer.amount-group.rotation.y)*blend;
          group.rotation.z=-.38+(state.active?Math.sin(state.time*.16)*.08:0);
          renderer.render(scene,camera);
        }
      };
      renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();alive=false;field=null;renderer.domElement.remove();host.classList.remove('is-webgl');geometry.dispose();material.dispose();renderer.dispose();},{once:true});
      field=result;host.classList.add('is-webgl');runner.invalidate();
    } catch {
      renderer?.domElement.remove();geometry?.dispose();material?.dispose();renderer?.dispose();host.classList.remove('is-webgl');
    }
  }
  createField();
}
