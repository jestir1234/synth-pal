
$(document).ready(function(){

  let context = new AudioContext();
  let oscillators = {};
  let notes = {};
  let playedSounds = {};
  let playedSounds2 = {};
  let playedSounds3 = {};
  let originalFreq = {};
  let originalFreq2 = {};
  let originalFreq3 = {};
  let currentEffects = {};
  let currentOctave = 0;
  let osc1Array = ["sine", "square", "triangle", "sawtooth"];
  let osc2Array = ["sine", "square", "triangle", "sawtooth"];
  let osc3Array = ["sine", "square", "triangle", "sawtooth"];
  let presets = ["DEFAULT", "MARTIAN", "CYBER CHURCH", "8-BIT JAMS", "VENTILLATOR", "DARK PACT", "EVIL STAIRS"];

  let masterGain = context.createGain();
  let delay;
  let flanger;
  let tremelo;

  let octaveUp = $('.octave-controls .up-btn-container');
  let octaveDown = $('.octave-controls .down-btn-container');
  let octaveDisplay = $('.octave-display-container')[0];

  octaveUp.on("click", () => changeCurrentOctave(1));
  octaveDown.on("click", () => changeCurrentOctave(-1));

  const changeCurrentOctave = (value) => {

    if (currentOctave < 3 && currentOctave > -3) {
      currentOctave += value;
    } else if (currentOctave === 3 && value < 0){
      currentOctave += value;
    } else if (currentOctave === -3 && value > 0){
      currentOctave += value;
    }
    octaveDisplay.innerHTML = currentOctave;
  }

  $(".delay-time-container #slider").roundSlider({
    width:10,
    radius: 50,
    max:100//0 to 180
  });

  $(".delay-feedback-container #slider").roundSlider({
    width:10,
    radius: 40,
    max:50 //0 to 1
  });

  $(".delay-mix-container #slider").roundSlider({
    width:10,
    radius: 40,
    max:100 // 0 to 1
  });

  $(".volume-container #slider").roundSlider({
   radius: 60,
   width: 16,
   value: 37,
   handleSize: 0,
   handleShape: "square",
   max: 100,
   value: 50,
   min: 0
  });

const setOscDisplays = () => {
  $('.osc1-display')[0].innerHTML = osc1Array[0].charAt(0).toUpperCase() + osc1Array[0].slice(1)
  $('.osc2-display')[0].innerHTML = osc2Array[0].charAt(0).toUpperCase() + osc2Array[0].slice(1)
  $('.osc3-display')[0].innerHTML = osc3Array[0].charAt(0).toUpperCase() + osc3Array[0].slice(1)
}

$('.oscillator1-container .arrow-up').on("click", (e) => {
  let first = osc1Array[0];
  osc1Array.shift();
  osc1Array.push(first);
  setOscDisplays();
});

$('.oscillator2-container .arrow-up').on("click", (e) => {
  let first = osc2Array[0];
  osc2Array.shift();
  osc2Array.push(first);
  setOscDisplays();
});

$('.oscillator3-container .arrow-up').on("click", (e) => {
  let first = osc3Array[0];
  osc3Array.shift();
  osc3Array.push(first);
  setOscDisplays();
});

$('.oscillator1-container .arrow-down').on("click", (e) => {
  let last = osc1Array[osc1Array.length - 1];
  osc1Array.pop();
  osc1Array.unshift(last);
  setOscDisplays();
});

$('.oscillator2-container .arrow-down').on("click", (e) => {
  let last = osc2Array[osc2Array.length - 1];
  osc2Array.pop();
  osc2Array.unshift(last);
  setOscDisplays();
});

$('.oscillator3-container .arrow-down').on("click", (e) => {
  let last = osc3Array[osc3Array.length - 1];
  osc3Array.pop();
  osc3Array.unshift(last);
  setOscDisplays();
});

const resetOscillators = () => {
  autoChangeOscillators("sine", "sine", "sine");
}

const resetOctave = () => {

  while (currentOctave !== 0) {
    if (currentOctave > 0) {
      changeCurrentOctave(-1);
    } else {
      changeCurrentOctave(1);
    }
  }
}

const autoChangeOctave = (value) => {
  if (currentOctave >= 0){
    while (currentOctave !== value){
      changeCurrentOctave(-1);
    }
  } else {
    while (currentOctave !== value){
      changeCurrentOctave(1);
    }
  }
}

const applyTremelo = (sound) => {
  let speed = $('.tremelo-container #speed')[0].value;
  let depth = $('.tremelo-container #depth')[0].value / 100;
  let mix = $('.tremelo-container #mix')[0].value / 100;

  tremolo = new Pizzicato.Effects.Tremolo({
    speed: speed,
    depth: 1,
    mix: mix
  });

  sound.effects.splice(2, 1);
  sound.addEffect(tremolo);
}

const resetPitch = () => {
  $('.pitch-container #pitch')[0].value = 0;
}

const resetAttack = () => {
  $('.attack-container #attack')[0].value = 0;
}

const resetTremolo = () => {
  $('.tremelo-container #speed')[0].value = 0;
  $('.tremelo-container #depth')[0].value = 0;
  $('.tremelo-container #mix')[0].value = 0;
}

const applyFlanger = (sound) => {
  let time = $('.flanger-container #time')[0].value / 100;
  let speed = $('.flanger-container #speed')[0].value / 100;
  let depth = $('.flanger-container #depth')[0].value / 100;
  let mix = $('.flanger-container #mix')[0].value / 100;

  flanger = new Pizzicato.Effects.Flanger({
    time: time,
    speed: speed,
    depth: depth,
    feedback: .1,
    mix: mix
  })
  sound.effects.splice(1, 1);
  sound.addEffect(flanger);
}

const resetFlanger = () => {
  $('.flanger-container #time')[0].value = 0;
  $('.flanger-container #speed')[0].value = 0;
  $('.flanger-container #depth')[0].value = 0;
  $('.flanger-container #mix')[0].value = 0;
}

const applyDelay = (sound) => {
  let delayTime = $('.delay-time-container #slider').data('roundSlider').option("value") / 100;
  let feedback = $('.delay-feedback-container #slider').data('roundSlider').option("value") / 100;
  let mix = $('.delay-mix-container #slider').data('roundSlider').option("value") / 100;

  delay = new Pizzicato.Effects.Delay({
    feedback: feedback,
    time: delayTime,
    mix: mix,
  });

  sound.effects.forEach((effect) => {
    console.log(effect)
    console.log(delay)
    if (effect === delay){

    }
  });
  sound.effects.splice(0, 1);
  sound.addEffect(delay);
}

const resetDelay = () => {
  $('.delay-time-container #slider').data('roundSlider').option("value", 0);
  $('.delay-feedback-container #slider').data('roundSlider').option("value", 0);
  $('.delay-mix-container #slider').data('roundSlider').option("value", 0);
}

const applyOctave = (sound) => {
  let val = currentOctave;
  newFrequency = calcOctave(sound.frequency, val);
  sound.frequency = newFrequency;
}

const applyAttack = (sound) => {
  let val = parseInt($('.attack-container #attack')[0].value);
  sound.attack = val;
}

const rotatePresets = (direction) => {
  return (e) => {
    if (direction === "up"){
      let first = presets[0];
      presets.shift();
      presets.push(first);
    } else if (direction === "down"){
      let last = presets[presets.length - 1];
      presets.unshift(last);
      presets.pop();
    }
      changePresets(presets[0]);
  }
}

const autoChangeOscillators = (osc1, osc2, osc3) => {

  while (osc1Array[0] !== osc1){
    $('.oscillator1-container .arrow-up')[0].click();
  }
  while (osc2Array[0] !== osc2){
    $('.oscillator2-container .arrow-up')[0].click();
  }
  while (osc3Array[0] !== osc3){
    $('.oscillator3-container .arrow-up')[0].click();
  }
}

applyEvilStairs = () => {
  applyDefault();
  $('.tremelo-container #depth')[0].value = 8;
  $('.attack-container #attack')[0].value = 1;

  autoChangeOscillators("sawtooth", "sawtooth", "sawtooth");
  autoChangeOctave(-2);
}

const applyDarkPact = () => {
  applyDefault();
  $('.flanger-container #time')[0].value = 14;
  $('.flanger-container #speed')[0].value = 21;
  $('.flanger-container #depth')[0].value = 24;
  $('.flanger-container #mix')[0].value = 30;

  $('.tremelo-container #speed')[0].value = 35;
  $('.tremelo-container #depth')[0].value = 8;
  $('.tremelo-container #mix')[0].value = 12;
  $('.attack-container #attack')[0].value = 2;
  autoChangeOscillators("triangle", "triangle", "sine");
  autoChangeOctave(-1);
}

const applyVentillator = () => {
  applyDefault();
  autoChangeOscillators("sine", "square", "sawtooth");
  $('.flanger-container #time')[0].value = 18;
  $('.flanger-container #speed')[0].value = 27;
  $('.flanger-container #depth')[0].value = 40;
  $('.flanger-container #mix')[0].value = 90;
  autoChangeOctave(-3);
}

const apply8BitJams = () => {
  applyDefault();
  autoChangeOctave(-1);
  autoChangeOscillators("triangle", "square", "sine");
}

const applyCyberChurch = () => {
  applyDefault();
  $('.flanger-container #time')[0].value = 40;
  $('.flanger-container #speed')[0].value = 30;
  $('.flanger-container #depth')[0].value = 35;
  $('.flanger-container #mix')[0].value = 28;

  $('.tremelo-container #speed')[0].value = 50;
  $('.tremelo-container #depth')[0].value = 18;
  $('.tremelo-container #mix')[0].value = 40;

  autoChangeOctave(-3);
  autoChangeOscillators("sine", "sawtooth", "sine")
}

const applyMartian = () => {
  applyDefault();
  $('.flanger-container #time')[0].value = 60;
  $('.flanger-container #speed')[0].value = 75;
  $('.flanger-container #depth')[0].value = 80;
  $('.flanger-container #mix')[0].value = 65;
}

const applyDefault = () => {
  resetDelay();
  resetFlanger();
  resetTremolo();
  resetOscillators();
  resetAttack();
  resetPitch();
  resetOctave(0);
}

const changePresets = (setting) => {
  $(".presets-display-container")[0].innerHTML = presets[0];
  if (setting === "DEFAULT"){
    applyDefault();
  } else if (setting === "MARTIAN"){
    applyMartian();
  } else if (setting === "CYBER CHURCH"){
    applyCyberChurch();
  } else if (setting === "8-BIT JAMS"){
    apply8BitJams();
  } else if (setting === "VENTILLATOR"){
    applyVentillator();
  } else if (setting === "DARK PACT"){
    applyDarkPact();
  } else if (setting === "EVIL STAIRS"){
    applyEvilStairs();
  }
}

const updatePitch = () => {
  let adjustVal = $('.pitch-container #pitch')[0].value / 100;
  let notes = Object.keys(playedSounds);
  let notes2 = Object.keys(playedSounds2);
  let notes3 = Object.keys(playedSounds3);

  notes.forEach((note) => {
    playedSounds[note].frequency = originalFreq[note] * (adjustVal + 1);
  })

  notes2.forEach((note2) => {
    playedSounds2[note2].frequency = originalFreq2[note2] * (adjustVal + 1);
  })

  notes3.forEach((note3) => {
    playedSounds3[note3].frequency = originalFreq3[note3] * (adjustVal + 1);
  })
}

const updateVolume = () => {
  let val = $('.volume-container #slider').data('roundSlider').option("value") / 100;

  let notes = Object.keys(playedSounds);
  let notes2 = Object.keys(playedSounds2);
  let notes3 = Object.keys(playedSounds3);

  notes.forEach((note) => {
    playedSounds[note].volume = val;
  })

  notes2.forEach((note2) => {
    playedSounds2[note2].volume = val;
  })

  notes3.forEach((note3) => {
    playedSounds3[note3].volume = val;
  })
}



$(".pitch-container #pitch").on("input", updatePitch);
$('.volume-container').on("mouseover", updateVolume);
$('.presets-container .up-btn-container').on("click", rotatePresets("up"));
$('.presets-container .down-btn-container').on("click", rotatePresets("down"));
$('.presets-display-container')[0].innerHTML = presets[0];



  let keyA = document.getElementById('keyA');
  let $keyA = $(keyA);
  let keyW = document.getElementById('keyW');
  let $keyW = $(keyW);
  let keyS = document.getElementById('keyS');
  let $keyS = $(keyS);
  let keyE = document.getElementById('keyE');
  let $keyE = $(keyE);
  let keyD = document.getElementById('keyD');
  let $keyD = $(keyD);
  let keyR = document.getElementById('keyR');
  let $keyR = $(keyR);
  let keyF = document.getElementById('keyF');
  let $keyF = $(keyF);
  let keyG = document.getElementById('keyG');
  let $keyG = $(keyG);
  let keyY = document.getElementById('keyY');
  let $keyY = $(keyY);
  let keyH = document.getElementById('keyH');
  let $keyH = $(keyH);
  let keyU = document.getElementById('keyU');
  let $keyU = $(keyU);
  let keyJ = document.getElementById('keyJ');
  let $keyJ = $(keyJ);

  const calcOctave = (frequency, val) => {

    switch(val){
      case 0:
        return frequency * 1;
      case 1:
        return frequency * 2;
      case 2:
        return (frequency * 2) * 2;
      case 3:
        return ((frequency * 2) * 2) * 2;
      case -1:
        return frequency / 2;
      case -2:
        return (frequency / 2) / 2;
      case -3:
        return ((frequency / 2) / 2) / 2;
      default:
        return frequency;
    }
  }

  const keyDown = (note, frequency) => {
    if(notes[note] === "down") return;
    notes[note] = "down";

    let oscillator1Type = $("#oscillator1Type").val();
    let sound = new Pizzicato.Sound({
      source: 'wave',
      options: {
        type: osc1Array[0],
        frequency: frequency
      }
    });

    let oscillator2Type = $("#oscillator2Type").val();
    let sound2 = new Pizzicato.Sound({
      source: 'wave',
      options: {
        type: osc2Array[0],
        frequency: frequency
      }
    });

    let oscillator3Type = $("#oscillator3Type").val();
    let sound3 = new Pizzicato.Sound({
      source: 'wave',
      options: {
        type: osc3Array[0],
        frequency: frequency
      }
    });

    playedSounds[note] = sound;
    playedSounds2[note] = sound2;
    playedSounds3[note] = sound3;

    originalFreq[note] = sound.frequency;
    originalFreq2[note] = sound2.frequency;
    originalFreq3[note] = sound3.frequency;

    applyDelay(sound);
    applyDelay(sound2);
    applyDelay(sound3);

    applyFlanger(sound);
    applyFlanger(sound2);
    applyFlanger(sound3);

    applyTremelo(sound);
    applyTremelo(sound2);
    applyTremelo(sound3);

    applyOctave(sound);
    applyOctave(sound2);
    applyOctave(sound3);

    applyAttack(sound);
    applyAttack(sound2);
    applyAttack(sound3);

    sound.volume = $('.volume-container #slider').data('roundSlider').option("value") / 100;
    sound2.volume = $('.volume-container #slider').data('roundSlider').option("value") / 100;
    sound3.volume = $('.volume-container #slider').data('roundSlider').option("value") / 100;

    sound.play();
    sound2.play();
    sound3.play();
  }

  const keyUp = (note, frequency) => {
    notes[note] = "up";

    playedSounds[note].stop();
    playedSounds2[note].stop();
    playedSounds3[note].stop();
    playedSounds[note].disconnect();
    playedSounds2[note].disconnect();
    playedSounds3[note].disconnect();
  }

  $(window).bind('keypress', (e) => {

    let key = e.keyCode || e.which;
    if (key === 97) {
      $keyA[0].setAttribute("class", "white-active")
      keyDown("f", 698.46);
    } else if (key === 119) {
      $keyW[0].setAttribute("class", "black-active")
      keyDown("fs", 739.99);
    } else if (key === 115){
      $keyS[0].setAttribute("class", "white-active-margin")
      keyDown("g", 783.99);
    } else if (key === 101) {
      $keyE[0].setAttribute("class", "black-active")
      keyDown("gs", 830.61);
    } else if (key === 100){
      $keyD[0].setAttribute("class", "white-active-margin")
      keyDown("a", 880.00);
    } else if (key === 114){
      $keyR[0].setAttribute("class", "black-active")
      keyDown("as", 932.33);
    } else if (key === 102){
      $keyF[0].setAttribute("class", "white-active-margin")
      keyDown("b", 987.77);
    } else if (key === 103){
      $keyG[0].setAttribute("class", "white-active")
      keyDown("c", 1046.50);
    } else if (key === 121){
      $keyY[0].setAttribute("class", "black-active")
      keyDown("cs", 1108.73);
    } else if (key === 104){
      $keyH[0].setAttribute("class", "white-active-margin")
      keyDown("d", 1174.66);
    } else if (key === 117){
      $keyU[0].setAttribute("class", "black-active")
      keyDown("ds", 1244.51);
    } else if (key === 106){
      $keyJ[0].setAttribute("class", "white-active-margin")
      keyDown("e", 1318.51);
    }
  });

  $(window).bind('keyup', (e) => {

    let key = e.keyCode || e.which;
    if (key === 65) {
      $keyA[0].setAttribute("class", "white f")
      keyUp("f", 698.46)
    } else if (key === 87){
      $keyW[0].setAttribute("class", "black fs")
      keyUp("fs", 739.99);
    } else if (key === 83){
      $keyS[0].setAttribute("class", "white g")
      keyUp("g", 783.99);
    } else if (key === 69){
      $keyE[0].setAttribute("class", "black gs")
      keyUp("gs", 830.61);
    } else if (key === 68){
      $keyD[0].setAttribute("class", "white a")
      keyUp("a", 880.00	);
    } else if (key === 82){
      $keyR[0].setAttribute("class", "black as")
      keyUp("as", 932.33);
    } else if (key === 70){
      $keyF[0].setAttribute("class", "white b")
      keyUp("b", 987.77	);
    } else if (key === 71){
      $keyG[0].setAttribute("class", "white c")
      keyUp("c", 1046.50);
    } else if (key === 89){
      $keyY[0].setAttribute("class", "black cs")
      keyUp("cs", 1108.73);
    } else if (key === 72){
      $keyH[0].setAttribute("class", "white d")
      keyUp("d", 1174.66);
    } else if (key === 85){
      $keyU[0].setAttribute("class", "black ds")
      keyUp("ds", 1244.51);
    } else if (key === 74){
      $keyJ[0].setAttribute("class", "white e")
      keyUp("e", 1318.51);
    }
  });




});
