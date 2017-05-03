import {Compass} from 'johnny-five';
import {int16} from 'johnny-five/lib/fn';

const priv = new Map();

export default {
  REGISTER: {
    value: {
      CRA: 0x00,
      CRB: 0x01,
      MODE: 0x02,
      READ: 0x03
    }
  },
  initialize: {
    value: function(opts, dataHandler) {
      //const state = priv.get(this);
      const address = opts.address || 0x1E;
      const READLENGTH = 6;

      //state.scale = 1;

      //Object.assign(state, new Compass.Scale(opts.gauss || 0.88));

      opts.address = address;

      this.io.i2cConfig(opts);

      // Page 18
      // OPERATIONAL EXAMPLES...
      //
      // 1. Write CRA (00) – send 0x3C 0x00 0x70 (8-average, 15 Hz default, normal measurement)
      //
      // Set CRA
      // Page 12
      this.io.i2cWrite(address, this.REGISTER.CRA, 0x70);

      // Set CRB
      // Page 13
      this.io.i2cWrite(address, this.REGISTER.CRB, 0x40);

      // Page 14
      // Measurement: Continuous
      this.io.i2cWrite(address, this.REGISTER.MODE, 0x00);

      this.io.i2cRead(address, this.REGISTER.READ, READLENGTH, function(bytes) {
        dataHandler({
          x: int16(bytes[0], bytes[1]),
          y: int16(bytes[4], bytes[5]),
          z: int16(bytes[2], bytes[3]),
        });
      });
    }
  }
};
