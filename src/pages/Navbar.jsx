import React from 'react';
import { FiHome, FiPlusSquare, FiSearch, FiUser,FiInstagram, FiLogOut } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
function Navbar() {
  // Shared styling helper function for clean active vs inactive navigation state
  const navItemStyles = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer active:scale-[0.97] ${
      isActive
        ? "text-white bg-zinc-900 font-semibold"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 border-t border-zinc-900 backdrop-blur-md z-50 flex justify-around items-center py-2 px-6 md:top-0 md:bottom-auto md:left-0 md:right-auto md:w-64 md:h-screen md:flex-col md:justify-start md:items-stretch md:border-t-0 md:border-r md:p-6 md:space-y-8">
      
      {/* App Branding - Hidden on mobile, visible at top of desktop sidebar */}
      <div className="hidden md:block px-4 py-3 mb-4">
        <h1 className="text-transparent bg-clip-text bg-linear-to-r from-white to-zinc-400 text-2xl font-black italic tracking-wider select-none">
          Nishiogram
        </h1>
      </div>

      {/* Navigation Links Container */}
      <div className="flex justify-around items-center w-full md:flex-col md:items-stretch md:space-y-2">
        
        {/* Feed / Home */}
        <NavLink title='home' to="/feed" className={navItemStyles}>
          <FiHome size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Home</span>
        </NavLink>
        <NavLink title='reels' to="/reels" className={navItemStyles}>
          <FiInstagram size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Reels</span>
        </NavLink>

        {/* Explore / Search */}
        <NavLink title='explore' to="/explore" className={navItemStyles}>
          <FiSearch size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Explore</span>
        </NavLink>

        {/* Create / Upload */}
        <NavLink title='upload' to="/upload" className={navItemStyles}>
          <FiPlusSquare size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">Create</span>
        </NavLink>

        {/* Profile */}
        <NavLink title='profile' to="/profile" className={navItemStyles}>
          <FiUser size={22} className="shrink-0 transition-transform group-hover:scale-105" />
          <span  className="hidden md:inline text-sm tracking-wide">Profile</span>
        </NavLink>
        <NavLink title='logout' to="/logout" className={navItemStyles}>
          <FiLogOut  size={22} className=" hidden md:flex shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:inline text-sm tracking-wide">logout</span>
        </NavLink>
        
      </div>
    </nav>
  );
}

export default Navbar;