import React from "react";

const SkeletonCard = () => {
  return (
    <div className="rounded-3xl bg-zinc-900/60 border border-white/5 overflow-hidden animate-pulse">
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-800" />
        <div className="flex-1">
          <div className="h-3 bg-zinc-800 rounded w-24 mb-1" />
          <div className="h-2 bg-zinc-800 rounded w-16" />
        </div>
      </div>
      <div className="w-full h-64 bg-zinc-800" />
      <div className="p-4">
        <div className="h-3 bg-zinc-800 rounded w-32 mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-20" />
      </div>
    </div>
  );
};

export default SkeletonCard;
