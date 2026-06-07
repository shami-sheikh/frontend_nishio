import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useReel } from "../context/ReelContext";
import ReelItem from "../pages/ReelItem"
import Navbar from "../pages/Navbar";
import { FiShare2, FiVolumeX, FiVolume2 } from "react-icons/fi";

const Reels = () => {
  const { user } = useAuth();
  const { reels } = useReel();
  const [muted, setMuted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === activeIndex) vid.play().catch(() => {});
      else { vid.pause(); vid.currentTime = 0; }
    });
  }, [activeIndex, reels.length]);

  useEffect(() => {
    videoRefs.current.forEach((vid) => {
      if (vid) vid.muted = muted;
    });
  }, [muted]);

  useEffect(() => {
    const observers = [];
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i); },
        { threshold: 0.6 }
      );
      obs.observe(vid);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [reels.length]);

  if (reels.length === 0) {
    return (
      <div className="h-dvh w-full sm:max-w-112.5 sm:mx-auto bg-black flex flex-col items-center justify-center text-zinc-500 pb-20 relative">
        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
          <FiShare2 size={28} className="text-zinc-600" />
        </div>
        <p className="text-white font-semibold text-lg">No reels yet</p>
        <p className="text-sm mt-1">Upload a video to see it here</p>
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <Navbar />
        </div>
      </div>
    );
  }

 return (
  <div className="bg-black h-dvh w-full sm:max-w-112.5 sm:mx-auto flex flex-col relative overflow-hidden sm:border-x sm:border-zinc-900">
    <button
      onClick={() => setMuted((m) => !m)}
      className="absolute top-6 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition"
    >
      {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
    </button>

    <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {reels.map((post, i) => (
        <ReelItem
          key={post._id}
          post={post}
          isActive={i === activeIndex}
          muted={muted}
          currentUserId={user?._id}
          videoRef={(el) => (videoRefs.current[i] = el)}
        />
      ))}
    </div>

    <div className="absolute bottom-0 left-0 right-0 z-40">
      <Navbar />
    </div>
  </div>
);
};

export default Reels;