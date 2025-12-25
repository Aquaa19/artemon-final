// Filename: src/pages/admin/Inventory.jsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Package, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { firestoreService } from '../../services/db';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'educational',
    description: '',
    image: '',
    stockCount: '', // NEW: Integrated with Low Stock Alerts
    isTrending: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await firestoreService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const finalData = {
        ...formData,
        price: parseFloat(formData.price),
        stockCount: parseInt(formData.stockCount) || 0, // NEW
        image: imageUrl
      };

      if (editingId) {
        await firestoreService.updateProduct(editingId, finalData);
        alert("Product updated successfully!");
      } else {
        await firestoreService.addProduct(finalData);
        alert("Product added to cloud inventory!");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this toy from the cloud database?")) return;
    try {
      await firestoreService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setIsAdding(true);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image,
      stockCount: product.stockCount || 0, // NEW
      isTrending: !!product.isTrending
    });
    setImagePreview(product.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({ name: '', price: '', category: 'educational', description: '', image: '', stockCount: '', isTrending: false });
  };

  if (loading) return (
    <div className="p-10 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <span className="text-gray-500 font-medium">Syncing Cloud Inventory...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Package className="w-6 h-6"/>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Cloud Inventory</h1>
        </div>
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
            isAdding ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isAdding ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Toy</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Toy Details' : 'Add New Toy to Store'}</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Product Image</label>
                <div 
                  className="relative group border-2 border-dashed border-gray-200 rounded-2xl aspect-video flex flex-col items-center justify-center overflow-hidden bg-gray-50 hover:border-indigo-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500 font-medium">Click to upload image</p>
                    </div>
                  )}
                  <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Toy Name</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input required type="number" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                  <input required type="number" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" 
                    value={formData.stockCount} onChange={e => setFormData({...formData, stockCount: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="educational">Educational</option>
                  <option value="creative">Creative</option>
                  <option value="action">Action Figures</option>
                  <option value="plushies">Plushies</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea className="w-full p-3 rounded-xl border border-gray-200 outline-none h-32 resize-none focus:border-indigo-500" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="trending" className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                  checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} />
                <label htmlFor="trending" className="text-sm font-bold text-gray-700 cursor-pointer">Show on Trending Section</label>
              </div>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <><Loader2 className="animate-spin" /> Processing...</> : (editingId ? 'Save Changes' : 'Push to Cloud Store')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => {
                const isLowStock = product.stockCount < 5; // NEW: Visual match for backend logic
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 flex items-center gap-4">
                      <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 shadow-sm"/>
                      <span className="font-bold text-gray-900">{product.name}</span>
                    </td>
                    <td className="p-5 text-gray-600 font-bold">₹{product.price.toLocaleString()}</td>
                    <td className="p-5">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-black text-sm ${isLowStock ? 'text-red-500' : 'text-gray-700'}`}>
                          {product.stockCount}
                        </span>
                        {isLowStock && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-red-400 uppercase animate-pulse">
                            <AlertCircle className="w-2.5 h-2.5" /> Low Stock
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black uppercase border border-indigo-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}