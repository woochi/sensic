import {expect} from 'chai';
import {threePointSecondDerivative} from './differential';

describe('threePointSecondDerivative', function() {
  it('calculates the second derivative for y=x^2', function() {
    expect(threePointSecondDerivative(4, 9, 16, 1)).to.eql(2);
  });

  it('calculates the second derivative for empty data data', function() {
    expect(threePointSecondDerivative(0, 0, 0, 1)).to.eql(0);
  });

  it('calculates the second derivative for descending real points', function() {
    expect(threePointSecondDerivative(308, 308, -4096, 1/50)).to.eql(-11010000);
  });

  it('calculates the second derivative for ascending real points', function() {
    expect(threePointSecondDerivative(-4096, -4096, 418, 1/50)).to.eql(11285000);
  });
});
