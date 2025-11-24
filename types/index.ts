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
