import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useNotification } from '@/hooks/useNotification';

export default function AppLayout() {
  useNotification();
  
  return (
    <div className="flex h-screen w-full bg-secondary/20 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
