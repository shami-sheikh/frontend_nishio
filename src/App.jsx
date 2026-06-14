import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Register from "./utils/Register";
import Login from "./utils/Login";
// import Feed from "./components/Feed";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import Explore from "./components/Explore";
import Upload from "./components/Upload";
import Navbar from "./pages/Navbar";
import Logout from "./components/Logout";
import Reels from "./components/Reels";
import StoryCard from "./components/StoryCard";
import { GuestRouter } from "./pages/GuestRoute";
import UserProfile from "./components/UserProfile";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Posts from "./admin/pages/Posts";
import AdminReels from "./admin/pages/AdminReels";
import AdminStories from "./admin/pages/AdminStories";
import AdminComments from "./admin/pages/Comments";
import Chat from "./pages/Chat";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, initializing } = useAuth();
  if (initializing)
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  return isLoggedIn ? children : <Navigate to="/login" />;
};
// Protected admin route
const AdminRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing)
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  return user?.isAdmin ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Routes>
      {/* for  Public routes sab ke liye */}
      <Route
        path="/login"
        element={
          <GuestRouter>
            <Login />
          </GuestRouter>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRouter>
            <Register />
          </GuestRouter>
        }
      />
      <Route path="/navbar" element={<Navbar />} />
      <Route path="/logout" element={<Logout />} />
{/* admin route */}
    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route index element={<Navigate to="dashboard" />} />
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="users"     element={<Users />} />
  <Route path="posts"  element={<Posts />} />
  <Route path="reels"     element={<AdminReels />} />
  <Route path="stories"   element={<AdminStories />} />
  <Route path="comments"  element={<AdminComments />} />
</Route>
      {/* Protected routes protext karega */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reels"
        element={
          <ProtectedRoute>
            <Reels />
          </ProtectedRoute>
        }
      />
      <Route
        path="/storycard"
        element={
          <ProtectedRoute>
            <StoryCard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
