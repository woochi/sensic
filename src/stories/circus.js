import {
  speak,
  indicateLocation,
  indicateSuccess,
  addCharacter,
  removeCharacter,
  addLocation
} from './game/gameActions';

export default {
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
};
