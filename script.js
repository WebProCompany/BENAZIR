/* =========================================================
   CONFIG
   ========================================================= */

const VALID_NAMES = [
  'benazir',
  'беназир'
];


/* =========================================================
   ELEMENTS
   ========================================================= */

const openLetterBtn =
  document.getElementById('openLetterBtn');

const nameModal =
  document.getElementById('nameModal');

const nameInput =
  document.getElementById('nameInput');

const submitName =
  document.getElementById('submitName');

const modalError =
  document.getElementById('modalError');

const envelope =
  document.getElementById('envelope');

const envelopeScreen =
  document.getElementById('envelope-screen');

const scrollHint =
  document.getElementById('scrollHint');

const mainContent =
  document.getElementById('mainContent');


/* =========================================================
   STATE
   ========================================================= */

let topStageOpened = false;
let letterFullyOpened = false;


/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value){

  return String(value)
    .trim()
    .toLowerCase();
}


function delay(ms){

  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


/* =========================================================
   STEP 1
   CLICK "ОТКРЫТЬ ПИСЬМО"
   ========================================================= */

/*
  First click does NOT open the complete letter.

  It only opens the top part of the envelope.
*/

openLetterBtn.addEventListener('click', async () => {

  if(topStageOpened){
    return;
  }

  topStageOpened = true;

  envelope.classList.add('stage-top');


  /*
    Give the flap enough time to visibly open
    before showing the name window.
  */

  await delay(900);

  openNameModal();

});


/* =========================================================
   NAME MODAL
   ========================================================= */

function openNameModal(){

  nameModal.classList.add('visible');

  nameModal.setAttribute(
    'aria-hidden',
    'false'
  );

  setTimeout(() => {

    nameInput.focus();

  }, 350);
}


function closeNameModal(){

  nameModal.classList.remove('visible');

  nameModal.setAttribute(
    'aria-hidden',
    'true'
  );
}


function showError(){

  modalError.classList.add('show');
}


function hideError(){

  modalError.classList.remove('show');
}


/* =========================================================
   NAME CHECK
   ========================================================= */

async function tryOpenLetter(){

  const value =
    normalize(nameInput.value);


  if(!value){

    showError();

    nameInput.focus();

    return;
  }


  if(!VALID_NAMES.includes(value)){

    showError();

    nameInput.select();

    return;
  }


  hideError();

  closeNameModal();

  await delay(400);

  openFullLetter();

}


/* =========================================================
   FULL LETTER OPENING
   ========================================================= */

async function openFullLetter(){

  if(letterFullyOpened){
    return;
  }

  letterFullyOpened = true;


  /*
    Add full-open state.

    CSS does the actual folding animation:
    - top fold
    - left fold
    - right fold
    - bottom fold
    - paper expansion
  */

  envelope.classList.add('full-open');


  /*
    Wait until the animation has mostly completed.
  */

  await delay(1750);


  envelopeScreen.classList.add('finished');


  /*
    Unlock scrolling only after the letter has
    become a flat sheet.
  */

  document.body.classList.remove('locked');


  /*
    Keep the user at the top after unlocking.
  */

  window.scrollTo({
    top:0,
    behavior:'auto'
  });


  /*
    Start revealing the first main section.
  */

  requestAnimationFrame(() => {

    document
      .querySelectorAll('[data-reveal]')
      .forEach(el => {

        const rect =
          el.getBoundingClientRect();

        if(
          rect.top <
          window.innerHeight * .85
        ){

          el.classList.add('visible');

        }

      });

  });
}


/* =========================================================
   ENTER KEY
   ========================================================= */

nameInput.addEventListener(
  'keydown',
  event => {

    if(event.key === 'Enter'){

      event.preventDefault();

      tryOpenLetter();

    }

    hideError();

  }
);


submitName.addEventListener(
  'click',
  tryOpenLetter
);


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

nameModal.addEventListener(
  'click',
  event => {

    if(event.target === nameModal){

      /*
        We intentionally do not close the modal
        because the letter is addressed to a specific name.
      */

      nameInput.focus();

    }

  }
);


/* =========================================================
   STEP 3 — SIMPLE SCROLL REVEALS
   ========================================================= */

const revealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if(entry.isIntersecting){

          entry.target.classList.add(
            'visible'
          );

          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },
    {
      threshold:.18
    }
  );


document
  .querySelectorAll('[data-reveal]')
  .forEach(el => {

    revealObserver.observe(el);

  });


/* =========================================================
   STEP 4 — PHOTO STACK
   ========================================================= */

const stackWrapper =
  document.getElementById(
    'photoStackWrapper'
  );

const photoCards =
  document.querySelectorAll(
    '.photo-card'
  );

const captions =
  document.querySelectorAll(
    '.caption'
  );

const totalPhotos =
  photoCards.length;


function updatePhotoStack(){

  if(!stackWrapper){
    return;
  }


  const rect =
    stackWrapper.getBoundingClientRect();


  const scrollableHeight =
    stackWrapper.offsetHeight -
    window.innerHeight;


  if(scrollableHeight <= 0){
    return;
  }


  let progress =
    -rect.top /
    scrollableHeight;


  progress =
    Math.max(
      0,
      Math.min(
        1,
        progress
      )
    );


  const segment =
    1 / totalPhotos;


  photoCards.forEach(
    (card, index) => {

      if(index === totalPhotos - 1){

        /*
          Last photo stays visible.
        */

        card.style.transform =
          `rotate(${card.dataset.rot || 0}deg)`;

        card.style.opacity = '1';

        return;
      }


      const localStart =
        index * segment;


      let local =
        (
          progress -
          localStart
        ) / segment;


      local =
        Math.max(
          0,
          Math.min(
            1,
            local
          )
        );


      const rotation =
        card.dataset.rot || 0;


      /*
        Main movement of each photograph.
      */

      const translateY =
        -local * 170;


      /*
        Slightly scales back as
        it leaves the stack.
      */

      const scale =
        1 -
        local * .055;


      /*
        Small horizontal movement
        makes the stack feel organic.
      */

      const translateX =
        index % 2 === 0
          ? -local * 8
          : local * 8;


      card.style.transform =
        `
          translate3d(
            ${translateX}px,
            ${translateY}px,
            0
          )
          rotate(${rotation}deg)
          scale(${scale})
        `;


      card.style.opacity =
        String(
          1 - local
        );

    }
  );


  /*
    Captions
  */

  captions.forEach(
    (caption, index) => {

      const center =
        index * segment +
        segment / 2;


      const distance =
        Math.abs(
          progress -
          center
        );


      const opacity =
        Math.max(
          0,
          1 -
          distance /
          (segment * .60)
        );


      caption.style.opacity =
        String(opacity);

    }
  );

}


let ticking = false;


window.addEventListener(
  'scroll',
  () => {

    if(ticking){
      return;
    }

    ticking = true;

    window.requestAnimationFrame(
      () => {

        updatePhotoStack();

        ticking = false;

      }
    );

  },
  {
    passive:true
  }
);


window.addEventListener(
  'resize',
  updatePhotoStack
);


updatePhotoStack();


/* =========================================================
   STEP 5 — MUSIC
   ========================================================= */

const bgMusic =
  document.getElementById(
    'bgMusic'
  );

const playBtn =
  document.getElementById(
    'playPause'
  );

const playIcon =
  document.getElementById(
    'playIcon'
  );


playBtn.addEventListener(
  'click',
  async () => {

    if(bgMusic.paused){

      try{

        await bgMusic.play();

        playBtn.classList.add(
          'playing'
        );

        playIcon.textContent =
          '❚❚';

        playBtn.setAttribute(
          'aria-label',
          'Пауза'
        );

      }catch(error){

        console.log(
          'Добавьте MP3-файл в папку audio/'
        );

      }

    }else{

      bgMusic.pause();

      playBtn.classList.remove(
        'playing'
      );

      playIcon.textContent =
        '▶';

      playBtn.setAttribute(
        'aria-label',
        'Воспроизвести'
      );

    }

  }
);


/* =========================================================
   AUDIO STATE
   ========================================================= */

bgMusic.addEventListener(
  'ended',
  () => {

    playBtn.classList.remove(
      'playing'
    );

    playIcon.textContent =
      '▶';

  }
);
