import {handleActions} from 'redux-actions';
import {
  loadStory,
  addCharacter,
  removeCharacter,
  speak,
  indicateLocation,
  indicateSuccess,
  clearIndicators
} from './gameActions';
import {difference, omit, union, without} from 'lodash';

const initialState = {
  currentStep: 0,
  errors: [],
  story: null,
  board: {},
  indicators: []
};

const gameBoardReducer = handleActions({
  [addCharacter]: (state, action) => {
    const {character, location} = action.payload;
    const existingCharacters = state[location] || [];

    if (existingCharacters.includes(character)) {
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

    const newCharacters = without(state[location], character);

    if (!newCharacters.length) {
      return omit(state, location);
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

  console.log('VALIDATE STEP', currentStep + 1);
  const expectedBoardState = story.solution.slice(0, currentStep + 1)
    .reduce((currentState, action) =>
      gameBoardReducer(currentState, action)
    , {});

  console.log('EXPECTING', expectedBoardState);

  const invalidCharacterErrors = Object.keys(boardState).reduce((errors, location) => {
    if (!expectedBoardState[location]) {
      return errors;
    }

    console.log(boardState, expectedBoardState);
    const extraCharacters = difference(boardState[location], expectedBoardState[location]);
    return errors.concat(extraCharacters.map(character => ({
      location: parseInt(location),
      message: `Invalid character ${character} at location ${location}`
    })));
  }, []);

  console.log(invalidCharacterErrors);
  return invalidCharacterErrors;
}

const indicatorReducer = handleActions({
  [indicateLocation]: (state, action) => {
    return [{
      location: action.payload,
      color: 'blue'
    }];
  },

  [indicateSuccess]: (state, action) => {
    return [{
      location: action.payload,
      color: 'green'
    }];
  },

  [clearIndicators]: (state, action) => {
    return [];
  }
}, []);

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
    indicators: indicatorReducer(state.indicators, action),
    board: newBoardState
  };
};

export default gameReducer;
