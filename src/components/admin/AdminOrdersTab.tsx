import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../lib/api';
import { formatUsd } from '../../lib/storeLogic';
import type { Order, OrderStatus, PaymentStatus } from '../../types/store';

interface AdminOrdersTabProps {
  orders: Order[];
  onChanged: () => Promise<void>;
}

const ORDER_STATUSES: OrderStatus[] = ['new', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'awaiting_verification', 'paid', 'failed'];

export function AdminOrdersTab({ orders, onChanged }: AdminOrdersTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.order_status === filterStatus);

  const handleUpdate = async (orderId: number, patch: { order_status?: OrderStatus; payment_status?: PaymentStatus }) => {
    try {
      setUpdatingId(orderId);
      const res = await api.admin.updateOrder(orderId, patch);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
      await onChanged();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#35170D]">Orders ({orders.length})</h2>
          <p className="text-xs text-[#5A524C]">
            Review incoming customer orders, verify EcoCash/bank payments, update fulfilment status, and export CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter orders by status"
            className="px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <a
            href="/api/admin/orders/export"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#35170D] hover:bg-[#F15A00] text-white text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center text-sm text-[#5A524C]">
          No orders match this status yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F7F6F3] text-xs font-semibold text-[#5A524C]">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {filtered.map((o) => {
                  const active = selectedOrder?.id === o.id;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`cursor-pointer transition-colors ${
                        active ? 'bg-[#FFF5E9]' : 'hover:bg-[#F7F6F3]'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#35170D]">{o.order_ref}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#35170D]">{o.customer_name}</p>
                        <p className="text-xs text-[#5A524C]">{o.city}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-[#35170D]">
                        {formatUsd(o.total_usd)}
                      </td>
                      <td className="py-3 px-4 text-xs capitalize text-[#35170D]">{o.order_status}</td>
                      <td className="py-3 px-4 text-xs capitalize text-[#5A524C]">
                        {o.payment_status.replace('_', ' ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            {!selectedOrder ? (
              <p className="text-sm text-[#5A524C]">Select an order row to inspect items and update status.</p>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-neutral-200 pb-3">
                  <div>
                    <p className="font-mono text-xs text-[#F15A00] font-bold">{selectedOrder.order_ref}</p>
                    <h3 className="font-display text-lg font-bold text-[#35170D]">{selectedOrder.customer_name}</h3>
                    <p className="text-xs text-[#5A524C]">
                      {selectedOrder.customer_phone} · {selectedOrder.customer_email}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#35170D] space-y-1">
                  <p>
                    <strong>Address:</strong> {selectedOrder.delivery_address}, {selectedOrder.city}
                  </p>
                  <p>
                    <strong>Delivery:</strong> {selectedOrder.delivery_option} ({formatUsd(selectedOrder.delivery_fee_usd)})
                  </p>
                  <p>
                    <strong>Method:</strong> {selectedOrder.payment_method.replace('_', ' ')}
                  </p>
                  {selectedOrder.delivery_instructions && (
                    <p>
                      <strong>Notes:</strong> {selectedOrder.delivery_instructions}
                    </p>
                  )}
                </div>

                <div className="border-t border-neutral-200 pt-3 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A524C]">Items</h4>
                  <ul className="space-y-1.5 text-xs">
                    {(selectedOrder.items || []).map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}× {item.product_name} {item.variant ? `(${item.variant})` : ''}
                        </span>
                        <span className="font-bold tabular-nums">{formatUsd(item.line_total_usd)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between pt-2 border-t border-neutral-100 text-sm font-bold text-[#35170D]">
                    <span>Order Total</span>
                    <span className="tabular-nums">{formatUsd(selectedOrder.total_usd)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
                  <div>
                    <label className="block text-xs font-semibold text-[#35170D] mb-1">Order Status</label>
                    <select
                      disabled={updatingId === selectedOrder.id}
                      value={selectedOrder.order_status}
                      onChange={(e) =>
                        handleUpdate(selectedOrder.id, { order_status: e.target.value as OrderStatus })
                      }
                      className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#35170D] mb-1">Payment Status</label>
                    <select
                      disabled={updatingId === selectedOrder.id}
                      value={selectedOrder.payment_status}
                      onChange={(e) =>
                        handleUpdate(selectedOrder.id, { payment_status: e.target.value as PaymentStatus })
                      }
                      className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
