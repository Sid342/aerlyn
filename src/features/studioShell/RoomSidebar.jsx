import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { computeRoomPoints } from '../../lib/switchPlanner.js';

const ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bath', 'entrance', 'balcony', 'other'];

function isRoomComplete(room) {
  return room.devices.length > 0 && computeRoomPoints(room).total > 0;
}

export { isRoomComplete };

export default function RoomSidebar({ activeRoomId, onSelect }) {
  const { home, dispatch, actions } = useHome();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('other');

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    dispatch(actions.addRoom(name, newType));
    setNewName('');
    setNewType('other');
    setAdding(false);
  }

  return (
    <aside className="room-sidebar">
      {home.floorPlanImage && (
        <img className="sidebar-fp" src={home.floorPlanImage} alt="Floor plan" />
      )}
      <ul className="sidebar-rooms">
        {home.rooms.map((room) => (
          <li
            key={room.id}
            className={`sidebar-room${room.id === activeRoomId ? ' active' : ''}`}
            onClick={() => onSelect(room.id)}
          >
            <span className="sidebar-room-name">{room.name}</span>
            {isRoomComplete(room) && <span className="sidebar-badge">✓</span>}
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="sidebar-add-form">
          <input
            autoFocus
            className="sidebar-add-input"
            placeholder="Room name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="sidebar-add-type"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="sidebar-add-actions">
            <button type="button" onClick={handleAdd}>Add</button>
            <button type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="sidebar-add-btn" onClick={() => setAdding(true)}>
          + Add Room
        </button>
      )}
    </aside>
  );
}
