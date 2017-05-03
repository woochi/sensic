import {handleActions} from 'redux-actions';
import {
  loadStory,
  addCharacter,
  removeCharacter,
  speak,
  indicateLocation,
  indicateSuccess,
  clearIndicators,
  change,
  moveCharacter
} from './gameActions';
import {difference, omit, union, without, intersection} from 'lodash';

const initialState = {
  currentStep: 0,
  errors: [],
  story: null,
  board: {},
  indicators: []
};

const gameBoardReducer = handleActions({
  [addCharacter]: (state, action) => {
    const {characters, location} = action.payload;
    const existingCharacters = state[location] || [];

    // If characters already exist in location
    if (intersection(characters, existingCharacters).length === characters.length) {
      return state;
    }

    return {
      ...state,
      [location]: union(existingCharacters, characters)
    }
  },

  [removeCharacter]: (state, action) => {
    const {characters, location} = action.payload;
    const existingCharacters = state[location] || [];

    // If none of the characters exist in location
    if (!intersection(characters, existingCharacters)) {
      return state;
    }

    const newCharacters = difference(existingCharacters, characters);

    if (!newCharacters.length) {
      return omit(state, location);
    }

    return {
      ...state,
      [location]: newCharacters
    };
  },

  [moveCharacter]: (state, action) => {
    const {characters, from, to} = action.payload;
    const originCharacters = state[from] || [];
    const targetCharacters = state[to] || [];

    if (!intersection(characters, originCharacters).length) {
      return state;
    }

    return {
      ...state,
      [from]: difference(originCharacters, characters),
      [to]: targetCharacters.concat(characters)
    }
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

  console.log('GOT', boardState);
  console.log('EXPECTING', expectedBoardState);

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
  } else if (action.type === speak.toString()) {
    return {
      ...state,
      currentStep: state.currentStep + 1
    };
  }

  let newBoardState;
  if (action.type === change.toString()) {
    newBoardState = action.payload;
  } else {
    newBoardState = gameBoardReducer(state.board, action);
  }

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
