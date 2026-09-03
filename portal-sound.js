/* Grupo Tenno — sonido reactivo del núcleo de acceso */
(()=>{
  const hold=document.getElementById('portal-hold');
  const portal=document.getElementById('entry-portal');
  if(!hold||!portal)return;

  let context=null;
  let active=false;
  let master=null;
  let sources=[];
  let startTime=0;

  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  const ensureContext=async()=>{
    if(!context)context=new AudioCtx();
    if(context.state==='suspended'){
      try{await context.resume();}catch(error){}
    }
    return context;
  };

  const createNoiseBuffer=ctx=>{
    const length=Math.max(1,Math.floor(ctx.sampleRate*.32));
    const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
    const data=buffer.getChannelData(0);
    let last=0;
    for(let i=0;i<length;i++){
      const white=Math.random()*2-1;
      last=last*.91+white*.09;
      data[i]=last*.72;
    }
    return buffer;
  };

  const stopSound=(fast=false)=>{
    if(!active||!context)return;
    active=false;
    const now=context.currentTime;
    const release=fast?.018:.055;
    if(master){
      try{
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(.0001,master.gain.value),now);
        master.gain.exponentialRampToValueAtTime(.0001,now+release);
      }catch(error){}
    }
    const oldSources=sources;
    sources=[];
    window.setTimeout(()=>{
      oldSources.forEach(source=>{try{source.stop();}catch(error){}});
      try{master?.disconnect();}catch(error){}
      master=null;
    },Math.ceil((release+.035)*1000));
  };

  const startSound=async event=>{
    if(active||portal.hidden||document.documentElement.classList.contains('portal-skip'))return;
    if(event?.type==='pointerdown'&&event.button!==0)return;
    const ctx=await ensureContext();
    if(!ctx||active)return;
    active=true;
    startTime=ctx.currentTime;

    master=ctx.createGain();
    master.gain.setValueAtTime(.0001,startTime);
    master.gain.exponentialRampToValueAtTime(.105,startTime+.075);
    master.connect(ctx.destination);

    const compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-24;
    compressor.knee.value=18;
    compressor.ratio.value=5;
    compressor.attack.value=.004;
    compressor.release.value=.12;
    compressor.connect(master);

    const filter=ctx.createBiquadFilter();
    filter.type='lowpass';
    filter.Q.value=1.25;
    filter.frequency.setValueAtTime(760,startTime);
    filter.frequency.exponentialRampToValueAtTime(2450,startTime+1.35);
    filter.connect(compressor);

    /* Grave estable: da sensación de energía/motor encendiéndose. */
    const bass=ctx.createOscillator();
    const bassGain=ctx.createGain();
    bass.type='sine';
    bass.frequency.setValueAtTime(72,startTime);
    bass.frequency.exponentialRampToValueAtTime(118,startTime+1.35);
    bassGain.gain.value=.64;
    bass.connect(bassGain).connect(filter);

    /* Armónico ascendente: crea la sensación de carga futurista. */
    const charge=ctx.createOscillator();
    const chargeGain=ctx.createGain();
    charge.type='triangle';
    charge.frequency.setValueAtTime(144,startTime);
    charge.frequency.exponentialRampToValueAtTime(286,startTime+1.35);
    chargeGain.gain.value=.23;
    charge.connect(chargeGain).connect(filter);

    /* Brillo suave, casi metálico, para que no parezca un simple zumbido. */
    const shimmer=ctx.createOscillator();
    const shimmerGain=ctx.createGain();
    shimmer.type='sine';
    shimmer.frequency.setValueAtTime(432,startTime);
    shimmer.frequency.exponentialRampToValueAtTime(690,startTime+1.35);
    shimmerGain.gain.setValueAtTime(.025,startTime);
    shimmerGain.gain.linearRampToValueAtTime(.075,startTime+1.15);
    shimmer.connect(shimmerGain).connect(filter);

    /* Pulso muy lento que hace que la carga respire. */
    const lfo=ctx.createOscillator();
    const lfoGain=ctx.createGain();
    lfo.type='sine';
    lfo.frequency.value=5.4;
    lfoGain.gain.value=.018;
    lfo.connect(lfoGain).connect(master.gain);

    /* Textura de aire filtrado para dar profundidad sin usar archivos MP3. */
    const noise=ctx.createBufferSource();
    const noiseGain=ctx.createGain();
    const noiseFilter=ctx.createBiquadFilter();
    noise.buffer=createNoiseBuffer(ctx);
    noise.loop=true;
    noiseGain.gain.value=.09;
    noiseFilter.type='bandpass';
    noiseFilter.frequency.setValueAtTime(520,startTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(1380,startTime+1.35);
    noiseFilter.Q.value=.75;
    noise.connect(noiseFilter).connect(noiseGain).connect(filter);

    sources=[bass,charge,shimmer,lfo,noise];
    sources.forEach(source=>{try{source.start(startTime);}catch(error){}});
  };

  hold.addEventListener('pointerdown',startSound,{passive:true});
  document.addEventListener('pointerup',()=>stopSound(),true);
  document.addEventListener('pointercancel',()=>stopSound(true),true);
  hold.addEventListener('lostpointercapture',()=>stopSound(),true);

  hold.addEventListener('keydown',event=>{
    if((event.key===' '||event.key==='Enter')&&!event.repeat)startSound(event);
  });
  hold.addEventListener('keyup',event=>{
    if(event.key===' '||event.key==='Enter')stopSound();
  });

  window.addEventListener('blur',()=>stopSound(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound(true);});
  document.getElementById('portal-skip-button')?.addEventListener('click',()=>stopSound(true));
})();
