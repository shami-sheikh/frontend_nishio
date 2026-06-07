import { useState } from "react";
import { FiZap, FiRefreshCw } from "react-icons/fi";
import axiosInstance from "../api/AxiosInstance.js";
import toast from "react-hot-toast";

const CaptionGenerator = ({ type, onSelect }) => {
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const generateCaptions = async () => {
    if (type === "reel") return toast.error("AI captions work for photos only");

    setLoading(true);
    setCaptions([]);
    setSelected(null);

    try {
      const res = await axiosInstance.post("/ai/caption", {
        base64: null, // no image needed
        mediaType: null,
      });

      setCaptions(res.data.captions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate captions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (caption) => {
    setSelected(caption);
    onSelect(caption);
    toast.success("Caption applied!");
  };

  if (type === "reel") return null;

  return (
    <div className="space-y-3">
      {/* Generate button */}
      <button
        onClick={generateCaptions}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all text-sm font-bold disabled:opacity-50 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <FiRefreshCw size={15} className="animate-spin" />
            Generating captions...
          </>
        ) : (
          <>
            <FiZap size={15} />
            {captions.length > 0 ? "Regenerate" : "Generate AI caption ✨"}
          </>
        )}
      </button>

      {/* Caption options */}
      {captions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 px-1 font-medium">Pick a caption:</p>
          {captions.map((caption, i) => (
            <button
              key={i}
              onClick={() => handleSelect(caption)}
              className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all ${
                selected === caption
                  ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-white"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
              }`}
            >
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                {i === 0 ? "😂 Funny" : i === 1 ? "✨ Aesthetic" : "💪 Motivational"}
              </span>
              {caption}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaptionGenerator;