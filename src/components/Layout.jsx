import { NavLink, Outlet } from 'react-router-dom';
import { IconSpin, IconStar, IconRank, IconSettings } from './Icons';

const navItems = [
  { to: '/', label: 'Spin', Icon: IconSpin },
  { to: '/ratings', label: 'Ratings', Icon: IconStar },
  { to: '/rankings', label: 'Rankings', Icon: IconRank },
  { to: '/settings', label: 'Settings', Icon: IconSettings },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1 className="header-title">Movie Night</h1>
        </div>
      </header>

      <div className="app-body">
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="main">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
