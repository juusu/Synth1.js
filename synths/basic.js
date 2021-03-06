function Synth(osc, env) {
  this.env = env;
  this.osc = osc;
  this.osc.gate = true;
}

Synth.prototype.getNextSample = function() {
  env.advance();
  return env.gain * osc.getNextSample();
}

module.exports = Synth;