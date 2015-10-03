var Kick = require('../synths/kick.js');
var Oscillator = require('../core/oscillator.js');
var ADSR = require('../core/ADSR.js');

global.context = global.context || new AudioContext();

var osc = new Oscillator(global.context.sampleRate);
var volEnv = new ADSR(global.context.sampleRate,2,25,.6,500,false);
var pitchEnv = new ADSR(global.context.sampleRate,0,80,.2,80,false);

global.kick = new Kick(osc, volEnv, pitchEnv, 3.3);
