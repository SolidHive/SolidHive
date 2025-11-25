export interface EventPricing {
  id: string;
  title: string;
  description?: string;
  amount: number;
  maxCapacity?: number;
  availableCapacity?: number | null;
}
