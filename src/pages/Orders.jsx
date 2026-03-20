import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserOrders } from '../api/orders.js';

function parseItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try {
    return JSON.parse(items);
  } catch {
    return [];
  }
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        if (!user) {
          setOrders([]);
          return;
        }
        const res = await fetchUserOrders(user.$id);
        // newest first
        setOrders([...res].reverse());
      } catch (e) {
        setErr(e?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-serif font-bold text-brand-maroon mb-6">
          Your Orders
        </h1>

        {!user && (
          <div className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6">
            Please login to see your orders.
          </div>
        )}

        {user && loading && <div className="text-brand-maroon">Loading...</div>}
        {user && err && (
          <div className="text-red-600 bg-red-50 p-4 rounded-xl">{err}</div>
        )}

        {user && !loading && !err && orders.length === 0 && (
          <div className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6">
            No orders yet.
          </div>
        )}

        {user && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => {
              const items = parseItems(o.items);
              return (
                <div
                  key={o.$id}
                  className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-xs text-brand-maroon/60 font-mono">
                        Order #{(o.orderId || o.$id).slice(0, 8)}
                      </p>
                      <p className="text-sm text-brand-maroon/80">
                        Address: {o.deliveryAddress || 'N/A'} | Phone:{' '}
                        {o.mobile || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-brand-gold/60 text-brand-maroon text-xs font-bold">
                        {o.status}
                      </span>
                      <span className="text-lg font-extrabold text-brand-maroon">
                        ₹{Number(o.totalAmount || 0).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 bg-brand-sand/40 rounded-xl p-4">
                    <ul className="text-sm text-brand-maroon space-y-1">
                      {items.map((it, idx) => (
                        <li key={idx} className="flex justify-between gap-4">
                          <span>
                            <span className="font-bold">{it.quantity}x</span>{' '}
                            {it.name}
                          </span>
                          <span className="font-bold">
                            ₹{Number(it.price || 0).toFixed(0)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

