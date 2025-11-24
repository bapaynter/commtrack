# Next.js App Router Migration Plan

## 1. Project Structure

```
commtrack/
├── app/
│   ├── actions.ts           # Server Actions for data mutations
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main dashboard entry (Server Component)
│   └── globals.css          # Global styles
├── components/
│   ├── board/               # Kanban board specific components
│   │   ├── BoardView.tsx
│   │   └── KanbanColumn.tsx
│   ├── common/              # Shared UI components
│   │   ├── Modal.tsx
│   │   ├── StatCard.tsx
│   │   └── StatusBadge.tsx
│   ├── dashboard/           # Dashboard container and logic
│   │   ├── DashboardShell.tsx # Main client wrapper for state
│   │   └── StatsView.tsx
│   ├── forms/               # Forms
│   │   ├── CommissionForm.tsx
│   │   └── ImageManager.tsx
│   └── list/                # List view specific components
│       └── ListView.tsx
├── lib/
│   ├── db.ts                # Local JSON persistence logic
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Helper functions (currency, dates)
├── public/
│   └── uploads/             # Local image storage
└── data/
    └── commissions.json     # Local database file
```

## 2. Data Model

```typescript
// lib/types.ts

export enum CommissionStatus {
  REQUESTED = "Requested",
  STARTED = "Started",
  FINISHED = "Finished",
}

export enum PaymentStatus {
  UNPAID = "Unpaid",
  DEPOSIT = "Deposit",
  PAID = "Paid",
}

export interface CommissionImages {
  references: string[];
  drafts: string[];
  finals: string[];
}

export interface Commission {
  id: string;
  clientName: string;
  title: string;
  price: number;
  status: CommissionStatus;
  paymentStatus: PaymentStatus;
  description: string;
  images: CommissionImages;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
```

## 3. Data Persistence Strategy

We will use a local JSON file (`data/commissions.json`) as the database.

**`lib/db.ts`**:

- `readDb()`: Reads and parses the JSON file.
- `writeDb(data)`: Writes data back to the JSON file.

**`app/actions.ts`**:

- `fetchCommissions()`: Returns `Commission[]`.
- `persistCommission(data: Partial<Commission>)`: Handles both create (if no ID) and update. Returns the saved `Commission`.
- `deleteCommission(id: string)`: Removes the item.
- `uploadImage(formData: FormData)`:
  - Extracts file from `formData`.
  - Validates type (image/\*) and size.
  - Saves to `public/uploads/[timestamp]_[filename]`.
  - Returns the relative path string (e.g., `/uploads/123_file.jpg`).

## 4. Image Handling (Dual-Mode)

The `ImageManager` component will be updated to support both inputs.

- **External URL**: Text input field (existing logic).
- **Local Upload**: File input field.
  - `onChange` -> triggers `uploadImage` Server Action immediately.
  - On success -> receives path string -> adds to the list of images just like a URL.

## 5. Component Architecture & Refactoring

**Exclusions**:

- Remove `callGemini`.
- Remove `handleEnhanceDescription`.
- Remove `handleDraftMessage`.
- Remove `isEnhancing`, `isDrafting`, `draftedMessage` states.

**Component Breakdown**:

1.  **`DashboardShell` (Client Component)**:

    - Manages `view` state (board, list, stats).
    - Manages `filter` and `search` state.
    - Manages `isFormOpen` and `editingId`.
    - Receives initial `commissions` as props (from Server Component) but also uses `useOptimistic` or simple state sync after Server Actions.

2.  **`CommissionForm`**:

    - Receives `initialData` (optional) and `onClose`.
    - Uses `persistCommission` action on submit.
    - Uses `ImageManager` for image handling.

3.  **`ImageManager`**:
    - Props: `images: string[]`, `onAdd: (url: string) => void`, `onRemove: (index: number) => void`.
    - Internal state for URL input.
    - Internal handler for File input -> calls `uploadImage`.

## 6. Naming Conventions

- **Files**: PascalCase for Components (`CommissionForm.tsx`), camelCase for utilities (`db.ts`).
- **Functions**:
  - Data: `fetch...`, `persist...`, `delete...`
  - Handlers: `handleSave`, `handleUpload`
- **Variables**: `commissions`, `commission`, `isLoading`

## 7. Step-by-Step Implementation Plan

1.  **Setup**: Initialize Next.js project, install dependencies (`lucide-react`, `clsx`, `tailwind-merge`).
2.  **Core**: Create `lib/types.ts` and `lib/db.ts` (ensure `data/` dir exists).
3.  **Actions**: Implement `app/actions.ts` (CRUD + Upload).
4.  **Components - Shared**: Migrate `StatCard`, `StatusBadge`, `Modal` to `components/common/`.
5.  **Components - Forms**:
    - Rebuild `ImageManager` with upload logic.
    - Rebuild `CommissionForm` using `react-hook-form` (optional but recommended) or controlled inputs, integrating `persistCommission`.
6.  **Components - Views**:
    - Extract `KanbanColumn` and `BoardView`.
    - Extract `ListView`.
    - Extract `StatsView`.
7.  **Integration**:
    - Create `components/dashboard/DashboardShell.tsx` to orchestrate views and state.
    - Update `app/page.tsx` to fetch data server-side and pass to `DashboardShell`.
8.  **Cleanup**: Verify no Gemini code remains.
