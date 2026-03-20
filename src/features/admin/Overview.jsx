import React, { useMemo, useEffect, useState } from 'react';
import { fetchAllOrders } from '../../api/orders.js';
import { fetchMenuItems } from '../../api/menu.js';
import { ShoppingBag, DollarSign, Users, Package } from 'lucide-react';

export function Overview() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [o, m] = await Promise.all([fetchAllOrders(), fetchMenuItems()]);
        setOrders(o);
        setMenu(m);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    if (!orders || !menu) return null;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );
    const uniqueCustomers = new Set(orders.map((o) => o.userId)).size;
    const activeItems = menu.filter((m) => m.isAvailable).length;

    return { totalOrders, totalRevenue, uniqueCustomers, activeItems };
  }, [orders, menu]);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-brand-maroon/20 rounded w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-brand-sand/50 h-32 rounded-2xl border-2 border-brand-maroon/20"
            />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(0)}`,
      icon: DollarSign,
    },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag },
    { title: 'Unique Customers', value: stats.uniqueCustomers, icon: Users },
    { title: 'Active Menu Items', value: stats.activeItems, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-maroon">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border-2 border-brand-maroon relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-brand-gold/30">
                <Icon className="w-16 h-16" />
              </div>
              <p className="text-sm font-medium text-brand-maroon/70 mb-1">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold text-brand-maroon relative z-10">
                {stat.value}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

