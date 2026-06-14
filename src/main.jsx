import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import {PostProvider} from "./context/PostContext.jsx"
import { FollowProvider } from "./context/FollowContext.jsx";
import { CommentProvider } from "./context/CommentContext.jsx";
import { ReelProvider } from "./context/ReelContext.jsx";
import { StoryProvider } from "./context/StoryContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
     <PostProvider>
       <FollowProvider>
      <CommentProvider>
           <ReelProvider>
            <StoryProvider>
             <AdminProvider>
              <NotificationProvider>
                <SocketProvider>
                  <ChatProvider>
                      <App />
        <Toaster position="top-right" />
                  </ChatProvider>
                </SocketProvider>
              </NotificationProvider>
             </AdminProvider>
            </StoryProvider>
           </ReelProvider>
      </CommentProvider>
       </FollowProvider>
     </PostProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);