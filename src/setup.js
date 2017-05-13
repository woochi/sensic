import {Board, Magnetometer, Pin, Expander, Led} from 'johnny-five';
import {int16} from 'johnny-five/lib/fn';
import HMC5883L from './board/hmc5883l';

class Multiplexer {
  constructor(options) {
    this.pins = options.pins;
    this.io = options.io;

    this.io.i2cConfig({address: 0x70});
  }

  select(port) {
    this.io.i2cWrite(0x70, [1 << port]);
  }
}

const board = new Board();

board.on('ready', function() {
  /*
  console.log('BOARD READY');

  const pins = [
    new Pin(2),
    new Pin(3),
    new Pin(4),
    new Pin(5),
  ];

  console.log('SETTING PINS TO LOW');
  pins.forEach(pin => pin.low());

  // 0, 1, 2 attached
  const magnetometer = new Magnetometer({
    address: 0x70,
    controller: 'HMC5883L'
  });

  magnetometer.on('data', console.log);

  board.io.i2cConfig({
    address: 0x70
  });

  //board.io.i2cWrite(0x70, [0x00]);
  board.io.i2cRead(0x70, 0x03, 6, function(bytes) {
    console.log('READ', bytes);
    const data = {
      x: int16(bytes[0], bytes[1]),
      y: int16(bytes[4], bytes[5]),
      z: int16(bytes[2], bytes[3])
    };
    console.log(data);
  });

  console.log('SETUP DONE');
  */

  const multiplexer = new Multiplexer({
    io: this.io
  });


  //multiplexer.select(0);

  const magnetometer = new Magnetometer({
    controller: HMC5883L
  });

  function logMagnetometer(heading) {
    console.log('MAGNETOMETER', heading);
  }

  magnetometer.on('data', logMagnetometer);

  //setTimeout(() => {
    multiplexer.select(2);

    const servo = new Expander({
      controller: 'PCA9685'
    });
    const servoBoard = new Board.Virtual(servo);

    /*
    const leds = [0, 1, 2, 3, 4].map(i => {
      const offset = i * 3;
      return new Led.RGB({
        pins: {red: offset, green: offset + 1, blue: offset + 2},
        board: servoBoard
      });
    });
    */

    const character = new Pin(10);

    function loop() {
      character.high();
      setTimeout(() => {
        character.low();
        loop();
      }, 500);
    }

    /*
    leds.forEach(led => {
      led.intensity(0.5);
      led.color('#0000FF');
      led.blink(1000);
    });
    */

    /*
    var led = new Led.RGB({
      pins: {red: 0, green: 1, blue: 2},
      board: servoBoard
    });
    led.color('#00FF00');
    led.blink(1000);
    */
  //}, 3000);

  /*
  const multiplexer = new Expander({
    controller: tca9548a,
    address: 0x70,
    board: board
  });
  const multiplexerBoard = new Board.Virtual(multiplexer);
  */

  /*
  const servo = new Expander({
    controller: 'PCA9685'
  });
  const servoBoard = new Board.Virtual(servo);

  var led = new Led({
    pin: 0,
    board: servoBoard
  });
  led.low();
  */
});
