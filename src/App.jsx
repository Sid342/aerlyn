import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
      </div>
    </HomeProvider>
  );
}
