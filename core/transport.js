function Transport(sampleRate) {
	this.sampleRate = sampleRate || 44100;

	this._playing = false;
	this.currentTime = 0;
	this.tick = 1 / this.sampleRate; // transport time ticks in seconds
}

Transport.prototype.advance = function() {
	if (this._playing) {
		this.currentTime += this.tick;
	}
};

Transport.prototype.reset = function() {
	this.currentTime = 0;
};

Transport.prototype.playing = function(playing) {
  return arguments.length ? (this._playing = playing) : this._playing;
};

module.exports = Transport;