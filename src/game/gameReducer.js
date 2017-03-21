import {handleActions} from 'redux-actions';
import {
  loadStory,
  addLocation,
  removeLocation,
  addCharacter,
  removeCharacter
} from './gameActions';
import {difference, omit, union, without} from 'lodash';

const initialState = {
  currentStep: 0,
  errors: [],
  story: null,
  board: {}
};

const gameBoardReducer = handleActions({
  [addLocation]: (state, action) => {
    return {
      ...state,
      [action.payload]: []
    };
  },

  [removeLocation]: (state, action) => {
    return omit(state, action.payload);
  },

  [addCharacter]: (state, action) => {
    const {character, location} = action.payload;
    const existingCharacters = state[location] || [];

    return {
      ...state,
      [location]: union(state[location], [character])
    }
  },

  [removeCharacter]: (state, action) => {
    const {character, location} = action.payload;
    return {
      ...state,
      [location]: without(state[location], character)
    };
  }
}, {});


function validateBoardState(boardState, story, currentStep) {
  if (!boardState || !story || !currentStep) {
    return [];
  }

  const expectedBoardState = story.solution.slice(0, currentStep + 1)
    .reduce((currentState, action) =>
      gameBoardReducer(currentState, action)
    , {});

  const invalidLocationErrors = difference(Object.keys(boardState), Object.keys(expectedBoardState)).map(location => ({
    location: parseInt(location),
    message: `Invalid location ${location} on board`
  }));

  const invalidCharacterErrors = Object.keys(boardState).reduce((errors, location) => {
    if (!expectedBoardState[location]) {
      return errors;
    }
    const extraCharacters = difference(boardState[location], expectedBoardState[location]);
    return errors.concat(extraCharacters.map(character => ({
      location: parseInt(location),
      message: `Invalid character ${character} at location ${location}`
    })));
  }, []);

  return invalidLocationErrors.concat(invalidCharacterErrors);
}

function gameReducer(state = initialState, action) {
  if (action.type === loadStory.toString()) {
    return {
      ...initialState,
      story: action.payload
    };
  }

  const newBoardState = gameBoardReducer(state.board, action);
  const errors = validateBoardState(newBoardState, state.story, state.currentStep);
  const completed = !!state.story && !errors.length && state.currentStep === state.story.solution.length - 1;

  return {
    ...state,
    currentStep: errors.length ? state.currentStep : state.currentStep + 1,
    completed,
    errors,
    board: newBoardState
  };
};

export default gameReducer;
