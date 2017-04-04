import {int16} from 'johnny-five/lib/fn';

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
      const address = opts.address || 0x1E;
      const READLENGTH = 6;
      opts.address = address;

      this.io.i2cConfig(opts);

      this.io.i2cWrite(address, this.REGISTER.CRA, 0x0C);
      this.io.i2cWrite(address, this.REGISTER.CRB, 0x20);
      this.io.i2cWrite(address, this.REGISTER.MODE, 0x00);

      this.io.i2cRead(address, this.REGISTER.READ, READLENGTH, function(bytes) {
        dataHandler({
          x: int16(bytes[0], bytes[1]),
          y: int16(bytes[4], bytes[5]),
          z: int16(bytes[2], bytes[3])
        })
      });
    }
  }
};
