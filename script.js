/* Grupo Tenno — interacción, núcleo 3D y movimiento */
(()=>{
  const root=document.documentElement;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

  /* Año del pie de página */
  const year=document.getElementById('year');
  if(year)year.textContent=String(new Date().getFullYear());

  /* Entrada del hero: escalonado de los elementos marcados con data-load */
  document.querySelectorAll('[data-load]').forEach((el,i)=>el.style.setProperty('--d',String(100+i*110)));
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('is-loaded')));

  /* Texto que se "decodifica" (las etiquetas mono de cada sección) */
  const glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_-';
  const scramble=el=>{
    const text=el.dataset.text;
    const out=el.querySelector('[aria-hidden]');
    const start=performance.now();
    const duration=700;
    const step=now=>{
      const t=Math.min(1,(now-start)/duration);
      const shown=Math.floor(text.length*t);
      let s=text.slice(0,shown);
      for(let i=shown;i<text.length;i++)s+=text[i]===' '?' ':glyphs[(Math.random()*glyphs.length)|0];
      out.textContent=s;
      if(t<1)requestAnimationFrame(step);else out.textContent=text;
    };
    requestAnimationFrame(step);
  };
  document.querySelectorAll('[data-scramble]').forEach(el=>{
    const text=el.textContent.trim();
    el.dataset.text=text;
    el.textContent='';
    const sr=document.createElement('span');sr.className='sr-only';sr.textContent=text;
    const vis=document.createElement('span');vis.setAttribute('aria-hidden','true');vis.textContent=text;
    el.append(sr,vis);
  });

  /* Revelado al hacer scroll, escalonado dentro de cada grupo */
  const reveals=[...document.querySelectorAll('.reveal')];
  if('IntersectionObserver' in window&&!reducedMotion){
    const groups=new Map();
    reveals.forEach(el=>{
      const parent=el.parentElement;
      const index=groups.get(parent)||0;
      groups.set(parent,index+1);
      el.style.setProperty('--d',String(Math.min(index,6)*90));
    });
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-in');
        if(entry.target.hasAttribute('data-scramble'))scramble(entry.target);
        io.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    reveals.forEach(el=>io.observe(el));
  }else{
    reveals.forEach(el=>el.classList.add('is-in'));
  }

  /* Contadores (solo animan cifras que ya están en el contenido) */
  const counters=document.querySelectorAll('[data-count]');
  if(counters.length&&!reducedMotion){
    counters.forEach((el,i)=>{
      const target=Number(el.dataset.count);
      const start=performance.now()+700+i*120;
      const step=now=>{
        const t=clamp((now-start)/1100,0,1);
        el.textContent=String(Math.round(target*(1-Math.pow(1-t,3)))).padStart(2,'0');
        if(t<1)requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* Cabecera: fondo al desplazarse, se oculta al bajar y reaparece al subir, barra de progreso */
  const header=document.querySelector('.site-header');
  const progress=document.querySelector('.progress');
  const pipeline=document.querySelector('.pipeline');
  const steps=pipeline?[...pipeline.querySelectorAll('.step')]:[];
  const mqVertical=window.matchMedia('(max-width: 640px)');
  const mqGrid=window.matchMedia('(max-width: 1140px)');
  let lastY=window.scrollY;
  let ticking=false;

  /* Ciclo de trabajo: la línea se llena según el avance del scroll */
  const updatePipeline=()=>{
    if(!pipeline)return;
    const vh=window.innerHeight;
    const r=pipeline.getBoundingClientRect();
    if(reducedMotion){pipeline.style.setProperty('--fill','1');steps.forEach(s=>s.classList.add('is-lit'));return;}
    if(mqVertical.matches){
      const p=clamp((vh*.7-r.top)/r.height,0,1);
      pipeline.style.setProperty('--fill',p.toFixed(3));
      steps.forEach(s=>s.classList.toggle('is-lit',p>=s.offsetTop/r.height));
    }else if(mqGrid.matches){
      steps.forEach(s=>s.classList.toggle('is-lit',s.getBoundingClientRect().top<vh*.8));
    }else{
      const p=clamp((vh*.85-r.top)/(vh*.45),0,1);
      pipeline.style.setProperty('--fill',p.toFixed(3));
      steps.forEach(s=>s.classList.toggle('is-lit',p>=(s.offsetLeft+8)/r.width));
    }
  };

  const onScroll=()=>{
    const y=window.scrollY;
    header.classList.toggle('is-scrolled',y>24);
    const menuOpen=header.classList.contains('menu-open');
    header.classList.toggle('is-hidden',!menuOpen&&y>lastY&&y>480);
    lastY=y;
    const max=root.scrollHeight-window.innerHeight;
    progress.style.setProperty('--p',max>0?(y/max).toFixed(4):'0');
    updatePipeline();
    ticking=false;
  };
  window.addEventListener('scroll',()=>{
    if(!ticking){ticking=true;requestAnimationFrame(onScroll);}
  },{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();
  header.addEventListener('focusin',()=>header.classList.remove('is-hidden'));

  /* Menú móvil accesible */
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.getElementById('site-nav');
  const toggleLabel=toggle.querySelector('.sr-only');
  const setMenu=open=>{
    toggle.setAttribute('aria-expanded',String(open));
    toggleLabel.textContent=open?'Cerrar menú':'Abrir menú';
    nav.classList.toggle('is-open',open);
    header.classList.toggle('menu-open',open);
    document.body.style.overflow=open?'hidden':'';
    if(open)nav.querySelector('a').focus({preventScroll:true});
  };
  toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&nav.classList.contains('is-open')){setMenu(false);toggle.focus();}
  });
  window.matchMedia('(min-width: 1141px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});

  /* Enlace activo según la sección visible */
  const navLinks=[...document.querySelectorAll('.site-nav ul a')];
  const sections=navLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){
    const spy=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const id='#'+entry.target.id;
        navLinks.forEach(link=>{
          if(link.getAttribute('href')===id)link.setAttribute('aria-current','true');
          else link.removeAttribute('aria-current');
        });
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    sections.forEach(section=>spy.observe(section));
  }

  /* Consola de 8 áreas: pestañas accesibles + mapa radial sincronizado */
  const consoleEl=document.querySelector('.console');
  if(consoleEl){
    const tabs=[...consoleEl.querySelectorAll('[role="tab"]')];
    const panels=tabs.map(tab=>document.getElementById(tab.getAttribute('aria-controls')));
    const svgNS='http://www.w3.org/2000/svg';
    const spokes=consoleEl.querySelector('.map-spokes');
    const nodesG=consoleEl.querySelector('.map-nodes');
    const beam=consoleEl.querySelector('.map-beam');
    const nodes=tabs.map((tab,i)=>{
      const a=(-90+i*45)*Math.PI/180;
      const x=200+Math.cos(a)*150, y=200+Math.sin(a)*150;
      const spoke=document.createElementNS(svgNS,'line');
      spoke.setAttribute('x1','200');spoke.setAttribute('y1','200');spoke.setAttribute('x2',x.toFixed(1));spoke.setAttribute('y2',y.toFixed(1));
      spokes.appendChild(spoke);
      const g=document.createElementNS(svgNS,'g');
      g.setAttribute('class','map-node');
      g.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      const c=document.createElementNS(svgNS,'circle');c.setAttribute('r','20');
      const t=document.createElementNS(svgNS,'text');t.textContent=String(i+1).padStart(2,'0');
      g.append(c,t);
      g.addEventListener('click',()=>{stopAuto();select(i,false);});
      nodesG.appendChild(g);
      return {g,x,y};
    });
    let current=0;
    const select=(i,focus)=>{
      current=i;
      tabs.forEach((tab,j)=>{
        const on=j===i;
        tab.setAttribute('aria-selected',String(on));
        tab.tabIndex=on?0:-1;
        panels[j].classList.toggle('is-active',on);
        panels[j].hidden=!on;
        nodes[j].g.classList.toggle('is-active',on);
      });
      beam.setAttribute('x2',nodes[i].x.toFixed(1));
      beam.setAttribute('y2',nodes[i].y.toFixed(1));
      beam.classList.remove('is-drawing');void beam.getBBox();beam.classList.add('is-drawing');
      if(focus)tabs[i].focus();
    };
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>{stopAuto();select(i,false);});
      tab.addEventListener('keydown',event=>{
        const keys={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};
        let next=null;
        if(event.key in keys)next=(i+keys[event.key]+tabs.length)%tabs.length;
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=tabs.length-1;
        if(next===null)return;
        event.preventDefault();stopAuto();select(next,true);
      });
    });
    select(0,false);

    /* Recorrido automático mientras la consola está a la vista, hasta que el usuario interactúa */
    let timer=0,stopped=reducedMotion;
    function stopAuto(){stopped=true;clearInterval(timer);timer=0;}
    consoleEl.addEventListener('pointerdown',stopAuto);
    consoleEl.addEventListener('focusin',stopAuto);
    if(!stopped&&'IntersectionObserver' in window){
      new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(stopped)return;
          if(entry.isIntersecting&&!timer)timer=setInterval(()=>select((current+1)%tabs.length,false),4200);
          else if(!entry.isIntersecting){clearInterval(timer);timer=0;}
        });
      },{threshold:.45}).observe(consoleEl);
    }
  }

  /* Núcleo 3D del hero: esfera de nodos con las 4 marcas en órbita */
  const canvas=document.querySelector('.core-canvas');
  const ctx=canvas&&canvas.getContext&&canvas.getContext('2d');
  if(ctx){
    const visual=canvas.parentElement;
    visual.classList.add('has-canvas');
    const small=window.matchMedia('(max-width: 640px)').matches;
    const N=small?220:380;
    const golden=Math.PI*(3-Math.sqrt(5));
    const pts=[];
    for(let i=0;i<N;i++){
      const y=1-(i/(N-1))*2;
      const r=Math.sqrt(1-y*y);
      const th=golden*i;
      pts.push({x:Math.cos(th)*r,y,z:Math.sin(th)*r,hue:(y+1)/2});
    }
    const links=[];
    const d0=Math.sqrt(4*Math.PI/N)*1.15;
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dz=pts[i].z-pts[j].z;
      if(dx*dx+dy*dy+dz*dz<d0*d0)links.push([i,j]);
    }
    const brands=[
      {name:'MISTI GLASS',color:'255,138,76'},
      {name:'RESERVA AQUERIS',color:'255,93,122'},
      {name:'KANTU FLORAL',color:'255,158,192'},
      {name:'BOCATTO',color:'242,196,109'}
    ];
    const packets=Array.from({length:small?8:14},()=>({l:(Math.random()*links.length)|0,p:Math.random(),s:.006+Math.random()*.01}));

    let W=0,H=0,R=0,cx=0,cy=0,dpr=1;
    const resize=()=>{
      const rect=visual.getBoundingClientRect();
      dpr=Math.min(window.devicePixelRatio||1,1.75);
      W=rect.width;H=rect.height;
      canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      R=Math.min(W,H)*.29;cx=W/2;cy=H/2;
    };
    resize();
    if('ResizeObserver' in window)new ResizeObserver(()=>{resize();if(!running)draw(last);}).observe(visual);

    let rotY=.6,tiltX=.38,targetTilt=.38,spin=.0032,drag=null,velocity=0;
    const rot=(p,ay,ax)=>{
      const cA=Math.cos(ay),sA=Math.sin(ay),cB=Math.cos(ax),sB=Math.sin(ax);
      const x=p.x*cA+p.z*sA;
      const z1=-p.x*sA+p.z*cA;
      const y=p.y*cB-z1*sB;
      const z=p.y*sB+z1*cB;
      const s=3.4/(3.4+z);
      return {x:cx+x*R*s,y:cy+y*R*s,z,s,near:(1-z)/2};
    };

    const draw=t=>{
      ctx.clearRect(0,0,W,H);
      /* resplandor del núcleo */
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.5);
      g.addColorStop(0,'rgba(95,243,255,.22)');g.addColorStop(.45,'rgba(139,123,255,.10)');g.addColorStop(1,'rgba(4,6,10,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

      /* órbita de las marcas */
      const orbitTilt=tiltX+.18;
      const orbitR=1.5;
      ctx.beginPath();
      for(let k=0;k<=72;k++){
        const a=k/72*Math.PI*2;
        const q=rot({x:Math.cos(a)*orbitR,y:0,z:Math.sin(a)*orbitR},0,orbitTilt);
        k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);
      }
      ctx.strokeStyle='rgba(150,205,255,.16)';ctx.lineWidth=1;ctx.setLineDash([2,5]);ctx.stroke();ctx.setLineDash([]);

      /* esfera de nodos */
      const P=pts.map(p=>rot(p,rotY,tiltX));
      ctx.lineWidth=.7;
      for(const [i,j] of links){
        const a=P[i],b=P[j];
        const n=(a.near+b.near)/2;
        ctx.strokeStyle=`rgba(95,243,255,${(.03+n*n*.32).toFixed(3)})`;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      for(let i=0;i<N;i++){
        const q=P[i],h=pts[i].hue;
        const r=.5+q.near*1.7;
        ctx.fillStyle=`rgba(${Math.round(95+44*h)},${Math.round(243-120*h)},255,${(.18+q.near*.82).toFixed(3)})`;
        ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();
      }
      /* paquetes de datos viajando por la red */
      for(const k of packets){
        const [i,j]=links[k.l];
        const a=P[i],b=P[j];
        const x=a.x+(b.x-a.x)*k.p,y=a.y+(b.y-a.y)*k.p;
        const n=(a.near+b.near)/2;
        ctx.fillStyle=`rgba(255,255,255,${(.25+n*.75).toFixed(3)})`;
        ctx.beginPath();ctx.arc(x,y,1.2+n*1.4,0,Math.PI*2);ctx.fill();
      }

      /* núcleo */
      ctx.fillStyle='rgba(8,14,26,.9)';ctx.strokeStyle='rgba(95,243,255,.75)';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.arc(cx,cy,R*.2,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#eaf1fb';ctx.font=`600 ${Math.round(R*.15)}px Geist, system-ui, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('GT',cx,cy+1);

      /* marcas en órbita, con enlace al núcleo */
      const fs=small?9.5:11;
      ctx.font=`500 ${fs}px "Geist Mono", ui-monospace, monospace`;
      brands.forEach((b,i)=>{
        const a=rotY*.55+i*Math.PI/2;
        const q=rot({x:Math.cos(a)*orbitR,y:0,z:Math.sin(a)*orbitR},0,orbitTilt);
        const alpha=q.z>.2?.4:1;
        const lg=ctx.createLinearGradient(cx,cy,q.x,q.y);
        lg.addColorStop(0,'rgba(95,243,255,0)');lg.addColorStop(1,`rgba(${b.color},${.55*alpha})`);
        ctx.strokeStyle=lg;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(q.x,q.y);ctx.stroke();
        const pp=((t/1600)+i*.25)%1;
        ctx.fillStyle=`rgba(${b.color},${alpha})`;
        ctx.beginPath();ctx.arc(cx+(q.x-cx)*pp,cy+(q.y-cy)*pp,1.8,0,Math.PI*2);ctx.fill();
        const halo=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,16*q.s);
        halo.addColorStop(0,`rgba(${b.color},${.55*alpha})`);halo.addColorStop(1,`rgba(${b.color},0)`);
        ctx.fillStyle=halo;ctx.beginPath();ctx.arc(q.x,q.y,16*q.s,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgba(${b.color},${alpha})`;ctx.beginPath();ctx.arc(q.x,q.y,4.2*q.s,0,Math.PI*2);ctx.fill();
        const w=ctx.measureText(b.name).width;
        const lx=clamp(q.x,w/2+6,W-w/2-6);
        ctx.fillStyle=`rgba(234,241,251,${(.92*alpha).toFixed(3)})`;
        ctx.fillText(b.name,lx,q.y-14*q.s-6);
      });
    };

    let running=false,raf=0,last=0,prev=0;
    const loop=t=>{
      const dt=Math.min(50,t-(prev||t));prev=t;last=t;
      if(!drag){rotY+=spin*dt/16+velocity;velocity*=.94;}
      tiltX+=(targetTilt-tiltX)*.05;
      for(const k of packets){k.p+=k.s*dt/16;if(k.p>=1){k.p=0;k.l=(Math.random()*links.length)|0;}}
      draw(t);
      raf=requestAnimationFrame(loop);
    };
    const start=()=>{if(running||reducedMotion)return;running=true;prev=0;raf=requestAnimationFrame(loop);};
    const stop=()=>{running=false;cancelAnimationFrame(raf);};
    draw(0);
    if(!reducedMotion){
      let inView=true;
      if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{inView=e.isIntersecting;inView&&!document.hidden?start():stop();}).observe(visual);
      document.addEventListener('visibilitychange',()=>{document.hidden||!inView?stop():start();});
      start();

      /* Arrastrar para girar el núcleo */
      visual.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};velocity=0;visual.setPointerCapture(e.pointerId);});
      visual.addEventListener('pointermove',e=>{
        if(!drag)return;
        const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
        rotY+=dx*.008;velocity=dx*.0016;
        targetTilt=clamp(targetTilt+dy*.004,-.2,.9);
        drag={x:e.clientX,y:e.clientY};
      });
      const end=()=>{drag=null;};
      visual.addEventListener('pointerup',end);visual.addEventListener('pointercancel',end);
      if(finePointer){
        window.addEventListener('pointermove',e=>{
          if(drag)return;
          targetTilt=.38+(e.clientY/window.innerHeight-.5)*.35;
        },{passive:true});
      }
    }
  }

  if(!finePointer||reducedMotion)return;

  /* Tarjetas de marca: inclinación 3D y luz que sigue el cursor */
  document.querySelectorAll('.brand').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      const r=card.getBoundingClientRect();
      const x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;
      card.style.setProperty('--mx',`${(x*100).toFixed(1)}%`);
      card.style.setProperty('--my',`${(y*100).toFixed(1)}%`);
      card.style.setProperty('--rx',`${((.5-y)*7).toFixed(2)}deg`);
      card.style.setProperty('--ry',`${((x-.5)*9).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
  });

  /* Botones magnéticos */
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('pointermove',event=>{
      const r=btn.getBoundingClientRect();
      const x=(event.clientX-r.left-r.width/2)*.16;
      const y=(event.clientY-r.top-r.height/2)*.26;
      btn.style.transform=`translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave',()=>{btn.style.transform='';});
  });
})();
