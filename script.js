/* Grupo Tenno — interacción, movimiento y progresión visual */
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Capa de estilos de movimiento. Si no carga, la web base sigue funcionando. */
const motionStyle=document.createElement('link');
motionStyle.rel='stylesheet';
motionStyle.href='motion.css?v=1';
document.head.appendChild(motionStyle);
motionStyle.addEventListener('load',()=>document.documentElement.classList.add('motion-ready'));

/* Foto del fundador: se reconstruye desde fragmentos verificados para evitar recursos truncados. */
const founderPhoto=document.querySelector('.photo-frame img');
if(founderPhoto){
  const parts=['assets/founder-b64-1.txt','assets/founder-b64-2.txt','assets/founder-b64-3.txt','assets/founder-b64-4.txt'];
  founderPhoto.loading='eager';
  founderPhoto.fetchPriority='high';
  founderPhoto.decoding='async';
  founderPhoto.removeAttribute('srcset');
  founderPhoto.style.opacity='0';
  founderPhoto.style.transition='opacity .22s ease';
  founderPhoto.removeAttribute('src');
  Promise.all(parts.map(url=>fetch(url+'?v=7').then(response=>{
    if(!response.ok)throw new Error('No se pudo cargar '+url);
    return response.text();
  }))).then(chunks=>{
    const base64=chunks.join('').replace(/\s/g,'');
    if(base64.length!==7184)throw new Error('Foto incompleta: '+base64.length);
    founderPhoto.onload=()=>{founderPhoto.style.opacity='1'};
    founderPhoto.src='data:image/webp;base64,'+base64;
  }).catch(()=>{founderPhoto.style.opacity='0'});
}

/* Navegación */
const header=document.querySelector('.site-header');
const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');
const navLinks=document.querySelectorAll('.site-nav a');
const setHeader=()=>header?.classList.toggle('scrolled',window.scrollY>16);
setHeader();
window.addEventListener('scroll',setHeader,{passive:true});
menuButton?.addEventListener('click',()=>{
  const open=!nav.classList.contains('open');
  nav.classList.toggle('open',open);
  menuButton.classList.toggle('open',open);
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
});
navLinks.forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuButton?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&nav?.classList.contains('open')){
    nav.classList.remove('open');
    menuButton?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded','false');
    menuButton?.focus();
  }
});

/* Barra de avance: representa visualmente seguimiento y medición. */
const progress=document.createElement('div');
progress.className='scroll-progress';
progress.setAttribute('aria-hidden','true');
progress.innerHTML='<span></span>';
document.body.appendChild(progress);
const progressBar=progress.firstElementChild;
let progressFrame=0;
const updateProgress=()=>{
  if(progressFrame)return;
  progressFrame=requestAnimationFrame(()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const value=Math.min(1,Math.max(0,window.scrollY/max));
    progressBar.style.transform=`scaleX(${value})`;
    progressFrame=0;
  });
};
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress,{passive:true});
updateProgress();

/* Aparición progresiva al entrar en pantalla */
const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window&&!reducedMotion){
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px'});
  revealItems.forEach((item,index)=>{
    if(item.closest('.brand-grid'))item.style.transitionDelay=`${Math.min(index%4,3)*55}ms`;
    observer.observe(item);
  });
}else{
  revealItems.forEach(item=>item.classList.add('visible'));
}

/* QUÉ HACEMOS: convierte la cuadrícula en un sistema de gestión conectado. */
function enhanceManagement(){
  const section=document.querySelector('#gestion');
  const grid=section?.querySelector('.capability-grid');
  if(!section||!grid||section.dataset.enhanced==='true')return;
  section.dataset.enhanced='true';
  section.classList.add('management-system');

  const cards=[...grid.querySelectorAll('.capability-card')];
  const shortNames=['Estrategia','Finanzas','Operaciones','Ventas','Marketing','Innovación','Control','Mejora'];
  const subtitles=['Dirección','Recursos','Ejecución','Clientes','Presencia','Tecnología','Seguimiento','Soporte'];
  const metrics=[
    ['Objetivos','Prioridades','Avance'],
    ['Ingresos','Costos','Margen'],
    ['Tiempos','Entregas','Incidencias'],
    ['Conversión','Ticket','Recurrencia'],
    ['Alcance','Leads','Retorno'],
    ['Automatización','Adopción','Eficiencia'],
    ['KPIs','Desviaciones','Cumplimiento'],
    ['Respuesta','Mejoras','Continuidad']
  ];
  const positions=[[50,10],[78,22],[90,50],[78,78],[50,90],[22,78],[10,50],[22,22]];

  const system=document.createElement('div');
  system.className='control-system reveal';
  system.innerHTML=`
    <div class="control-map" aria-label="Mapa interactivo de las áreas gestionadas por Grupo Tenno">
      <svg class="control-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
      <div class="control-hub" aria-hidden="true">
        <div><img src="assets/grupo-tenno-mark.webp" alt=""><strong>GRUPO TENNO</strong><small>CONTROL CENTRAL</small></div>
      </div>
    </div>
    <aside class="control-detail" aria-label="Detalle del área seleccionada">
      <div class="detail-top"><span class="detail-kicker">ÁREA ACTIVA</span><span class="detail-number">01</span></div>
      <h3></h3>
      <p class="detail-description"></p>
      <div class="detail-measure"><span>QUÉ MEDIMOS</span><div class="metric-chips"></div></div>
      <div class="detail-message">Decisiones conectadas con datos y ejecución.</div>
    </aside>`;
  grid.insertAdjacentElement('afterend',system);

  const map=system.querySelector('.control-map');
  const svg=system.querySelector('.control-lines');
  const detail=system.querySelector('.control-detail');
  const detailNumber=detail.querySelector('.detail-number');
  const detailTitle=detail.querySelector('h3');
  const detailDescription=detail.querySelector('.detail-description');
  const chips=detail.querySelector('.metric-chips');

  positions.forEach(([x,y],index)=>{
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1','50');line.setAttribute('y1','50');line.setAttribute('x2',String(x));line.setAttribute('y2',String(y));
    line.classList.add('control-line');line.dataset.index=String(index);svg.appendChild(line);

    const button=document.createElement('button');
    button.type='button';
    button.className='control-node';
    button.style.setProperty('--node-x',x+'%');
    button.style.setProperty('--node-y',y+'%');
    button.dataset.index=String(index);
    button.setAttribute('aria-pressed','false');
    button.innerHTML=`<span class="node-index">${String(index+1).padStart(2,'0')}</span><strong>${shortNames[index]}</strong><small>${subtitles[index]}</small>`;
    map.appendChild(button);
  });

  const nodes=[...map.querySelectorAll('.control-node')];
  const lines=[...svg.querySelectorAll('.control-line')];
  const activate=index=>{
    const card=cards[index];
    if(!card)return;
    nodes.forEach((node,i)=>{
      node.classList.toggle('is-active',i===index);
      node.setAttribute('aria-pressed',String(i===index));
    });
    lines.forEach((line,i)=>line.classList.toggle('is-active',i===index));
    detailNumber.textContent=String(index+1).padStart(2,'0');
    detailTitle.textContent=card.querySelector('h3')?.textContent||shortNames[index];
    detailDescription.textContent=card.querySelector('p')?.textContent||'';
    chips.innerHTML=metrics[index].map(metric=>`<span>${metric}</span>`).join('');
    if(!reducedMotion&&detail.animate){
      detail.animate([{opacity:.72,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,easing:'cubic-bezier(.2,.75,.2,1)'});
    }
  };
  nodes.forEach((node,index)=>{
    node.addEventListener('click',()=>activate(index));
    node.addEventListener('focus',()=>activate(index));
    if(finePointer)node.addEventListener('mouseenter',()=>activate(index));
  });
  activate(0);

  if(finePointer&&!reducedMotion){
    let raf=0;
    map.addEventListener('pointermove',event=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        const r=map.getBoundingClientRect();
        const px=(event.clientX-r.left)/r.width-.5;
        const py=(event.clientY-r.top)/r.height-.5;
        map.style.setProperty('--map-y',`${px*2.2}deg`);
        map.style.setProperty('--map-x',`${py*-2.2}deg`);
        raf=0;
      });
    });
    map.addEventListener('pointerleave',()=>{
      map.style.setProperty('--map-y','0deg');
      map.style.setProperty('--map-x','0deg');
    });
  }

  if('IntersectionObserver'in window&&!reducedMotion){
    const systemObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){system.classList.add('visible');systemObserver.disconnect();}
      });
    },{threshold:.14});
    systemObserver.observe(system);
  }else system.classList.add('visible');
}

enhanceManagement();

/* Hero: el cursor mueve ligeramente el ecosistema alrededor de la dirección central. */
const hero=document.querySelector('.hero');
if(hero&&finePointer&&!reducedMotion){
  let heroFrame=0;
  hero.addEventListener('pointermove',event=>{
    if(heroFrame)return;
    heroFrame=requestAnimationFrame(()=>{
      const r=hero.getBoundingClientRect();
      const x=((event.clientX-r.left)/r.width-.5)*12;
      const y=((event.clientY-r.top)/r.height-.5)*10;
      hero.style.setProperty('--hero-x',`${x}px`);
      hero.style.setProperty('--hero-y',`${y}px`);
      heroFrame=0;
    });
  });
  hero.addEventListener('pointerleave',()=>{
    hero.style.setProperty('--hero-x','0px');
    hero.style.setProperty('--hero-y','0px');
  });
}

/* Marcas: microinteracción 3D para comunicar que cada negocio conserva identidad propia. */
if(finePointer&&!reducedMotion){
  document.querySelectorAll('.brand-card').forEach(card=>{
    let cardFrame=0;
    card.addEventListener('pointermove',event=>{
      if(cardFrame)return;
      cardFrame=requestAnimationFrame(()=>{
        const r=card.getBoundingClientRect();
        const x=(event.clientX-r.left)/r.width;
        const y=(event.clientY-r.top)/r.height;
        card.style.setProperty('--tilt-y',`${(x-.5)*4.5}deg`);
        card.style.setProperty('--tilt-x',`${(y-.5)*-4.5}deg`);
        card.style.setProperty('--shine-x',`${x*100}%`);
        card.style.setProperty('--shine-y',`${y*100}%`);
        card.classList.add('is-pointed');
        cardFrame=0;
      });
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--tilt-y','0deg');
      card.style.setProperty('--tilt-x','0deg');
      card.classList.remove('is-pointed');
    });
  });
}

/* Fundador: profundidad mínima, sin distraer del contenido. */
const founderBlock=document.querySelector('.founder-photo');
if(founderBlock&&finePointer&&!reducedMotion){
  let founderFrame=0;
  founderBlock.addEventListener('pointermove',event=>{
    if(founderFrame)return;
    founderFrame=requestAnimationFrame(()=>{
      const r=founderBlock.getBoundingClientRect();
      const x=((event.clientX-r.left)/r.width-.5)*-5;
      const y=((event.clientY-r.top)/r.height-.5)*-5;
      founderBlock.style.setProperty('--founder-x',`${x}px`);
      founderBlock.style.setProperty('--founder-y',`${y}px`);
      founderFrame=0;
    });
  });
  founderBlock.addEventListener('pointerleave',()=>{
    founderBlock.style.setProperty('--founder-x','0px');
    founderBlock.style.setProperty('--founder-y','0px');
  });
}

/* Pequeña entrada secuencial de los indicadores 360° / KPIs / expansión. */
const facts=document.querySelectorAll('.fact-row>div');
if(facts.length&&'IntersectionObserver'in window&&!reducedMotion){
  const factObserver=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){
      facts.forEach((fact,index)=>fact.animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:index*90,easing:'cubic-bezier(.2,.75,.2,1)',fill:'both'}));
      factObserver.disconnect();
    }
  },{threshold:.45});
  factObserver.observe(document.querySelector('.fact-row'));
}

const year=document.getElementById('year');
if(year)year.textContent=new Date().getFullYear();
