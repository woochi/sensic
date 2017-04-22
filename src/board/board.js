import {Board as ArduinoBoard, Magnetometer, Pin} from 'johnny-five';
import LSM303DLH from './lsm303dlh';
import {threePointSecondDerivative} from './differential';
import invariant from 'invariant';

class Board {
  constructor(options) {
    this.options = {
      threshold: 1,
      frequency: 50,
      characterPins: [],
      ...options
    };

    invariant(
      this.options.characterPins.length === 0,
      'You must define the character power pin numbers in options.'
    );

    this.board = new ArduinoBoard();
    this.magnetometerValues = [0, 0, 0];
  }

  start() {
    // On board ready
    this.board.on('ready', () => {
      this.characterPins = this.options.characterPins.map(pinNumber => {
        return new Pin(pinNumber);
      });

      // Set up magnetometer connection
      this.magnetometer = new Magnetometer({
        controller: LSM303DLH,
        frequency: this.options.frequency
      });

      this.magnetometer.on('data', this.onMagnetometerUpdate);
      this.updateLoop = setInterval(this.updateState, 500);
    });
  }

  stop = () => {
    clearInterval(this.updateLoop);
    clearTimeout(this.deferredEndUpdate);
    this.characterPins.forEach(pin => pin.low());
  }

  onMagnetometerUpdate = ({heading: {x}}) => {
    if (this.updating) {
      this.magnetometerValues.shift();
      this.magnetometerValues.push(x);

      const {threshold, frequency} = this.options;
      const timeDifference = 1000/frequency;
      const acceleration = threePointSecondDerivative(...this.magnetometerValues, timeDifference);

      //console.log(this.magnetometerValues, acceleration);

      if (acceleration < -threshold) {
        // If we detect acceleration when the character power was turned on, add character as active
        this.activeCharacters.push(this.currentCharacter);
        this.endCurrentCharacterUpdate();
      }
    }
  }

  getState() {
    return this.activeCharacters || [];
  }

  updateState = () => {
    this.activeCharacters = [];
    this.startUpdate();
  }

  startUpdate = () => {
    // Pule through character pins and update state, starting from the first pin
    this.currentCharacterIndex = 0;
    this.updateCurrentCharacterState();
  }

  updateCurrentCharacter = () => {
    this.updating = true;

    // Start power for current character
    this.currentCharacterPin = this.characterPins[currentCharacterIndex];
    this.currentCharacterPin.high();

    // Schedule pulse to end after 100ms
    this.deferredEndUpdate = setTimeout(this.endCurrentCharacterUpdate, 100);
  }

  endCurrentCharacterUpdate = () => {
    // Clear timeout if update end was called manually earlier
    clearTimeout(this.deferredEndUpdate);

    // Reset magnetometer state
    this.updating = false;
    this.magnetometerValues = [0, 0, 0];

    // Stop power for current character
    this.currentCharacterPin.low();

    if (this.currentCharacterIndex < this.characterPins.length - 1) {
      // If this was not the last character, start pulsing the next one
      this.currentCharacterIndex++;
      this.updateCurrentCharacter();
    } else {
      this.endUpdate();
    }
  }

  endUpdate = () => {
    this.updating = false;
    this.magnetometerValues = [0, 0, 0];
  }
}

export default Board;
