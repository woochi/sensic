import {expect} from 'chai';
import gameReducer from './gameReducer';

describe('gameReducer', function() {

  it('has an initial state', function() {
    expect(gameReducer()).to.eql({});
  });

});
