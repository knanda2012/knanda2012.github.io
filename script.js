/* Conceptual particle-flow animation — intentionally NOT a research simulation. */
(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-frequency]')];
  const canvas = document.getElementById('flow-canvas');
  const nav = document.getElementById('primary-nav');
  const menuButton = document.getElementById('menu-button');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
  }
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frequency = 124, particles = [], width = 640, height = 520, frame = 0, rafId = null, running = true;
  const rand = (a,b) => a + Math.random() * (b-a);
  function reset(p) { p.x = rand(.04,.96); p.y=rand(.04,.96); p.age=0; p.life=rand(100,340); return p; }
  function makeParticles() { particles = Array.from({length:220},() => reset({x:0,y:0,age:0,life:0,shade:Math.random()})); }
  function resize() {
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    width=Math.max(1,rect.width); height=Math.max(1,rect.height);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#0c2736';ctx.fillRect(0,0,width,height);
  }
  function velocity(x,y) {
    // Stylized analytic vortices; frequency only changes artistic flow character.
    const centers = frequency===140 ? [[.27,.32,1],[.73,.32,-1],[.27,.74,-1],[.73,.74,1]] : [[.32,.51,1],[.70,.51,-1]];
    let vx=0,vy=0;
    for (const [cx,cy,s] of centers) {
      const dx=x-cx,dy=(y-cy)*1.15;
      const r2=dx*dx+dy*dy+.012;
      const strength=s*Math.exp(-r2*3.1)/(.10+r2);
      vx+=-dy*strength;vy+=dx*strength;
    }
    vx+=.055*Math.sin(y*8+frequency*.025);
    return [vx,vy];
  }
  function draw() {
    frame++;
    ctx.fillStyle=reducedMotion ? '#0c2736' : 'rgba(12,39,54,.065)';
    ctx.fillRect(0,0,width,height);
    ctx.save();
    ctx.strokeStyle='rgba(161,231,215,.075)';ctx.lineWidth=.7;
    for(let j=1;j<8;j++){ctx.beginPath();ctx.moveTo(width*j/8,0);ctx.lineTo(width*j/8,height);ctx.stroke();}
    for(let j=1;j<7;j++){ctx.beginPath();ctx.moveTo(0,height*j/7);ctx.lineTo(width,height*j/7);ctx.stroke();}
    // Soft contour guides make the conceptual flow field legible in a still image.
    const guideCenters = frequency===140 ? [[.27,.32,1],[.73,.32,-1],[.27,.74,-1],[.73,.74,1]] : [[.32,.51,1],[.70,.51,-1]];
    ctx.save();
    guideCenters.forEach(([cx,cy,spin])=>{
      const count=frequency===140?3:5;
      for(let k=1;k<=count;k++){
        const radius=k/count;
        ctx.beginPath();
        ctx.ellipse(cx*width,cy*height,(frequency===140?.105:.155)*radius*width,(frequency===140?.12:.24)*radius*height,spin*.19,0,Math.PI*2);
        ctx.strokeStyle=`rgba(113,228,211,${.044+(.037*(1-radius))})`;
        ctx.lineWidth=1.0;
        ctx.stroke();
      }
    });
    ctx.restore();
    const speed=frequency===124?1.25:frequency===110?.78:frequency===140?1.06:.68;
    for(const p of particles){
      const oldX=p.x,oldY=p.y;
      const v=velocity(p.x,p.y);
      p.x+=v[0]*.0017*speed;
      p.y+=v[1]*.0017*speed;
      p.age++;
      if(p.x<.018||p.x>.982||p.y<.018||p.y>.982||p.age>p.life){reset(p);continue;}
      ctx.beginPath();ctx.moveTo(oldX*width,oldY*height);ctx.lineTo(p.x*width,p.y*height);
      const alpha=.24+.45*(1-Math.abs(p.age/p.life-.5)*2);
      ctx.strokeStyle=p.shade>.94?`rgba(245,196,151,${alpha})`:`rgba(143,234,215,${alpha})`;
      ctx.lineWidth=p.shade>.94?1.9:1.0;ctx.stroke();
    }
    ctx.restore();
    if(running&&!reducedMotion)rafId=requestAnimationFrame(draw);
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{
    frequency=Number(b.dataset.frequency);
    buttons.forEach(btn=>{const active=btn===b;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
    makeParticles();ctx.fillStyle='#0c2736';ctx.fillRect(0,0,width,height);
    if(reducedMotion)draw();
  }));
  makeParticles();resize();draw();
  window.addEventListener('resize',()=>{resize();if(reducedMotion)draw();});
  document.addEventListener('visibilitychange',()=>{
    if(reducedMotion)return;
    running=!document.hidden;
    if(!running&&rafId)cancelAnimationFrame(rafId);
    else if(running)draw();
  });
})();
