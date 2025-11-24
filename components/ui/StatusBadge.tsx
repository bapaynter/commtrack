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
        colors = "bg-gray-100 text-gray-700 border-gray-200";
        break;
      case CommissionStatus.STARTED:
        colors = "bg-blue-50 text-blue-700 border-blue-200";
        break;
      case CommissionStatus.FINISHED:
        colors = "bg-green-50 text-green-700 border-green-200";
        break;
      default:
        colors = "bg-gray-100 text-gray-600";
    }
  } else {
    switch (status) {
      case PaymentStatus.UNPAID:
        colors = "bg-red-50 text-red-700 border-red-200";
        break;
      case PaymentStatus.DEPOSIT:
        colors = "bg-yellow-50 text-yellow-700 border-yellow-200";
        break;
      case PaymentStatus.PAID:
        colors = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      default:
        colors = "bg-gray-100 text-gray-600";
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