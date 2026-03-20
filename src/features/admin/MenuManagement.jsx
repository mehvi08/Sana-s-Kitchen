import React, { useEffect, useState } from 'react';
import { createMenuItem, updateMenuItem, deleteMenuItem, fetchMenuItems } from '../../api/menu.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { uploadMenuImage, getMenuImageUrl } from '../../api/storage.js';

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    imageFileId: '',
  });

  useEffect(() => {
    async function load() {
      const items = await fetchMenuItems();
      setMenuItems(items);
    }
    load();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setImageFile(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true,
      imageFileId: '',
    });
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.$id);
    setImageFile(null);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      imageFileId: item.imageFileId || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageFileId = formData.imageFileId || '';
    if (imageFile) {
      setIsUploading(true);
      try {
        imageFileId = await uploadMenuImage(imageFile);
      } finally {
        setIsUploading(false);
      }
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      imageFileId,
    };

    if (editingId) {
      const updated = await updateMenuItem(editingId, payload);
      setMenuItems((prev) =>
        prev.map((i) => (i.$id === editingId ? updated : i)),
      );
    } else {
      const created = await createMenuItem(payload);
      setMenuItems((prev) => [...prev, created]);
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((i) => i.$id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-brand-maroon">
          Menu Management
        </h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Add New Item</Button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-brand-maroon">
          <h2 className="text-xl font-bold text-brand-maroon mb-4">
            {editingId ? 'Edit Item' : 'Create New Menu Item'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                label="Price (₹)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />

              <Input
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-brand-maroon mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="flex h-10 w-full rounded-md border border-brand-maroon/30 bg-white/50 px-3 py-2 text-sm text-brand-maroon file:border-0 file:bg-brand-maroon file:text-brand-sand file:px-2 file:py-1 file:rounded-md file:mr-2"
                />
                <p className="mt-1 text-xs text-brand-maroon/60">
                  Optional. Uploaded image will be used for this item.
                </p>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-brand-maroon mb-1">
                Description
              </label>
              <textarea
                className="flex w-full rounded-md border border-brand-maroon/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon min-h-[80px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="w-4 h-4 text-brand-maroon rounded border-brand-maroon/30 focus:ring-brand-maroon"
              />
              <label
                htmlFor="isAvailable"
                className="text-sm font-medium text-brand-maroon"
              >
                Available for order
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-brand-maroon/10">
              <Button type="submit" isLoading={isUploading}>
                {editingId ? 'Update Item' : 'Create Item'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border-2 border-brand-maroon overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-sand/50">
            <tr className="text-brand-maroon/70 text-sm">
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-brand-maroon/10">
            {menuItems.map((item) => (
              <tr key={item.$id} className="hover:bg-brand-sand/10">
                <td className="p-4">
                  {item.imageFileId ? (
                    <img
                      src={getMenuImageUrl(item.imageFileId)}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover border border-brand-maroon/20"
                    />
                  ) : item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover border border-brand-maroon/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-brand-sand flex items-center justify-center text-brand-maroon/30">
                      ?
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium text-brand-maroon">
                  {item.name}
                </td>
                <td className="p-4 text-brand-maroon/80">{item.category}</td>
                <td className="p-4 font-bold text-brand-maroon">
                  ₹{Number(item.price).toFixed(0)}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-brand-maroon hover:bg-brand-gold rounded-lg transition-colors inline-block"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.$id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-brand-maroon/50"
                >
                  No menu items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

