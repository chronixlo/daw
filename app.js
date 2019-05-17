(function () {
  var scaleRoot = 'C';
  var scaleRootFrequency = Tone.Frequency(scaleRoot + '4');
  var major = true;
  var majorScaleSemiTones = [0, 2, 4, 5, 7, 9, 11, 12];
  var minorScaleSemiTones = [0, 2, 3, 5, 7, 8, 10, 12];
  var semiTones = major ? majorScaleSemiTones : minorScaleSemiTones;
  var scale = [];

  for (var i = 0; i < 7; i++) {
    var tone = scaleRootFrequency.transpose(semiTones[i]);
    scale.push(tone.toNote().slice(0, -1));
  }

  var progression = [4, 5, 1, 1];
  var noteProgression = progression.map(i => scale[i - 1]);

  var kick = new Tone.MembraneSynth().toMaster()
  var pad = new Tone.PolySynth().toMaster();
  pad.volume.value = -12;
  var bass = new Tone.Synth().toMaster();
  var lead = new Tone.PolySynth(12, Tone.AMSynth).toMaster();

  var app = document.querySelector('.app');
  var stepSequencerContainer = document.querySelector('.step-sequencer-container');
  var play = document.querySelector('.play');
  var stepSequencer = document.createElement('div');
  stepSequencer.classList.add('step-sequencer');
  stepSequencerColumns = [];

  var headerColumn = document.createElement('div');
  headerColumn.classList.add('step-sequencer-header-column');
  for (var cell = 20; cell >= 0; cell--) {
    var el = document.createElement('div');
    el.classList.add('step-sequencer-cell');
    el.textContent = scale[cell % 7];
    headerColumn.appendChild(el);
  }
  stepSequencerContainer.appendChild(headerColumn);

  for (var col = 0; col < 64; col++) {
    var column = document.createElement('div');
    column.classList.add('step-sequencer-column');
    stepSequencerColumns.push(column);

    for (var cell = 20; cell >= 0; cell--) {
      var el = document.createElement('div');
      el.classList.add('step-sequencer-cell');

      var currentRoot = progression[Math.floor(col / 16)];
      var note = (cell - (currentRoot - 1));
      var suggested = false;

      if (note % 7 === 0 || (note - 2) % 7 === 0 || (note - 4) % 7 === 0) {
        suggested = true;
        el.classList.add('suggested');
      }

      if (suggested && col % 2 === 0 && Math.random() > 0.9) {
        el.setAttribute('data-checked', '');
      }

      el.addEventListener('click', function (e) {
        this.toggleAttribute('data-checked');
      });

      column.appendChild(el);
    }

    stepSequencer.appendChild(column);
  }

  stepSequencerContainer.appendChild(stepSequencer);

  play.addEventListener('click', togglePlay);
  document.addEventListener('keypress', function (e) {
    if (e.code === 'Space') {
      togglePlay();
    }
  });

  function togglePlay() {
    Tone.Transport.toggle();
  }

  var loop = new Tone.Sequence(function (time, col) {
    var note = noteProgression[Math.floor(col / 16)];

    var ssCol = stepSequencerColumns[col];
    var prevCol = stepSequencerColumns[(col + 63) % 64];
    prevCol.classList.remove('current');
    ssCol.classList.add('current');

    for (var i = 0; i < ssCol.children.length; i++) {
      if (ssCol.children[i].hasAttribute('data-checked')) {
        var dog = 20 - i;
        lead.triggerAttackRelease(scale[dog % 7] + (4 + Math.floor(dog / 7)), '8n');
      }
    }

    if (col % 4 === 0) {
      kick.triggerAttackRelease('C1', '8n')
    }

    if (col % 16 === 0) {
      var rootNote = note + '4';

      var fifth = Tone.Frequency(rootNote).transpose(7);

      pad.triggerAttackRelease(rootNote, '1n');
      pad.triggerAttackRelease(fifth, '1n');
    }

    bass.triggerAttackRelease(note + '2', '8n')
  }, new Array(64).fill().map((i, idx) => idx), '16n')
  .start(0);
})();
