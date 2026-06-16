import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary/20 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
              isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-1 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/20" : ""
                )}>
                  <link.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
