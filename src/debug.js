// Debug script that logs the board state every 500ms

import Board from './board';
import onDeath from 'death';

onDeath(function() {
  console.log('EXIT HANDLER');
  board.stop();
});

const board = new Board({
  characterPins: [2, 3]
});

function logBoardState() {
  console.log(board.getState());
}

// Initialize
board.start();
setInterval(logBoardState, 500);
