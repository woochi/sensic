import tty from 'tty';
import say from 'say';
import {
  loadStory,
  speak,
  indicateLocation,
  indicateSuccess,
  addCharacter,
  removeCharacter
} from './game/gameActions';
import gameReducer from './game/gameReducer';
import stories from './stories';
import Board from './board';
import {difference, uniq} from 'lodash';

function play(currentState) {
  const {story, currentStep} = currentState;
  const requiredAction = story.solution[currentStep];
  const {type, payload} = requiredAction;

  if (type === speak.toString()) {
    say.speak(requiredAction.payload, 'Daniel', 1.0, () => {
      const newState = gameReducer(gameState, requiredAction);
      gameState = play(newState);
    });
  } else if (
    [
      indicateLocation.toString(),
      indicateSuccess.toString()
    ].includes(type)
  ) {
    console.log('ACTION', type);
    updateGameState(play(gameReducer(currentState, requiredAction)));
    console.log('AFTER ACTION', gameState.indicators);
  }

  return currentState;
}

function advance(currentState) {
  const {story, currentStep} = currentState;
  const requiredAction = story.solution[currentStep];

  if (currentState.completed) {
    console.log('Story has been completed!');
    return;
  }

  if (requiredAction.type === speak.toString()) {
    say.speak(requiredAction.payload, 'Daniel', 1.0);
  }

  console.log('Simulating action', requiredAction);

  return gameReducer(currentState, requiredAction);
}

function onBoardChange(nextState) {
  console.log('CHANGE', nextState.errors);
  const currentState = gameState;

  // TODO: Trigger actions for character adds and removes
  const locations = uniq(Object.keys(currentState).concat(Object.keys(nextState)));
  let newGameState = gameState;

  locations.forEach(location => {
    const currentCharacters = currentState[location] || [];
    const nextCharacters = nextState[location] || [];
    const addedCharacters = difference(nextCharacters, currentCharacters);
    const removedCharacters = difference(currentCharacters, nextCharacters);

    if (addedCharacters.length) {
      newGameState = addedCharacters.reduce((state, character) => {
        return gameReducer(state, addCharacter(character, location));
      }, newGameState);
    }

    if (removedCharacters.length) {
      newGameState = removedCharacters.reduce((state, character) => {
        return gameReducer(state, removeCharacter(character, location));
      }, newGameState);
    }
  });

  //console.log('NEXT', newGameState);

  updateGameState(newGameState);
}

function updateGameState(newGameState) {
  board.clearIndicators();
  console.log('CLEARED');
  gameState = newGameState;
  const {errors, indicators} = gameState;

  if (errors) {
    errors.forEach(({location}) => board.indicateError(location));
  }

  if (indicators) {
    indicators.forEach(({location}) => board.indicateLocation(location))
  }

  play(gameState);
}

const {stdin, stdout} = process;
let gameState = undefined;
const board = new Board({
  characterPins: [8, 9, 10, 11, 12],
  onChange: onBoardChange
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
    updateGameState(advance(gameState));
  }

  // Load story on number press
  const number = parseInt(key) - 1;
  if (number >= 0) {
    if (number < stories.length) {
      const story = stories[number];
      gameState = play(gameReducer(gameState, loadStory(story)));
      console.log('Loaded story: ' + story.name);
      board.start();
    } else {
      console.log(`Invalid story number. Select one of the stories by pressing: ${[...Array(stories.length).keys().map((_, i) => i + 1)].join()}`);
    }
  }
});
