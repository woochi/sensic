import {expect} from 'chai';
import sinon from 'sinon';
import Board from './board';

let isActive = false;
const inactiveData = { x: 334, y: -135, z: -4096 };
const activeData = { x: -4096, y: -4096, z: -4096 };

class MockBoard {
  on(eventName, callback) {
    callback();
  }
}

class MockMagnetometer {
  constructor(opts) {
    this.opts = opts;
  }

  on(eventName, callback) {
    if (eventName === 'data') {
      this.passData(callback);
    }
  }

  passData(callback) {
    const data = isActive ? activeData : inactiveData;

    callback(data);
    setTimeout(() => {
      this.passData(callback);
    }, 1000/this.opts.frequency);
  }
}

class MockPin {
  constructor() {
    this.value = 0;
  }

  high() {
    this.value = 1;
  }

  low() {
    this.value = 0;
  }
}

describe('Board', function() {

  beforeEach(function() {
    this.clock = sinon.useFakeTimers();

    Board.__Rewire__('ArduinoBoard', MockBoard);
    Board.__Rewire__('Magnetometer', MockMagnetometer);
    Board.__Rewire__('Pin', MockPin);
  });

  afterEach(function() {
    this.clock.restore();
    Board.__ResetDependency__('ArduinoBoard');
    Board.__ResetDependency__('Magnetometer');
    Board.__ResetDependency__('Pin');
  });

  describe('starting the board', function() {
    beforeEach(function() {
      this.board = new Board();

      this.board.start();
    });

    afterEach(function() {
      this.board.stop();
    });

    it('initially has no active characters', function() {
      expect(this.board.getState()).to.eql(false);
    });

    describe('waiting for the update interval (500ms)', function() {
      beforeEach(function() {
        this.clock.tick(600);
      });

      it('still has no active characters', function() {
        expect(this.board.getState()).to.eql(false);
      });
    });

    describe('bringing the character to the location and waiting for the update interval', function() {
      beforeEach(function() {
        isActive = true;
        this.clock.tick(600);
      });

      it('reports the character as active', function() {
        expect(this.board.getState()).to.eql(true);
      });

      describe('removing the character from the location and waiting for the update interval', function() {
        beforeEach(function() {
          isActive = false;
          this.clock.tick(600);
        });

        it('reports the character as inactive', function() {
          expect(this.board.getState()).to.eql(false);
        });
      });
    });
  });
});
