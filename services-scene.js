const serviceStates = {
  si: { number:'01 / BUILD', caption:'화면, 서비스, 데이터를 하나로.', announcement:'시스템 구축: 화면, 서비스, 데이터 층을 하나로 조립합니다.', levels:[-.68,-.02,.64], offsets:[0,0,0] },
  sm: { number:'02 / OPERATE', caption:'멈추지 않는 시스템의 흐름.', announcement:'시스템 운영: 조립된 구조를 따라 신호가 순환합니다.', levels:[-.83,0,.83], offsets:[0,0,0] },
  a11y: { number:'03 / ACCESS', caption:'사람이 닿는 화면을 더 분명하게.', announcement:'웹접근성: 사용자가 만나는 화면과 포커스를 강조합니다.', levels:[-1.1,-.5,1.03], offsets:[-.15,-.15,.12], turns:[0,0,-.1] },
  consulting: { number:'04 / DESIGN', caption:'구조를 펼치고, 방향을 설계하다.', announcement:'IT 컨설팅: 각 층을 분리해 구조와 연결을 살펴봅니다.', levels:[-1.17,0,1.14], offsets:[-.62,0,.62], turns:[-.07,0,.07] }
};

function localMotionLoop(element, render) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true, active = false, frame = 0, last = 0, time = 0;
  const menu = document.getElementById('navSheet');
  const tick = now => {
    if (!active) return;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now; time += delta;
    render({ time, delta, active, reduced: media.matches });
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    active = visible && !document.hidden && !media.matches && !menu?.classList.contains('is-open');
    cancelAnimationFrame(frame); last = 0;
    if (active) frame = requestAnimationFrame(tick);
    else if (visible && !document.hidden) render({ time, delta: 0, active: false, reduced: media.matches });
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(element);
  const menuObserver = new MutationObserver(sync);
  if (menu) menuObserver.observe(menu, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync); media.addEventListener('change', sync);
  sync();
  return {
    get active() { return active; },
    invalidate() { if (visible && !document.hidden) render({ time, delta: 0, active, reduced: media.matches }); },
    destroy() { active = false; cancelAnimationFrame(frame); observer.disconnect(); menuObserver.disconnect(); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); }
  };
}

async function createSystemModel(stage, host, explorer, getSelected) {
  let renderer, loop, resizeObserver;
  try {
    const T = await import('./assets/vendor/three.module.min.js');
    const motion = window.DeonaeunMotion;
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
    if(!context){explorer.dataset.renderer='fallback';return null;}
    renderer = new T.WebGLRenderer({ canvas, context, alpha:true, antialias:true, powerPreference:'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-3.8, 3.8, 2.8, -2.8, 0.1, 40);
    camera.position.set(6, 5.5, 7.5); camera.lookAt(0, 0, 0);
    scene.add(new T.HemisphereLight(0xdfece8, 0x142b38, 2.5));
    const light = new T.DirectionalLight(0xffc599, 4.2); light.position.set(-4, 7, 5); scene.add(light);
    const rim = new T.DirectionalLight(0x99d5e6, 3.4); rim.position.set(4, 2, -3); scene.add(rim);
    const model = new T.Group(); scene.add(model);
    const materials = [], geometries = [];
    function material(color, extra = {}) {
      const value = new T.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.06, ...extra });
      materials.push(value); return value;
    }
    const ivory = material(0x6f9298), slate = material(0x19353e), mid = material(0x537984);
    const orange = material(0xff9b60, { emissive: 0xf88942, emissiveIntensity: 0.25 });
    const muted = material(0x9fbabb), white = material(0xd7e4d9);
    function remember(geometry) { geometries.push(geometry); return geometry; }
    function roundedSlab(width, depth, thickness, radius = 0.13) {
      const shape = new T.Shape(), x = -width / 2, z = -depth / 2;
      shape.moveTo(x + radius, z); shape.lineTo(x + width - radius, z);
      shape.quadraticCurveTo(x + width, z, x + width, z + radius);
      shape.lineTo(x + width, z + depth - radius); shape.quadraticCurveTo(x + width, z + depth, x + width - radius, z + depth);
      shape.lineTo(x + radius, z + depth); shape.quadraticCurveTo(x, z + depth, x, z + depth - radius);
      shape.lineTo(x, z + radius); shape.quadraticCurveTo(x, z, x + radius, z);
      const geometry = new T.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 8 });
      geometry.rotateX(-Math.PI / 2); return remember(geometry);
    }
    function box(parent, width, height, depth, mat, x = 0, y = 0, z = 0) {
      const mesh = new T.Mesh(remember(new T.BoxGeometry(width, height, depth)), mat);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    }
    const slabGeometry = roundedSlab(3.2, 1.9, 0.09);
    const layerMats = [slate.clone(), ivory.clone(), white.clone()]; materials.push(...layerMats);
    const layers = layerMats.map((mat, index) => {
      const group = new T.Group(); const slab = new T.Mesh(slabGeometry, mat); group.add(slab);
      const edges = new T.LineSegments(remember(new T.EdgesGeometry(slabGeometry, 32)), new T.LineBasicMaterial({ color: index === 0 ? 0x8aa2a9 : 0xffffff, transparent: true, opacity: 0.35 }));
      materials.push(edges.material); group.add(edges); model.add(group); return group;
    });
    // Data layer: physical storage modules rather than fabricated live metrics.
    [-0.94, 0, 0.94].forEach((x, index) => {
      box(layers[0], 0.7, 0.14, 1.08, mid, x, 0.19, 0.03);
      for (let j = 0; j < 4; j++) box(layers[0], 0.5, 0.017, 0.055, slate, x, 0.271, -0.3 + j * 0.2);
      box(layers[0], 0.13, 0.025, 0.065, index === 1 ? orange : ivory, x, 0.272, 0.48);
    });
    // API layer: a routing core and visible paths.
    box(layers[1], 0.68, 0.17, 0.64, orange, 0, 0.2, 0);
    box(layers[1], 0.5, 0.025, 0.47, ivory, 0, 0.297, 0);
    const apiTrackPoints = [
      [-1.3, .135, -.57], [-.76, .135, -.57], [-.76, .135, 0], [0, .135, 0], [.78, .135, 0], [.78, .135, .57], [1.3, .135, .57]
    ];
    const apiTrack = new T.CatmullRomCurve3(apiTrackPoints.map(p => new T.Vector3(...p)), false, 'centripetal');
    const routeMaterial = new T.LineBasicMaterial({ color: 0xeaa16e, transparent: true, opacity: 0.8 }); materials.push(routeMaterial);
    const route = new T.Line(remember(new T.BufferGeometry().setFromPoints(apiTrack.getPoints(60))), routeMaterial); layers[1].add(route);
    [[-1.25,-.58],[1.25,.57],[-1.23,.55],[1.22,-.54]].forEach(([x,z]) => box(layers[1], .25, .06, .22, muted, x, .17, z));
    const apiBranchGeometry = remember(new T.BufferGeometry().setFromPoints([new T.Vector3(-1.22,.135,.55),new T.Vector3(-.6,.135,.55),new T.Vector3(-.6,.135,0),new T.Vector3(0,.135,0),new T.Vector3(.6,.135,0),new T.Vector3(.6,.135,-.54),new T.Vector3(1.22,.135,-.54)]));
    layers[1].add(new T.Line(apiBranchGeometry,routeMaterial));
    // UI layer: a clear application layout with one highlighted control.
    box(layers[2], 2.8, .022, .19, slate, 0, .135, -.67);
    [-1.2,-1.04,-.88].forEach(x => box(layers[2], .06,.025,.06, muted,x,.16,-.67));
    box(layers[2], .25, .025, 1.17, mid, -1.27, .14, .13);
    [-.2,.02,.24,.46].forEach(z => box(layers[2], .13,.024,.04, white,-1.27,.165,z));
    [[-.54,-.2],[.66,-.2],[-.54,.43],[.66,.43]].forEach(([x,z],index) => {
      box(layers[2], .98,.035,.44,index === 0 ? orange : mid,x,.15,z);
      box(layers[2], .55,.012,.055,index === 0 ? ivory : slate,x-.08,.175,z-.05);
      box(layers[2], .36,.012,.035,index === 0 ? ivory : muted,x-.175,.177,z+.065);
    });
    const focusGeometry = remember(new T.BufferGeometry().setFromPoints([[-1.08,.2,-.46],[0,.2,-.46],[0,.2,.06],[-1.08,.2,.06]].map(p => new T.Vector3(...p))));
    const focusMaterial = new T.LineBasicMaterial({ color:0xffc594, transparent:true, opacity:0 }); materials.push(focusMaterial);
    const focusOutline = new T.LineLoop(focusGeometry, focusMaterial); layers[2].add(focusOutline);

    const fadingMaterials=layers.map((layer,index)=>{
      if(index===2)return [];
      const clones=new Map();
      layer.traverse(child=>{
        if(!child.material||child.material===layerMats[index])return;
        if(!clones.has(child.material)){
          const clone=child.material.clone();clone.transparent=true;materials.push(clone);clones.set(child.material,clone);
        }
        child.material=clones.get(child.material);
      });
      return [...clones.values()];
    });
    // Fine guides keep the model's layers connected in every selected state.
    const connectionGeometry = remember(new T.BufferGeometry());
    const connectionPositions = new Float32Array(24);
    connectionGeometry.setAttribute('position', new T.BufferAttribute(connectionPositions,3));
    const connectionMaterial = new T.LineDashedMaterial({color:0x9baa9f,transparent:true,opacity:.45,dashSize:.045,gapSize:.055}); materials.push(connectionMaterial);
    const connections = new T.LineSegments(connectionGeometry,connectionMaterial); model.add(connections);
    const signalGeometry = remember(new T.SphereGeometry(.06,12,8));
    const signalMaterial = new T.MeshBasicMaterial({color:0xffd1a0, transparent:true, opacity:.95}); materials.push(signalMaterial);
    const signals = Array.from({length:10}, () => { const dot = new T.Mesh(signalGeometry,signalMaterial); model.add(dot); return dot; });
    const base = new T.Mesh(remember(new T.CylinderGeometry(2.25,2.25,.018,72)),material(0x122c37,{transparent:true,opacity:.22}));
    base.position.y = -1.65; model.add(base);
    const circlePoints = Array.from({length:96},(_,i) => new T.Vector3(Math.cos(i/96*Math.PI*2)*2.26,-1.64,Math.sin(i/96*Math.PI*2)*2.26));
    const ringGeometry = remember(new T.BufferGeometry().setFromPoints(circlePoints));
    const ringMaterial = new T.LineBasicMaterial({color:0x769da5,transparent:true,opacity:.22}); materials.push(ringMaterial); model.add(new T.LineLoop(ringGeometry,ringMaterial));
    const waveMaterial = new T.LineBasicMaterial({color:0xffa46b,transparent:true,opacity:0}); materials.push(waveMaterial);
    const wave = new T.LineLoop(ringGeometry,waveMaterial); model.add(wave);
    const particleCount = 44, particlePositions = new Float32Array(particleCount*3);
    const particleGeometry = remember(new T.BufferGeometry()); particleGeometry.setAttribute('position',new T.BufferAttribute(particlePositions,3));
    const particleMaterial = new T.PointsMaterial({color:0xffb582,size:.045,transparent:true,opacity:0,depthWrite:false}); materials.push(particleMaterial);
    const particles = new T.Points(particleGeometry,particleMaterial); model.add(particles);
    const pointer = {x:0,y:0}; let burstAge = 5, disposed = false;
    const initial = serviceStates[getSelected()];
    const startAssembled = motion?.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
    layers.forEach((layer,index) => {
      layer.position.y=initial.levels[index]+(startAssembled?0:(index-1)*.6);
      layer.position.x=initial.offsets[index]+(startAssembled?0:(index-1)*.55);
    });
    function draw({time,delta,active,reduced}) {
      if (disposed) return;
      const selected = getSelected(), state = serviceStates[selected];
      const ease = active ? 1 - Math.exp(-delta*4.4) : 1;
      layers.forEach((layer,index) => {
        layer.position.y += (state.levels[index]-layer.position.y)*ease;
        layer.position.x += (state.offsets[index]-layer.position.x)*ease;
        layer.rotation.y += ((state.turns?.[index] || 0)-layer.rotation.y)*ease;
        const targetScale=selected==='a11y'&&index===2?1.16:1;
        layer.scale.setScalar(layer.scale.x+(targetScale-layer.scale.x)*ease);
        const targetOpacity=selected==='a11y'&&index<2?.2:1;
        fadingMaterials[index].forEach(mat=>{mat.opacity+=(targetOpacity-mat.opacity)*ease;});
        layerMats[index].transparent=true;
        layerMats[index].opacity+=(targetOpacity-layerMats[index].opacity)*ease;
      });
      model.rotation.y += (((reduced?0:pointer.x)*.11)-model.rotation.y)*ease;
      model.rotation.x += (((reduced?0:pointer.y)*.035)-model.rotation.x)*ease;
      model.position.y=-.06+(active?Math.sin(time*.55)*.035:0);
      focusMaterial.opacity=selected==='a11y'?1:0;
      routeMaterial.opacity=selected==='sm'?1:.6;
      connectionMaterial.color.set(selected==='sm'?0xffac73:0x7d9ca3);
      connectionMaterial.opacity=selected==='a11y'?.15:selected==='sm'?.72:.38;
      focusOutline.scale.setScalar(selected==='a11y'&&active?1+Math.sin(time*1.5)*.012:1);
      let write=0;
      for(const x of [-1.42,1.42]) {
        for(let layer=0;layer<2;layer++) {
          for(const index of [layer,layer+1]) {
            connectionPositions[write++]=x+layers[index].position.x;
            connectionPositions[write++]=layers[index].position.y+.06;
            connectionPositions[write++]=x<0?-.75:.75;
          }
        }
      }
      connectionGeometry.attributes.position.needsUpdate=true; connections.computeLineDistances();
      signals.forEach((dot,i)=>{
        dot.visible=selected==='sm';
        if(i<6) {
          const phase=(time*.23+i/6)%1, point=apiTrack.getPoint(phase);
          dot.position.copy(point).add(layers[1].position); dot.position.y+=.025;
        } else {
          const phase=(time*.3+(i-6)/4)%1;
          dot.position.set(i%2?1.42:-1.42,layers[0].position.y+(layers[2].position.y-layers[0].position.y)*phase,i%2?.75:-.75);
        }
      });
      burstAge+=active?delta:0;
      const burstProgress=Math.min(burstAge/1.25,1), strength=reduced?0:1-burstProgress;
      wave.visible=strength>0; wave.scale.set(1+burstProgress*.14,1,1+burstProgress*.14); waveMaterial.opacity=strength*.6;
      particleMaterial.opacity=strength*.6;
      for(let i=0;i<particleCount;i++) {
        const angle=i/particleCount*Math.PI*2, radius=1.7+burstProgress*.75;
        particlePositions[i*3]=Math.cos(angle)*radius;
        particlePositions[i*3+1]=-.5+Math.sin(i*2.1)*.62+burstProgress*.33;
        particlePositions[i*3+2]=Math.sin(angle)*radius;
      }
      particleGeometry.attributes.position.needsUpdate=true;
      renderer.render(scene,camera);
    }
    function size() {
      const width=stage.clientWidth,height=stage.clientHeight;
      if(!width||!height) return;
      renderer.setSize(width,height,false);
      const aspect=width/height, halfHeight=3.06;
      camera.left=-halfHeight*aspect; camera.right=halfHeight*aspect; camera.top=halfHeight; camera.bottom=-halfHeight;
      camera.updateProjectionMatrix(); loop?.invalidate();
    }
    size();
    loop=(motion?.loop || localMotionLoop)(stage,draw);
    resizeObserver=new ResizeObserver(size); resizeObserver.observe(stage);
    const move=event=>{
      if(!loop.active||event.pointerType==='touch') return;
      const rect=stage.getBoundingClientRect(); pointer.x=(event.clientX-rect.left)/rect.width-.5; pointer.y=(event.clientY-rect.top)/rect.height-.5;
    };
    const leave=()=>{pointer.x=0;pointer.y=0;};
    stage.addEventListener('pointermove',move); stage.addEventListener('pointerleave',leave);
    function cleanup() {
      if(disposed) return; disposed=true;
      loop.destroy(); resizeObserver.disconnect();
      stage.removeEventListener('pointermove',move); stage.removeEventListener('pointerleave',leave);
      geometries.forEach(geometry=>geometry.dispose()); materials.forEach(mat=>mat.dispose());
      renderer.dispose(); renderer.domElement.remove(); explorer.classList.remove('is-rendered'); explorer.dataset.renderer='fallback';
    }
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();},{once:true});
    window.addEventListener('pagehide',event=>{if(!event.persisted)cleanup();});
    loop.invalidate(); explorer.classList.add('is-rendered'); explorer.dataset.renderer='webgl';
    return {select(){if(disposed)return;burstAge=0;if(getSelected()==='si'&&!motion?.reduced){layers.forEach((layer,index)=>{layer.position.y=serviceStates.si.levels[index]+(index-1)*.72;layer.position.x=(index-1)*.6;});}loop.invalidate();}};
  } catch {
    loop?.destroy(); resizeObserver?.disconnect();
    if(renderer){renderer.dispose();renderer.domElement.remove();}
    explorer.classList.remove('is-rendered'); explorer.dataset.renderer='fallback';
    return null;
  }
}

function initializeServices() {
  const explorer=document.getElementById('serviceScene');
  if(!explorer) return;
  let selected='si', model=null;
  const buttons=[...explorer.querySelectorAll('[data-service-choice]')];
  const select=button=>{
    const next=button.dataset.serviceChoice;
    if(!serviceStates[next]||next===selected) return;
    selected=next; const state=serviceStates[next]; explorer.dataset.service=next;
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    document.getElementById('serviceSceneMode').textContent=state.number;
    document.getElementById('serviceSceneCaption').textContent=state.caption;
    document.getElementById('serviceSceneStatus').textContent=state.announcement;
    model?.select();
  };
  buttons.forEach(button=>{
    button.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')select(button);});
    button.addEventListener('focus',()=>select(button));
    button.addEventListener('click',()=>select(button));
  });
  window.DeonaeunMotion?.observe(explorer,()=>{});
  createSystemModel(explorer,document.getElementById('serviceCanvas'),explorer,()=>selected).then(value=>{model=value;});
  const toggle=document.getElementById('a11yMiniToggle');
  const help=document.getElementById('a11yMiniHelp');
  const status=document.getElementById('a11yMiniStatus');
  toggle?.addEventListener('change',()=>{
    help.hidden=!toggle.checked;
    status.textContent=toggle.checked?'선택한 안내가 펼쳐졌습니다.':'키보드 안내를 닫았습니다.';
  });
  document.getElementById('a11yMiniReset')?.addEventListener('click',()=>{
    toggle.checked=false;help.hidden=true;status.textContent='처음 상태로 돌아왔습니다.';toggle.focus();
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initializeServices,{once:true});
else initializeServices();
