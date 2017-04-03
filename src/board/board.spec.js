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

describe.only('Board', function() {

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

  it('works', function() {
    const board = new Board();

    board.start();

    this.clock.tick(100);
    board.updateState();
    this.clock.tick(100);

    // Add character
    console.log('ADD CHARACTER');
    isActive = true;
    board.updateState();
    this.clock.tick(140);

    // Remove character
    console.log('REMOVE CHARACTER')
    isActive = false;
    this.clock.tick(100);

    board.updateState();
    this.clock.tick(100);

    board.stop();
  });
});
