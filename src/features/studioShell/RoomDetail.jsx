import RoomCard from '../houseExplorer/RoomCard.jsx';

export default function RoomDetail({ room }) {
  if (!room) {
    return <div className="room-detail-empty">Select a room from the sidebar.</div>;
  }
  return (
    <div className="room-detail">
      <RoomCard room={room} />
    </div>
  );
}
