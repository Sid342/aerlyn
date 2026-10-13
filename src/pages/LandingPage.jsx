import { useState } from 'react';
import { HomeProvider } from '../context/HomeContext.jsx';
import Shell from './Shell.jsx';
import Hero from '../features/marketing/Hero.jsx';
import WhyAutomate from '../features/marketing/WhyAutomate.jsx';
import DayInLife from '../features/marketing/DayInLife.jsx';
import HowItWorks from '../features/marketing/HowItWorks.jsx';
import ContactCTA from '../features/marketing/ContactCTA.jsx';
import HomeTypePicker from '../features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from '../features/houseExplorer/HouseSvg.jsx';
import FloorPlanUpload from '../features/houseExplorer/FloorPlanUpload.jsx';
import ModeToggle from '../features/houseExplorer/ModeToggle.jsx';
import ScenePresets from '../features/houseExplorer/ScenePresets.jsx';
import RoomList from '../features/houseExplorer/RoomList.jsx';
import RoomDrawer from '../features/houseExplorer/RoomDrawer.jsx';
import SceneBuilder from '../features/sceneBuilder/SceneBuilder.jsx';
import TouchPlateDesigner from '../features/touchPlate/TouchPlateDesigner.jsx';
import PlanBar from '../features/savePlan/PlanBar.jsx';

function Planner() {
  const [drawerRoomId, setDrawerRoomId] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h2>Plan your smart home</h2>
        <p className="app-intro">
          Build your home room by room, see what automation feels like in Play mode,
          then save your plan and get a free quote.
        </p>
      </header>
      <HomeTypePicker />
      <HouseSvg onRoomClick={(id) => setDrawerRoomId(id)} />
      <FloorPlanUpload />
      <ModeToggle />
      <ScenePresets />
      <RoomList />
      <SceneBuilder />
      <TouchPlateDesigner />
      {drawerRoomId && (
        <RoomDrawer roomId={drawerRoomId} onClose={() => setDrawerRoomId(null)} />
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <HomeProvider>
      <Shell after={<PlanBar />}>
        <Hero />
        <WhyAutomate />
        <DayInLife />
        <section id="planner" style={{ padding: '80px 0 40px' }}>
          <Planner />
        </section>
        <HowItWorks />
        <ContactCTA />
      </Shell>
    </HomeProvider>
  );
}
