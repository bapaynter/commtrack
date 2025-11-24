import React from "react";
import { LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
}) => {
  // Extract the base color name (e.g., "blue-500" -> "blue") to construct text/bg classes dynamically if needed,
  // but the original code passed full classes like "bg-blue-500 text-blue-600".
  // However, the original code did:
  // <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
  //   <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />
  // </div>
  // And passed `colorClass="bg-blue-500 text-blue-600"` which seems a bit mixed up in the original usage vs implementation.
  // Let's look at usage in baseapp.js:
  // colorClass="bg-blue-500 text-blue-600"
  // Implementation:
  // className={`p-3 rounded-full ${colorClass} bg-opacity-10`} -> "p-3 rounded-full bg-blue-500 text-blue-600 bg-opacity-10"
  // Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} -> "w-6 h-6 text-blue-500 text-blue-600" (replace only replaces first occurrence)

  // To make it cleaner in TS and Tailwind, I'll accept a base color or specific classes.
  // But to stick to the migration plan and existing logic, I'll try to replicate the visual result.
  // The original usage passed: "bg-blue-500 text-blue-600"
  // The container got: "bg-blue-500 text-blue-600 bg-opacity-10" -> This sets background to blue-500 with 10% opacity.
  // The icon got: "text-blue-500 text-blue-600" (if replace worked as intended for the first bg-).

  // Let's simplify. I'll accept `className` for the icon container and let the parent pass the colors.
  // Or better, just accept the color name like "blue" and generate the classes.
  // BUT, the prompt says "Implement... based on the design".
  // Let's stick to the props but maybe clean up the implementation.

  // Actually, looking at `baseapp.js` usage:
  // colorClass="bg-yellow-500 text-yellow-600"
  // Implementation:
  // <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
  // <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />

  // I will implement it to work with the strings provided in `baseapp.js` for compatibility,
  // but I'll use `twMerge` to handle class conflicts.

  // Wait, `colorClass.replace("bg-", "text-")` on "bg-yellow-500 text-yellow-600" results in "text-yellow-500 text-yellow-600".
  // That seems redundant but works.

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={cn("p-3 rounded-full bg-opacity-10", colorClass)}>
        <Icon
          className={cn("w-6 h-6", colorClass.replace("bg-", "text-"))}
        />
      </div>
    </div>
  );
};