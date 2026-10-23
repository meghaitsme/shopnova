import { useEffect, useMemo, useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

const STORAGE_KEY = 'admin_orders_v1';
const LOG_PREFIX = '[Orders]';
const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const log = {
  info:  (...args: unknown[]) => console.info(LOG_PREFIX, ...args),
  warn:  (...args: unknown[]) => console.warn(LOG_PREFIX, ...args),
  error: (...args: unknown[]) => console.error(LOG_PREFIX, ...args),
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  if (!/^[+\d][\d\s\-()]{6,}$/.test(phone.trim())) return false;
  return phone.replace(/\D/g, '').length >= 7;
}

function validateOrder(o: Order): string[] {
  const errors: string[] = [];
  if (!o.id?.trim())                              errors.push('Missing order ID');
  if (!o.customerName?.trim())                    errors.push(`[${o.id}] Missing customer name`);
  if (!isValidEmail(o.customerEmail ?? ''))       errors.push(`[${o.id}] Invalid email: "${o.customerEmail}"`);
  if (!isValidPhone(o.customerPhone ?? ''))       errors.push(`[${o.id}] Invalid phone: "${o.customerPhone}"`);
  if (!Array.isArray(o.items) || o.items.length === 0) errors.push(`[${o.id}] No items`);
  if (typeof o.total !== 'number' || !isFinite(o.total) || o.total < 0)
                                                  errors.push(`[${o.id}] Invalid total: ${o.total}`);
  if (!ALL_STATUSES.includes(o.status))           errors.push(`[${o.id}] Invalid status: "${o.status}"`);
  if (isNaN(Date.parse(o.createdAt)))             errors.push(`[${o.id}] Invalid createdAt: "${o.createdAt}"`);
  return errors;
}

function sanitizeOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== 'object') {
    log.warn('Dropping non-object order:', raw);
    return null;
  }
  const r = raw as Record<string, unknown>;
  const items = Array.isArray(r.items)
    ? (r.items as unknown[])
        .map((it): OrderItem | null => {
          if (!it || typeof it !== 'object') return null;
          const i = it as Record<string, unknown>;
          const price = Number(i.price);
          const quantity = Number(i.quantity);
          if (!i.productId || !i.name || !isFinite(price) || !isFinite(quantity)) {
            log.warn('Dropping malformed item:', it);
            return null;
          }
          return {
            productId: String(i.productId),
            name: String(i.name),
            price,
            quantity,
          };
        })
        .filter((x): x is OrderItem => x !== null)
    : [];

  const status = String(r.status ?? 'pending') as OrderStatus;

  return {
    id: String(r.id ?? ''),
    customerName: String(r.customerName ?? ''),
    customerEmail: String(r.customerEmail ?? ''),
    customerPhone: String(r.customerPhone ?? ''),
    items,
    total: Number(r.total ?? 0),
    status: ALL_STATUSES.includes(status) ? status : 'pending',
    createdAt: String(r.createdAt ?? new Date().toISOString()),
    notes: r.notes ? String(r.notes) : undefined,
  };
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

// --- localStorage persistence ----------------------------------------------

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      log.info('No orders in storage; seeding demo data.');
      const seed = createSeedOrders();
      writeOrders(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      log.warn('Storage data is not an array; resetting.');
      return [];
    }
    const result: Order[] = [];
    for (const item of parsed) {
      const o = sanitizeOrder(item);
      if (o) result.push(o);
    }
    log.info(`Loaded ${result.length} order(s) from storage.`);
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    log.error('Failed to read orders from storage:', msg);
    return [];
  }
}

function writeOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    log.info(`Persisted ${orders.length} order(s) to storage.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    log.error('Failed to persist orders:', msg);
  }
}

function createSeedOrders(): Order[] {
  const now = Date.now();
  const iso = (offsetDays: number) => new Date(now - offsetDays * 86400000).toISOString();
  return [
    {
      id: 'ORD-1001',
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      customerPhone: '+1 555 010 1234',
      items: [
        { productId: 'p-1', name: 'Wireless Headphones', price: 89.99, quantity: 1 },
        { productId: 'p-2', name: 'USB-C Cable', price: 12.5, quantity: 2 },
      ],
      total: 114.99,
      status: 'delivered',
      createdAt: iso(10),
      notes: 'Left at front door.',
    },
    {
      id: 'ORD-1002',
      customerName: 'Bob Smith',
      customerEmail: 'bob.smith@example.com',
      customerPhone: '+1 555 010 5678',
      items: [
        { productId: 'p-3', name: 'Mechanical Keyboard', price: 129.0, quantity: 1 },
      ],
      total: 129.0,
      status: 'shipped',
      createdAt: iso(3),
    },
    {
      id: 'ORD-1003',
      customerName: 'Carol Davis',
      customerEmail: 'carol@example.com',
      customerPhone: '+44 20 7946 0958',
      items: [
        { productId: 'p-4', name: 'Laptop Stand', price: 45.0, quantity: 1 },
        { productId: 'p-5', name: 'Mouse Pad', price: 15.0, quantity: 1 },
      ],
      total: 60.0,
      status: 'pending',
      createdAt: iso(1),
    },
    {
      id: 'ORD-1004',
      customerName: 'Daniel Lee',
      customerEmail: 'dan.lee@example.com',
      customerPhone: '+1 555 010 9999',
      items: [
        { productId: 'p-6', name: 'Monitor 27"', price: 299.99, quantity: 1 },
      ],
      total: 299.99,
      status: 'confirmed',
      createdAt: iso(0),
    },
  ];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Orders() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy]       = useState<'createdAt' | 'total' | 'customerName'>('createdAt');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    try {
      const loaded = readOrders();
      const errs: string[] = [];
      for (const o of loaded) {
        const v = validateOrder(o);
        if (v.length) {
          errs.push(...v);
          log.warn('Order failed validation:', o.id, v);
        }
      }
      setValidationErrors(errs);
      setOrders(loaded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      log.error('Failed to load orders:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ─── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'total')             cmp = a.total - b.total;
      else if (sortBy === 'customerName') cmp = a.customerName.localeCompare(b.customerName);
      else                                cmp = Date.parse(a.createdAt) - Date.parse(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [orders, search, statusFilter, sortBy, sortDir]);

  const stats = useMemo(() => {
    const total = orders.length;
    const byStatus: Record<OrderStatus, number> = {
      pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0,
    };
    let revenue = 0;
    for (const o of orders) {
      byStatus[o.status]++;
      if (o.status !== 'cancelled') revenue += o.total;
    }
    return { total, byStatus, revenue };
  }, [orders]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  function updateStatus(orderId: string, next: OrderStatus) {
    const current = orders.find((o) => o.id === orderId);
    if (!current) {
      log.warn('updateStatus: order not found', orderId);
      return;
    }
    if (current.status === next) return;

    setUpdatingId(orderId);
    log.info(`Updating status for ${orderId}: ${current.status} → ${next}`);

    try {
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, status: next } : o,
      );
      writeOrders(updated);
      setOrders(updated);
      log.info(`Status updated for ${orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      log.error(`Failed to update status for ${orderId}:`, msg);
      alert(`Could not update order ${orderId}: ${msg}`);
    } finally {
      setUpdatingId(null);
    }
  }

  function deleteOrder(orderId: string) {
    if (!window.confirm(`Delete order ${orderId}? This cannot be undone.`)) return;

    setDeletingId(orderId);
    log.info(`Deleting order ${orderId}`);

    try {
      const updated = orders.filter((o) => o.id !== orderId);
      writeOrders(updated);
      setOrders(updated);
      log.info(`Order ${orderId} deleted`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      log.error(`Failed to delete order ${orderId}:`, msg);
      alert(`Could not delete order ${orderId}: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  }

  function resetToSeed() {
    if (!window.confirm('Reset all orders to demo data?')) return;
    log.info('Resetting orders to seed data.');
    const seed = createSeedOrders();
    writeOrders(seed);
    setOrders(seed);
    setValidationErrors([]);
  }

  // ─── Render: loading / error ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading orders…</div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Failed to load orders.</strong>
          <div className="text-sm mt-1">{error}</div>
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render: main ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Refresh
          </button>
          <button
            onClick={resetToSeed}
            className="px-4 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 rounded"
          >
            Reset demo
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <strong>{validationErrors.length} validation issue(s) found:</strong>
          <ul className="list-disc ml-5 mt-1 max-h-32 overflow-y-auto">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Total"     value={stats.total} />
        <StatCard label="Revenue"   value={formatCurrency(stats.revenue)} />
        <StatCard label="Pending"   value={stats.byStatus.pending}   tone="yellow" />
        <StatCard label="Shipped"   value={stats.byStatus.shipped}   tone="purple" />
        <StatCard label="Delivered" value={stats.byStatus.delivered} tone="green" />
        <StatCard label="Cancelled" value={stats.byStatus.cancelled} tone="red" />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search by ID, name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border rounded"
        >
          <option value="createdAt">Sort: Date</option>
          <option value="total">Sort: Total</option>
          <option value="customerName">Sort: Customer</option>
        </select>
        <button
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          className="px-3 py-2 border rounded"
          title="Toggle sort direction"
        >
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
        <span className="text-sm text-gray-500 ml-auto">
          Showing {filtered.length} of {orders.length}
        </span>
      </div>

      {orders.length === 0 && (
        <div className="p-10 text-center text-gray-500 border rounded">
          No orders yet.
        </div>
      )}

      {orders.length > 0 && filtered.length === 0 && (
        <div className="p-6 text-center text-gray-500 border rounded">
          No orders match your filters.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isUpdating = updatingId === o.id;
                const isDeleting = deletingId === o.id;
                const isExpanded = expandedId === o.id;
                return (
                  <FragmentRow
                    key={o.id}
                    order={o}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedId(isExpanded ? null : o.id)}
                    onStatusChange={(next) => updateStatus(o.id, next)}
                    onDelete={() => deleteOrder(o.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  tone = 'gray',
}: {
  label: string;
  value: string | number;
  tone?: 'gray' | 'yellow' | 'purple' | 'green' | 'red';
}) {
  const tones: Record<string, string> = {
    gray:   'bg-gray-50   border-gray-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    green:  'bg-green-50  border-green-200',
    red:    'bg-red-50    border-red-200',
  };
  return (
    <div className={`p-3 rounded border ${tones[tone]}`}>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function FragmentRow({
  order,
  isUpdating,
  isDeleting,
  isExpanded,
  onToggle,
  onStatusChange,
  onDelete,
}: {
  order: Order;
  isUpdating: boolean;
  isDeleting: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (next: OrderStatus) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr className="border-t align-top">
        <td className="px-3 py-2 font-mono text-xs">{order.id}</td>
        <td className="px-3 py-2">{order.customerName || '—'}</td>
        <td className="px-3 py-2">
          <div>{order.customerEmail || '—'}</div>
          <div className="text-gray-500 text-xs">{order.customerPhone}</div>
        </td>
        <td className="px-3 py-2 text-right">{formatCurrency(order.total)}</td>
        <td className="px-3 py-2">
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
            className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[order.status]}`}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {isUpdating && (
            <span className="ml-2 text-xs text-gray-500">saving…</span>
          )}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">{formatDate(order.createdAt)}</td>
        <td className="px-3 py-2">
          <div className="flex gap-2">
            <button
              onClick={onToggle}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {isExpanded ? 'Hide' : 'View'}
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              {isDeleting ? '…' : 'Delete'}
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50 border-t">
          <td colSpan={7} className="px-3 py-3">
            <div className="text-sm">
              <strong>Items:</strong>
              <ul className="list-disc ml-5 mt-1">
                {order.items.map((it, idx) => (
                  <li key={idx}>
                    {it.name} × {it.quantity} — {formatCurrency(it.price * it.quantity)}
                  </li>
                ))}
              </ul>
              {order.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}