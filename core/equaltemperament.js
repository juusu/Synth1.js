function EqualTemperament(aPitch) {
	this._a = aPitch || 440;

	this._twelthRootOfTwo = Math.pow(2, 1/12);

	this.pitches = new Array(9);

	// compute the 4th octave first
	this.pitches[4] = new Array(12);

	for (i=0;i<12;i++) {
		this.pitches[4][i] = this._a * Math.pow(this._twelthRootOfTwo,i-9);
	}
  
	//now do all the others
	for (j=0;j<9;j++) {
		if (j!=4) {
            this.pitches[j] = new Array(12);
			for (i=0;i<12;i++) {
				this.pitches[j][i] = this.pitches[4][i] * Math.pow(2,j-4);
			}
		}
	}
};

module.exports = EqualTemperament;