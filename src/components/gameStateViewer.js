import React from 'react';
import css from './gameStateViewer.scss';

class GameStateViewer extends React.PureComponent {
  render() {
    console.log(this.props.value);
    return (
      <div className={css.gameStateViewer}>
        <pre>{JSON.stringify(this.props.value, null, 2)}</pre>
      </div>
    );
  }
}

export default GameStateViewer;
