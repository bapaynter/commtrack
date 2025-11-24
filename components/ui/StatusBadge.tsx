import React from "react";
import { CommissionStatus, PaymentStatus } from "@/types";

interface StatusBadgeProps {
  status: CommissionStatus | PaymentStatus | string;
  type?: "work" | "payment";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "work",
}) => {
  let colors = "";
  if (type === "work") {
    switch (status) {
      case CommissionStatus.REQUESTED:
        colors =
          "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
        break;
      case CommissionStatus.STARTED:
        colors =
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30";
        break;
      case CommissionStatus.FINISHED:
        colors =
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30";
        break;
      default:
        colors =
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  } else {
    switch (status) {
      case PaymentStatus.UNPAID:
        colors =
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30";
        break;
      case PaymentStatus.DEPOSIT:
        colors =
          "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30";
        break;
      case PaymentStatus.PAID:
        colors =
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30";
        break;
      default:
        colors =
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  }

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}
    >
      {status}
    </span>
  );
};