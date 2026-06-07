import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiImage, FiFilm, FiX, FiCheck } from "react-icons/fi";
import { MdOutlinePhotoCamera } from "react-icons/md";
import toast from "react-hot-toast";
import axiosInstance from "../api/AxiosInstance";
import { usePost } from "../context/PostContext";
import { useReel } from "../context/ReelContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../pages/Navbar";
// import CaptionGenerator from "../cloudeai/CaptionGenerator";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost, fetchFeed } = usePost();
  const { addReel } = useReel();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState("photo");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const processFile = (selected) => {
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) return toast.error("File exceeds 50MB limit");
    const isVideo = selected.type.startsWith("video/");
    setType(isVideo ? "reel" : "photo");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploadDone(false);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("image/") || dropped?.type.startsWith("video/")) {
      processFile(dropped);
    } else {
      toast.error("Only images and videos allowed");
    }
  };

  const handleRemove = () => {
    if (loading) return;
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    setUploadDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("Please select a file");
    if (loading) return;

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    const isReel = type === "reel";
    if (isReel) formData.append("video", file);
    else formData.append("media", file);
    formData.append("type", type);
    formData.append("caption", caption.trim());

    try {
      const endpoint = isReel ? "/reels/createreels" : "/posts/createpost";
      const res = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setUploadDone(true);

      if (res?.data?.post) {
        addPost(res.data.post);
        toast.success("Posted successfully!");
      } else if (res?.data?.reel) {
        addReel(res.data.reel);
        toast.success("Reel uploaded!");
        navigate("/reels");
      } else {
        fetchFeed().catch(() => {});
        toast.success("Posted successfully!");
      }
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setUploadProgress(0);
        setUploadDone(false);
        navigate("/feed");
      }, 800);
    } catch (err) {
      toast.error(err.response?.data?.extraDetails || "Upload failed");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pb-28">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-fuchsia-400 to-indigo-400">
          New Post
        </h1>
        {file && !loading && (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-full text-xs font-bold transition-colors"
          >
            <FiCheck size={13} />
            Share
          </button>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* User info strip */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-fuchsia-500/40">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.userName}`}
              alt={user?.userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.userName}</p>
            <p className="text-xs text-zinc-500">Posting to your profile</p>
          </div>
        </div>

        {/* Upload area / Preview */}
        {!preview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-5 w-full aspect-square rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01]"
                : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900/60"
            }`}
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-colors ${
              isDragging ? "bg-fuchsia-500/20" : "bg-zinc-800"
            }`}>
              <MdOutlinePhotoCamera size={36} className={isDragging ? "text-fuchsia-400" : "text-zinc-500"} />
            </div>
            <div className="text-center px-6">
              <p className="text-white font-bold text-base">
                {isDragging ? "Drop it!" : "Share a photo or video"}
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                JPG, PNG, MP4, MOV · Max 50MB
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-full text-xs text-zinc-400">
                <FiImage size={12} /> Photo
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-full text-xs text-zinc-400">
                <FiFilm size={12} /> Reel
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
            {type === "reel" ? (
              <video src={preview} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            )}

            {/* overlay on upload */}
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-fuchsia-500 animate-spin" />
                <p className="text-white font-bold text-lg">{uploadProgress}%</p>
                <p className="text-zinc-400 text-xs">Uploading to Cloudinary...</p>
              </div>
            )}

            {/* success overlay */}
            {uploadDone && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <FiCheck size={32} className="text-emerald-400" />
                </div>
                <p className="text-white font-bold">Posted!</p>
              </div>
            )}

            {/* remove button */}
            {!loading && !uploadDone && (
              <button
                onClick={handleRemove}
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-red-500/80 transition-colors"
              >
                <FiX size={16} />
              </button>
            )}

            {/* type badge */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold">
              {type === "reel"
                ? <><FiFilm size={11} className="text-blue-400" /> Reel</>
                : <><FiImage size={11} className="text-emerald-400" /> Photo</>
              }
            </div>
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-rose-500 via-fuchsia-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Caption Textarea container */}
        <div className="relative">
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
            maxLength={2200}
            rows={3}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 resize-none disabled:opacity-40 transition-all"
          />
          <span className="absolute bottom-3 right-4 text-[10px] text-zinc-600">
            {caption.length}/2200
          </span>
        </div>

        {/* abhi ai bann nhi rha hai baad mai bana denge  */}
        {/* <CaptionGenerator
          file={file}
          type={type}
          onSelect={(caption) => setCaption(caption)}
        /> */}

        {/* Main interactive execution block */}
        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          className="w-full relative overflow-hidden bg-linear-to-r from-rose-500 via-fuchsia-500 to-indigo-500 text-white font-bold rounded-2xl py-4 text-sm disabled:opacity-30 transition-all active:scale-[0.98] hover:opacity-90"
        >
          {loading
            ? `Uploading... ${uploadProgress}%`
            : uploadDone
            ? "✓ Posted!"
            : "Share Post"
          }
        </button>

      </div>
      <Navbar />
    </div>
  );
};

export default Upload;