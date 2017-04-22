// Debug script that logs the board state every 500ms

import Board from './board';

const board = new Board();

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

function logBoardState() {
  console.log(board.getState());
}

// Initialize
board.start();
setInterval(logBoardState, 500);
