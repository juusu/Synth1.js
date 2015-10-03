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