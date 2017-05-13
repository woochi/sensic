class Multiplexer {
  constructor(options = {}) {
    this.address = options.address || 0x70;
    this.io = options.io;

    this.io.i2cConfig({address: this.address});
  }

  select(port) {
    this.io.i2cWrite(this.address, [1 << port]);
  }
}

export default Multiplexer;
