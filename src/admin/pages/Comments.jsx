import { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("/admin/comments")
      .then((res) => setComments(res.data.comments || []))
      .catch(() => toast.error("Failed to load comments"))
      .finally(() => setLoading(false));
  }, []);

  const deleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axiosInstance.delete(`/admin/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success("Comment deleted");
    } catch { toast.error("Failed"); }
  };

  const filtered = comments.filter((c) =>
    c.text?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Comments <span className="text-zinc-500 font-normal text-base">({comments.length})</span></h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500/50 w-48"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-3 bg-zinc-800 rounded" />
                <div className="w-48 h-3 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c._id} className="flex items-start gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-colors">
              <img
                src={c.user?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.user?.userName}`}
                className="w-9 h-9 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-fuchsia-400">@{c.user?.userName}</p>
                <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {new Date(c.createdAt).toLocaleDateString()} · {c.likes?.length || 0} likes
                </p>
              </div>
              <button
                onClick={() => deleteComment(c._id)}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all shrink-0"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComments;