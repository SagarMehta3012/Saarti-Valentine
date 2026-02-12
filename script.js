/* =========================
   Config: number of items
   Place images as: images/photo1.jpg ... photo20.jpg
   Place songs as:  songs/song1.mp3 ... song20.mp3
   ========================= */
   const TOTAL = 8;
   const images = Array.from({length: TOTAL}, (_,i) => `photos/photo${i+1}.jpg`);
   const songs  = Array.from({length: TOTAL}, (_,i) => `songs/song${i+1}.mp3`);
   
   /* --------------------------------------
      PASSWORD / LOGIN (index.html)
      password is case-sensitive: Saarti@210125
      -------------------------------------- */
   document.addEventListener('DOMContentLoaded', ()=> {
     const loginBtn = document.getElementById('loginBtn');
     const input = document.getElementById('passwordInput');
     if (loginBtn && input) {
       loginBtn.addEventListener('click', checkPassword);
       input.addEventListener('keydown', (e)=> { if (e.key === 'Enter') checkPassword(); });
     }
   });
   
   function checkPassword(){
     const input = document.getElementById("passwordInput");
     const login = document.getElementById("loginScreen");
     const main  = document.getElementById("mainContent");
     const err   = document.getElementById("errorMsg");
     if (!input) return;
     if (input.value === "Saarti@210125") {
       if (login) login.style.display = 'none';
       if (main) main.style.display = 'block';
     } else {
       if (err) err.textContent = "Wrong password ❤️ Try another guess";
       // small shake effect
       if (input) {
         input.classList.remove('shake');
         void input.offsetWidth;
         input.classList.add('shake');
         setTimeout(()=> input.classList.remove('shake'), 600);
       }
     }
   }
   
   /* small CSS injection for shake (so we don't change CSS file) */
   (function injectShake(){
     const s = document.createElement('style');
     s.innerHTML = `.shake{animation:shake .6s ease}
     @keyframes shake{10%{transform:translateX(-6px)}30%{transform:translateX(6px)}50%{transform:translateX(-4px)}70%{transform:translateX(4px)}90%{transform:translateX(-2px)}100%{transform:none}}`;
     document.head.appendChild(s);
   })();
   
   /* --------------------------------------
      SLIDESHOW + PLAYER (playlist.html)
      -------------------------------------- */
   let currentIndex = 0;
   const slideImage = document.getElementById('slideImage');
   const audio = document.getElementById('audioPlayer');
   const progress = document.getElementById('progress');
   const currentTimeEl = document.getElementById('currentTime');
   const durationEl = document.getElementById('duration');
   const togglePlayBtn = document.getElementById('togglePlay');
   const trackTitle = document.getElementById('trackTitle');
   
   function safeGet(el){ return (typeof el !== 'undefined' && el) ? el : null; }
   function formatTime(t){ if (!t || isNaN(t)) return '0:00'; const m=Math.floor(t/60); const s=Math.floor(t%60).toString().padStart(2,'0'); return `${m}:${s}`; }
   
   window.addEventListener('load', ()=>{
     if (slideImage && audio) { loadMedia(0); }
     // ensure mobile first-interaction plays audio
     window.addEventListener('load', ()=>{
        if (slideImage && audio) {
          loadMedia(0);
      
          document.body.addEventListener('click', ()=> {
            audio.play().catch(()=>{});
          }, {once:true});
        }
      });
      
   });
   
   function loadMedia(index){
    if (!slideImage || !audio) return;
  
    currentIndex = index % TOTAL;
  
    const lower = `photos/photo${currentIndex + 1}.jpg`;
    const upper = `photos/photo${currentIndex + 1}.JPG`;
  
    const testImg = new Image();
    testImg.onload = () => {
      slideImage.src = lower;
    };
    testImg.onerror = () => {
      slideImage.src = upper;
    };
    testImg.src = lower;
  
    audio.src = songs[currentIndex];
    audio.load();
  
    if (trackTitle) trackTitle.textContent = `Track ${currentIndex + 1}`;
  }
  
   
   function nextSlide(){ loadMedia((currentIndex + 1) % TOTAL); }
   function prevSlide(){ loadMedia((currentIndex - 1 + TOTAL) % TOTAL); }
   
   
   function playPause(){
     if (!audio) return;
     if (audio.paused){ audio.play(); if (togglePlayBtn) togglePlayBtn.textContent = '⏸'; }
     else { audio.pause(); if (togglePlayBtn) togglePlayBtn.textContent = '▶'; }
   }
   function playPauseToggleText(){ if (togglePlayBtn) togglePlayBtn.textContent = audio && audio.paused ? '▶' : '⏸'; }
   
   if (audio){
     audio.addEventListener('timeupdate', ()=>{
       if (!audio.duration) return;
       const pct = (audio.currentTime / audio.duration) * 100;
       if (progress) progress.value = pct;
       if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
       if (durationEl) durationEl.textContent = formatTime(audio.duration);
     });
     audio.addEventListener('loadedmetadata', ()=> {
       if (durationEl) durationEl.textContent = formatTime(audio.duration);
       playPauseToggleText();
     });
   }
   function seek(){ if (!audio || !audio.duration || !progress) return; audio.currentTime = (progress.value/100)*audio.duration; }
   
   /* --------------------------------------
      NO BUTTON PROXIMITY DODGE (message.html)
      - Buttons start side-by-side
      - No button only dodges when cursor approaches
      - Stays inside .proposal-box
      -------------------------------------- */
   (function initNoDodge(){
     const NO_TRIGGER = 110; // distance threshold in px
     const noBtn = document.getElementById('noBtn');
     const proposal = document.querySelector('.proposal-box');
   
     if (!noBtn || !proposal) return;
   
     // ensure initial position (centered)
     function resetNo(){
       noBtn.style.position = 'relative';
       noBtn.style.left = '';
       noBtn.style.top = '';
       noBtn.style.transform = '';
     }
     resetNo();
   
     // on mouse move only when proposal is visible
     document.addEventListener('mousemove', (e)=>{
       const rectP = proposal.getBoundingClientRect();
       // if not visible, ignore
       if (rectP.width === 0 && rectP.height === 0) return;
   
       const rectB = noBtn.getBoundingClientRect();
       const centerX = rectB.left + rectB.width/2;
       const centerY = rectB.top + rectB.height/2;
       const dx = Math.abs(e.clientX - centerX);
       const dy = Math.abs(e.clientY - centerY);
   
       if (dx < NO_TRIGGER && dy < NO_TRIGGER){
         dodgeNo(noBtn, proposal);
       }
     });
   
     // also dodge on touchstart near button for mobile
     document.addEventListener('touchstart', (ev)=>{
       if (!ev.touches || !ev.touches[0]) return;
       const t = ev.touches[0];
       const rectB = noBtn.getBoundingClientRect();
       const centerX = rectB.left + rectB.width/2;
       const centerY = rectB.top + rectB.height/2;
       const dx = Math.abs(t.clientX - centerX);
       const dy = Math.abs(t.clientY - centerY);
       if (dx < NO_TRIGGER && dy < NO_TRIGGER) dodgeNo(noBtn, proposal);
     });
   
     function dodgeNo(btn, container){
       const cRect = container.getBoundingClientRect();
       // compute safe ranges inside container padding
       const pad = 14;
       const maxLeft = Math.max(0, cRect.width - btn.offsetWidth - pad);
       const maxTop  = Math.max(0, cRect.height - btn.offsetHeight - pad);
   
       // choose a new position biased away from center
       const randX = Math.random() * maxLeft;
       const randY = Math.random() * maxTop;
   
       btn.style.position = 'absolute';
       btn.style.left = `${randX}px`;
       btn.style.top  = `${randY}px`;
       btn.style.transform = 'translate3d(0,0,0)';
       // add a tiny nudge animation
       btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' });
     }
   })();
   
   /* --------------------------------------
      HEART BURST on YES
      -------------------------------------- */
   function accepted(){
     // small burst cluster near center
     const COUNT = 28;
     for (let i=0;i<COUNT;i++){
       const h = document.createElement('div');
       h.className = 'burst';
       h.style.left = (50 + (Math.random()*40 - 20)) + 'vw';
       h.style.top  = (50 + (Math.random()*20 - 10)) + 'vh';
       h.style.fontSize = (14 + Math.random()*26) + 'px';
       h.style.color = ['#FFD27A', '#FF7E7E', '#FFB4C6'][Math.floor(Math.random()*3)];
       document.body.appendChild(h);
       setTimeout(()=> h.remove(), 1200 + Math.random()*500);
     }
   
     // optional final small modal or alert after burst
     setTimeout(()=> {
       // small in-page modal replacement: a gentle message
       const modal = document.createElement('div');
       modal.className = 'glass elevated';
       modal.style.position = 'fixed';
       modal.style.left = '50%';
       modal.style.top = '50%';
       modal.style.transform = 'translate(-50%,-50%)';
       modal.style.padding = '22px';
       modal.style.zIndex = 9999;
       modal.innerHTML = `<h3 style="margin:6px 0 12px">I love you forever, Aarti ❤️</h3>
                          <p class="muted" style="margin:0 0 12px">You are my best decision and my happiest life. — Sagar</p>
                          <button class="btn primary" onclick="this.parentElement.remove()">Close</button>`;
       document.body.appendChild(modal);
     }, 650);
   }
   
   /* --------------------------------------
      gentle accessibility: close any floating bursts on navigation
      -------------------------------------- */
   window.addEventListener('beforeunload', ()=> {
     // cleanup if necessary
   });
   
   /* End of script.js */
   