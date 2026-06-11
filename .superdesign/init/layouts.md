# Shared Layout Components

This project has one primary layout component that serves as the main application shell for authenticated pages.

## Layout Component

- **File Path**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Description**: Standard dashboard layout with a left navigation sidebar (fixed on desktop, hidden on mobile) and a top navigation header with user profile details, notification actions, and search bar.

### Full Source Code

```tsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Alex Graham");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Try to extract user name from token or localStorage
    const savedUser = localStorage.getItem("userName");
    if (savedUser) {
      setUserName(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all ${
      active
        ? "bg-primary-container text-on-primary-container font-semibold translate-x-1"
        : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
    }`;
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] z-40 bg-surface border-r border-outline-variant hidden md:flex flex-col p-md gap-sm pt-24">
        <div className="px-md mb-lg">
          <Link to="/" className="font-headline-sm text-headline-sm font-bold text-primary block">
            AI Meeting Memory
          </Link>
          <p className="font-label-sm text-outline uppercase tracking-wider mt-xs">Enterprise Workspace</p>
        </div>

        <nav className="flex-1 flex flex-col gap-xs">
          <Link to="/" className={linkClass("/")}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/" className={linkClass("/meetings")}>
            <span className="material-symbols-outlined">video_library</span>
            <span>Meetings</span>
          </Link>
          <Link to="/" className={linkClass("/workspaces")}>
            <span className="material-symbols-outlined">group_work</span>
            <span>Workspaces</span>
          </Link>
          <a href="#" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-md text-label-md transition-all">
            <span className="material-symbols-outlined">insights</span>
            <span>Analytics</span>
          </a>
          <a href="#" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-md text-label-md transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-md">
          <a
            href="#"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-primary transition-all font-label-md text-label-md"
          >
            <span className="material-symbols-outlined">help</span>
            <span>Help Center</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-md px-md py-sm w-full text-left text-error hover:bg-error-container/20 transition-all rounded-lg font-label-md text-label-md"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="bg-surface border-b border-outline-variant docked full-width top-0 z-50 fixed w-full md:w-[calc(100%-280px)]">
          <div className="flex justify-between items-center w-full px-gutter h-16 md:h-20">
            <div className="flex items-center gap-xl flex-1">
              <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight md:hidden">AMMS</span>
              
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-surface-container-low px-md py-xs rounded-full gap-sm border border-outline-variant">
                <span className="material-symbols-outlined text-outline">search</span>
                <input
                  type="text"
                  placeholder="Search transcripts, meetings..."
                  className="bg-transparent border-none focus:ring-0 text-body-sm w-64 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-md">
              <button className="p-sm rounded-full hover:bg-surface-container-low transition-colors duration-200 relative">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-sm p-xs pr-md rounded-full border border-outline-variant hover:bg-surface-container-low cursor-pointer">
                <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_circle
                </span>
                <span className="hidden md:block font-label-md text-on-surface">{userName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="pt-16 md:pt-20 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
```
