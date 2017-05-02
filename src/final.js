import tty from 'tty';
import say from 'say';
import {
  loadStory,
  speak,
  indicateLocation,
  indicateSuccess,
  addCharacter,
  removeCharacter,
  addLocation
} from './game/gameActions';
import gameReducer from './game/gameReducer';
import stories from './stories';
import Board from './board';

function updateGameState() {
  const activeCharacters = board.getState();
}

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
    ].includes(requiredAction.type)
  ) {
    return play(gameReducer(currentState, requiredAction));
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

const {stdin, stdout} = process;
let gameState = undefined;
const board = new Board({
  characterPins: [2, 3, 4, 5]
});
const loop = setInterval(updateGameState, 500);

stdin.resume();
stdin.setEncoding( 'utf8' );
stdin.setRawMode(true);
stdin.on('data', (key, test) => {
  // On CTRL+C (exit)
  if ( key === '\u0003' ) {
    console.log('Exiting');
    clearInterval(loop);
    board.stop();
    process.exit();
  }

  // Advance story manually
  if (key === '\r' && gameState && gameState.story) {
    gameState = advance(gameState);
  }

  // Load story on number press
  const number = parseInt(key) - 1;
  if (number >= 0) {
    if (number < stories.length) {
      const story = stories[number];
      gameState = play(gameReducer(gameState, loadStory(story)));
      console.log('Loaded story: ' + story.name);
    } else {
      console.log(`Invalid story number. Select one of the stories by pressing: ${[...Array(stories.length).keys().map((_, i) => i + 1)].join()}`);
    }
  }
});
