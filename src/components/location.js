import React from 'react';
import css from './location.scss';
import {DragSource as dragSource} from 'react-dnd';
import {ItemTypes} from '../enums';

const unitSource = {
  beginDrag(props) {
    return {id: props.id};
  }
};
const dragStateToProps = (connect, monitor) => ({
  connectDragSource: connect.dragSource()
});

class Location extends React.PureComponent {
  render() {
    const {connectDragSource, name, id, error} = this.props;
    const className = error ? css.locationError : css.location;

    return connectDragSource(
      <div className={className}>
        {this.props.onRemove &&
          <a className={css.removeButton} onClick={this.props.onRemove}>X</a>
        }
        <div className={css.name}>{name} ({id})</div>
        <div className={css.characters}>{this.props.children}</div>
      </div>
    );
  }
}

export default dragSource(ItemTypes.Location, unitSource, dragStateToProps)(Location);
