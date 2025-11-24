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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm transition-colors">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Payment</th>
            {isAuthenticated && <th className="px-6 py-4 text-right">Price</th>}
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {commissions.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                {item.title}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                {item.clientName}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={item.status} type="work" />
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={item.paymentStatus} type="payment" />
              </td>
              {isAuthenticated && (
                <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-300">
                  {formatCurrency(item.price)}
                </td>
              )}
              <td className="px-6 py-4 text-right">
                {isAuthenticated && (
                  <button
                    onClick={() => onEdit(item)}
                    className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
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
        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
          No commissions found matching your search.
        </div>
      )}
    </div>
  );
};