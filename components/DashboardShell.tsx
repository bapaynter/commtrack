"use client";

import React, { useState, useMemo } from "react";
import { Commission, CommissionStatus, PaymentStatus } from "@/types";
import {
  Palette,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { StatCard } from "./ui/StatCard";
import { Modal } from "./ui/Modal";
import { CommissionForm } from "./CommissionForm";
import { CommissionBoard } from "./CommissionBoard";
import { CommissionList } from "./CommissionList";
import { StatsDashboard } from "./StatsDashboard";
import { formatCurrency } from "@/lib/utils";
import { LoginButton } from "./LoginButton";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardShellProps {
  initialCommissions: Commission[];
  isAuthenticated: boolean;
}

export default function DashboardShell({
  initialCommissions,
  isAuthenticated,
}: DashboardShellProps) {
  // In a real app with optimistic updates, we might use useOptimistic here.
  // For now, we'll rely on the server action revalidating the path and passing fresh data.
  // However, since this is a client component receiving props, it will update when the parent server component re-renders.
  const commissions = initialCommissions;

  const [view, setView] = useState<"board" | "list" | "stats">("board");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(
    null
  );
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const openForm = (commission: Commission | null = null) => {
    setEditingCommission(commission);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCommission(null);
  };

  // --- Stats Calculation ---
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

  // --- Filtered Data ---
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      const matchesSearch = (c.clientName + c.title)
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = filter === "All" || c.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [commissions, search, filter]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Palette className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
            ArtTrack
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg transition-colors">
          <button
            onClick={() => setView("board")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === "board"
                ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === "list"
                ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            List
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setView("stats")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "stats"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Stats
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={() => openForm()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm shadow-indigo-200 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Commission
            </button>
          )}
          <LoginButton isAuthenticated={isAuthenticated} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0 transition-colors">
          {isAuthenticated && (
            <>
              <StatCard
                title="Pending Revenue"
                value={formatCurrency(stats.pending)}
                icon={DollarSign}
                colorClass="bg-yellow-500 text-yellow-600"
              />
              <StatCard
                title="Total Earned"
                value={formatCurrency(stats.paid)}
                icon={CheckCircle}
                colorClass="bg-emerald-500 text-emerald-600"
              />
            </>
          )}
          <StatCard
            title="Active Jobs"
            value={stats.active}
            icon={Palette}
            colorClass="bg-blue-500 text-blue-600"
          />
          <StatCard
            title="Requests"
            value={stats.requested}
            icon={Briefcase}
            colorClass="bg-gray-500 text-gray-600"
          />
        </div>

        {/* View Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search client or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>
            {view === "list" && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {Object.values(CommissionStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {view === "board" && (
            <CommissionBoard
              commissions={filteredCommissions}
              onEdit={openForm}
              isAuthenticated={isAuthenticated}
            />
          )}

          {view === "list" && (
            <CommissionList
              commissions={filteredCommissions}
              onEdit={openForm}
              isAuthenticated={isAuthenticated}
            />
          )}

          {view === "stats" && isAuthenticated && (
            <StatsDashboard commissions={commissions} />
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingCommission ? "Edit Commission" : "New Commission"}
      >
        <CommissionForm
          initialData={editingCommission}
          onClose={closeForm}
        />
      </Modal>
    </div>
  );
}