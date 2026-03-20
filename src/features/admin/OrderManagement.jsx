import React, { useEffect, useState } from 'react';
import { fetchAllOrders, updateOrderStatus } from '../../api/orders.js';

// Match your Appwrite enum options:
// (pending, confirmed, shipped, delivered, cancelled)
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'];

export function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await fetchAllOrders();
      setOrders(all);
      setLoading(false);
    }
    load();
  }, []);

  const handleStatusChange = async (orderId, currentStatus, direction) => {
    const currentIndex = STATUSES.indexOf(currentStatus);
    const nextStatus = STATUSES[currentIndex + direction];
    if (!nextStatus) return;
    await updateOrderStatus(orderId, nextStatus);
    setOrders((prev) =>
      prev.map((o) => (o.$id === orderId ? { ...o, status: nextStatus } : o)),
    );
  };

  if (loading) {
    return <div className="text-brand-maroon">Loading orders...</div>;
  }

  const columns = STATUSES.map((status) => ({
    title: status,
    items: orders.filter((o) => o.status === status),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-maroon">
        Order Management
      </h1>

      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {columns.map((column) => (
          <div
            key={column.title}
            className="bg-white/50 backdrop-blur rounded-2xl border-2 border-brand-maroon shadow-sm p-4 min-w-[260px] flex-shrink-0"
          >
            <div className="flex justify-between items-center mb-4 border-b border-brand-maroon/20 pb-2">
              <h2 className="font-bold text-brand-maroon text-lg">
                {column.title}
              </h2>
              <span className="bg-brand-maroon text-brand-sand rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {column.items.length}
              </span>
            </div>

            <div className="space-y-4">
              {column.items.map((order) => (
                <div
                  key={order.$id}
                  className="bg-white border text-sm border-brand-maroon/20 rounded-xl p-4 shadow-sm"
                >
                  <div className="mb-2">
                    <span className="font-mono text-xs text-brand-maroon/50 block">
                      #{order.$id.slice(0, 6)}
                    </span>
                    <span className="text-xs text-brand-maroon/70 block">
                      {order.deliveryAddress || 'Pickup'}
                    </span>
                  </div>

                  <div className="bg-brand-sand/30 p-2 rounded-lg mb-3">
                    <ul className="text-xs text-brand-maroon space-y-1">
                      {(Array.isArray(order.items)
                        ? order.items
                        : (() => {
                            try {
                              return JSON.parse(order.items || '[]');
                            } catch {
                              return [];
                            }
                          })()
                      )?.map((it, idx) => (
                        <li key={idx}>
                          <span className="font-bold">{it.quantity}x</span>{' '}
                          {it.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-brand-maroon">
                      ₹{Number(order.totalAmount || 0).toFixed(0)}
                    </span>

                    <div className="flex space-x-1">
                      {column.title !== 'pending' && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.$id, column.title, -1)
                          }
                          className="bg-brand-gold text-brand-maroon hover:bg-brand-gold/80 px-2 py-1 rounded text-xs font-medium"
                        >
                          {'<'}
                        </button>
                      )}

                      {column.title !== 'completed' && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.$id, column.title, 1)
                          }
                          className="bg-brand-maroon text-brand-sand hover:bg-brand-maroon/90 px-2 py-1 rounded text-xs font-medium"
                        >
                          Next &gt;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {column.items.length === 0 && (
                <div className="p-6 text-center border-2 border-dashed border-brand-maroon/20 rounded-xl text-brand-maroon/40 text-sm font-medium">
                  No orders
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

