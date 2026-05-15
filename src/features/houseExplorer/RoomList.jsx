import { useState } from 'react';
import RoomCard from './RoomCard.jsx';
import { useHome } from '../../context/HomeContext.jsx';

const ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bath', 'entrance', 'balcony', 'other'];

export default function RoomList() {
  const { home, dispatch, actions } = useHome();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('other');

  if (!home.homeType) return null;

  function addRoom() {
    const name = newName.trim();
    if (!name) return;
    dispatch(actions.addRoom(name, newType));
    setNewName('');
    setNewType('other');
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>2. Shape the rooms</h3>
      <p style={{ color: 'var(--text-dim)', margin: '4px 0 8px' }}>
        Rename, resize, add or remove rooms to match the real home. Each room is pre-filled
        with the devices it usually needs — adjust freely.
      </p>

      {home.rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}

      {home.mode === 'build' && (
        <div className="card room-card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="room-name-input"
            placeholder="New room name (e.g. Pooja Room)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRoom()}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: 8,
              padding: '0 10px',
            }}
          >
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="button" className="htp-btn" onClick={addRoom}>
            Add room
          </button>
        </div>
      )}
    </div>
  );
}
