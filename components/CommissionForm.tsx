"use client";

import React, { useState } from "react";
import {
  Commission,
  CommissionStatus,
  PaymentStatus,
  CommissionImages,
} from "@/types";
import { persistCommission, deleteCommission } from "@/app/actions/commissionActions";
import { ImageManager } from "./ImageManager";
import { Save, Trash2, DollarSign, ImageIcon } from "lucide-react";

interface CommissionFormProps {
  initialData?: Commission | null;
  onClose: () => void;
}

export const CommissionForm: React.FC<CommissionFormProps> = ({
  initialData,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Commission>>({
    clientName: initialData?.clientName || "",
    title: initialData?.title || "",
    price: initialData?.price || 0,
    status: initialData?.status || CommissionStatus.REQUESTED,
    paymentStatus: initialData?.paymentStatus || PaymentStatus.UNPAID,
    description: initialData?.description || "",
    images: initialData?.images || {
      references: [],
      drafts: [],
      finals: [],
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title || !formData.clientName) {
      alert("Title and Client Name are required.");
      return;
    }

    setIsSaving(true);
    try {
      await persistCommission({
        ...formData,
        id: initialData?.id, // Pass ID if editing
        price: Number(formData.price),
      });
      onClose();
    } catch (e) {
      console.error("Error saving:", e);
      alert("Failed to save. See console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Are you sure you want to delete this commission?")) return;
    try {
      await deleteCommission(initialData.id);
      onClose();
    } catch (e) {
      console.error("Error deleting:", e);
      alert("Failed to delete.");
    }
  };

  const updateImageCategory = (
    category: keyof CommissionImages,
    newImages: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      images: {
        ...(prev.images as CommissionImages),
        [category]: newImages,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="e.g., Fantasy Portrait"
          />
        </div>
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) =>
              setFormData({ ...formData, clientName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Client or Social Handle"
          />
        </div>
      </div>

      {/* Status & Price Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Work Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as CommissionStatus,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {Object.values(CommissionStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={formData.paymentStatus}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentStatus: e.target.value as PaymentStatus,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {Object.values(PaymentStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-700">
            Notes / Description
          </label>
        </div>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          placeholder="E.g., Red dragon fighting a knight, sunny day..."
        ></textarea>
      </div>

      {/* Images Section */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Gallery
        </h3>

        <ImageManager
          label="Client References"
          images={formData.images?.references || []}
          onAdd={(url) =>
            updateImageCategory("references", [
              ...(formData.images?.references || []),
              url,
            ])
          }
          onRemove={(idx) =>
            updateImageCategory(
              "references",
              (formData.images?.references || []).filter((_, i) => i !== idx)
            )
          }
        />

        <ImageManager
          label="Drafts & Sketches"
          images={formData.images?.drafts || []}
          onAdd={(url) =>
            updateImageCategory("drafts", [
              ...(formData.images?.drafts || []),
              url,
            ])
          }
          onRemove={(idx) =>
            updateImageCategory(
              "drafts",
              (formData.images?.drafts || []).filter((_, i) => i !== idx)
            )
          }
        />

        <ImageManager
          label="Final Pieces"
          images={formData.images?.finals || []}
          onAdd={(url) =>
            updateImageCategory("finals", [
              ...(formData.images?.finals || []),
              url,
            ])
          }
          onRemove={(idx) =>
            updateImageCategory(
              "finals",
              (formData.images?.finals || []).filter((_, i) => i !== idx)
            )
          }
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {initialData?.id ? (
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        ) : (
          <div></div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Commission"}
          </button>
        </div>
      </div>
    </div>
  );
};