import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { useNavigate } from 'react-router-dom';

// UI-only: matches original side panel look.
// Checkout flow now goes to /checkout for final bill confirmation.
export function CartModal({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-brand-sand shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 bg-brand-maroon text-brand-sand">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <h2 className="text-2xl font-serif font-bold">Your Order</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-brand-maroon/60">
                  <ShoppingBag className="w-16 h-16 opacity-30" />
                  <p className="text-xl font-semibold">Your order is empty</p>
                  <p className="text-sm">Add some delicious items from the menu!</p>
                  <Button className="mt-4" onClick={handleClose}>
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-brand-maroon/10 shadow-sm"
                    >
                      <img
                        src={
                          item.image_url ||
                          'https://placehold.co/80x80/FFF/4A2511?text=Food'
                        }
                        alt={item.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-brand-gold shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-maroon text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-brand-maroon/60">
                          {item.description}
                        </p>
                        <p className="text-sm font-bold text-brand-maroon mt-1">
                          ₹{(Number(item.price) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex items-center gap-1 bg-brand-sand rounded-full border border-brand-maroon/30 shadow-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 text-brand-maroon hover:bg-brand-gold/30 rounded-l-full"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-brand-maroon text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 text-brand-maroon hover:bg-brand-gold/30 rounded-r-full"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t-2 border-brand-maroon/20 bg-brand-sand/90">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-brand-maroon">
                    Total
                  </span>
                  <span className="text-2xl font-extrabold text-brand-maroon">
                    ₹{getTotal().toFixed(0)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full h-14 text-lg rounded-full shadow-lg"
                >
                  {user ? '🛍️ Checkout' : 'Login to Checkout'}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

