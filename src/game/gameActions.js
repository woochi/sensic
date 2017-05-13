import {createAction} from 'redux-actions';
import {castArray} from 'lodash';

function characterActionPayloadCreator(characters, location) {
  return {
    characters: castArray(characters),
    location
  };
}

function moveActionPayloadCreator(characters, from, to) {
  return {
    characters: castArray(characters),
    from,
    to
  }
}

export const loadStory = createAction('LOAD_STORY');
export const addCharacter = createAction('ADD_CHARACTER', characterActionPayloadCreator);
export const removeCharacter = createAction('REMOVE_CHARACTER', characterActionPayloadCreator);
export const speak = createAction('SPEAK');
export const indicateLocation = createAction('INDICATE_LOCATION');
export const indicateSuccess = createAction('INDICATE_SUCCESS');
export const clearIndicators = createAction('CLEAR_INDICATORS');
export const change = createAction('CHANGE');
export const moveCharacter = createAction('MOVE_CHARACTER', moveActionPayloadCreator);
