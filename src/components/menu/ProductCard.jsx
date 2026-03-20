import React from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { getMenuImageUrl } from '../../api/storage.js';

function getImageSrc(item) {
  return (
    (item.imageFileId ? getMenuImageUrl(item.imageFileId) : item.imageUrl) ||
    'https://placehold.co/600x600/FFF/4A2511?text=Food'
  );
}

export function ProductCard({ item }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addItem, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.id === item.$id);
  const quantity = cartItem?.quantity || 0;

  const add = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    addItem({
      id: item.$id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: getImageSrc(item),
    });
  };

  const sub = (e) => {
    e.stopPropagation();
    updateQuantity(item.$id, quantity - 1);
  };

  return (
    <div
      className="group bg-brand-sand/60 border-2 border-brand-maroon/15 hover:border-brand-maroon rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/item/${item.$id}`)}
    >
      <div className="flex gap-5 p-5 md:p-7">
        {/* Left image */}
        <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-2xl overflow-hidden bg-white/70 border border-brand-maroon/10 shadow-sm">
          <img
            src={getImageSrc(item)}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-1">
              <h3 className="font-serif font-black tracking-tight text-brand-maroon text-lg md:text-xl leading-snug">
                {item.name}
              </h3>
              <p className="text-sm md:text-[14.5px] text-brand-maroon/70 mt-2 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="shrink-0">
              <div className="rounded-2xl bg-white/80 border border-brand-maroon/15 shadow-sm px-3 py-2 text-right">
                <div className="text-[11px] md:text-xs font-extrabold tracking-wide uppercase text-brand-maroon/70 leading-none">
                  Cost
                </div>
                <div className="text-base md:text-lg font-extrabold text-brand-maroon leading-tight mt-1">
                  ₹{Number(item.price || 0).toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-5 flex items-center justify-end gap-3">
            {quantity > 0 ? (
              <div
                className="inline-flex items-center gap-2 bg-white/80 rounded-full border border-brand-maroon/20 px-2 py-1 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={sub}
                  className="w-9 h-9 rounded-full bg-brand-maroon text-brand-sand flex items-center justify-center hover:bg-brand-maroon/90 active:scale-95 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center px-1">
                  <div className="text-[11px] text-brand-maroon/70 font-bold leading-tight">
                    In cart
                  </div>
                  <div className="text-lg font-extrabold text-brand-maroon leading-none">
                    {quantity}
                  </div>
                </div>
                <button
                  onClick={add}
                  className="w-9 h-9 rounded-full bg-brand-maroon text-brand-sand flex items-center justify-center hover:bg-brand-maroon/90 active:scale-95 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={add}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-maroon text-brand-sand font-extrabold px-5 py-2.5 hover:bg-brand-maroon/90 active:scale-[0.99] transition shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

