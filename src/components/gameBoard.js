import React from 'react';
import {DropTarget as dropTarget} from 'react-dnd';
import {ItemTypes} from '../enums';
import css from './gameBoard.scss';
import Location from './location';
import Character from './Character';
import gameReducer from '../game/gameReducer';
import {loadStory, addLocation, removeLocation, addCharacter, removeCharacter} from '../game/gameActions';

const dropSpec = {
  drop(props, monitor, component) {
    return props.onDrop(monitor.getItem());
  }
};
const dropStateToProps = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
});

const locationDropSpec = {
  drop(props, monitor) {
    props.onDropCharacter(monitor.getItem(), props.id);
  }
};
const DroppableLocation = dropTarget(ItemTypes.Character, locationDropSpec, dropStateToProps)(
  ({connectDropTarget, onDropCharacter, ...props}) => connectDropTarget(<div><Location {...props}/></div>)
);

class GameBoard extends React.PureComponent {
  render() {
    const {connectDropTarget, value} = this.props;
    const {board} = value;

    return connectDropTarget(
      <div className={css.board}>
        {Object.keys(board).map(location =>
          <DroppableLocation
            key={location}
            id={location}
            onDropCharacter={this.onDropCharacter}
            error={value.errors.find(error => {
              return error.location === parseInt(location)
            })}
            onRemove={() => this.onRemoveLocation(location)}>
            {board[location].map(character =>
              <Character
                key={character}
                id={character}
                onRemove={() => this.onRemoveCharacter(character, location)}/>
            )}
          </DroppableLocation>
        )}
      </div>
    );
  }

  onDropCharacter = (character, location) => {
    this.props.onDropCharacter(character, location);
  }

  onRemoveCharacter = (character, location) => {
    this.props.onChange(gameReducer(this.props.value, removeCharacter(character, location)));
  }

  onRemoveLocation = (location) => {
    this.props.onChange(gameReducer(this.props.value, removeLocation(location)));
  }
}

export default dropTarget(ItemTypes.Location, dropSpec, dropStateToProps)(GameBoard);
