import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary/10 p-4 border-r border-primary/20 shadow-soft">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-12 h-12 bg-primary rounded-3xl flex items-center justify-center text-primary-foreground shadow-soft">
          <Calendar className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-primary">TutorApp</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground font-medium shadow-soft" 
                : "text-foreground hover:bg-primary/20"
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
