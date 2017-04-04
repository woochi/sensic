import {Board as ArduinoBoard, Magnetometer, Pin} from 'johnny-five';
import LSM303DLH from './lsm303dlh';
import {threePointSecondDerivative} from './differential';

class Board {
  constructor(opts) {
    this.opts = {
      threshold: 1,
      frequency: 50,
      ...opts
    };

    this.board = new ArduinoBoard();
    this.magnetometerValues = [0, 0, 0];
  }

  start() {
    // Start listening to magnetometer
    this.board.on('ready', () => {
      this.power = new Pin(2);

      // Set up magnetometer connection
      this.magnetometer = new Magnetometer({
        controller: LSM303DLH,
        frequency: this.opts.frequency
      });

      this.magnetometer.on('data', this.onMagnetometerUpdate);
      this.updateLoop = setInterval(this.updateState, 500);
    });
  }

  stop = () => {
    clearInterval(this.updateLoop);
    clearTimeout(this.deferredEndUpdate);
    this.power.low();
  }

  onMagnetometerUpdate = ({heading: {x}}) => {
    if (this.updating) {
      this.magnetometerValues.shift();
      this.magnetometerValues.push(x);

      const {threshold, frequency} = this.opts;
      const timeDifference = 1000/frequency;
      const acceleration = threePointSecondDerivative(...this.magnetometerValues, timeDifference);

      //console.log(this.magnetometerValues, acceleration);

      if (acceleration < -threshold) {
        this.characterWasActiveDuringUpdate = true;
        this.endUpdate();
      }
    }
  }

  getState() {
    return this.characterWasActiveDuringUpdate || false;
  }

  updateState = () => {
    this.startUpdate();
    this.deferredEndUpdate = setTimeout(this.endUpdate, 100);
  }

  startUpdate = () => {
    this.characterWasActiveDuringUpdate = false;
    this.updating = true;
    this.power.high();
  }

  endUpdate = () => {
    clearTimeout(this.deferredEndUpdate);
    this.power.low();
    this.updating = false;
    this.magnetometerValues = [0, 0, 0];
  }
}

export default Board;
