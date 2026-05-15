import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
        <HouseSvg />
        <ModeToggle />
        <ScenePresets />
        <RoomList />
        <ExportPanel />
      </div>
    </HomeProvider>
  );
}
