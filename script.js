/* Grupo Tenno — interacción y movimiento */
(()=>{
  const root=document.documentElement;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Año del pie de página */
  const year=document.getElementById('year');
  if(year)year.textContent=String(new Date().getFullYear());

  /* Entrada del hero: escalonado de los elementos marcados con data-load */
  document.querySelectorAll('[data-load]').forEach((el,i)=>el.style.setProperty('--d',String(120+i*110)));
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('is-loaded')));

  /* El diagrama del núcleo usa SMIL: se pausa si el usuario prefiere menos movimiento */
  const coreSvg=document.querySelector('.core-svg');
  if(coreSvg&&reducedMotion&&coreSvg.pauseAnimations)coreSvg.pauseAnimations();

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
        io.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    reveals.forEach(el=>io.observe(el));
  }else{
    reveals.forEach(el=>el.classList.add('is-in'));
  }

  /* Contadores de cifras (solo animan valores que ya están en el contenido) */
  const counters=document.querySelectorAll('[data-count]');
  if(counters.length&&'IntersectionObserver' in window&&!reducedMotion){
    const countIo=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const el=entry.target;
        const target=Number(el.dataset.count);
        const start=performance.now();
        const duration=1200;
        const step=now=>{
          const t=Math.min(1,(now-start)/duration);
          const eased=1-Math.pow(1-t,3);
          el.textContent=String(Math.round(target*eased)).padStart(2,'0');
          if(t<1)requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIo.unobserve(el);
      });
    },{threshold:.6});
    counters.forEach(el=>countIo.observe(el));
  }

  /* Cabecera: fondo al desplazarse, se oculta al bajar y reaparece al subir, barra de progreso */
  const header=document.querySelector('.site-header');
  const progress=document.querySelector('.progress');
  let lastY=window.scrollY;
  let ticking=false;
  const onScroll=()=>{
    const y=window.scrollY;
    header.classList.toggle('is-scrolled',y>24);
    const menuOpen=header.classList.contains('menu-open');
    header.classList.toggle('is-hidden',!menuOpen&&y>lastY&&y>480);
    lastY=y;
    const max=root.scrollHeight-window.innerHeight;
    progress.style.setProperty('--p',max>0?(y/max).toFixed(4):'0');
    ticking=false;
  };
  window.addEventListener('scroll',()=>{
    if(!ticking){ticking=true;requestAnimationFrame(onScroll);}
  },{passive:true});
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
  window.matchMedia('(min-width: 961px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});

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

  if(!finePointer||reducedMotion)return;

  /* Parallax suave del núcleo */
  const core=document.querySelector('.core');
  if(core){
    let frame=0;
    window.addEventListener('pointermove',event=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        const x=(event.clientX/window.innerWidth-.5);
        const y=(event.clientY/window.innerHeight-.5);
        core.style.transform=`translate3d(${x*-14}px,${y*-14}px,0) rotate(${x*2}deg)`;
        frame=0;
      });
    },{passive:true});
  }

  /* Luz que sigue el cursor en las tarjetas de marca */
  document.querySelectorAll('.brand').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',`${event.clientX-r.left}px`);
      card.style.setProperty('--my',`${event.clientY-r.top}px`);
    });
  });

  /* Botones magnéticos */
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('pointermove',event=>{
      const r=btn.getBoundingClientRect();
      const x=(event.clientX-r.left-r.width/2)*.18;
      const y=(event.clientY-r.top-r.height/2)*.28;
      btn.style.transform=`translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave',()=>{btn.style.transform='';});
  });
})();
