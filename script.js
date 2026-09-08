// =========================================================
// CONFIG — easy to edit
// =========================================================
const VALID_NAMES = ['benazir', 'беназир']; // допустимые варианты имени (без учёта регистра)

// =========================================================
// ELEMENTS
// =========================================================
const openLetterBtn = document.getElementById('openLetterBtn');
const nameModal      = document.getElementById('nameModal');
const nameInput      = document.getElementById('nameInput');
const submitName     = document.getElementById('submitName');
const modalError     = document.getElementById('modalError');
const envelope       = document.getElementById('envelope');
const envelopeScreen = document.getElementById('envelope-screen');
const scrollHint     = document.getElementById('scrollHint');

// =========================================================
// STEP 1 — open name modal
// =========================================================
openLetterBtn.addEventListener('click', () => {
  nameModal.classList.add('visible');
  setTimeout(() => nameInput.focus(), 300);
});

function normalize(str){
  return str.trim().toLowerCase();
}

function tryOpenLetter(){
  const value = normalize(nameInput.value);
  if(VALID_NAMES.includes(value)){
    modalError.classList.remove('show');
    nameModal.classList.remove('visible');
    openEnvelope();
  } else {
    modalError.classList.add('show');
  }
}

submitName.addEventListener('click', tryOpenLetter);
nameInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') tryOpenLetter();
  modalError.classList.remove('show');
});

// =========================================================
// STEP 2 — envelope opening sequence
// =========================================================
function openEnvelope(){
  envelope.classList.add('open');
  envelopeScreen.classList.add('opened');

  // unlock scrolling once the letter has fully emerged from the envelope
  setTimeout(() => {
    document.body.classList.remove('locked');
  }, 2300);
}

// =========================================================
// STEP 3 — scroll reveal for simple sections
// =========================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// =========================================================
// STEP 4 — photo stack, scroll-driven reveal
// =========================================================
const stackWrapper = document.getElementById('photoStackWrapper');
const photoCards    = document.querySelectorAll('.photo-card');
const captions      = document.querySelectorAll('.caption');
const totalPhotos   = photoCards.length;

function updatePhotoStack(){
  const rect = stackWrapper.getBoundingClientRect();
  const scrollableHeight = stackWrapper.offsetHeight - window.innerHeight;
  if(scrollableHeight <= 0) return;

  let progress = -rect.top / scrollableHeight;
  progress = Math.min(1, Math.max(0, progress));

  const segment = 1 / totalPhotos;

  photoCards.forEach((card, i) => {
    if(i === totalPhotos - 1) return; // last photo stays in place
    const localStart = i * segment;
    let local = (progress - localStart) / segment;
    local = Math.min(1, Math.max(0, local));

    const rot = card.dataset.rot || 0;
    const translateY = -local * 160;
    const scale = 1 - local * 0.06;
    card.style.transform = `translateY(${translateY}px) rotate(${rot}deg) scale(${scale})`;
    card.style.opacity = 1 - local;
  });

  captions.forEach((cap, i) => {
    const center = i * segment + segment / 2;
    const dist = Math.abs(progress - center);
    const opacity = Math.max(0, 1 - dist / (segment * 0.6));
    cap.style.opacity = opacity;
  });
}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    window.requestAnimationFrame(() => {
      updatePhotoStack();
      ticking = false;
    });
    ticking = true;
  }
});
window.addEventListener('resize', updatePhotoStack);
updatePhotoStack();

// =========================================================
// STEP 5 — music play / pause (no autoplay)
// =========================================================
const bgMusic   = document.getElementById('bgMusic');
const playBtn   = document.getElementById('playPause');
const playIcon  = document.getElementById('playIcon');

playBtn.addEventListener('click', () => {
  if(bgMusic.paused){
    bgMusic.play().catch(() => {
      // файл ещё не добавлен в audio/ — просто игнорируем
      console.log('Добавьте свой MP3-файл в папку audio/ (например audio/our-song.mp3)');
    });
    playBtn.classList.add('playing');
    playIcon.textContent = '❚❚';
  } else {
    bgMusic.pause();
    playBtn.classList.remove('playing');
    playIcon.textContent = '▶';
  }
});
