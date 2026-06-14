import React from 'react';
import { FiHome, FiPlusSquare, FiSearch, FiUser, FiInstagram, FiLogOut, FiShield, FiMessageCircle } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user } = useAuth();

  // 😈 BEAST MODE: Dynamic class generator that completely avoids Tailwind display conflicts
  const getNavItemStyles = (isActive, baseDisplay = "flex") =>
    `${baseDisplay} items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer active:scale-[0.97] ${
      isActive
        ? "text-white bg-zinc-900 font-semibold"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 border-t border-zinc-900 backdrop-blur-md z-50 flex justify-around items-center py-2 px-6 md:top-0 md:bottom-auto md:left-0 md:right-auto md:w-64 md:h-screen md:flex-col md:justify-start md:items-stretch md:border-t-0 md:border-r md:p-6 md:space-y-8">

      <div className="hidden md:block px-4 py-3 mb-4">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 text-2xl font-black italic tracking-wider select-none">
          Nishiogram
        </h1>
      </div>

      <div className="flex justify-around items-center w-full md:flex-col md:items-stretch md:space-y-2">

        {/* Standard Links: Default to "flex" */}
        <NavLink title='home' to="/feed" className={({ isActive }) => getNavItemStyles(isActive)}>
          <FiHome size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Home</span>
        </NavLink>

        <NavLink title='reels' to="/reels" className={({ isActive }) => getNavItemStyles(isActive)}>
          <FiInstagram size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Reels</span>
        </NavLink>

        <NavLink title='explore' to="/explore" className={({ isActive }) => getNavItemStyles(isActive)}>
          <FiSearch size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Explore</span>
        </NavLink>

        <NavLink title='upload' to="/upload" className={({ isActive }) => getNavItemStyles(isActive)}>
          <FiPlusSquare size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Create</span>
        </NavLink>

        <NavLink title='profile' to="/profile" className={({ isActive }) => getNavItemStyles(isActive)}>
          <FiUser size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Profile</span>
        </NavLink>

        <NavLink title='logout' to="/logout" className={({ isActive }) => getNavItemStyles(isActive, "hidden md:flex")}>
          <FiLogOut size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Logout</span>
        </NavLink>
        <NavLink title='logout' to="/chat" className={({ isActive }) => getNavItemStyles(isActive, "hidden md:flex")}>
          <FiMessageCircle size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">chats</span>
        </NavLink>

        {/* Admin Link */}
        {user?.isAdmin && (
          <NavLink title='admin' to="/admin" className={({ isActive }) => getNavItemStyles(isActive)}>
            <FiShield size={22} className="shrink-0 transition-transform group-hover:scale-105" />
            <span className="hidden md:inline text-sm tracking-wide">Admin</span>
          </NavLink>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
