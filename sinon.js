import sinon from 'sinon';



beforeEach(function() {
	this.sinon = sinon.sandbox.create();
	this.clock = sinon.useFakeTimers();
});

afterEach(function() {
	this.sinon.restore();
	this.clock.restore();
});



export default sinon;
