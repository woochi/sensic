import {Board as ArduinoBoard, Magnetometer, Pin} from 'johnny-five';
import LSM303DLH from './lsm303dlh';
import {threePointSecondDerivative} from './differential';
import invariant from 'invariant';

class Board {
  constructor(options) {
    this.options = {
      threshold: 8,
      frequency: 50,
      characterPins: [],
      ...options
    };

    invariant(
      this.options.characterPins.length > 0,
      'You must define the character power pin numbers in options.'
    );

    this.board = new ArduinoBoard();
    this.resetMagnetometerValues();
  }

  start() {
    // On board ready
    this.board.on('ready', () => {
      this.characterPins = this.options.characterPins.map(pinNumber => {
        return new Pin(pinNumber);
      });
      this.depowerCharacterPins();

      // Set up magnetometer connection
      this.magnetometer = new Magnetometer({
        controller: LSM303DLH,
        frequency: this.options.frequency
      });

      this.magnetometer.on('data', this.onMagnetometerUpdate);
      this.updateLoop = setInterval(this.updateState, 500);
    });
  }

  depowerCharacterPins = () => {
    if (this.characterPins) {
      console.log('DEPOWER PINS');
      this.characterPins.forEach(pin => pin.low());
    }
  }

  stop = () => {
    console.log('Stopping board');

    console.log('Clearing update intervals and timeouts');
    clearInterval(this.updateLoop);
    clearTimeout(this.deferredEndUpdate);

    console.log('Turning character pin powers low');
    this.depowerCharacterPins();
  }

  resetMagnetometerValues = () => {
    this.magnetometerValues = {
      x: [0, 0, 0],
      y: [0, 0, 0],
      z: [0, 0, 0]
    };
  }

  updateMagnetometerValues = (heading) => {
    ['x', 'y', 'z'].forEach(dimension => {
      const dimensionValues = this.magnetometerValues[dimension];
      dimensionValues.shift();
      dimensionValues.push(heading[dimension]);
    });
  }

  getMagnetometerAcceleration = () => {
    const {x, y, z} = this.magnetometerValues;
    const {frequency} = this.options;
    const timeDifference = 1000/frequency;

    console.log(x);

    return {
      x: threePointSecondDerivative(...x, timeDifference),
      y: threePointSecondDerivative(...y, timeDifference),
      z: threePointSecondDerivative(...z, timeDifference)
    };
  };

  onMagnetometerUpdate = ({heading}) => {
    // const {x, y, z} = heading;
    if (this.updating) {
      const {threshold} = this.options;
      this.updateMagnetometerValues(heading);
      const acceleration = this.getMagnetometerAcceleration();

      if (!this.endingCurrentCharacterUpdate && Math.abs(acceleration.x) > threshold) {
        // If we detect acceleration when the character power was turned on, add character as active
        this.activeCharacters.push(this.currentCharacterIndex);

        // Start pulse end
        this.endingCurrentCharacterUpdate = true;

        // Stop power for current character
        this.currentCharacterPin.low();
      }

      // Wait for the magnet pulse to properly end before pulsing the next character.
      // This avoids the magnetometer to be triggered by the residue from the previous pulse.
      if (this.endingCurrentCharacterUpdate && Math.abs(acceleration.x) < threshold - 1) {
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
    // Pulse through character pins and update state, starting from the first pin
    this.currentCharacterIndex = 0;
    this.updateCurrentCharacter();
  }

  updateCurrentCharacter = () => {
    this.endingCurrentCharacterUpdate = false;
    this.updating = true;

    // Start power for current character
    this.currentCharacterPin = this.characterPins[this.currentCharacterIndex];
    this.currentCharacterPin.high();

    // Schedule pulse to end after 100ms
    this.deferredEndUpdate = setTimeout(this.endCurrentCharacterUpdate, 100);
  }

  endCurrentCharacterUpdate = () => {
    // Clear timeout if update end was called manually earlier
    clearTimeout(this.deferredEndUpdate);

    // Reset magnetometer state
    this.updating = false;
    this.resetMagnetometerValues();

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
    this.resetMagnetometerValues();
  }
}

export default Board;
