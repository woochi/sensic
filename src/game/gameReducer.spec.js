import {expect} from 'chai';
import gameReducer from './gameReducer';
import {
  loadStory,
  addLocation,
  removeLocation,
  addCharacter,
  removeCharacter
} from './gameActions';

describe('gameReducer', function() {

  describe('loading a simple story', function() {
    before(function() {
      this.state = undefined;
      this.story = {
        name: 'Moving a character from location A to B',
        solution: [
          addCharacter(1, 10),
          removeCharacter(1, 10),
          addCharacter(1, 20)
        ]
      };
      this.state = gameReducer(this.state, loadStory(this.story));
    });

    it('initializes game state correctly', function() {
      expect(this.state).to.eql({
        currentStep: 0,
        board: {},
        errors: [],
        story: this.story,
        indicators: []
      });
    });

    describe('removing a non-added character', function() {
      beforeEach(function() {
        this.previousState = this.state;
        this.state = gameReducer(this.state, removeCharacter(1, 30));
      });

      it('retains the previous state', function() {
        expect(this.state).to.eql(this.previousState);
      });
    });

    describe('adding a character to location A', function() {
      before(function() {
        this.state = gameReducer(this.state, addCharacter(1, 10));
      });

      it('increments current step', function() {
        expect(this.state.currentStep).to.eql(1);
      });

      describe('adding the same character to the same location twice', function() {
        before(function() {
          this.previousState = this.state;
          this.state = gameReducer(this.state, addCharacter(1, 10));
        });

        it('retains the previous state', function() {
          expect(this.state).to.eql(this.previousState);
        });
      });

      describe('removing the character from location A', function() {
        before(function() {
          this.state = gameReducer(this.state, removeCharacter(1, 10));
        });

        it('removes the empty location from the state', function() {
          expect(this.state.board).to.eql({});
        });

        it('increments current step', function() {
          expect(this.state.currentStep).to.eql(2);
        });

        describe('removing character from location A again', function() {
          before(function() {
            this.previousState = this.state;
            this.state = gameReducer(this.state, removeCharacter(1, 10));
          });

          it('does not increment the current step again', function() {
            expect(this.state.currentStep).to.eql(2);
          });

          it('retains the previous state', function() {
            expect(this.state).to.eql(this.previousState);
          });
        });

        describe('adding the character to location B', function() {
          before(function() {
            this.state = gameReducer(this.state, addCharacter(1, 20));
          });

          it('increments current step', function() {
            expect(this.state.currentStep).to.eql(3);
          });

          it('completes the story without errors', function() {
            expect(this.state.errors).to.eql([]);
            expect(this.state.completed).to.eql(true);
          });
        });
      });
    });

    describe('adding an incorrect character to location A', function() {
      before(function() {
        this.state = gameReducer(this.state, addCharacter(2, 10));
      });

      it('reports error for the invalid location and character', function() {
        expect(this.state.errors).to.eql([
          {location: 10, message: 'Invalid character 2 at location 10'}
        ]);
      });
    });
  });
});
