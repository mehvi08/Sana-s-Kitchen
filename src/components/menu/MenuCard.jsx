import React from 'react';
import { ShoppingCart } from 'lucide-react';
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

function getPieceText(item) {
  const raw =
    item?.pieceCount ??
    item?.pieces ??
    item?.piece_count ??
    item?.piece_count_description ??
    null;

  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return `${n} piece${n === 1 ? '' : 's'}`;

  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return item?.description || '';
}

export function MenuCard({ item }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleAdd = (e) => {
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

  const handleCardClick = () => {
    navigate(`/item/${item.$id}`);
  };

  return (
    <div
      className="group cursor-pointer rounded-xl bg-brand-sand/60 border border-brand-maroon/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <img
          src={getImageSrc(item)}
          alt={item.name}
          className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-sm"
          loading="lazy"
        />

        <div className="mt-4">
          <h3 className="text-xl font-bold text-brand-maroon">{item.name}</h3>
          <p className="text-sm text-brand-maroon/70 mt-1 line-clamp-2">
            {getPieceText(item)}
          </p>
        </div>
      </div>

      <div className="mt-auto bg-[#4A2511] h-12 flex items-center justify-between rounded-b-xl px-4">
        <span className="text-[15px] font-semibold text-white tracking-tight">
          ₹{Number(item.price || 0).toFixed(0)}
        </span>

        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 text-white font-semibold tracking-tight hover:opacity-90 active:opacity-100 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

