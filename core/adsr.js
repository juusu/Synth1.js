var AdsrPhase = {
  ATTACK: 1,
  DECAY: 2,
  SUSTAIN: 3,
  RELEASE: 4
};

function ADSR(sampleRate, attack, decay, sustain, release, doSustain) {

  this._gate = false;

  this.attackTime = typeof attack !== 'undefined' ? attack : 0;
  this.decayTime = typeof decay !== 'undefined' ? decay : 20;
  this.sustainLevel = typeof sustain !== 'undefined' ? sustain : .5;
  this.releaseTime = typeof release !== 'undefined' ? release : 500;
  this.gain = 0; // starting gain
  this.phase = AdsrPhase.ATTACK; // start in attack phase
  this.sampleRate = sampleRate || 44100;

  this.sustain = typeof doSustain !== 'undefined' ? doSustain : true;

  this.tick = 1000 / this.sampleRate;
  this.time = 0;

  this.recalcRates();
}

ADSR.prototype.recalcRates = function() {
  this.attackRate = 1000 /
    (this.sampleRate * this.attackTime + 1000);
  this.decayRate = 1000 /
    (this.sampleRate * this.decayTime + 1000) *
    (1 - this.sustainLevel);
  this.releaseRate = 1000 /
    (this.sampleRate * this.releaseTime + 1000) *
    this.sustainLevel;
}

ADSR.prototype.gate = function(gate) {
  return arguments.length ? (this._gate = gate) : this._gate;
};

ADSR.prototype.reset = function() {
  this.phase = AdsrPhase.ATTACK;
};

ADSR.prototype.advance = function() {
  switch (this.phase) {
    case AdsrPhase.ATTACK:
      if (this.gate()) {
        this.gain += this.attackRate;
        this.time += this.tick;
        if (this.time >= this.attackTime) {
          this.gain = 1;
          this.time = 0;
          this.phase = AdsrPhase.DECAY;
        }
      }
      break;
    case AdsrPhase.DECAY:
      this.gain -= this.decayRate;
      this.time += this.tick;
      if (this.time >= this.decayTime) {
        this.gain = this.sustainLevel;
        this.time = 0;
        this.phase = AdsrPhase.SUSTAIN;
      }
      break;
    case AdsrPhase.SUSTAIN:
      if (!this.sustain) {
        this.gate(false);
      }
      if (!this.gate()) {
        this.phase = AdsrPhase.RELEASE;
      }
      break;
    case AdsrPhase.RELEASE:
      this.gain -= this.releaseRate;
      this.time += this.tick;
      if (this.time >= this.releaseTime) {
        this.gain = 0;
        this.time = 0;
        this.phase = AdsrPhase.ATTACK;
      }
      break;
  }
};

module.exports = ADSR;