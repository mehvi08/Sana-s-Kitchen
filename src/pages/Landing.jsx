import React, { useMemo, useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { MenuCard } from '../components/menu/MenuCard.jsx';
import { CartModal } from '../components/menu/CartModal.jsx';
import { fetchMenuItems } from '../api/menu.js';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingBag } from 'lucide-react';

export default function Landing() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getTotalItems } = useCart();

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const items = await fetchMenuItems();
        setMenuItems(items);
      } catch (err) {
        setError(err?.message || 'Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalItems = getTotalItems();

  const menuByCategory = useMemo(() => {
    if (!menuItems) return {};
    return menuItems.reduce((acc, item) => {
      const categoryName = item.category || 'Uncategorized';
      if (!acc[categoryName]) acc[categoryName] = [];
      if (item.isAvailable) {
        acc[categoryName].push(item);
      }
      return acc;
    }, {});
  }, [menuItems]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16">
        {/* Archway Hero Section */}
        <section className="px-4 pt-8 md:pt-16 max-w-7xl mx-auto">
          <div className="bg-brand-gold/20 rounded-t-[100px] md:rounded-t-[200px] border-4 border-b-0 border-brand-maroon p-8 md:p-16 text-center min-h-[50vh] flex flex-col items-center justify-center relative overflow-hidden">
            <SplitText
              text="Taste the Festivities"
              className="text-4xl md:text-6xl lg:text-8xl font-serif font-bold text-brand-maroon mb-6"
            />

            <p className="text-lg md:text-xl text-brand-maroon/80 max-w-2xl mx-auto font-medium mb-10 animate-fadeUpDelay200">
              Celebrate this Ramadan with our exclusive, handcrafted menu. Share
              the joy of eating together with flavors that bring memories.
            </p>
          </div>
        </section>

        {/* Dynamic Menu Section */}
        <section className="px-4 py-8 max-w-3xl mx-auto">
          {isLoading && (
            <div className="py-8 animate-pulse text-center">
              {[1, 2].map((i) => (
                <div key={i} className="mb-16">
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="h-px bg-brand-maroon/20 w-16"></div>
                    <div className="h-8 bg-brand-maroon/20 rounded w-48"></div>
                    <div className="h-px bg-brand-maroon/20 w-16"></div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {[1, 2].map((j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between bg-brand-gold/30 rounded-full my-4 relative h-20 md:h-24 pl-20 pr-4 md:pl-28 md:pr-6 md:ml-4"
                      >
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/50 absolute -left-4 md:-left-8 border-4 border-brand-sand"></div>
                        <div className="flex-1 px-4 text-left">
                          <div className="h-5 bg-brand-maroon/20 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-brand-maroon/20 rounded w-1/2"></div>
                        </div>
                        <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full bg-white/50"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl">
              <p className="font-bold">Failed to load menu.</p>
              <p className="mt-1 text-sm whitespace-pre-wrap break-words">
                {error?.message || error || 'Unknown error'}
              </p>
            </div>
          )}

          {Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} className="mb-16">
              <div className="text-center mb-8 flex items-center justify-center space-x-4 before:border-t after:border-t before:border-brand-maroon after:border-brand-maroon before:w-16 after:w-16">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-maroon">
                  {category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item) => (
                  <MenuCard key={item.$id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-brand-maroon text-brand-sand py-8 text-center rounded-t-[40px] mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="bg-brand-sand/10 px-6 py-2 rounded-full backdrop-blur font-medium">
            📞 +91 98765 43210
          </div>
          <div className="bg-brand-sand/10 px-6 py-2 rounded-full backdrop-blur font-medium">
            📸 @ramadan_menu
          </div>
        </div>
      </footer>

      {/* Floating View Order button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-brand-maroon text-brand-sand rounded-full px-6 py-4 shadow-2xl hover:scale-105 transition-all duration-200 font-bold text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            View Order
            <span className="bg-brand-gold text-brand-maroon rounded-full w-7 h-7 flex items-center justify-center font-extrabold text-sm shrink-0">
              {totalItems}
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

