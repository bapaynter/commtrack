"use client";

import React, { useState } from "react";
import { ImageIcon, Trash2, ExternalLink, Upload, Link as LinkIcon } from "lucide-react";
import { uploadImage } from "@/app/actions/uploadAction";

interface ImageManagerProps {
  label: string;
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({
  label,
  images = [],
  onAdd,
  onRemove,
}) => {
  const [inputUrl, setInputUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "file">("url");

  const handleAddUrl = () => {
    if (inputUrl) {
      onAdd(inputUrl);
      setInputUrl("");
      setIsAdding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const path = await uploadImage(formData);
      onAdd(path);
      setIsAdding(false);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const MOCK_IMAGES = [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop",
  ];

  const addRandomMock = () => {
    const random = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
    onAdd(random);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> {label}
        </h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {isAdding ? "Cancel" : "+ Add Image"}
        </button>
      </div>

      {isAdding && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <div className="flex gap-4 mb-3 text-sm">
            <button
              onClick={() => setMode("url")}
              className={`flex items-center gap-1 pb-1 border-b-2 transition-colors ${
                mode === "url"
                  ? "border-indigo-600 text-indigo-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <LinkIcon className="w-3 h-3" /> URL
            </button>
            <button
              onClick={() => setMode("file")}
              className={`flex items-center gap-1 pb-1 border-b-2 transition-colors ${
                mode === "file"
                  ? "border-indigo-600 text-indigo-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Upload className="w-3 h-3" /> Upload
            </button>
          </div>

          {mode === "url" ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
              />
              <button
                onClick={handleAddUrl}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Add
              </button>
              <button
                onClick={addRandomMock}
                className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
                title="Add Random Mock"
              >
                Mock
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
          >
            <img
              src={url}
              alt="Reference"
              className="w-full h-full object-cover"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/150?text=Err")
              }
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onRemove(idx)}
                className="bg-white text-red-600 p-1.5 rounded-full hover:bg-red-50 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 bg-white text-gray-600 p-1.5 rounded-full hover:bg-gray-50 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
        {images.length === 0 && !isAdding && (
          <div className="col-span-3 py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400">No images yet</p>
          </div>
        )}
      </div>
    </div>
  );
};