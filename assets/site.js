(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Digital rain in the hero */
  var cv = document.getElementById('rain');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), cols = [], fs = 15, W = 0, H = 0;
    var glyphs = '01EN01ES10HOLA01HI0101+1713010110';
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      cols = []; for (var i = 0; i < Math.ceil(W / fs); i++) cols.push(Math.random() * H / fs);
      ctx.font = '600 ' + (fs - 2) + 'px Manrope, Inter, monospace';
    }
    function frame() {
      ctx.fillStyle = 'rgba(17,18,20,0.16)'; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < cols.length; i++) {
        var ch = glyphs.charAt(Math.floor(Math.random() * glyphs.length)), y = cols[i] * fs;
        ctx.fillStyle = Math.random() > 0.975 ? 'rgba(217,248,171,0.95)' : 'rgba(197,243,106,0.55)';
        ctx.fillText(ch, i * fs, y);
        if (y > H && Math.random() > 0.975) cols[i] = 0; else cols[i] += 0.55;
      }
    }
    size(); window.addEventListener('resize', size);
    if (reduce) { for (var k = 0; k < 120; k++) frame(); }
    else {
      var last = 0, visible = true;
      document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
      (function loop(t) { if (visible && t - last > 55) { frame(); last = t; } requestAnimationFrame(loop); })(0);
    }
  }

  /* Live call in the phone mockup */
  var stage = document.getElementById('device');
  if (stage) {
    var thread = document.getElementById('thread'), status = document.getElementById('call-status'),
        card = document.getElementById('summary-card'), data = JSON.parse(document.getElementById('call-script').textContent);
    function add(m) {
      var el = document.createElement('div'); el.className = 'msg in ' + (m[0] === 'ai' ? 'ai' : 'cl');
      var s = document.createElement('small'); s.textContent = m[1]; el.appendChild(s);
      el.appendChild(document.createTextNode(m[2])); thread.appendChild(el);
      while (thread.children.length > 6) thread.removeChild(thread.firstChild);
    }
    function showAll() {
      stage.classList.add('live'); status.textContent = data.liveEs;
      data.lines.forEach(add); card.classList.add('show');
    }
    if (reduce) { showAll(); }
    else {
      var run = function () {
        thread.innerHTML = ''; card.classList.remove('show');
        stage.classList.remove('live'); stage.classList.add('ringing'); status.textContent = data.ring;
        setTimeout(function () { stage.classList.remove('ringing'); stage.classList.add('live'); status.textContent = data.liveEn; }, 2200);
        data.lines.forEach(function (m, i) {
          setTimeout(function () { add(m); if (i === 3) status.textContent = data.liveEs; }, 2800 + i * 1800);
        });
        setTimeout(function () { stage.classList.remove('live'); status.textContent = data.ended; card.classList.add('show'); }, 2800 + data.lines.length * 1800 + 400);
        setTimeout(run, 2800 + data.lines.length * 1800 + 6500);
      };
      run();
    }
  }

  /* Video play/pause control */
  var v = document.getElementById('demo-video'), b = document.getElementById('vid-toggle');
  if (v && b) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); }
    var sync = function () { b.querySelector('span').textContent = v.paused ? b.dataset.play : b.dataset.pause; b.setAttribute('aria-pressed', String(!v.paused)); };
    b.addEventListener('click', function () { if (v.paused) v.play(); else v.pause(); });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
  }
})();

/* Test call audio player */
(function () {
  var a = document.getElementById('aud'), btn = document.getElementById('aud-btn'), box = document.getElementById('player');
  if (!a || !btn) return;
  var wave = document.getElementById('aud-wave'), prog = document.getElementById('aud-prog'), time = document.getElementById('aud-time');
  var fmt = function (s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
  var total = function () { return isFinite(a.duration) && a.duration > 0 ? a.duration : 126; };
  var draw = function () { var p = a.currentTime / total(); prog.style.clipPath = 'inset(0 ' + (100 - p * 100) + '% 0 0)'; time.textContent = fmt(a.currentTime) + ' / ' + fmt(total()); };
  btn.addEventListener('click', function () { if (a.paused) a.play(); else a.pause(); });
  a.addEventListener('play', function () { box.classList.add('playing'); btn.setAttribute('aria-label', box.dataset.pause); });
  a.addEventListener('pause', function () { box.classList.remove('playing'); btn.setAttribute('aria-label', box.dataset.play); });
  a.addEventListener('timeupdate', draw); a.addEventListener('loadedmetadata', draw);
  wave.addEventListener('click', function (e) {
    var r = wave.getBoundingClientRect(), p = (e.clientX - r.left) / r.width;
    var seek = function () { a.currentTime = p * total(); draw(); };
    if (a.readyState < 1) { a.addEventListener('loadedmetadata', seek, { once: true }); a.load(); } else seek();
  });
})();
