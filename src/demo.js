import Board from './board';
import gameReducer from './game/gameReducer';
import {loadStory, addLocation, addCharacter, removeCharacter} from './game/gameActions';

const story = {
  name: 'Demo story',
  solution: [
    addLocation(10),
    addCharacter(1, 10),
    removeCharacter(1, 10)
  ]
};
const board = new Board();
let gameState = gameReducer(undefined, loadStory(story));

// Build initial game board state;
// we need to add location manually in code since our prototype doesn't support that yet.
gameState = gameReducer(gameState, addLocation(10));

function updateGameState() {
  const isCharacterActive = board.getState();

  if (isCharacterActive) {
    //console.log('CHARACTER IS ACTIVE');
    gameState = gameReducer(gameState, addCharacter(1, 10));
  } else {
    //console.log('CHARACTER IS INACTIVE');
    gameState = gameReducer(gameState, removeCharacter(1, 10));
  }

  console.log(gameState);
}

function exitHandler() {
  board.stop();
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', exitHandler);


// Initialize
board.start();
setInterval(updateGameState, 500);
