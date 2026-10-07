export function adminPath(suffix: string) {
  return `/api/v1/admin${suffix}`;
}

export type SeriesPoint = { label: string; actual: number; projected: number };

export type BoardOrder = {
  id: string;
  client: string;
  handle: string;
  task: string;
  taskBn: string;
  note: string;
  openedAt: string | Date;
  pricePaise: number;
  status: string;
  lane: string;
};

export type Dashboard = {
  shops: { count: number; previous: number; delta: number };
  orders: { count: number; previous: number; delta: number };
  experts: { verified: number; pending: number };
  revenue: { monthPaise: number; previousPaise: number; delta: number | null };
  completion: { rate: number; closed: number; total: number };
  payouts: { paid: number; pending: number; waiting: number };
  signals: { pendingExperts: number; openDisputes: number; waitingPayouts: number; revenueDelta: number | null };
  series: SeriesPoint[];
  statuses: { status: string; count: number }[];
  recentOrders: BoardOrder[];
  recharge?: { enabled: boolean };
};

export const EMPTY_DASHBOARD: Dashboard = {
  shops: { count: 0, previous: 0, delta: 0 },
  orders: { count: 0, previous: 0, delta: 0 },
  experts: { verified: 0, pending: 0 },
  revenue: { monthPaise: 0, previousPaise: 0, delta: null },
  completion: { rate: 0, closed: 0, total: 0 },
  payouts: { paid: 0, pending: 0, waiting: 0 },
  signals: { pendingExperts: 0, openDisputes: 0, waitingPayouts: 0, revenueDelta: null },
  series: [],
  statuses: [],
  recentOrders: [],
  recharge: { enabled: false },
};
