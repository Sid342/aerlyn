import { useState } from 'react';
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import RoomDrawer from './features/houseExplorer/RoomDrawer.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';

function AppInner() {
  const [drawerRoomId, setDrawerRoomId] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Aerlyn Studio</h1>
        <p>Interactive House Explorer</p>
        <p className="app-intro">
          Build your home room by room, see what automation feels like in Play mode,
          and send the plan straight to Aerlyn — no guesswork.
        </p>
      </header>
      <HomeTypePicker />
      <ModeToggle />
      <ScenePresets />
      <HouseSvg onRoomClick={(id) => setDrawerRoomId(id)} />
      <RoomList />
      <ExportPanel />
      {drawerRoomId && (
        <RoomDrawer roomId={drawerRoomId} onClose={() => setDrawerRoomId(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HomeProvider>
      <AppInner />
    </HomeProvider>
  );
}
