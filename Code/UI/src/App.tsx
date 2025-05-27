// eslint-disable-next-line
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import RoutesComponent from './Routes/RoutesComponent';
import { NavigationGuardProvider } from './Components/Navbar/NavigationGuardContext';


function App() {
  return (
    <div className="App" style={{ fontFamily: "'Inter', sans-serif" }}>
      <BrowserRouter>
      <NavigationGuardProvider>
        <RoutesComponent />
      </NavigationGuardProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
