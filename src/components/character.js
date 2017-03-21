import React from 'react';
import css from './character.scss';
import {DragSource as dragSource} from 'react-dnd';
import {ItemTypes} from '../enums';

const unitSource = {
  beginDrag(props) {
    return {id: props.id};
  },
  endDrag(props, monitor) {
    const {onRemove} = props;
    if (monitor.didDrop() && onRemove) {
      onRemove(monitor.getItem());
    }
  }
};
const dragStateToProps = (connect, monitor) => ({
  connectDragSource: connect.dragSource()
});

class Character extends React.PureComponent {
  render() {
    const {connectDragSource, name, id} = this.props;

    return connectDragSource(
      <div className={css.character}>
        <div className={css.name}>{name} ({id})</div>
      </div>
    );
  }
}

export default dragSource(ItemTypes.Character, unitSource, dragStateToProps)(Character);
