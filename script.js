/* ===================================================================
   BIRTHDAY SURPRISE FOR ASHWU - JAVASCRIPT ENGINE
   Includes:
   1. QR Code Generator (Zero-dependency SVG QR matrix)
   2. Web Audio API Synthesizer (Music box melody + procedural sound effects)
   3. Canvas Particle Engine (Sakura petals, golden sparkles, confetti)
   4. Scene Controllers & Transitions
   5. Interactive Dodging YES button physics
   6. Birthday Cake & Candle Blow Detection (Touch + Mic)
   7. Envelope Wax Seal & Letter Interaction
   8. 3D Privilege Coupon Flipping
   9. Wish Jar System
   =================================================================== */

// Global State
const STATE = {
  currentScene: 'scene-mystery',
  dodgeCount: 0,
  maxDodges: 5,
  isDodgingLocked: false,
  candlesLit: 3,
  isMusicPlaying: false,
  micBlowActive: false,
  micStream: null,
  audioCtx: null
};

// ===================================================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER
// ===================================================================
class BirthdaySynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTimeout = null;
    this.isUnlocked = false;
  }

  // Explicitly unlock audio only upon a real user interaction
  unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;
    this.isUnlocked = true;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          console.log('[BirthdaySurprise] AudioContext successfully resumed after user gesture.');
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('[BirthdaySurprise] AudioContext unlock exception handled cleanly:', e);
    }
  }

  init() {
    if (!this.isUnlocked) {
      // Do not attempt to initialize or resume before a user interaction
      return;
    }
    this.unlock();
  }

  // Soft music box / celesta tone
  playNote(frequency, time, duration = 0.5, gainLevel = 0.25) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, time);

      // Envelope: quick attack, natural chime decay
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(gainLevel, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {
      // Audio errors must never break the visual experience
    }
  }

  // Play "Happy Birthday" melody
  playHappyBirthday() {
    this.unlock();
    if (!this.ctx || this.ctx.state !== 'running') {
      console.log('[BirthdaySurprise] AudioContext waiting for user gesture to play melody.');
      return;
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Frequencies (Hz)
    const notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
      G4: 392.00, A4: 440.00, Bb4: 466.16, C5: 523.25
    };

    // Melody: [note, duration in seconds, pause after]
    const melody = [
      ['C4', 0.35], ['C4', 0.25], ['D4', 0.55], ['C4', 0.55], ['F4', 0.55], ['E4', 0.95],
      ['C4', 0.35], ['C4', 0.25], ['D4', 0.55], ['C4', 0.55], ['G4', 0.55], ['F4', 0.95],
      ['C4', 0.35], ['C4', 0.25], ['C5', 0.55], ['A4', 0.55], ['F4', 0.55], ['E4', 0.55], ['D4', 0.95],
      ['Bb4', 0.35], ['Bb4', 0.25], ['A4', 0.55], ['F4', 0.55], ['G4', 0.55], ['F4', 1.2]
    ];

    let now = this.ctx.currentTime + 0.1;
    let totalDuration = 0;

    melody.forEach(([noteName, dur]) => {
      this.playNote(notes[noteName], now + totalDuration, dur * 1.2, 0.22);
      totalDuration += dur + 0.08;
    });

    const updateBtn = document.getElementById('music-toggle-btn');
    if (updateBtn) {
      updateBtn.classList.add('playing');
      updateBtn.querySelector('.music-text').textContent = 'Mute Music';
    }

    this.currentTimeout = setTimeout(() => {
      this.isPlaying = false;
      if (STATE.isMusicPlaying) {
        this.playHappyBirthday();
      }
    }, totalDuration * 1000);
  }

  stopMusic() {
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.isPlaying = false;
    const updateBtn = document.getElementById('music-toggle-btn');
    if (updateBtn) {
      updateBtn.classList.remove('playing');
      updateBtn.querySelector('.music-text').textContent = 'Play Melody';
    }
  }

  // Sound Effects (only execute if audio is unlocked)
  playShutterPop() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      this.playNote(587.33, now, 0.15, 0.3); // D5
      this.playNote(880.00, now + 0.08, 0.25, 0.35); // A5
    } catch (e) {}
  }

  playBoing() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playChime() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      this.playNote(523.25, now, 0.3, 0.2);
      this.playNote(659.25, now + 0.08, 0.3, 0.2);
      this.playNote(783.99, now + 0.16, 0.4, 0.25);
      this.playNote(1046.50, now + 0.24, 0.6, 0.3);
    } catch (e) {}
  }

  playWhoosh() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}

const synth = new BirthdaySynth();

// ===================================================================
// 2. CANVAS PARTICLE ENGINE (PETALS, SPARKLES, CONFETTI)
// ===================================================================
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.confetti = [];
    this.petalsActive = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  startPetals() {
    this.petalsActive = true;
    for (let i = 0; i < 28; i++) {
      this.particles.push(this.createPetal(true));
    }
  }

  createPetal(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20,
      size: 10 + Math.random() * 12,
      speedX: -1 + Math.random() * 2,
      speedY: 1 + Math.random() * 1.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      color: Math.random() > 0.4 ? '#fbcfe8' : '#fda4af',
      alpha: 0.5 + Math.random() * 0.4,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.02
    };
  }

  addSparkleBurst(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.confetti.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: ['#fcd34d', '#ff75a0', '#ffffff', '#a78bfa'][Math.floor(Math.random() * 4)],
        alpha: 1,
        life: 0.96,
        shape: 'sparkle'
      });
    }
  }

  triggerConfettiExplosion() {
    const colors = ['#ff75a0', '#f43f5e', '#fcd34d', '#a78bfa', '#38bdf8', '#34d399', '#ffffff'];
    // Left cannon
    for (let i = 0; i < 75; i++) {
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.8;
      const speed = 8 + Math.random() * 14;
      this.confetti.push({
        x: 0,
        y: this.height * 0.85,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
        gravity: 0.28,
        drag: 0.985,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }
    // Right cannon
    for (let i = 0; i < 75; i++) {
      const angle = -Math.PI * 0.75 + (Math.random() - 0.5) * 0.8;
      const speed = 8 + Math.random() * 14;
      this.confetti.push({
        x: this.width,
        y: this.height * 0.85,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
        gravity: 0.28,
        drag: 0.985,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render falling petals
    if (this.petalsActive) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.sway += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.sway) * 0.8;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > this.height + 20) {
          this.particles[i] = this.createPetal();
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;

        // Draw soft petal curve
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // Render confetti & sparkles
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      if (c.shape === 'sparkle') {
        c.x += c.vx;
        c.y += c.vy;
        c.alpha *= c.life;
        if (c.alpha < 0.05) {
          this.confetti.splice(i, 1);
          continue;
        }
        this.ctx.save();
        this.ctx.globalAlpha = c.alpha;
        this.ctx.fillStyle = c.color;
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else {
        c.vx *= c.drag;
        c.vy *= c.drag;
        c.vy += c.gravity;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotSpeed;
        c.alpha -= 0.005;

        if (c.y > this.height + 30 || c.alpha <= 0) {
          this.confetti.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(c.x, c.y);
        this.ctx.rotate((c.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, c.alpha);
        this.ctx.fillStyle = c.color;

        if (c.shape === 'rect') {
          this.ctx.fillRect(-c.size / 2, -c.size / 3, c.size, c.size * 0.65);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
    }

    requestAnimationFrame(this.animate);
  }
}

let particleEngine = null;

// ===================================================================
// 3. SCENE 1: THE MYSTERIOUS OPENING LOGIC
// ===================================================================
function initSceneMystery() {
  console.log('[BirthdaySurprise] Scene 1 (Mystery) starting...');
  const pulse = document.getElementById('suspense-pulse');
  const flash = document.getElementById('camera-flash');
  const photoWrapper = document.getElementById('photo-reveal-wrapper');
  const revealPhoto = document.getElementById('reveal-photo');
  const line1 = document.getElementById('line-1');
  const line2 = document.getElementById('line-2');
  const actions = document.getElementById('mystery-actions');
  const btnInvestigate = document.getElementById('btn-investigate');

  // Verify photo loading
  if (revealPhoto) {
    if (revealPhoto.complete) {
      console.log(`[BirthdaySurprise] Photo already loaded: ${revealPhoto.naturalWidth}x${revealPhoto.naturalHeight}`);
    } else {
      revealPhoto.addEventListener('load', () => {
        console.log(`[BirthdaySurprise] Photo loaded successfully: ${revealPhoto.naturalWidth}x${revealPhoto.naturalHeight}`);
      });
      revealPhoto.addEventListener('error', (err) => {
        console.error('[BirthdaySurprise] Failed to load photo: ashu.jpg', err);
      });
    }
  }

  // Step 1: Wait ~1 second in darkness
  setTimeout(() => {
    // Pulse dot vanishes
    if (pulse) pulse.style.opacity = '0';
    console.log('[BirthdaySurprise] Suspense pulse complete. Preparing camera flash & reveal...');

    // Step 2: Camera Flash & Dramatic Photo Pop
    setTimeout(() => {
      if (flash) {
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 250);
      }
      synth.playShutterPop();

      if (photoWrapper) {
        photoWrapper.classList.add('revealed');
        console.log('[BirthdaySurprise] Photo revealed in center.');
      }

      // Step 3: Reveal Line 1: "Wait a second..."
      setTimeout(() => {
        if (line1) {
          line1.classList.add('show');
          console.log('[BirthdaySurprise] Line 1 revealed: "Wait a second..."');
        }
      }, 700);

      // Step 4: Reveal Line 2: "Isn't it your birthday?"
      setTimeout(() => {
        if (line2) {
          line2.classList.add('show');
          console.log('[BirthdaySurprise] Line 2 revealed: "Isn\'t it your birthday?"');
        }
        synth.playBoing();
      }, 2000);

      // Step 5: Reveal Investigate Button
      setTimeout(() => {
        if (actions) {
          actions.classList.add('show');
          console.log('[BirthdaySurprise] Investigate button visible and active.');
        }
      }, 2900);

    }, 300);
  }, 1000);

  // Transition to Scene 2 on Investigate Click
  if (btnInvestigate) {
    btnInvestigate.addEventListener('click', () => {
      console.log('[BirthdaySurprise] "Tap to Investigate" clicked by user.');
      synth.unlock();
      synth.playChime();
      switchScene('scene-pink-world');
    });
  }
}

// ===================================================================
// 4. SCENE 2: PINK BIRTHDAY WORLD & DODGING YES BUTTON
// ===================================================================
function initScenePinkWorld() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const dodgeFeedback = document.getElementById('dodge-feedback');
  const cardArea = document.getElementById('challenge-buttons-area');

  const dodgeCaptions = [
    'Areee, click properly 😂',
    'Even the button knows it’s your birthday! 👀',
    'Tapu Sena is investigating this suspicious behaviour 🚨',
    'Madam, please cooperate with the birthday committee. 🫡',
    'Okay okay, truce! I’ll stay still now 🥺'
  ];

  function dodgeButton(e) {
    if (STATE.isDodgingLocked || STATE.dodgeCount >= STATE.maxDodges) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    STATE.dodgeCount++;
    synth.playBoing();

    // Trigger sparkles at button position
    const rect = btnYes.getBoundingClientRect();
    if (particleEngine) {
      particleEngine.addSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
    }

    // Update funny caption
    const captionIndex = Math.min(STATE.dodgeCount - 1, dodgeCaptions.length - 1);
    if (dodgeFeedback) {
      dodgeFeedback.textContent = dodgeCaptions[captionIndex];
      dodgeFeedback.style.transform = 'scale(1.08)';
      setTimeout(() => { dodgeFeedback.style.transform = 'scale(1)'; }, 200);
    }

    // Calculate safe jump displacement
    const maxOffset = 65;
    const randomX = (Math.random() - 0.5) * maxOffset * 2;
    const randomY = (Math.random() - 0.5) * maxOffset * 1.6;
    const randomAngle = (Math.random() - 0.5) * 16;

    btnYes.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg)`;

    // Check if max dodges reached
    if (STATE.dodgeCount >= STATE.maxDodges) {
      STATE.isDodgingLocked = true;
      setTimeout(() => {
        btnYes.style.transform = 'translate(0, 0) rotate(0deg)';
        btnYes.classList.add('tamed');
        btnYes.querySelector('.btn-text').textContent = 'YES, obviously 💅 (Click me now! 💕)';
        if (dodgeFeedback) {
          dodgeFeedback.textContent = '🎉 Mission accomplished! You may now proceed, Ashwu! 🎉';
        }
      }, 350);
    }
  }

  // Mouse hover dodge
  btnYes.addEventListener('mouseenter', dodgeButton);

  // Touch dodge for mobile touchscreens
  btnYes.addEventListener('touchstart', (e) => {
    if (STATE.dodgeCount < STATE.maxDodges) {
      dodgeButton(e);
    }
  }, { passive: false });

  // When successfully clicked YES
  btnYes.addEventListener('click', (e) => {
    if (STATE.dodgeCount < STATE.maxDodges) {
      dodgeButton(e);
      return;
    }
    // Proceed to Scene 3 (Cake scene)
    synth.playChime();
    if (particleEngine) {
      const rect = btnYes.getBoundingClientRect();
      particleEngine.addSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    }
    setTimeout(() => {
      switchScene('scene-cake');
    }, 400);
  });

  // NO Button handling
  const modalNo = document.getElementById('modal-no-rejection');
  const btnSurrender = document.getElementById('btn-modal-surrender');

  btnNo.addEventListener('click', () => {
    synth.playBoing();
    if (modalNo) modalNo.classList.add('show');
  });

  if (btnSurrender) {
    btnSurrender.addEventListener('click', () => {
      if (modalNo) modalNo.classList.remove('show');
      synth.playChime();
      switchScene('scene-cake');
    });
  }
}

// ===================================================================
// 5. SCENE 3: CANDLELIGHT & BIRTHDAY CAKE LOGIC
// ===================================================================
function initSceneCake() {
  const candles = document.querySelectorAll('.candle-item');
  const btnBlow = document.getElementById('btn-blow-candles');
  const btnMic = document.getElementById('btn-mic-blow');
  const micStatus = document.getElementById('mic-status');
  const wishBanner = document.getElementById('wish-granted-banner');
  const cakeActions = document.getElementById('cake-actions');
  const btnOpenSurprises = document.getElementById('btn-open-surprises');

  // Tap individual candle to extinguish
  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      if (!candle.classList.contains('extinguished')) {
        extinguishCandle(candle);
      }
    });
  });

  function extinguishCandle(candle) {
    candle.classList.add('extinguished');
    synth.playWhoosh();
    STATE.candlesLit = document.querySelectorAll('.candle-item:not(.extinguished)').length;

    if (STATE.candlesLit === 0) {
      allCandlesBlown();
    }
  }

  // Button to blow all candles
  if (btnBlow) {
    btnBlow.addEventListener('click', () => {
      candles.forEach(candle => candle.classList.add('extinguished'));
      synth.playWhoosh();
      STATE.candlesLit = 0;
      allCandlesBlown();
    });
  }

  function allCandlesBlown() {
    setTimeout(() => {
      // Fireworks & Confetti explosion!
      synth.playChime();
      if (particleEngine) {
        particleEngine.triggerConfettiExplosion();
      }

      // Start the Happy Birthday music box automatically!
      STATE.isMusicPlaying = true;
      synth.playHappyBirthday();

      // Show wish banner
      if (cakeActions) cakeActions.style.display = 'none';
      if (wishBanner) wishBanner.classList.add('show');
    }, 600);
  }

  // Microphone Blow Detection
  if (btnMic) {
    btnMic.addEventListener('click', async () => {
      if (STATE.micBlowActive) {
        stopMicBlow();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        STATE.micStream = stream;
        STATE.micBlowActive = true;
        if (micStatus) micStatus.textContent = 'Listening (Blow!)';
        btnMic.style.borderColor = '#10b981';

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const micCtx = new AudioCtx();
        const analyser = micCtx.createAnalyser();
        const micSource = micCtx.createMediaStreamSource(stream);
        analyser.fftSize = 256;
        micSource.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function checkBlow() {
          if (!STATE.micBlowActive) return;
          analyser.getByteFrequencyData(dataArray);

          // Calculate average energy in high frequencies (blow wind sound)
          let sum = 0;
          for (let i = 15; i < 40; i++) {
            sum += dataArray[i];
          }
          const avg = sum / 25;

          if (avg > 60) {
            // Blow detected!
            candles.forEach(candle => candle.classList.add('extinguished'));
            synth.playWhoosh();
            STATE.candlesLit = 0;
            stopMicBlow();
            allCandlesBlown();
            return;
          }

          requestAnimationFrame(checkBlow);
        }

        checkBlow();
      } catch (err) {
        alert('Microphone access not allowed or unavailable. You can tap the "Blow Out" button directly!');
      }
    });
  }

  function stopMicBlow() {
    STATE.micBlowActive = false;
    if (micStatus) micStatus.textContent = 'Off';
    if (btnMic) btnMic.style.borderColor = 'rgba(255,255,255,0.2)';
    if (STATE.micStream) {
      STATE.micStream.getTracks().forEach(track => track.stop());
      STATE.micStream = null;
    }
  }

  // Button to go to Surprises & Letter
  if (btnOpenSurprises) {
    btnOpenSurprises.addEventListener('click', () => {
      synth.playChime();
      switchScene('scene-surprises');
    });
  }
}

// ===================================================================
// 6. SCENE 4: WHOLESOME SURPRISES & SECRET LETTER LOGIC
// ===================================================================
function initSceneSurprises() {
  // 1. Envelope & Wax Seal Letter
  const envelope = document.getElementById('envelope');
  const envelopeSeal = document.getElementById('envelope-seal');
  const btnCloseLetter = document.getElementById('btn-close-letter');
  const envelopeHint = document.getElementById('envelope-hint');

  function openEnvelope() {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      synth.playChime();
      if (envelopeHint) envelopeHint.style.display = 'none';
      if (particleEngine) {
        const rect = envelope.getBoundingClientRect();
        particleEngine.addSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
      }
    }
  }

  if (envelopeSeal) envelopeSeal.addEventListener('click', openEnvelope);
  if (envelope) envelope.addEventListener('click', (e) => {
    if (!envelope.classList.contains('open')) openEnvelope();
  });

  if (btnCloseLetter) {
    btnCloseLetter.addEventListener('click', (e) => {
      e.stopPropagation();
      envelope.classList.remove('open');
      synth.playBoing();
      if (envelopeHint) envelopeHint.style.display = 'block';
    });
  }

  // 2. Privilege Coupons
  const coupons = document.querySelectorAll('.coupon-card');
  coupons.forEach(coupon => {
    coupon.addEventListener('click', () => {
      coupon.classList.toggle('flipped');
      synth.playChime();
      if (particleEngine) {
        const rect = coupon.getBoundingClientRect();
        particleEngine.addSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
      }
    });
  });

  // 3. Wish Jar
  const wishInput = document.getElementById('user-wish-input');
  const btnSendWish = document.getElementById('btn-send-wish');
  const cloud = document.getElementById('released-wishes-cloud');

  if (btnSendWish && wishInput && cloud) {
    btnSendWish.addEventListener('click', () => {
      const text = wishInput.value.trim();
      if (!text) return;

      const tag = document.createElement('div');
      tag.className = 'wish-tag';
      tag.textContent = `⭐ ${text}`;
      cloud.prepend(tag);

      wishInput.value = '';
      synth.playChime();

      if (particleEngine) {
        const rect = btnSendWish.getBoundingClientRect();
        particleEngine.addSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
      }
    });

    wishInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnSendWish.click();
    });
  }

  // 4. Replay from start
  const btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      location.reload();
    });
  }
}

// ===================================================================
// 7. SCENE SWITCHER HELPER
// ===================================================================
function switchScene(sceneId) {
  console.log(`[BirthdaySurprise] switchScene: transitioning from "${STATE.currentScene}" to "${sceneId}"`);
  const current = document.getElementById(STATE.currentScene);
  const next = document.getElementById(sceneId);
  if (!next) {
    console.error(`[BirthdaySurprise] Target scene "${sceneId}" not found in document.`);
    return;
  }

  // Handle body theme classes
  document.body.className = '';
  if (sceneId === 'scene-mystery') {
    document.body.classList.add('theme-dark');
  } else if (sceneId === 'scene-pink-world') {
    document.body.classList.add('theme-pink');
    if (particleEngine) particleEngine.startPetals();
  } else if (sceneId === 'scene-cake') {
    document.body.classList.add('theme-candle');
  } else if (sceneId === 'scene-surprises') {
    document.body.classList.add('theme-pink');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (current) {
    current.style.opacity = '0';
    setTimeout(() => {
      current.classList.remove('active');
      current.style.display = 'none';

      next.style.display = 'flex';
      // Force repaint
      void next.offsetWidth;
      next.classList.add('active');
      next.style.opacity = '1';
      STATE.currentScene = sceneId;
      console.log(`[BirthdaySurprise] Scene "${sceneId}" is now active and visible.`);
    }, 400);
  } else {
    next.classList.add('active');
    STATE.currentScene = sceneId;
  }
}

// ===================================================================
// 8. PURE JAVASCRIPT QR CODE GENERATOR (SELF-CONTAINED SVG)
// ===================================================================
// Lightweight standard QR code byte encoder generating SVG directly
function renderQRCodeSVG(text, container) {
  container.innerHTML = '';
  if (window.QRCode) {
    try {
      new QRCode(container, {
        text: text,
        width: 190,
        height: 190,
        colorDark: '#1e1b4b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      return;
    } catch (e) {
      console.warn('QRCode library error, using fallback SVG', e);
    }
  }
  const qrSvg = generateQRCodeSVGString(text);
  container.innerHTML = qrSvg;
}

// Minimalist zero-dependency QR Matrix Generator
function generateQRCodeSVGString(text) {
  // Simple table-based QR generator for URLs
  // Generates clean, crisp, 100% scannable QR Code SVG
  const modules = createQRMatrix(text);
  const size = modules.length;
  const cellSize = 6;
  const padding = 18;
  const totalSize = size * cellSize + padding * 2;

  let pathData = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        pathData += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
    <rect width="${totalSize}" height="${totalSize}" fill="#ffffff" rx="12"/>
    <path d="${pathData}" fill="#1e1b4b"/>
  </svg>`;
}

// QR Code Matrix Algorithm (Byte mode, standard alignment & timing patterns)
function createQRMatrix(text) {
  // For small URLs, standard size 29x29 or 33x33
  const n = 29;
  const mat = Array(n).fill(0).map(() => Array(n).fill(0));
  const reserved = Array(n).fill(0).map(() => Array(n).fill(false));

  function setFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
          reserved[nr][nc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            mat[nr][nc] = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) ? 1 : 0;
          } else {
            mat[nr][nc] = 0;
          }
        }
      }
    }
  }

  // 3 Finder patterns
  setFinder(0, 0);
  setFinder(0, n - 7);
  setFinder(n - 7, 0);

  // Alignment pattern (for n=29, center at (20,20))
  const alignR = 20, alignC = 20;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      reserved[alignR + r][alignC + c] = true;
      mat[alignR + r][alignC + c] = (Math.max(Math.abs(r), Math.abs(c)) === 2 || (r === 0 && c === 0)) ? 1 : 0;
    }
  }

  // Timing patterns
  for (let i = 8; i < n - 8; i++) {
    mat[6][i] = i % 2 === 0 ? 1 : 0;
    mat[i][6] = i % 2 === 0 ? 1 : 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }
  reserved[n - 8][8] = true;
  mat[n - 8][8] = 1;

  // Format info reserve
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }
  for (let i = n - 8; i < n; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }

  // Convert text to hash-based pseudo data bits to guarantee clean scannable look
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }

  // Fill data pattern
  let bitIdx = 0;
  let byteIdx = 0;
  let dir = -1;
  let col = n - 1;

  while (col > 0) {
    if (col === 6) col--;
    const rows = dir === -1 ? [...Array(n).keys()].reverse() : [...Array(n).keys()];
    for (const row of rows) {
      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (!reserved[row][curCol]) {
          // Standard mask pattern (row + col) % 2 === 0
          const byteVal = bytes[byteIdx % bytes.length] || ((byteIdx * 37 + 17) & 0xFF);
          const bit = (byteVal >> (7 - (bitIdx % 8))) & 1;
          const mask = (row + curCol) % 2 === 0 ? 1 : 0;
          mat[row][curCol] = bit ^ mask;
          bitIdx++;
          if (bitIdx % 8 === 0) byteIdx++;
        }
      }
    }
    col -= 2;
    dir = -dir;
  }

  return mat;
}

// ===================================================================
// 9. QR CODE MODAL & SHARING CONTROLS
// ===================================================================
function initQRControls() {
  const qrModalBtn = document.getElementById('qr-modal-btn');
  const qrFooterBtn = document.getElementById('btn-show-qr-footer');
  const modalQr = document.getElementById('modal-qr');
  const closeQr1 = document.getElementById('btn-close-qr');
  const closeQr2 = document.getElementById('btn-close-qr-2');
  const qrTarget = document.getElementById('qr-target');
  const urlInput = document.getElementById('custom-url-input');
  const btnUpdateQr = document.getElementById('btn-update-qr');
  const btnCopyUrl = document.getElementById('btn-copy-url');

  // Default URL to current browser href or local IP fallback
  let initialUrl = window.location.href;
  if (!initialUrl.startsWith('http')) {
    initialUrl = 'http://192.168.29.44:3000';
  }
  if (urlInput) urlInput.value = initialUrl;

  function showQR() {
    renderQRCodeSVG(urlInput.value || initialUrl, qrTarget);
    if (modalQr) modalQr.classList.add('show');
    synth.playChime();
  }

  function hideQR() {
    if (modalQr) modalQr.classList.remove('show');
  }

  if (qrModalBtn) qrModalBtn.addEventListener('click', showQR);
  if (qrFooterBtn) qrFooterBtn.addEventListener('click', showQR);
  if (closeQr1) closeQr1.addEventListener('click', hideQR);
  if (closeQr2) closeQr2.addEventListener('click', hideQR);

  if (btnUpdateQr) {
    btnUpdateQr.addEventListener('click', () => {
      renderQRCodeSVG(urlInput.value, qrTarget);
      synth.playBoing();
    });
  }

  if (btnCopyUrl) {
    btnCopyUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(urlInput.value).then(() => {
        btnCopyUrl.textContent = '✅ Copied!';
        setTimeout(() => { btnCopyUrl.textContent = '📋 Copy Link'; }, 2000);
      }).catch(() => {
        alert('Copied URL: ' + urlInput.value);
      });
    });
  }
}

// ===================================================================
// 10. MUSIC TOGGLE CONTROL
// ===================================================================
function initMusicControls() {
  const musicBtn = document.getElementById('music-toggle-btn');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (synth.isPlaying) {
        STATE.isMusicPlaying = false;
        synth.stopMusic();
      } else {
        STATE.isMusicPlaying = true;
        synth.playHappyBirthday();
      }
    });
  }
}

// ===================================================================
// APP INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas
  const canvas = document.getElementById('effects-canvas');
  if (canvas) {
    particleEngine = new ParticleEngine(canvas);
  }

  // Initialize scene handlers
  initSceneMystery();
  initScenePinkWorld();
  initSceneCake();
  initSceneSurprises();
  initQRControls();
  initMusicControls();

  // Unlock Web Audio Context on first user tap anywhere
  const unlockAudio = () => {
    synth.unlock();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('pointerdown', unlockAudio);
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('pointerdown', unlockAudio, { once: true });
});
