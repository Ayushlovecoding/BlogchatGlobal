
import { Header, Footer } from './components';
import { AllRoutes } from './routes/AllRoutes';
import './App.css';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider>
      <div className="App">
        <Header />
        <AllRoutes />
        <Footer />
      </div>
    </SocketProvider>
  );
}

export default App;
