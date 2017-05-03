import tty from 'tty';
import say from 'say';
import {
  loadStory,
  speak,
  indicateLocation,
  indicateSuccess,
  addCharacter,
  removeCharacter,
  change
} from './game/gameActions';
import gameReducer from './game/gameReducer';
import stories from './stories';
import Board from './board';
import {difference, uniq, omit} from 'lodash';

function isAutomaticAction(action) {
  return [
    speak.toString(),
    indicateLocation.toString(),
    indicateSuccess.toString()
  ].includes(action.type);
}

function advance(currentState) {
  const {story, currentStep} = currentState;
  const requiredAction = story.solution[currentStep];
  const {type} = requiredAction;
  const nextState = gameReducer(currentState, requiredAction);

  console.log('Advancing', requiredAction);

  if (type === speak.toString()) {
    say.speak(requiredAction.payload, 'Daniel', 1.0, () => {
      checkRequiredAction(updateGameState(nextState));
    });
  } else {
    checkRequiredAction(updateGameState(nextState));
  }
}

function getNextAction(state) {
  const {story, currentStep} = state;

  return story.solution[currentStep];
}

function checkRequiredAction(state) {
  const requiredAction = getNextAction(state);

  console.log('IS AUTOMATIC?', isAutomaticAction(requiredAction));
  if (requiredAction && isAutomaticAction(requiredAction)) {
    advance(state);
  }
}

function updateGameState(newGameState) {
  board.clearIndicators();
  gameState = newGameState;
  const {errors, indicators} = gameState;

  if (errors) {
    errors.forEach(({location}) => board.indicateError(location));
  }

  if (indicators) {
    indicators.forEach(({location}) => board.indicateLocation(location))
  }

  return newGameState;
}

const {stdin, stdout} = process;
let gameState = undefined;
const board = new Board({
  characterPins: [8, 9, 10, 11, 12],
  onChange: (boardState) => {
    const nextGameState = gameReducer(gameState, change(boardState));
    checkRequiredAction(updateGameState(nextGameState));
  }
});

stdin.resume();
stdin.setEncoding( 'utf8' );
stdin.setRawMode(true);
stdin.on('data', (key, test) => {
  // On CTRL+C (exit)
  if ( key === '\u0003' ) {
    console.log('Exiting');
    board.stop();
    process.exit();
  }

  // Advance story manually
  if (key === '\r' && gameState && gameState.story) {
    advance(gameState);
  }

  // Load story on number press
  const number = parseInt(key) - 1;
  if (number >= 0) {
    if (number < stories.length) {
      const story = stories[number];
      checkRequiredAction(updateGameState(gameReducer(gameState, loadStory(story))));
      console.log('Loaded story: ' + story.name);
      board.start();
    } else {
      console.log(`Invalid story number. Select one of the stories by pressing: ${[...Array(stories.length).keys().map((_, i) => i + 1)].join()}`);
    }
  }
});
