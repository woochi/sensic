const firstPig = 8;
const mother = 9;
const secondPig = 12;
const thirdPig = 11;
const wolf = 10;

const whiteHouse = 0;
const yellowHouse = 1;
const brownHouse = 2;
const redHouse = 3;
const forest = 4;

import {
  speak,
  indicateLocation,
  indicateSuccess,
  clear,
  addCharacter,
  moveCharacter,
} from '../game/gameActions';

export default {
  name: '3 Little Piggies',
  solution: [
    indicateLocation(whiteHouse),
    speak('Once upon a time there was a mother pig that had three little piggies. Mother pig wore white and the three little piggies wore red, blue and yellow. They all lived at mother pig’s white house. Put mother pig and the three little piggies at mother pig’s house.'),
    addCharacter([mother, firstPig, secondPig, thirdPig], whiteHouse),
    //indicateSuccess(whiteHouse),
    indicateLocation(forest),
    speak('Near mother pig’s house there was a green forest. In the green forest lived a wolf. The wolf wore black. Put the wolf in the forest.'),
    addCharacter(wolf, forest),
    //indicateSuccess(forest),
    speak(`Mother pig did not have enough food and told the little piggies: ‘Go out and seek your fortune, but beware the big bad wolf’. The piggies went out in the world.
The first little piggy was wearing yellow. He was lazy and he built his house out of yellow straw. Now the first little piggy lives in the yellow straw house.`),
    indicateLocation(yellowHouse),
    moveCharacter(firstPig, whiteHouse, yellowHouse),
    //indicateSuccess(yellowHouse),
    indicateLocation(brownHouse),
    speak('The second little piggy always wore blue. He was also lazy and he built his house out of brown twigs. Now the second little piggie lives in the brown twig house.'),

    moveCharacter(secondPig, whiteHouse, brownHouse),
    //indicateSuccess(brownHouse),

    speak('The third little piggy was wearing red. He was not lazy and he built his house out of red brick. Now the third little piggy lives in the red brick house.'),
    indicateLocation(redHouse),
    moveCharacter(thirdPig, whiteHouse, redHouse),
    //indicateSuccess(redHouse),
    //indicateLocation(forest),
    indicateLocation(yellowHouse),
    speak('The next day, a wolf passed by and he smelled the little piggies and wanted to eat them. He first went from the forest to the first piggy’s yellow straw house.'),
    moveCharacter(wolf, forest, yellowHouse),
    //indicateSuccess(forest),
    //indicateSuccess(yellowHouse),

    speak(`So he knocked on the door and said:  "Little pig! Little pig! Let me in! Let me in!".
But the little pig saw the wolf's big paws through the keyhole, so he answered back:
 "No! No! No! Not by the hairs on my chinny chin chin!". Then the wolf showed his teeth and said: "Then I'll huff and I'll puff and I'll blow your house down." So he huffed and he puffed and he blew the house down! The wolf opened his jaws very wide and bit down as hard as he could, but the first little pig escaped and ran away to hide with the second little pig. Move the first little piggy to the brown twig house.`),
    indicateLocation(brownHouse),
    moveCharacter(firstPig, yellowHouse, brownHouse),
    //indicateSuccess(brownHouse),
    speak('Then the wolf went to the second little piggy’s house, the brown twig house'),
    indicateLocation(brownHouse),
    moveCharacter(wolf, yellowHouse, brownHouse),
    //indicateSuccess(brownHouse),
    speak(`So he knocked on the door and said:  "Little pig! Little pig! Let me in! Let me in!".
But the little pig saw the wolf's big paws through the keyhole, so he answered back:
 "No! No! No! Not by the hairs on my chinny chin chin!". Then the wolf showed his teeth and said: "Then I'll huff and I'll puff and I'll blow your house down". So he huffed and he puffed and he blew the house down! The wolf opened his jaws very wide and bit down as hard as he could, but the first and second little pigs escaped and ran away to hide with the third little pig.  Move first and second little piggy to the red brick house.`),
    indicateLocation(redHouse),
    moveCharacter([firstPig, secondPig], brownHouse, redHouse),
    //indicateSuccess(brownHouse),
    //indicateSuccess(redHouse),
    //indicateLocation(redHouse),
    speak('Then the wolf went to the third little piggy’s house, the red brick house'),
    moveCharacter(wolf, brownHouse, redHouse),
    //indicateSuccess(brownHouse),
    //indicateSuccess(redHouse),
    speak(`So he knocked on the door and said:  "Little pig! Little pig! Let me in! Let me in!".
But the little pig saw the wolf's big paws through the keyhole, so he answered back:
 "No! No! No! Not by the hairs on my chinny chin chin!". Then the wolf showed his teeth and said: "Then I'll huff and I'll puff and I'll blow your house down". Well! he huffed and he puffed.

He puffed and he huffed. And he huffed, huffed, and he puffed, puffed; but he could not blow the house down. So the little piggies lived happily ever after and the wolf returned to the green forest`),
    indicateLocation(forest),
    moveCharacter(wolf, redHouse, forest),
    //indicateSuccess(redHouse),
    //indicateSuccess(forest),
    speak('The end!')
  ]
};
