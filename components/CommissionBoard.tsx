"use client";

import React, { useEffect, useState } from "react";
import { Commission, CommissionStatus } from "@/types";
import { StatusBadge } from "./ui/StatusBadge";
import { Briefcase, Palette, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { persistCommission } from "@/app/actions/commissionActions";

interface CommissionBoardProps {
  commissions: Commission[];
  onEdit: (commission: Commission) => void;
  isAuthenticated: boolean;
}

const CommissionCard = ({
  item,
  index,
  onEdit,
  isAuthenticated,
}: {
  item: Commission;
  index: number;
  onEdit: (commission: Commission) => void;
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

          {(item.images?.references?.length > 0 ||
            item.images?.drafts?.length > 0) && (
            <div className="flex -space-x-2 mb-3">
              {[
                ...(item.images.references || []),
                ...(item.images.drafts || []),
              ]
                .slice(0, 3)
                .map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover"
                    alt=""
                  />
                ))}
            </div>
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
  isAuthenticated,
}: {
  title: string;
  status: CommissionStatus;
  items: Commission[];
  onEdit: (commission: Commission) => void;
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

    const newStatus = destination.droppableId as CommissionStatus;

    // Optimistic update
    const updatedCommissions = localCommissions.map((c) => {
      if (c.id === draggableId) {
        return { ...c, status: newStatus };
      }
      return c;
    });

    setLocalCommissions(updatedCommissions);

    try {
      await persistCommission({ id: draggableId, status: newStatus });
    } catch (error) {
      console.error("Failed to update commission status", error);
      // Revert to props on error
      setLocalCommissions(commissions);
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
          items={localCommissions.filter(
            (c) => c.status === CommissionStatus.REQUESTED
          )}
          onEdit={onEdit}
          isAuthenticated={isAuthenticated}
        />
        <KanbanColumn
          title="In Progress"
          status={CommissionStatus.STARTED}
          items={localCommissions.filter(
            (c) => c.status === CommissionStatus.STARTED
          )}
          onEdit={onEdit}
          isAuthenticated={isAuthenticated}
        />
        <KanbanColumn
          title="Completed"
          status={CommissionStatus.FINISHED}
          items={localCommissions.filter(
            (c) => c.status === CommissionStatus.FINISHED
          )}
          onEdit={onEdit}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </DragDropContext>
  );
};