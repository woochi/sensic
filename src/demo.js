// First mid-term demo story script

import Board from './board';
import gameReducer from './game/gameReducer';
import {loadStory, addLocation, addCharacter, removeCharacter} from './game/gameActions';
import colors from 'colors';

const story = {
  name: 'Demo story',
  solution: [
    addLocation(10),
    addCharacter(1, 10),
    removeCharacter(1, 10)
  ]
};
const board = new Board({
  characterPins: [2]
});
let gameState = gameReducer(undefined, loadStory(story));

// Build initial game board state;
// we need to add location manually in code since our prototype doesn't support that yet.
gameState = gameReducer(gameState, addLocation(10));

function updateGameState() {
  const isCharacterActive = board.getState();
  const previousGameState = gameState;

  if (isCharacterActive) {
    //console.log('CHARACTER IS ACTIVE');
    gameState = gameReducer(gameState, addCharacter(1, 10));

    if (gameState !== previousGameState) {
      console.log(colors.cyan('ADDED CHARACTER'));
    }
  } else {
    //console.log('CHARACTER IS INACTIVE');
    gameState = gameReducer(gameState, removeCharacter(1, 10));

    if (gameState !== previousGameState) {
      console.log(colors.cyan('REMOVED CHARACTER'));
    }
  }

  //console.log(gameState);

  if (gameState !== previousGameState && gameState.completed) {
    console.log(colors.green('YAY, STORY COMPLETE!'));
  }
}

function exitHandler() {
  board.stop();
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log(error);
  exitHandler();
});

// Initialize
board.start();
setInterval(updateGameState, 500);
