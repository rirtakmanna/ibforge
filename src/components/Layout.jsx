// src/components/Layout.jsx
//
// Global shell rendered on every protected route via <Outlet />.
// Three nav layouts (no hamburger at any breakpoint):
//   ≥1024px → horizontal top nav with 4 text links + avatar slot
//   768–1023px → horizontal top nav with 4 icon links + avatar icon slot
//   <768px → top bar (avatar slot left, ATLAS logo right) + bottom dock (4 icon links)
//
// Phase 1 scope: structure + active state + responsive layout.
// AvatarMenu component, Framer Motion page transitions, and full icon set
// land in Phase 2A. The slots are present now so the layout doesn't shift
// when components fill them.

import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "D" },
  { to: "/roadmap", label: "Roadmap", icon: "R" },
  { to: "/portfolio", label: "Portfolio", icon: "P" },
  { to: "/calendar", label: "Calendar", icon: "C" },
];

function Layout() {
  return (
    <div className="layout">
      {/* Desktop + Tablet top bar */}
      <header className="layout-top" role="banner">
        <div className="layout-top-inner">
          <div className="layout-brand" aria-label="ATLAS">
            <span className="layout-brand-mark" aria-hidden="true">
              ▲
            </span>
            <span className="layout-brand-word">ATLAS</span>
          </div>

          <nav className="layout-nav layout-nav-desktop" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `layout-nav-link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <nav className="layout-nav layout-nav-tablet" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `layout-nav-icon${isActive ? " is-active" : ""}`
                }
                aria-label={item.label}
                title={item.label}
              >
                <span aria-hidden="true">{item.icon}</span>
              </NavLink>
            ))}
          </nav>

          <div className="layout-avatar-slot" aria-hidden="true">
            {/* AvatarMenu component lands in Phase 2A / Phase 3 */}
          </div>
        </div>
      </header>

      {/* Mobile top bar (avatar left, ATLAS icon right) */}
      <header className="layout-mobile-top" role="banner" aria-label="ATLAS">
        <div className="layout-mobile-avatar-slot" aria-hidden="true">
          {/* AvatarMenu icon lands in Phase 2A / Phase 3 */}
        </div>
        <span className="layout-mobile-brand" aria-hidden="true">
          ▲
        </span>
      </header>

      <main className="layout-main" role="main">
        <Outlet />
      </main>

      {/* Mobile bottom dock */}
      <nav className="layout-bottom-dock" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `layout-dock-link${isActive ? " is-active" : ""}`
            }
            aria-label={item.label}
          >
            <span aria-hidden="true">{item.icon}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
