function MonoTrackSequencer(transport, synth, patternData, tempo, sampleRate, ticksPerRow) {
 	this.transport = transport;
 	this.synth = synth;
	this.patternData = patternData || [[]];
	this.sampleRate = sampleRate || 44100;
	this.tempo = tempo || 125;
	this.ticksPerRow = ticksPerRow || 6;
	this.currentTick = 0;
	this.currentPattern = 0;
	this.currentRow = 0;

	// fixed for now
	this.rowsPerBeat = 4;

	this._tickDuration = 60 / this.tempo / this.rowsPerBeat / this.ticksPerRow; 
	this._nextTickTime = 0;
}

MonoTrackSequencer.prototype.advance = function() {
	
	this.transport.advance();
	// are we even playing ?
	if (this.transport.playing()) {
		// is it time to advance one tick?
		if (this.transport.currentTime >= this._nextTickTime) {
			if (this.currentTick===0) {
				// do stuff that happens every row
				var note = Notes[this.patternData[this.currentRow]];
				console.log (this.patternData[this.currentRow]);
			}
			// do stuff that happens every tick
			this.currentTick++;
			this._nextTickTime += this._tickDuration;
			if (this.currentTick >= this.ticksPerRow) {
				this.currentTick = 0;
				this.currentRow ++;
				if (this.currentRow >= this.patternData.length) {
					this.currentRow = 0;
				}
			}
		}
	}
};

module.exports = MonoTrackSequencer;