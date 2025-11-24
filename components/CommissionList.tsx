import React from "react";
import { Commission } from "@/types";
import { StatusBadge } from "./ui/StatusBadge";
import { Edit2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CommissionListProps {
  commissions: Commission[];
  onEdit: (commission: Commission) => void;
  isAuthenticated: boolean;
}

export const CommissionList: React.FC<CommissionListProps> = ({
  commissions,
  onEdit,
  isAuthenticated,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Payment</th>
            {isAuthenticated && <th className="px-6 py-4 text-right">Price</th>}
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {commissions.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {item.title}
              </td>
              <td className="px-6 py-4 text-gray-600">{item.clientName}</td>
              <td className="px-6 py-4">
                <StatusBadge status={item.status} type="work" />
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={item.paymentStatus} type="payment" />
              </td>
              {isAuthenticated && (
                <td className="px-6 py-4 text-right font-mono text-gray-700">
                  {formatCurrency(item.price)}
                </td>
              )}
              <td className="px-6 py-4 text-right">
                {isAuthenticated && (
                  <button
                    onClick={() => onEdit(item)}
                    className="text-gray-400 hover:text-indigo-600 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {commissions.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No commissions found matching your search.
        </div>
      )}
    </div>
  );
};