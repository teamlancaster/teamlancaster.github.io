/* Team Lancaster — lightweight vanilla JS (no dependencies) */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;

  // header state
  var header = document.querySelector('.site-header');
  function onScroll(){ if(header) header.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // intro choreography
  requestAnimationFrame(function(){ document.body.classList.add('play'); });

  // scroll reveals
  var els = document.querySelectorAll('.reveal');
  if(reduce || !('IntersectionObserver' in window)){
    els.forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:.15, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){ io.observe(e); });
  }

  if(reduce) return;

  // hero parallax
  var inner = document.querySelector('[data-parallax]');
  if(inner){
    var ticking=false;
    window.addEventListener('scroll', function(){
      if(ticking) return; ticking=true;
      requestAnimationFrame(function(){
        var y = window.scrollY, h = window.innerHeight;
        if(y < h*1.2){
          inner.style.transform = 'translate3d(0,'+(y*0.35)+'px,0)';
          inner.style.opacity = Math.max(0, 1 - y/(h*0.85));
        }
        ticking=false;
      });
    }, {passive:true});
  }

  // gold particle field
  var cv = document.querySelector('canvas[data-particles]');
  if(cv && cv.getContext){
    var ctx = cv.getContext('2d'), W, H, dpr, parts=[], running=true;
    var count = window.innerWidth < 720 ? 45 : 90;
    function size(){
      dpr = Math.min(window.devicePixelRatio||1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function mk(initial){
      return { x:Math.random()*W, y: initial ? Math.random()*H : H+10,
        r: Math.random()*1.8+.4, vy: -(Math.random()*.35+.08), vx:(Math.random()-.5)*.15,
        a: Math.random()*.45+.12, tw: Math.random()*Math.PI*2 };
    }
    size(); for(var i=0;i<count;i++) parts.push(mk(true));
    window.addEventListener('resize', size);
    function frame(){
      if(!running) return;
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<parts.length;i++){
        var p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.tw+=.03;
        if(p.y < -10) parts[i]=p=mk(false);
        var al = p.a*(.6+.4*Math.sin(p.tw));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283);
        ctx.fillStyle='rgba(205,186,155,'+al+')';
        ctx.shadowColor='rgba(154,116,72,.9)'; ctx.shadowBlur=p.r*6;
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    // pause when off-screen or tab hidden
    var vis = new IntersectionObserver(function(e){ var was=running; running=e[0].isIntersecting && !document.hidden; if(running && !was) frame(); });
    vis.observe(cv);
    document.addEventListener('visibilitychange', function(){ var was=running; running=!document.hidden; if(running && !was) frame(); });
    frame();
  }

  // card tilt + cursor glow
  if(window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.card').forEach(function(c){
      c.addEventListener('pointermove', function(e){
        var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        c.style.setProperty('--ry', ((x-.5)*10).toFixed(2)+'deg');
        c.style.setProperty('--rx', ((.5-y)*10).toFixed(2)+'deg');
        c.style.setProperty('--mx', (x*100)+'%'); c.style.setProperty('--my', (y*100)+'%');
      });
      c.addEventListener('pointerleave', function(){ c.style.setProperty('--rx','0deg'); c.style.setProperty('--ry','0deg'); });
    });
  }
})();
