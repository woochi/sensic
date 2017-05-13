import {
  speak,
  indicateLocation,
  indicateSuccess,
  addCharacter,
  removeCharacter,
} from '../game/gameActions';

export default {
  name: 'Little Red Riding Hood',
  solution: [
    speak('Once upon a time, there was a little girl who lived in a village.  Whenever she went out, the little girl wore a red riding cloak, so everyone in the village called her Little Red Riding Hood. Little Red Riding Hood lived with her mother in her mother’s white house. Mother always wore white. Put Little Red Riding Hood and her mother at mother’s house.'),
    indicateLocation(1),
    addCharacter(1, 1),
    addCharacter(4, 1),
    indicateSuccess(1),
    speak(`One morning, Little Red Riding Hood asked her mother if she could go to visit her grandmother as it had been awhile since they'd seen each other. "That's a good idea," her mother said.  So they packed a nice basket for Little Red Riding Hood to take to her grandmother. When the basket was ready, the little girl put on her red cloak and kissed her mother goodbye.
"Remember, go straight to Grandma's house," her mother cautioned.  "Don't dawdle along the way and please don't talk to strangers!  The woods are dangerous."
"Don't worry, mommy," said Little Red Riding Hood, "I'll be careful."

Grandma lived in a red house and always wore yellow clothes. `),
    indicateLocation(4),
    addCharacter(2, 4),
    indicateSuccess(4),
    speak('On her way to grandma’s house, Little Red Riding Hood reached a field full of yellow flowers. '),
    indicateLocation(1),
    removeCharacter(4, 1),
    indicateSuccess(1),
    indicateLocation(2),
    addCharacter(4, 2),
    indicateSuccess(2),
    speak(`She forgot her promise to her mother.  She picked a few, watched the butterflies flit about for awhile, listened to the frogs croaking and then picked a few more.
Little Red Riding Hood was enjoying the warm summer day so much, that she didn't notice a dark shadow approaching out of the forest behind her...
Suddenly, the black wolf appeared beside her. The wolf was now in the field of yellow flowers with Little Red Riding Hood.`),
    indicateLocation(2),
    addCharacter(5, 2),
    indicateSuccess(2),
    speak(`"What are you doing out here, little girl?" the wolf asked in a voice as friendly as he could muster. "I'm on my way to see my Grandma who lives through the forest, near the brook,"  Little Red Riding Hood replied. Then she continued picking up some flowers.

While Little Red Riding Hood was picking up flowers, the wolf rushed to grandma’s house.
`),
    indicateLocation(2),
    removeCharacter(5, 2),
    indicateSuccess(2),
    indicateLocation(4),
    addCharacter(5, 4),
    indicateSuccess(4),
    speak(`The wolf, a little out of breath from running, arrived at Grandma's and knocked lightly at the door.
"Oh thank goodness dear!  Come in, come in!  I was worried sick that something had happened to you in the forest," said Grandma thinking that the knock was her granddaughter.
The wolf let himself in.  Poor Granny did not have time to say another word, before the wolf picked her up and locked her in the brown shed! Poor grandma was now all alone in the shed and the wolf remained in the house.`),
    indicateLocation(4),
    removeCharacter(2, 4),
    indicateSuccess(4),
    indicateLocation(3),
    addCharacter(2, 3),
    indicateSuccess(3),
    speak(`The wolf then poked through Granny's wardrobe to find a nightgown that he liked.  He added a frilly sleeping cap, and for good measure, dabbed some of Granny's perfume behind his pointy ears.
A few minutes later, Red Riding Hood arrived at grandma’s house and knocked on the door.`),
    indicateLocation(2),
    removeCharacter(4, 2),
    indicateSuccess(2),
    indicateLocation(4),
    addCharacter(4, 4),
    indicateSuccess(4),
    speak(`The wolf jumped into bed and pulled the covers over his nose.  "Who is it?" he called in a cackly voice.
"It's me, Little Red Riding Hood."
"Oh how lovely!  Do come in, my dear," croaked the wolf.
When Little Red Riding Hood entered the little cottage, she could scarcely recognize her Grandmother.
"Grandmother!  Your voice sounds so odd.  Is something the matter?" she asked.
"Oh, I just have touch of a cold," squeaked the wolf adding a cough at the end to prove the point.
"But Grandmother!  What big ears you have," said Little Red Riding Hood as she edged closer to the bed.
"The better to hear you with, my dear," replied the wolf.
"But Grandmother!  What big eyes you have," said Little Red Riding Hood.
"The better to see you with, my dear," replied the wolf.
"But Grandmother!  What big teeth you have," said Little Red Riding Hood her voice quivering slightly.
"The better to eat you with, my dear," roared the wolf and he leapt out of the bed and began to chase the little girl.
Almost too late, Little Red Riding Hood realized that the person in the bed was not her Grandmother, but a hungry wolf.
She ran across the room and through the door, shouting, "Help!  Wolf!" as loudly as she could.

A woodsman dressed in blue was chopping logs nearby. He heard her cry and ran to grandma’s house as fast as he could.`),
    indicateLocation(4),
    addCharacter(3, 4),
    indicateSuccess(4),
    speak(`He grabbed the wolf and carried him deep into the green forest where he wouldn't bother people any longer.`),
    indicateLocation(4),
    removeCharacter(3, 4),
    indicateLocation(5),
    addCharacter(3, 5),
    indicateLocation(4),
    removeCharacter(5, 4),
    indicateLocation(5),
    addCharacter(5, 5),
    indicateSuccess(4),
    indicateSuccess(5),
    speak(`Little Red Riding Hood released poor Grandmother who was a bit frazzled by the whole experience, but still in one piece. They both stayed at Grandma’s house.`),
    indicateLocation(3),
    removeCharacter(2, 3),
    indicateLocation(4),
    addCharacter(2, 4),
    indicateSuccess(3),
    indicateSuccess(4),
    speak(`"Oh Grandma, I was so scared!"  sobbed Little Red Riding Hood, "I'll never speak to strangers or dawdle in the forest again."
"There, there, child.  You've learned an important lesson.  Thank goodness you shouted loud enough for this kind woodsman to hear you!"
Little Red Riding Hood and her Grandmother had a nice lunch at Grandma’s house and a long chat.
`),
  ]
};
