"use client";

import React, { useEffect, useState } from "react";
import { Commission, CommissionStatus } from "@/types";
import { StatusBadge } from "./ui/StatusBadge";
import { Briefcase, Palette, CheckCircle, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { persistCommission, batchUpdateCommissions } from "@/app/actions/commissionActions";

interface CommissionBoardProps {
  commissions: Commission[];
  onEdit: (commission: Commission) => void;
  isAuthenticated: boolean;
}

const CommissionCard = ({
  item,
  index,
  onEdit,
  onPreviewImage,
  isAuthenticated,
}: {
  item: Commission;
  index: number;
  onEdit: (commission: Commission) => void;
  onPreviewImage: (url: string) => void;
  isAuthenticated: boolean;
}) => {
  return (
    <Draggable
      draggableId={item.id}
      index={index}
      isDragDisabled={!isAuthenticated}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => isAuthenticated && onEdit(item)}
          className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${
            isAuthenticated ? "cursor-pointer hover:shadow-md" : ""
          } transition-all group relative mb-3 ${
            snapshot.isDragging
              ? "shadow-lg ring-2 ring-indigo-500 rotate-2"
              : ""
          }`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
              {item.title}
            </h4>
            <StatusBadge status={item.paymentStatus} type="payment" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
            {item.clientName}
          </p>

          {item.images?.finals?.length > 0 ? (
            <div className="mb-3 w-full h-32 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img
                src={item.images.finals[0]}
                alt="Final Piece"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isAuthenticated
                    ? "hover:scale-105"
                    : "cursor-zoom-in hover:opacity-90"
                }`}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.stopPropagation();
                    onPreviewImage(item.images.finals[0]);
                  }
                }}
              />
            </div>
          ) : (
            (item.images?.references?.length > 0 ||
              item.images?.drafts?.length > 0) && (
              <div className="flex -space-x-2 mb-3">
                {[
                  ...(item.images.references || []),
                  ...(item.images.drafts || []),
                ]
                  .slice(0, 3)
                  .map((url, i) => (
                    <div key={i} className="relative w-6 h-6 hover:z-10">
                      <img
                        src={url}
                        className="peer w-full h-full rounded-full ring-2 ring-white dark:ring-gray-800 object-cover cursor-zoom-in"
                        alt=""
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden peer-hover:block h-[300px] w-auto min-w-[200px] rounded-lg shadow-xl border-2 border-white dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden z-50 pointer-events-none">
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
            {isAuthenticated && (
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.price)}
              </span>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const KanbanColumn = ({
  title,
  status,
  items,
  onEdit,
  onPreviewImage,
  isAuthenticated,
}: {
  title: string;
  status: CommissionStatus;
  items: Commission[];
  onEdit: (commission: Commission) => void;
  onPreviewImage: (url: string) => void;
  isAuthenticated: boolean;
}) => (
  <div className="flex-1 min-w-[300px] flex flex-col h-full">
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col h-full transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          {status === CommissionStatus.REQUESTED && (
            <Briefcase className="w-4 h-4" />
          )}
          {status === CommissionStatus.STARTED && (
            <Palette className="w-4 h-4" />
          )}
          {status === CommissionStatus.FINISHED && (
            <CheckCircle className="w-4 h-4" />
          )}
          {title}
        </h3>
        <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold">
          {items.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto custom-scrollbar pr-1 transition-colors rounded-lg ${
              snapshot.isDraggingOver
                ? "bg-gray-100/50 dark:bg-gray-800/50"
                : ""
            }`}
            style={{ minHeight: "100px" }}
          >
            {items.map((item, index) => (
              <CommissionCard
                key={item.id}
                item={item}
                index={index}
                onEdit={onEdit}
                onPreviewImage={onPreviewImage}
                isAuthenticated={isAuthenticated}
              />
            ))}
            {provided.placeholder}
            {items.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                Empty
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  </div>
);

export const CommissionBoard: React.FC<CommissionBoardProps> = ({
  commissions,
  onEdit,
  isAuthenticated,
}) => {
  const [localCommissions, setLocalCommissions] = useState(commissions);
  const [isMounted, setIsMounted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLocalCommissions(commissions);
  }, [commissions]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startStatus = source.droppableId as CommissionStatus;
    const finishStatus = destination.droppableId as CommissionStatus;

    // Clone to avoid mutation
    const newCommissions = localCommissions.map((c) => ({ ...c }));

    if (startStatus === finishStatus) {
      const columnItems = newCommissions
        .filter((c) => c.status === startStatus)
        .sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt
        );

      const [movedItem] = columnItems.splice(source.index, 1);
      columnItems.splice(destination.index, 0, movedItem);

      const updates: Partial<Commission>[] = [];
      columnItems.forEach((item, index) => {
        item.order = index;
        updates.push({ id: item.id, order: index });
      });

      setLocalCommissions((prev) =>
        prev.map((p) => {
          const updated = columnItems.find((c) => c.id === p.id);
          return updated ? updated : p;
        })
      );

      try {
        await batchUpdateCommissions(updates);
      } catch (error) {
        console.error("Failed to reorder commissions", error);
        setLocalCommissions(commissions);
      }
    } else {
      const sourceItems = newCommissions
        .filter((c) => c.status === startStatus)
        .sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt
        );

      const destItems = newCommissions
        .filter((c) => c.status === finishStatus)
        .sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt
        );

      const [movedItem] = sourceItems.splice(source.index, 1);
      movedItem.status = finishStatus;
      destItems.splice(destination.index, 0, movedItem);

      const updates: Partial<Commission>[] = [];

      // Update destination orders
      destItems.forEach((item, index) => {
        item.order = index;
        const update: Partial<Commission> = { id: item.id, order: index };
        if (item.id === movedItem.id) {
          update.status = finishStatus;
        }
        updates.push(update);
      });

      // Update source orders
      sourceItems.forEach((item, index) => {
        item.order = index;
        updates.push({ id: item.id, order: index });
      });

      setLocalCommissions((prev) =>
        prev.map((p) => {
          if (p.id === movedItem.id) return movedItem;
          const destItem = destItems.find((d) => d.id === p.id);
          if (destItem) return destItem;
          const sourceItem = sourceItems.find((s) => s.id === p.id);
          if (sourceItem) return sourceItem;
          return p;
        })
      );

      try {
        await batchUpdateCommissions(updates);
      } catch (error) {
        console.error("Failed to move commission", error);
        setLocalCommissions(commissions);
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {/* Render a static skeleton or loading state to avoid hydration mismatch */}
        <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-900 rounded-xl p-4 h-full animate-pulse"></div>
        <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-900 rounded-xl p-4 h-full animate-pulse"></div>
        <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-900 rounded-xl p-4 h-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        <KanbanColumn
          title="Requested"
          status={CommissionStatus.REQUESTED}
          items={localCommissions
            .filter((c) => c.status === CommissionStatus.REQUESTED)
            .sort(
              (a, b) =>
                (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt
            )}
          onEdit={onEdit}
          onPreviewImage={setPreviewImage}
          isAuthenticated={isAuthenticated}
        />
        <KanbanColumn
          title="In Progress"
          status={CommissionStatus.STARTED}
          items={localCommissions
            .filter((c) => c.status === CommissionStatus.STARTED)
            .sort(
              (a, b) =>
                (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt
            )}
          onEdit={onEdit}
          onPreviewImage={setPreviewImage}
          isAuthenticated={isAuthenticated}
        />
        <KanbanColumn
          title="Completed"
          status={CommissionStatus.FINISHED}
          items={localCommissions
            .filter((c) => c.status === CommissionStatus.FINISHED)
            .sort(
              (a, b) =>
                (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt
            )}
          onEdit={onEdit}
          onPreviewImage={setPreviewImage}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DragDropContext>
  );
};