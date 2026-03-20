import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { fetchMenuItemById } from '../api/menu.js';
import { getMenuImageUrl } from '../api/storage.js';
import { Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';

function getImageSrc(item) {
  return (
    (item.imageFileId ? getMenuImageUrl(item.imageFileId) : item.imageUrl) ||
    'https://placehold.co/800x800/FFF/4A2511?text=Food'
  );
}

export default function MenuItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addItem, updateQuantity } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const doc = await fetchMenuItemById(id);
        setItem(doc);
      } catch (e) {
        setErr(e?.message || 'Item not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const cartItem = item ? items.find((i) => i.id === item.$id) : null;
  const quantity = cartItem?.quantity || 0;

  const add = () => {
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

  const sub = () => updateQuantity(item.$id, quantity - 1);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-sand">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-32 h-32 rounded-full border-4 border-brand-maroon/20" />
        </div>
      </div>
    );
  }

  if (err || !item) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-sand">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xl text-brand-maroon font-bold mb-4">
            Item not found.
          </p>
          <Button onClick={() => navigate('/')}>Return to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-brand-maroon hover:opacity-80 transition-opacity mb-8 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Menu
        </button>

        <div className="bg-brand-gold/20 rounded-[40px] border-4 border-brand-maroon overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-white flex items-center justify-center p-8 border-b-4 md:border-b-0 md:border-r-4 border-brand-maroon">
            <img
              src={getImageSrc(item)}
              alt={item.name}
              className="w-full max-w-[400px] aspect-square object-cover rounded-full shadow-2xl border-8 border-brand-sand"
            />
          </div>

          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-brand-sand">
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-brand-maroon mb-2 leading-tight">
                {item.name}
              </h1>
              <p className="text-xl text-brand-maroon/80 font-medium">
                {item.description}
              </p>
            </div>

            <div className="my-8 h-px w-full bg-brand-maroon/20" />

            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-bold text-brand-maroon/60 uppercase tracking-widest mb-1">
                  Price
                </p>
                <p className="text-5xl font-bold text-brand-maroon drop-shadow-sm">
                  ₹{Number(item.price).toFixed(0)}
                </p>
              </div>
            </div>

            {quantity > 0 ? (
              <div className="flex items-center justify-between bg-white rounded-full shadow-xl px-6 py-4">
                <button
                  onClick={sub}
                  className="w-12 h-12 rounded-full bg-brand-maroon text-brand-sand flex items-center justify-center hover:opacity-80 transition-opacity text-xl font-bold shadow-md"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <p className="text-xs text-brand-maroon/60 uppercase tracking-widest">
                    In Cart
                  </p>
                  <p className="text-3xl font-bold text-brand-maroon leading-none">
                    {quantity}
                  </p>
                </div>
                <button
                  onClick={add}
                  className="w-12 h-12 rounded-full bg-brand-maroon text-brand-sand flex items-center justify-center hover:opacity-80 transition-opacity text-xl font-bold shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full text-lg h-16 rounded-full shadow-xl flex items-center justify-center gap-3"
                onClick={add}
              >
                <ShoppingBag className="w-6 h-6" /> Add to Order
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

