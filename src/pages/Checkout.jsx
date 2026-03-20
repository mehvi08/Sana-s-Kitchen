import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchProfileByUserId } from '../api/profiles.js';
import { createOrder } from '../api/orders.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingProfile(true);
        setErr(null);
        if (!user) return;
        const p = await fetchProfileByUserId(user.$id);
        setProfile(p);
      } catch (e) {
        setErr(e?.message || 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, [user]);

  const billItems = useMemo(
    () =>
      items.map((i) => ({
        name: i.name,
        price: Number(i.price || 0),
        quantity: i.quantity,
        lineTotal: Number(i.price || 0) * i.quantity,
        menuItemId: i.id,
      })),
    [items],
  );

  const total = getTotal();

  const handleConfirm = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!profile) {
      setErr('Please complete your profile first.');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await createOrder({
        userId: user.$id,
        items: billItems.map((b) => ({
          menuItemId: b.menuItemId,
          name: b.name,
          price: b.price,
          quantity: b.quantity,
        })),
        totalAmount: total,
        status: 'pending',
        deliveryAddress: profile.address,
        mobile: profile.mobile,
      });
      clearCart();
      navigate('/orders');
    } catch (e) {
      setErr(e?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
          <div className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6 text-center">
            Your cart is empty.
            <div className="mt-4">
              <Link to="/">
                <Button>Browse Menu</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-serif font-bold text-brand-maroon mb-6">
          Final Bill & Confirmation
        </h1>

        {!user && (
          <div className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6">
            Please login to continue checkout.
          </div>
        )}

        {user && loadingProfile && (
          <div className="text-brand-maroon">Loading your profile…</div>
        )}

        {user && !loadingProfile && !profile && (
          <div className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6">
            <p className="font-bold">Profile not found.</p>
            <p className="text-sm text-brand-maroon/80 mt-1">
              Please fill your address and mobile in Profile.
            </p>
            <div className="mt-4">
              <Link to="/profile">
                <Button>Go to Profile</Button>
              </Link>
            </div>
          </div>
        )}

        {user && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/70 border-2 border-brand-maroon rounded-2xl p-6">
              <h2 className="text-xl font-serif font-bold text-brand-maroon mb-4">
                Order Items
              </h2>
              <div className="space-y-3">
                {billItems.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-brand-sand/40 rounded-xl p-3"
                  >
                    <div>
                      <p className="font-bold text-brand-maroon">{b.name}</p>
                      <p className="text-xs text-brand-maroon/70">
                        {b.quantity} × ₹{b.price.toFixed(0)}
                      </p>
                    </div>
                    <div className="font-extrabold text-brand-maroon">
                      ₹{b.lineTotal.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-brand-maroon/20 pt-4">
                <span className="text-lg font-bold text-brand-maroon">Total</span>
                <span className="text-2xl font-extrabold text-brand-maroon">
                  ₹{total.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6">
              <h2 className="text-xl font-serif font-bold text-brand-maroon mb-4">
                Delivery Details
              </h2>
              <div className="space-y-2 text-sm text-brand-maroon">
                <div>
                  <span className="font-bold">Name:</span>{' '}
                  {profile.fullname || user.name || user.email}
                </div>
                <div>
                  <span className="font-bold">Mobile:</span> {profile.mobile}
                </div>
                <div>
                  <span className="font-bold">Address:</span> {profile.address}
                </div>
              </div>

              <div className="mt-4">
                <Link to="/profile" className="text-sm font-bold underline">
                  Edit profile
                </Link>
              </div>

              {err && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-4">
                  {err}
                </p>
              )}

              <Button
                onClick={handleConfirm}
                isLoading={submitting}
                className="w-full mt-6 h-12 text-base"
              >
                Confirm & Place Order
              </Button>

              <Link to="/cart" className="block mt-3">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

