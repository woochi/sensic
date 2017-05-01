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

const {stdin, stdout} = process;
const stories = [
  {
    name: 'Circus',
    solution: [
      speak('There once was a kingdom. In the middle of the kingdom stood a tall castle. In the castle lived the queen of the land.'),
      addLocation(1),
      indicateLocation(1),
      addCharacter(1, 1),
      indicateSuccess(1),
      speak('North of the castle was the village of Norfolk.'),
      indicateLocation(2),
      addLocation(2),
      speak('West of the village lay a road. One day, a travelling circus came along the road.'),
      indicateLocation(3),
      addLocation(3),
      addCharacter(2, 3),
      speak('The circus arrived into the town to perform their tricks.'),
      indicateLocation(2),
      removeCharacter(2, 3),
      addCharacter(2, 2),
      speak('The queen heard of the circus and decided to invite them to perform for her.'),
      indicateLocation(1),
      removeCharacter(2, 2),
      addCharacter(2, 1),
      speak('At the castle, the acrobats wolted, jugglers juggled and magicians casted their spells, but the queen was hard to please. Tired with their tricks the queen told the circus to leave the castle. And so, the circus returned to the road to find new opportunities.'),
      indicateLocation(3),
      removeCharacter(2, 1),
      addCharacter(2, 3),
    ]
  }
];
let gameState = undefined;

function updateGameState() {
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

stdin.resume();
stdin.setEncoding( 'utf8' );
stdin.setRawMode(true);
stdin.on('data', (key, test) => {
  // On CTRL+C (exit)
  if ( key === '\u0003' ) {
    console.log('Exiting');
    process.exit();
  }

  // Advance story manually
  if (key === '\r' && gameState && gameState.story) {
    gameState = advance(gameState);
  }

  // Load story
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

setInterval(updateGameState, 500);
