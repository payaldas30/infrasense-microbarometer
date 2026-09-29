import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SensorProvider } from './context/SensorContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SettingsDrawer } from './components/common/SettingsDrawer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SignalLabPage } from './pages/SignalLabPage';
import { ValidationPage } from './pages/ValidationPage';
import { HardwarePage } from './pages/HardwarePage';
import { ResearchPage } from './pages/ResearchPage';
import { SIHPage } from './pages/SIHPage';
import { AboutPage } from './pages/AboutPage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ROUTES: Record<string, React.FC<any>> = {
  '/': HomePage,
  '/dashboard': DashboardPage,
  '/architecture': ArchitecturePage,
  '/signal-lab': SignalLabPage,
  '/validation': ValidationPage,
  '/hardware': HardwarePage,
  '/research': ResearchPage,
  '/sih26144': SIHPage,
  '/about': AboutPage,
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = React.useState<string>(
    ROUTES[window.location.pathname] ? window.location.pathname : '/'
  );
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PageComponent = ROUTES[currentPath] || HomePage;

  return (
    <ThemeProvider>
      <SensorProvider>
        <div className="min-h-screen bg-base text-t1 flex flex-col transition-colors duration-200">
          <Navbar
            currentPath={currentPath}
            navigate={navigate}
            openSettings={() => setSettingsOpen(true)}
          />

          <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

          <main className="flex-1 pt-20">
            {/* Thin gradient accent stripe */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

            {currentPath === '/' ? (
              <HomePage navigate={navigate} />
            ) : (
              <PageComponent navigate={navigate} />
            )}
          </main>

          <Footer navigate={navigate} />
        </div>
      </SensorProvider>
    </ThemeProvider>
  );
};

export default App;
