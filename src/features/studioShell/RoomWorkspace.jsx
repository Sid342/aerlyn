import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import RoomSidebar from './RoomSidebar.jsx';
import RoomDetail from './RoomDetail.jsx';
import './RoomWorkspace.css';

export default function RoomWorkspace() {
  const { home } = useHome();
  const [activeRoomId, setActiveRoomId] = useState(null);

  if (!home.homeType) return null;

  const activeRoom =
    home.rooms.find((r) => r.id === activeRoomId) ?? home.rooms[0] ?? null;

  return (
    <div className="room-workspace">
      <RoomSidebar
        activeRoomId={activeRoom?.id ?? null}
        onSelect={setActiveRoomId}
      />
      <RoomDetail room={activeRoom} />
    </div>
  );
}
