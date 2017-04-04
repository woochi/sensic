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
          addLocation(10),
          addLocation(20),
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
        story: this.story
      });
    });

    describe('removing a non-existent location', function() {
      beforeEach(function() {
        this.previousState = this.state;
        this.state = gameReducer(this.state, removeLocation(30));
      });

      it('retains the previous state', function() {
        expect(this.state).to.eql(this.previousState);
      });
    });

    describe('adding location A', function() {
      before(function() {
        this.state = gameReducer(this.state, addLocation(10));
      });

      it('increments current step', function() {
        expect(this.state.currentStep).to.eql(1);
      });

      it('adds the location to the board state with empty character list', function() {
        expect(this.state.board[10]).to.eql([]);
      });

      describe('adding the same location twice', function() {
        before(function() {
          this.previousState = this.state;
          this.state = gameReducer(this.state, addLocation(10));
        });

        it('retains the previous state', function() {
          expect(this.state).to.eql(this.previousState);
        });
      });

      describe('adding incorrect location', function() {
        before(function() {
          this.state = gameReducer(this.state, addLocation(30));
        });

        it('does not increment current step', function() {
          expect(this.state.currentStep).to.equal(1);
        });

        it('reports error for the invalid and missing locations', function() {
          expect(this.state.errors).to.eql([
            {location: 30, message: 'Invalid location 30 on board'},
            {location: 20, message: 'Missing location 20 from board'}
          ]);
        });
      });

      describe('removing location A', function() {
        beforeEach(function() {
          this.state = gameReducer(this.state, removeLocation(10));
        });

        it('removes the location from board', function() {
          expect(this.state.board[10]).to.eql(undefined);
        });

        it('does not increment current step', function() {
          expect(this.state.currentStep).to.eql(1);
        });
      });

      describe('adding location B', function() {
        before(function() {
          this.state = gameReducer(this.state, addLocation(20));
        });

        it('increments current step', function() {
          expect(this.state.currentStep).to.eql(2);
        });

        describe('adding a character to location A', function() {
          before(function() {
            this.state = gameReducer(this.state, addCharacter(1, 10));
          });

          it('increments current step', function() {
            expect(this.state.currentStep).to.eql(3);
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

            it('increments current step', function() {
              expect(this.state.currentStep).to.eql(4);
            });

            describe('removing character from location A again', function() {
              before(function() {
                this.previousState = this.state;
                this.state = gameReducer(this.state, removeCharacter(1, 10));
              });

              it('does not increment the current step again', function() {
                expect(this.state.currentStep).to.eql(4);
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
                expect(this.state.currentStep).to.eql(5);
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

    describe('adding an invalid location', function() {
      before(function() {
        this.state = gameReducer(this.state, addLocation(20));
      });

      it('reports error for the invalid and missing locations', function() {
        expect(this.state.errors).to.eql([
          {location: 20, message: 'Invalid location 20 on board'},
          {location: 10, message: 'Missing location 10 from board'}
        ]);
      });
    });
  });
});
