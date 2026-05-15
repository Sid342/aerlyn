import { useState } from 'react';
import { HomeProvider } from './context/HomeContext.jsx';
import SiteNav from './features/marketing/SiteNav.jsx';
import Hero from './features/marketing/Hero.jsx';
import WhyAutomate from './features/marketing/WhyAutomate.jsx';
import DayInLife from './features/marketing/DayInLife.jsx';
import HowItWorks from './features/marketing/HowItWorks.jsx';
import ContactCTA from './features/marketing/ContactCTA.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import FloorPlanUpload from './features/houseExplorer/FloorPlanUpload.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import RoomDrawer from './features/houseExplorer/RoomDrawer.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';
import SceneBuilder from './features/sceneBuilder/SceneBuilder.jsx';

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
      <HouseSvg onRoomClick={(id) => setDrawerRoomId(id)} />
      <FloorPlanUpload />
      <ModeToggle />
      <ScenePresets />
      <RoomList />
      <ExportPanel />
      <SceneBuilder />
      {drawerRoomId && (
        <RoomDrawer roomId={drawerRoomId} onClose={() => setDrawerRoomId(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HomeProvider>
      <SiteNav />
      <Hero />
      <WhyAutomate />
      <DayInLife />
      <section id="planner" style={{ padding: '80px 0 40px' }}>
        <AppInner />
      </section>
      <HowItWorks />
      <ContactCTA />
    </HomeProvider>
  );
}
