import { useState } from 'react';
import Shell from './Shell.jsx';
import Hero from '../features/marketing/Hero.jsx';
import WhatItDoes from '../features/marketing/WhatItDoes.jsx';
import HowItWorks from '../features/marketing/HowItWorks.jsx';
import Proof from '../features/marketing/Proof.jsx';
import Faq from '../features/marketing/Faq.jsx';
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
import PlanNotice from '../features/savePlan/PlanNotice.jsx';

function Planner() {
  const [drawerRoomId, setDrawerRoomId] = useState(null);

  return (
    <section id="planner" className="section">
      <h2 className="section-title">What's your home?</h2>
      <HomeTypePicker />
      <PlanNotice />
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
    </section>
  );
}

export default function LandingPage() {
  return (
    <Shell>
      <Hero />
      <Planner />
      <WhatItDoes />
      <HowItWorks />
      <Proof />
      <Faq />
      <ContactCTA />
    </Shell>
  );
}
