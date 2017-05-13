import {Board as ArduinoBoard, Magnetometer, Pin, Expander, Led} from 'johnny-five';
import {threePointSecondDerivative} from './differential';
import invariant from 'invariant';
import Multiplexer from './multiplexer';
import {series, constant, waterfall} from 'async';
import {isEqual, uniq} from 'lodash';
import HMC5883L from './hmc5883l';

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

function getAcceleration(magnetometerValues, frequency) {
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
      threshold: 1,
      frequency: 50,
      characterPins: [],
      locationIds: [0, 1, 2, 3, 4],
      ledServoPort: 7,
      onChange: () => {},
      ...options
    };

    invariant(
      this.options.characterPins.length > 0,
      'You must define the character power pin numbers in options.'
    );

    this.state = {};
    this.queue = [];
    this.board = new ArduinoBoard();
  }

  start = () => {
    // On board ready
    // Set up components
    this.multiplexer = new Multiplexer({
      io: this.board.io
    });
    this.magnetometer = new Magnetometer({
      controller: HMC5883L
    });
    this.characterPins = this.options.characterPins.map(pinNumber => {
      return new Pin(pinNumber);
    });

    // LED Servo
    this.servo = new Expander({
      controller: 'PCA9685'
    });
    const servoBoard = new ArduinoBoard.Virtual(this.servo);
    this.leds = [0, 1, 2, 3, 4].map(i => {
      const offset = i * 3;
      return new Led.RGB({
        pins: {red: offset, green: offset + 1, blue: offset + 2},
        board: servoBoard
      });
    });

    this.multiplexer.select(7);

    this.leds.forEach(led => {
      led.intensity(10);
      led.color('#00FF00');
    });

    // Make sure everything is powered off at start
    this.depowerCharacterPins();

    // Setup magnetometer
    this.magnetometer.on('data', this.onMagnetometerUpdate);
    this.magnetometerValues = createMagnetometerValues();

    this.loop();
  }

  depowerCharacterPins = () => {
    if (this.characterPins) {
      console.log('Depowering character pins');
      this.characterPins.forEach(pin => pin.low());
    }
  }

  loop = () => {
    this.updateState().then(newState => {
      console.log(newState);
      if (!isEqual(this.state, newState)) {
        this.state = newState;
        this.options.onChange(newState);
      }
      this.state = newState;

      console.log('QUEUE', this.queue.length);
      if (this.queue.length) {
        series(this.queue, () => {
          this.queue = [];
          this.loop();
        });
      } else {
        this.loop();
      }
    })
    .catch(error => {
      console.log('Error while running the update', error, error.stack);
      this.stop();
    });
  }

  stop = () => {
    console.log('Stopping board');

    console.log('Turning character pin powers low');
    this.depowerCharacterPins();

    console.log('Turning indicators off');
    this.multiplexer.select(7);
    this.leds.forEach(led => led.off());
  }

  getState() {
    return this.state;
  }

  onMagnetometerUpdate = ({heading}) => {
    const {frequency, threshold} = this.options;
    this.magnetometerValues = updateMagnetometerValues(this.magnetometerValues, heading);
    //console.log('RAW', heading);

    if (this.updating) {
      const accelerationValues = getAcceleration(this.magnetometerValues, frequency);
      const acceleration = totalAcceleration(accelerationValues);
      //console.log('UPDATING', acceleration);

      if (acceleration > threshold) {
        // Set character to state
        // TODO: dedupe characters
        this.activeCharactersInLocation = uniq(this.activeCharactersInLocation.concat(this.characterId));
      }
    }
  }

  updateState = () => {
    return new Promise((resolve, reject) => {
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
        this.activeCharactersInLocation = [];
        this.locationId = locationId;
        this.multiplexer.select(locationId);
        //console.log('LOCATION UPDATE', this.locationId);

        // Pulse characters
        const characterUpdates = this.characterPins.map(characterPin => (characters, characterCallback) => {
          this.characterId = characterPin.pin;
          //console.log('CHARACTER UPDATE', this.characterId);

          // Perform pulse by waiting 100ms, pulsing 100ms and waiting 100ms.
          // This allows the magnet field to properly reset before and after the pulse.
          // Otherwise the previous pulse might still register in the next character's pulse period.

          setTimeout(() => {
            this.updating = true;

            // Power on current character pin
            characterPin.high();
            //console.log('HIGH');
            this.updating = true;

            setTimeout(() => {

              // Power off current character pin
              characterPin.low();
              //console.log('LOW');


              setTimeout(() => {
                this.updating = false;
                //console.log('STOP TRACKING');

                setTimeout(() => {
                  //console.log('CALLBACK');
                  characterCallback(null, this.activeCharactersInLocation);
                }, 100);
              }, 100);
            }, 120);
          }, 100);
        });

        waterfall(
          [constant([])].concat(characterUpdates),
          (err, activeCharactersInLocation) => {
            if (err) {
              reject(err);
              return;
            }

            let newState;
            if (activeCharactersInLocation.length) {
              newState = {
                ...state,
                [locationId]: activeCharactersInLocation
              };
            } else {
              newState = state;
            }

            console.log(newState);

            locationCallback(null, newState);
          }
        );
      });

      waterfall(
        [constant({})].concat(locationUpdates),
        (err, newState) => {
          if (err) {
            reject(err);
          } else {
            resolve(newState);
          }
        }
      );
    });
  }

  getLedForLocation = location => {
    const ledIndex = this.options.locationIds.findIndex(id => id === location);

    if (ledIndex >= 0) {
      return this.leds[ledIndex];
    }

    return null;
  }

  fadeInLocationLed = (location, color = 'blue') => callback => {
    const led = this.getLedForLocation(location);

    if (led) {
      this.multiplexer.select(this.options.ledServoPort);
      led.color(color);
    }

    callback();
  }

  fadeOutLocationLed = location => callback => {
    const led = this.getLedForLocation(location);

    if (led) {
      this.multiplexer.select(this.options.ledServoPort);
      led.off();
    }

    callback();
  }

  clearIndication = location => {
    this.queue.push(this.fadeOutLocationLed(location));
  }

  indicateLocation = location => {
    this.queue.push(this.fadeInLocationLed(location, 'blue'));
  }

  indicateSuccess = location => {
    this.queue.push(this.fadeInLocationLed(location, 'green'));
  }

  indicateError = location => {
    this.queue.push(this.fadeInLocationLed(location, 'red'));
  }

  clearIndicators = () => {
    this.options.locationIds.forEach(this.clearIndication);
  }
}

export default Board;
