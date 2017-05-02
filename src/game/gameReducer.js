import {handleActions} from 'redux-actions';
import {
  loadStory,
  addLocation,
  removeLocation,
  addCharacter,
  removeCharacter,
  speak,
  indicateLocation,
  indicateSuccess
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
    const {payload: location} = action;

    if (state[location]) {
      return state;
    }

    return {
      ...state,
      [location]: []
    };
  },

  [removeLocation]: (state, action) => {
    const {payload: location} = action;

    if (!state[location]) {
      return state;
    }

    return omit(state, location);
  },

  [addCharacter]: (state, action) => {
    const {character, location} = action.payload;
    const existingCharacters = state[location] || [];

    if (!state[location] || existingCharacters.includes(character)) {
      return state;
    }

    return {
      ...state,
      [location]: union(state[location], [character])
    }
  },

  [removeCharacter]: (state, action) => {
    const {character, location} = action.payload;

    if (!state[location] || !state[location].includes(character)) {
      return state;
    }

    return {
      ...state,
      [location]: without(state[location], character)
    };
  },

  [speak]: (state, action) => {
    return {...state};
  },

  [indicateLocation]: (state, action) => {
    return {...state};
  },

  [indicateSuccess]: (state, action) => {
    return {...state};
  }
}, {});


function validateBoardState(boardState, story, currentStep) {
  if (!boardState || !story) {
    return [];
  }

  const expectedBoardState = story.solution.slice(0, currentStep + 1)
    .reduce((currentState, action) =>
      gameBoardReducer(currentState, action)
    , {});

  const expectedLocations = Object.keys(expectedBoardState);
  const currentLocations = Object.keys(boardState);
  const invalidLocationErrors = difference(currentLocations, expectedLocations).map(location => ({
    location: parseInt(location),
    message: `Invalid location ${location} on board`
  }));
  const missingLocationErrors = difference(expectedLocations, currentLocations).map(location => ({
    location: parseInt(location),
    message: `Missing location ${location} from board`
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

  return invalidLocationErrors
    .concat(missingLocationErrors)
    .concat(invalidCharacterErrors);
}

function gameReducer(state = initialState, action) {
  if (state.completed) {
    return state;
  }

  if (action.type === loadStory.toString()) {
    return {
      ...initialState,
      story: action.payload
    };
  }

  const newBoardState = gameBoardReducer(state.board, action);

  if (newBoardState === state.board) {
    return state;
  }

  const errors = validateBoardState(newBoardState, state.story, state.currentStep);
  const completed = !!state.story && !errors.length && state.currentStep === state.story.solution.length - 1;
  const currentStep = (errors.length || state.board === newBoardState) ? state.currentStep : state.currentStep + 1;

  return {
    ...state,
    currentStep,
    completed,
    errors,
    board: newBoardState
  };
};

export default gameReducer;
