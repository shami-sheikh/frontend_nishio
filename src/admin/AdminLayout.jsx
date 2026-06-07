import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiBarChart2, FiUsers, FiImage, FiFilm,
  FiBookOpen, FiMessageCircle, FiLogOut, FiArrowLeft
} from "react-icons/fi";

const NAV = [
  { to: "dashboard",  label: "Dashboard", icon: FiBarChart2 },
  { to: "users",      label: "Users",     icon: FiUsers },
  { to: "posts",      label: "Posts",     icon: FiImage },
  { to: "reels",      label: "Reels",     icon: FiFilm },
  { to: "stories",    label: "Stories",   icon: FiBookOpen },
  { to: "comments",   label: "Comments",  icon: FiMessageCircle },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/20"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
    }`;

  return (
    <div className="min-h-screen bg-[#050506] text-white flex">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-zinc-950 border-r border-zinc-900 p-5 fixed h-full z-30">
        <div className="mb-8">
          <h1 className="text-lg font-black bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xs text-zinc-500 mt-1">@{user?.userName}</p>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 pt-4 border-t border-zinc-900">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <FiArrowLeft size={16} /> Back to App
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-950 border-b border-zinc-900 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-sm font-black bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button onClick={() => navigate("/")} className="text-xs text-zinc-400">← App</button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/20"
                    : "bg-zinc-900 text-zinc-400"
                }`
              }
            >
              <Icon size={12} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── Page content ── */}
      <main className="flex-1 md:ml-56 pt-28 md:pt-0 px-4 md:px-8 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;