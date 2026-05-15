import { HomeProvider } from './context/HomeContext.jsx';
import SiteNav from './features/marketing/SiteNav.jsx';
import Hero from './features/marketing/Hero.jsx';
import WhyAutomate from './features/marketing/WhyAutomate.jsx';
import DayInLife from './features/marketing/DayInLife.jsx';
import HowItWorks from './features/marketing/HowItWorks.jsx';
import ContactCTA from './features/marketing/ContactCTA.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import FloorPlanUpload from './features/houseExplorer/FloorPlanUpload.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';
import RoomWorkspace from './features/studioShell/RoomWorkspace.jsx';

function AppInner() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Aerlyn Studio</h1>
        <p>Plan your home automation room by room.</p>
      </header>
      <HomeTypePicker />
      <FloorPlanUpload />
      <ModeToggle />
      <ScenePresets />
      <RoomWorkspace />
      <ExportPanel />
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
