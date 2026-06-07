import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useStory } from "../context/StoryContext";
import toast from "react-hot-toast";

const AddStoryModal = ({ isOpen, onClose }) => {
  const { handleCreateStory } = useStory();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ Detect file type
  const getMediaType = (file) => {
    if (!file) return null;
    const type = file.type.split("/")[0]; // "image" or "video"
    return type === "image" || type === "video" ? type : null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const mediaType = getMediaType(selectedFile);
      if (!mediaType) {
        toast.error("Please select an image or video");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Select a file");
      return;
    }

    setUploading(true);
    try {
      const mediaType = getMediaType(file);
      await handleCreateStory(file, caption, mediaType);
      setFile(null);
      setCaption("");
      onClose();
    } finally {
      setUploading(false);
    }
  };

  // ✅ FIXED: Correct syntax
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-sm w-full p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Add Story</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input */}
          <div className="relative">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="story-file"
            />
            <label
              htmlFor="story-file"
              className="block w-full p-4 bg-zinc-800/50 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-zinc-800/70 transition-colors"
            >
              {file ? (
                <div>
                  <p className="text-white text-sm font-medium">{file.name}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {getMediaType(file) === "image" ? "📷 Image" : "🎥 Video"}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">Click to upload image or video</p>
              )}
            </label>
          </div>

          {/* Caption/Text */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            maxLength={150}
            className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-fuchsia-500/50"
            rows={3}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            {uploading ? "Uploading..." : "Post Story"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStoryModal;