import React from 'react';
import Location from './location';
import Character from './character';
import css from './locationList.scss';

const locations = [
  {id: 10, name: 'Forest'},
  {id: 20, name: 'House'}
];

const characters = [
  {id: 1, name: 'Alice'}
];

class LocationList extends React.PureComponent {
  render() {
    return (
      <div>
        <ul className={css.list}>
          {locations.map(location =>
            <li key={location.id} className={css.item}>
              <Location id={location.id} name={location.name}/>
            </li>
          )}
        </ul>
        <ul className={css.list}>
          {characters.map(character =>
            <li key={character.id} className={css.item}>
              <Character id={character.id} name={character.name}/>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default LocationList;
