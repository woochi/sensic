import {Board as ArduinoBoard, Magnetometer, Pin} from 'johnny-five';
import LSM303DLH from './lsm303dlh';
import {threePointSecondDerivative} from './differential';

class Board {
  constructor(opts) {
    this.opts = {
      threshold: 40,
      frequency: 100,
      ...opts
    };

    this.board = new ArduinoBoard();
    this.power = new Pin(2);
    this.magnetometerValues = [0, 0, 0];

    this.board.on('ready', () => {
      // Set up magnetometer connection
      this.magnetometer = new Magnetometer({
        controller: LSM303DLH,
        frequency: this.opts.frequency
      });
    });
  }

  start() {
    // Start listening to magnetometer
    this.magnetometer.on('data', this.onMagnetometerUpdate);
  }

  stop() {
    this.power.low();
  }

  onMagnetometerUpdate = ({x, y, z}) => {
    // TODO: check x value
    const {threshold} = this.opts;

    this.magnetometerValues.shift();
    this.magnetometerValues.push(x);

    if (this.updating) {
      const timeDifference = 1000/this.opts.frequency;
      const acceleration = threePointSecondDerivative(...this.magnetometerValues, timeDifference);

      if (acceleration < -threshold) {
        this.characterWasActiveDuringUpdate = true;
      }
    }
  }

  getState() {
    return {};
  }

  updateState() {
    this.startUpdate();
    setTimeout(this.endUpdate, 100);
  }

  startUpdate = () => {
    console.log('START UPDATE');
    this.characterWasActiveDuringUpdate = false;
    this.updating = true;
    this.power.high();
  }

  endUpdate = () => {
    console.log('END UPDATE');
    clearTimeout(this.endUpdateTimeout);
    this.updating = false;
    this.power.low();

    if (this.characterWasActiveDuringUpdate) {
      console.log('CHARACTER WAS ACTIVE');
    } else {
      console.log('CHARACTER WAS INACTIVE');
    }
  }
}

export default Board;
