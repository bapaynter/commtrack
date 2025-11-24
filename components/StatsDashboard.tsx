import React, { useMemo } from "react";
import { Commission, CommissionStatus, PaymentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface StatsDashboardProps {
  commissions: Commission[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  commissions,
}) => {
  const stats = useMemo(() => {
    const total = commissions.reduce((acc, c) => acc + (c.price || 0), 0);
    const paid = commissions
      .filter((c) => c.paymentStatus === PaymentStatus.PAID)
      .reduce((acc, c) => acc + (c.price || 0), 0);
    const pending = total - paid;
    const active = commissions.filter(
      (c) => c.status === CommissionStatus.STARTED
    ).length;
    const requested = commissions.filter(
      (c) => c.status === CommissionStatus.REQUESTED
    ).length;
    const finished = commissions.filter(
      (c) => c.status === CommissionStatus.FINISHED
    ).length;

    return { total, paid, pending, active, requested, finished };
  }, [commissions]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          Financial Breakdown
        </h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Collection Rate</span>
              <span className="font-bold text-gray-900">
                {Math.round((stats.paid / (stats.total || 1)) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${(stats.paid / (stats.total || 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-600 font-semibold uppercase">
                Paid
              </p>
              <p className="text-2xl font-bold text-emerald-800">
                {formatCurrency(stats.paid)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-600 font-semibold uppercase">
                Unpaid / Pending
              </p>
              <p className="text-2xl font-bold text-yellow-800">
                {formatCurrency(stats.pending)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          Workload Distribution
        </h2>

        {/* Chart Area */}
        <div className="flex items-end gap-4 h-48 border-b border-gray-200 pb-px">
          {/* Finished Bar */}
          <div className="flex-1 flex justify-center items-end h-full group relative">
            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg pointer-events-none whitespace-nowrap z-10 flex flex-col items-center">
              <span className="font-bold">{stats.finished} Finished</span>
              <span className="text-gray-300 text-[10px]">
                {Math.round((stats.finished / (commissions.length || 1)) * 100)}%
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
            <div
              style={{
                height: `${
                  (stats.finished / (commissions.length || 1)) * 100
                }%`,
              }}
              className="w-full max-w-[64px] bg-blue-500 rounded-t-lg min-h-[4px] transition-all duration-500 hover:bg-blue-600"
            ></div>
          </div>

          {/* Active Bar */}
          <div className="flex-1 flex justify-center items-end h-full group relative">
            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg pointer-events-none whitespace-nowrap z-10 flex flex-col items-center">
              <span className="font-bold">{stats.active} Active</span>
              <span className="text-gray-300 text-[10px]">
                {Math.round((stats.active / (commissions.length || 1)) * 100)}%
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
            <div
              style={{
                height: `${(stats.active / (commissions.length || 1)) * 100}%`,
              }}
              className="w-full max-w-[64px] bg-indigo-500 rounded-t-lg min-h-[4px] transition-all duration-500 hover:bg-indigo-600"
            ></div>
          </div>

          {/* Requested Bar */}
          <div className="flex-1 flex justify-center items-end h-full group relative">
            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg pointer-events-none whitespace-nowrap z-10 flex flex-col items-center">
              <span className="font-bold">{stats.requested} Requested</span>
              <span className="text-gray-300 text-[10px]">
                {Math.round(
                  (stats.requested / (commissions.length || 1)) * 100
                )}
                %
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
            <div
              style={{
                height: `${
                  (stats.requested / (commissions.length || 1)) * 100
                }%`,
              }}
              className="w-full max-w-[64px] bg-gray-300 rounded-t-lg min-h-[4px] transition-all duration-500 hover:bg-gray-400"
            ></div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex gap-4 mt-3">
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-gray-500">Finished</span>
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-gray-500">Active</span>
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-gray-500">Requested</span>
          </div>
        </div>
      </div>
    </div>
  );
};