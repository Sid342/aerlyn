import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import FloorPlanUpload from './features/houseExplorer/FloorPlanUpload.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';
import SceneBuilder from './features/sceneBuilder/SceneBuilder.jsx';

export default function App() {
  return (
    <HomeProvider>
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
        <HouseSvg />
        <FloorPlanUpload />
        <ModeToggle />
        <ScenePresets />
        <RoomList />
        <ExportPanel />
        <SceneBuilder />
      </div>
    </HomeProvider>
  );
}
