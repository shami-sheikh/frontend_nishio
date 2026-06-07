import { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import { FiTrash2 } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";

const AdminReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("/admin/reels")
      .then((res) => setReels(res.data.reels || []))
      .catch(() => toast.error("Failed to load reels"))
      .finally(() => setLoading(false));
  }, []);

  const deleteReel = async (id) => {
    if (!window.confirm("Delete this reel?")) return;
    try {
      await axiosInstance.delete(`/admin/reels/${id}`);
      setReels((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reel deleted");
    } catch { toast.error("Failed"); }
  };

  const filtered = reels.filter((r) =>
    r.user?.userName?.toLowerCase().includes(search.toLowerCase()) ||
    r.caption?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Reels <span className="text-zinc-500 font-normal text-base">({reels.length})</span></h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500/50 w-48"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((reel) => (
            <div key={reel._id} className="relative group rounded-2xl overflow-hidden aspect-square bg-zinc-900">
              <video
                src={reel.videoUrl || reel.mediaUrl}
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
                <p className="text-white text-xs font-bold truncate w-full text-center">@{reel.user?.userName}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><AiFillHeart size={12} className="text-rose-400" />{reel.likes?.length || 0}</span>
                  <span>{reel.views || 0} views</span>
                </div>
                <button
                  onClick={() => deleteReel(reel._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/80 hover:bg-rose-500 rounded-xl text-white text-xs font-bold transition-all"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReels;