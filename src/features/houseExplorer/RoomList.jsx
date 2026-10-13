import { useState } from 'react';
import RoomCard from './RoomCard.jsx';
import SceneBuilder from '../sceneBuilder/SceneBuilder.jsx';
import { useHome } from '../../context/HomeContext.jsx';
import './RoomCard.css';

const ROOM_TYPES = [
  ['living', 'Living room'], ['bedroom', 'Bedroom'], ['kitchen', 'Kitchen'], ['bath', 'Bathroom'],
  ['entrance', 'Entrance'], ['balcony', 'Balcony'], ['other', 'Other'],
];

// The detailed editor behind "Customise": open a room to change what is in it.
export default function RoomList() {
  const { home, dispatch, actions } = useHome();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('other');

  function addRoom(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    dispatch(actions.addRoom(name, newType));
    setNewName('');
    setNewType('other');
  }

  return (
    <div className="editor">
      <p className="plan-hint">Open a room to change what goes in it.</p>
      {home.rooms.map((room, i) => <RoomCard key={room.id} room={room} index={i} />)}

      <form className="add-room" onSubmit={addRoom}>
        <label className="lead-field">
          Add a room
          <input className="lead-input" placeholder="Room name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </label>
        <select className="lead-input" value={newType} onChange={(e) => setNewType(e.target.value)} aria-label="Kind of room">
          {ROOM_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="submit" className="btn quiet">Add room</button>
      </form>

      <details className="room-card">
        <summary><span className="room-card-name">Your own scenes</span></summary>
        <div className="room-card-body"><SceneBuilder /></div>
      </details>
    </div>
  );
}
