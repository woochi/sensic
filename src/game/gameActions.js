import {createAction} from 'redux-actions';

function characterActionPayloadCreator(character, location) {
  return {
    character,
    location
  };
}

export const loadStory = createAction('LOAD_STORY');
export const addLocation = createAction('ADD_LOCATION');
export const removeLocation = createAction('REMOVE_LOCATION');
export const addCharacter = createAction('ADD_CHARACTER', characterActionPayloadCreator);
export const removeCharacter = createAction('REMOVE_CHARACTER', characterActionPayloadCreator);
export const speak = createAction('SPEAK');
export const indicateLocation = createAction('INDICATE_LOCATION');
export const indicateSuccess = createAction('INDICATE_SUCCESS');
