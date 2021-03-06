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