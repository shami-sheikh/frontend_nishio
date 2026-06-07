import { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import { FiTrash2 } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("/admin/posts")
      .then((res) => setPosts(res.data.posts || []))
      .catch(() => toast.error("Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axiosInstance.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Post deleted");
    } catch { toast.error("Failed"); }
  };

  const filtered = posts.filter((p) =>
    p.user?.userName?.toLowerCase().includes(search.toLowerCase()) ||
    p.caption?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Posts <span className="text-zinc-500 font-normal text-base">({posts.length})</span></h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500/50 w-48"
        />
      </div>

      {loading ? <GridSkeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((post) => (
            <div key={post._id} className="relative group rounded-2xl overflow-hidden aspect-square bg-zinc-900">
              {post.type === "reel"
                ? <video src={post.mediaUrl} className="w-full h-full object-cover" preload="metadata" />
                : <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
              }
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
                <p className="text-white text-xs font-bold truncate w-full text-center">@{post.user?.userName}</p>
                {post.caption && <p className="text-zinc-300 text-[10px] text-center line-clamp-2">{post.caption}</p>}
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <AiFillHeart size={12} className="text-rose-400" />
                  {post.likes?.length || 0}
                </div>
                <button
                  onClick={() => deletePost(post._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/80 hover:bg-rose-500 rounded-xl text-white text-xs font-bold transition-all"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
              {post.type === "reel" && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-lg px-2 py-0.5 text-[9px] font-bold text-blue-400">Reel</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="aspect-square bg-zinc-900 rounded-2xl animate-pulse" />
    ))}
  </div>
);

export default Posts;