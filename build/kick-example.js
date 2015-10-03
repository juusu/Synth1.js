(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var Waveform = {
  SINE: 1,
  SAW: 2,
  PULSE: 3,
  TRIANGLE: 4,
  NOISE: 5
};

function Oscillator(sampleRate) {
  this.waveform = Waveform.SINE;
  this.phase = 0;
  this.sampleRate = sampleRate || 44100;
  this.frequency = 220;
  this.pulseWidth = 0;
  
  this._gate = false;

};

Oscillator.prototype.gate = function ( gate ) {
    return arguments.length ? ( this._gate = gate ): this._gate;
};

Oscillator.prototype.getNextSample = function() {
  var output;
  switch (this.waveform) {
    case Waveform.SINE:
      output = Math.sin(Math.PI * this.phase);      
      break;
    case Waveform.SAW:
      output = this.phase;
      break;
    case Waveform.PULSE:
      output = this.phase > 0 &&
               this.phase < 1 + this.pulseWidth ||
               this.phase <= 0 &&
               this.phase < this.pulseWidth - 1 ?
               1 : -1;
      break;
    case Waveform.NOISE:
      output = Math.random() * 2 - 1;
      break;
    case Waveform.TRIANGLE:
      output = Math.abs(this.phase) < .5 ?
               this.phase * 2 :
               2 * (this.phase < 0 ? -1 : 1) -
               this.phase * 2;
      break;
  }   
  
  // increment the phase
  this.phase += 2 * this.frequency / this.sampleRate;
  
  // wrap the phase around if needed
  this.phase -= (this.phase > 1 && 2);
  
  return this.gate() ? output : 0;
};

module.exports = Oscillator;
},{}],3:[function(require,module,exports){
(function (global){
var Kick = require('../synths/kick.js');
var Oscillator = require('../core/oscillator.js');
var ADSR = require('../core/ADSR.js');

global.context = global.context || new AudioContext();

var osc = new Oscillator(global.context.sampleRate);
var volEnv = new ADSR(global.context.sampleRate,2,25,.6,500,false);
var pitchEnv = new ADSR(global.context.sampleRate,0,80,.2,80,false);

global.kick = new Kick(osc, volEnv, pitchEnv, 3.3);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core/ADSR.js":1,"../core/oscillator.js":2,"../synths/kick.js":4}],4:[function(require,module,exports){
var Oscillator = require('../core/oscillator.js');
var ADSR = require('../core/ADSR.js');

function Kick(osc, volEnv, pitchEnv, pitchRange, baseFrequency) {

  this.osc = osc;
  this.osc.gate(true);

  this.pitchEnv = pitchEnv;
  this.volEnv = volEnv;

  this._gate = false;

  this.pitchRange = typeof pitchRange !== 'undefined' ? pitchRange : 2;
  this.baseFrequency = typeof baseFrequency !== 'undefined' ? baseFrequency : 49; // G-1

}

Kick.prototype.getNextSample = function() {
  this.volEnv.advance();
  this.pitchEnv.advance();
  this.osc.frequency = (this.pitchEnv.gain * this.pitchRange + 1) * this.baseFrequency;
  return this.volEnv.gain * this.osc.getNextSample();
}

Kick.prototype.gate = function(gate) {
  return arguments.length ? (this._gate = gate, this.pitchEnv.gate(gate), this.volEnv.gate(gate)) : this._gate;
}

Kick.prototype.kick = function() {
  // reset envelopes
  this.pitchEnv.reset();
  this.volEnv.reset();
  this.gate(true);
}

module.exports = Kick;
},{"../core/ADSR.js":1,"../core/oscillator.js":2}]},{},[3]);
