import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Timer from './pages/Timer';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';

type Page = 'dashboard' | 'subjects' | 'timer' | 'analytics' | 'goals';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'subjects':
        return <Subjects />;
      case 'timer':
        return <Timer />;
      case 'analytics':
        return <Analytics />;
      case 'goals':
        return <Goals />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-accent/5">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 container py-6 md:py-8">
          {renderPage()}
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
