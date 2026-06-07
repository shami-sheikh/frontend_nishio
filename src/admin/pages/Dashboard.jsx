import { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import { motion } from "framer-motion";

const STATS = [
  { key: "totalUsers",    label: "Total Users",    color: "from-blue-500 to-indigo-500" },
  { key: "totalPosts",    label: "Total Posts",    color: "from-rose-500 to-pink-500" },
  { key: "totalReels",    label: "Total Reels",    color: "from-fuchsia-500 to-purple-500" },
  { key: "totalStories",  label: "Total Stories",  color: "from-amber-500 to-orange-500" },
  { key: "totalComments", label: "Total Comments", color: "from-emerald-500 to-teal-500" },
  { key: "todayUsers",    label: "Users Today",    color: "from-cyan-500 to-blue-500" },
  { key: "todayPosts",    label: "Posts Today",    color: "from-violet-500 to-fuchsia-500" },
  { key: "todayReels",    label: "Reels Today",    color: "from-pink-500 to-rose-500" },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/admin/stats")
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Overview</h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ key, label, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5"
            >
              <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {stats?.[key] ?? 0}
              </p>
              <p className="text-xs text-zinc-500 mt-1 font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;