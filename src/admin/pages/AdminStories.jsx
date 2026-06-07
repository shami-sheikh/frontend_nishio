import { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("/admin/stories")
      .then((res) => setStories(res.data.stories || []))
      .catch(() => toast.error("Failed to load stories"))
      .finally(() => setLoading(false));
  }, []);

  const deleteStory = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      await axiosInstance.delete(`/admin/stories/${id}`);
      setStories((prev) => prev.filter((s) => s._id !== id));
      toast.success("Story deleted");
    } catch { toast.error("Failed"); }
  };

  const filtered = stories.filter((s) =>
    s.user?.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Stories <span className="text-zinc-500 font-normal text-base">({stories.length})</span></h2>
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
            <div key={i} className="aspect-[9/16] bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((story) => (
            <div key={story._id} className="relative group rounded-2xl overflow-hidden aspect-[9/16] bg-zinc-900">
              {story.mediaType === "video"
                ? <video src={story.mediaUrl} className="w-full h-full object-cover" preload="metadata" />
                : <img src={story.mediaUrl} alt="story" className="w-full h-full object-cover" />
              }
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
                <p className="text-white text-xs font-bold truncate w-full text-center">@{story.user?.userName}</p>
                <p className="text-zinc-400 text-[10px]">{story.views?.length || 0} views</p>
                <p className="text-zinc-500 text-[10px]">Expires {new Date(story.expiresAt).toLocaleDateString()}</p>
                <button
                  onClick={() => deleteStory(story._id)}
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

export default AdminStories;