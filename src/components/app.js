import React from 'react';
import LocationList from './locationList';
import GameBoard from './gameBoard';
import GameStateViewer from './GameStateViewer';
import css from './app.scss';
import {withState} from 'recompose';
import gameReducer from '../game/gameReducer';
import gameActions from '../game/gameActions';
import {loadStory, addLocation, addCharacter, removeCharacter} from '../game/gameActions';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {compose} from 'recompose';

class App extends React.PureComponent {
  render() {
    const {value} = this.props;

    return (
        <div className={css.app}>
          <div className={css.sidebar}>
            <LocationList/>
          </div>
          <div className={css.content}>
            <div className={css.canvas}>
              <GameBoard
                value={value}
                onDrop={this.onDropLocation}
                onDropCharacter={this.onDropCharacter}
                onChange={this.props.onChange}/>
            </div>
            <div className={css.console}>
              <GameStateViewer value={value}/>
            </div>
          </div>
        </div>
    );
  }

  onDropLocation = (unit) => {
    this.props.onChange(gameReducer(this.props.value, addLocation(unit.id)));
  }

  onDropCharacter = (character, location) => {
    this.props.onChange(gameReducer(this.props.value, addCharacter(character.id, location)));
  }
}

const initialState = gameReducer(undefined, loadStory({
  name: 'Test story',
  solution: [
    addLocation(10),
    addLocation(20),
    addCharacter(1, 10),
    removeCharacter(1, 10),
    addCharacter(2, 10)
  ]
}));
export default compose(
  DragDropContext(HTML5Backend),
  withState('value', 'onChange', initialState)
)(App);
