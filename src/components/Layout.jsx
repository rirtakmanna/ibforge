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
import { LayoutGrid, ListChecks, FolderOpen, Calendar } from "lucide-react";
import AvatarMenu from "@/components/AvatarMenu";
import "./Layout.css";

// Lucide icon assignments (Brand System §Tablet Navigation):
//   Dashboard → LayoutGrid  (grid/squares)
//   Roadmap   → ListChecks  (list/steps)
//   Portfolio → FolderOpen  (folder)
//   Calendar  → Calendar    (calendar)
// Locked once — do not swap icon styles mid-project.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", Icon: LayoutGrid },
  { to: "/roadmap", label: "Roadmap", Icon: ListChecks },
  { to: "/portfolio", label: "Portfolio", Icon: FolderOpen },
  { to: "/calendar", label: "Calendar", Icon: Calendar },
];

function Layout() {
  return (
    <div className="layout">
      {/* Desktop + Tablet top bar */}
      <header className="layout-top" role="banner">
        <div className="layout-top-inner">
          <NavLink to="/" end className="layout-brand" aria-label="ATLAS — Dashboard">
            <span className="layout-brand-mark" aria-hidden="true">
              <svg
                className="layout-logo-static"
                width="28"
                height="28"
                viewBox="0 0 362 362"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="6"
                  y="6"
                  width="350"
                  height="350"
                  stroke="var(--color-electric-blue)"
                  strokeWidth="16"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M208.215 178.807C208.215 179.371 207.898 179.888 207.396 180.144L106.681 231.438C106.216 231.675 105.661 231.654 105.216 231.381C104.771 231.108 104.5 230.624 104.5 230.103V210.085C104.5 209.509 104.83 208.984 105.349 208.733L180.449 172.551L105.349 136.369C104.83 136.119 104.5 135.594 104.5 135.018V115C104.5 114.478 104.771 113.993 105.216 113.721C105.661 113.448 106.216 113.426 106.681 113.663L207.396 164.959C207.898 165.215 208.215 165.732 208.215 166.296V178.807Z"
                  fill="var(--color-electric-blue)"
                  stroke="var(--color-electric-blue)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M256 228.502C256.552 228.502 257 228.95 257 229.502V246.705C257 247.257 256.552 247.705 256 247.705H155.911C155.359 247.705 154.911 247.257 154.911 246.705V229.502C154.911 228.95 155.359 228.502 155.911 228.502H256Z"
                  fill="var(--color-electric-blue)"
                  stroke="var(--color-electric-blue)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                className="layout-logo-rotor"
                width="28"
                height="28"
                viewBox="0 0 362 362"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="29.5"
                  y1="36.5"
                  x2="332.5"
                  y2="36.5"
                  stroke="var(--color-electric-blue)"
                  strokeWidth="17"
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 181 181"
                    to="360 181 181"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </line>
              </svg>
            </span>
            <span className="layout-brand-word">ATLAS</span>
          </NavLink>

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
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `layout-nav-icon${isActive ? " is-active" : ""}`
                }
                aria-label={label}
                title={label}
              >
                <Icon className="layout-nav-icon-svg" aria-hidden="true" />
              </NavLink>
            ))}
          </nav>

          <div className="layout-avatar-slot">
            <AvatarMenu variant="desktop" />
          </div>
          <div className="layout-avatar-slot layout-avatar-slot--tablet">
            <AvatarMenu variant="icon" />
          </div>
        </div>
      </header>

      {/* Mobile top bar — DESIGN DECISION (Phase 2A): ATLAS logo left, Avatar right.
         Overrides Brand System §Mobile Navigation (which specifies avatar-left).
         Reason: operator preference; dropdown anchored right to prevent overflow. */}
      <header className="layout-mobile-top" role="banner" aria-label="ATLAS">
        <NavLink to="/" end className="layout-mobile-brand" aria-label="ATLAS — Dashboard">
          <svg
            className="layout-logo-static"
            width="32"
            height="32"
            viewBox="0 0 362 362"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="6"
              y="6"
              width="350"
              height="350"
              stroke="var(--color-electric-blue)"
              strokeWidth="16"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M208.215 178.807C208.215 179.371 207.898 179.888 207.396 180.144L106.681 231.438C106.216 231.675 105.661 231.654 105.216 231.381C104.771 231.108 104.5 230.624 104.5 230.103V210.085C104.5 209.509 104.83 208.984 105.349 208.733L180.449 172.551L105.349 136.369C104.83 136.119 104.5 135.594 104.5 135.018V115C104.5 114.478 104.771 113.993 105.216 113.721C105.661 113.448 106.216 113.426 106.681 113.663L207.396 164.959C207.898 165.215 208.215 165.732 208.215 166.296V178.807Z"
              fill="var(--color-electric-blue)"
              stroke="var(--color-electric-blue)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M256 228.502C256.552 228.502 257 228.95 257 229.502V246.705C257 247.257 256.552 247.705 256 247.705H155.911C155.359 247.705 154.911 247.257 154.911 246.705V229.502C154.911 228.95 155.359 228.502 155.911 228.502H256Z"
              fill="var(--color-electric-blue)"
              stroke="var(--color-electric-blue)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className="layout-logo-rotor"
            width="32"
            height="32"
            viewBox="0 0 362 362"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <line
              x1="29.5"
              y1="36.5"
              x2="332.5"
              y2="36.5"
              stroke="var(--color-electric-blue)"
              strokeWidth="17"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 181 181"
                to="360 181 181"
                dur="4s"
                repeatCount="indefinite"
              />
            </line>
          </svg>
        </NavLink>
        <div className="layout-mobile-avatar-slot">
          <AvatarMenu variant="icon" />
        </div>
      </header>

      <main className="layout-main" role="main">
        <Outlet />
      </main>

      {/* Mobile bottom dock */}
      <nav className="layout-bottom-dock" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `layout-dock-link${isActive ? " is-active" : ""}`
            }
            aria-label={label}
          >
            <Icon className="layout-dock-icon-svg" aria-hidden="true" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
