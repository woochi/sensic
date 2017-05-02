import {Board as ArduinoBoard, Magnetometer, Pin, Expander} from 'johnny-five';
import {threePointSecondDerivative} from './differential';
import invariant from 'invariant';
import Multiplexer from './multiplexer';
import series from 'async/series';

function createMagnetometerValues() {
  return {
    x: [0, 0, 0],
    y: [0, 0, 0],
    z: [0, 0, 0]
  };
}

function updateMagnetometerValues(magnetometerValues, heading) {
  return ['x', 'y', 'z'].reduce((values, dimension) => {
    const dimensionValues = values[dimension].slice(1);
    dimensionValues.push(heading[dimension]);

    return {...values, [dimension]: dimensionValues};
  }, magnetometerValues);
}

function acceleration(magnetometerValues, frequency) {
  const {x, y, z} = magnetometerValues;
  const timeDifference = 1000/frequency;

  // TODO: return null for axis if values have not been populated
  return {
    x: threePointSecondDerivative(...x, timeDifference),
    y: threePointSecondDerivative(...y, timeDifference),
    z: threePointSecondDerivative(...z, timeDifference)
  };
}

function totalAcceleration({x, y, z}) {
  return (Math.abs(x) + Math.abs(y) + Math.abs(z)) * 0.33;
}

class Board {
  constructor(options) {
    this.options = {
      threshold: 4,
      frequency: 50,
      characterPins: [],
      locationIds: [],
      ...options
    };

    invariant(
      this.options.characterPins.length > 0,
      'You must define the character power pin numbers in options.'
    );

    this.state = {};
    this.board = new ArduinoBoard();
    this.resetMagnetometerValues();
  }

  start() {
    // On board ready
    this.board.on('ready', () => {
      // Set up components
      this.multiplexer = new Multiplexer();
      this.expander = new Expander('PCA9685');
      this.characterPins = this.options.characterPins.map(pinNumber => {
        return new Pin(pinNumber);
      });
      this.magnetometer = new Magnetometer({
        controller: 'HMC5883L',
        frequency: this.options.frequency
      });

      // Make sure everything is powered off at start
      this.depowerCharacterPins();
      this.loop();
    });
  }

  depowerCharacterPins = () => {
    if (this.characterPins) {
      console.log('Depowering character pins');
      this.characterPins.forEach(pin => pin.low());
    }
  }

  loop = () => {
    this.updateState().then(this.loop);
  }

  stop = () => {
    console.log('Stopping board');

    console.log('Clearing update intervals and timeouts');
    clearInterval(this.updateLoop);
    clearTimeout(this.deferredEndUpdate);

    console.log('Turning character pin powers low');
    this.depowerCharacterPins();
  }

  getState() {
    return this.state;
  }

  updateState = () => {
    //  clear state
    //
    //  for each location
    //    select multiplexer location
    //
    //    for each character
    //      pulse character
    //        if magnetometer reported acceleration during pulse
    //          set character as active in location

    // For each location
    const locationUpdates = this.options.locationIds.map(locationId => (state, locationCallback) => {
      this.multiplexer.select(locationId);

      // Pulse characters
      const characterUpdates = this.characterPins.map(characterPin => (characters, characterCallback) => {
        let magnetometerValues = createMagnetometerValues();

        const trackCurrentCharacter = ({heading}) => {
          magnetometerValues = updateMagnetometerValues(magnetometerValues, heading);
          const accelerationValues = getAcceleration(magnetometerValues, this.opts.frequency);
          const acceleration = totalAcceleration(accelerationValues);

          if (totalAcceleration > threshold) {
            // Set character to state
            // TODO: dedupe characters
            characters.push(characterPin.pin);
          }
        };
        this.magnetometer.on('data', trackCurrentCharacter);

        // Perform pulse by waiting 100ms, pulsing 100ms and waiting 100ms.
        // This allows the magnet field to properly reset before and after the pulse.
        // Otherwise the previous pulse might still register in the next character's pulse period.
        setTimeout(() => {
          // Power on current character pin
          characterPin.high();

          setTimeout(() => {
            // Power off current character pin
            characterPin.low();

            setTimeout(() => {
              this.magnetometer.off('data', trackCurrentCharacter);
              characterCallback(characters);
            }, 100);
          }, 100);
        }, 100);
      });

      series(
        [constant([])].concat(characterUpdates),
        (err, activeCharactersInLocation) => locationCallback({
          ...state,
          [locationId]: activeCharactersInLocation
        });
      );
    });

    series(
      [constant({})].concat(locationUpdates),
      (err, newState) => this.state = newState
    );
  }

  indicateLocation = (location) => {
    // TODO
  }
}

export default Board;
