import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';


export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!user) navigate('/login');
    else navigate('/checkout');
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-serif text-brand-maroon">
              Order Placed!
            </h1>
            <p className="text-brand-maroon/80">
              Thank you for ordering. Your food is being prepared.
            </p>
            <Link to="/">
              <Button>Return to Menu</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-serif text-brand-maroon mb-8">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brand-maroon/70 mb-4">Your cart is empty.</p>
            <Link to="/">
              <Button variant="outline">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/50 rounded-2xl p-4 md:p-8 border-2 border-brand-maroon shadow-sm">
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-brand-maroon/20 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-full object-cover shadow border border-brand-maroon/20"
                    />
                    <div>
                      <h3 className="font-semibold text-brand-maroon">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-brand-maroon/70">
                        ₹{Number(item.price).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-brand-sand rounded-full border border-brand-maroon/30 shadow-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 text-brand-maroon hover:bg-brand-gold/30 rounded-l-full"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-brand-maroon text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 text-brand-maroon hover:bg-brand-gold/30 rounded-r-full"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 flex flex-col items-end border-t-2 border-brand-maroon w-full">
              <div className="flex justify-between w-full md:w-64 mb-6">
                <span className="text-lg font-bold text-brand-maroon">
                  Total:
                </span>
                <span className="text-lg font-bold text-brand-maroon">
                  ₹{getTotal().toFixed(0)}
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-600 mb-4 w-full text-right">
                  {error}
                </p>
              )}

              <Button
                onClick={handleCheckout}
                isLoading={isSubmitting}
                className="w-full md:w-64 py-6 text-lg"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

