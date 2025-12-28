// Filename: src/pages/admin/Inventory.jsx
import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Pencil, Package, X, Upload, 
  Loader2, AlertCircle, Settings2, Save 
} from 'lucide-react';
import { firestoreService } from '../../services/db';
import { storage, db } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Dynamic categories state
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false); // Toggle Category Manager
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '', // Starts empty to force selection from dynamic list
    description: '',
    image: '',
    stockCount: '',
    isTrending: false
  });

  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    initData();
  }, []);

  const fetchProducts = async () => {
    const data = await firestoreService.getProducts();
    setProducts(data || []);
  };

  // NEW: Fetch categories from a dedicated settings document
  const fetchCategories = async () => {
    try {
      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const catList = docSnap.data().list || [];
        setCategories(catList);
        if (catList.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: catList[0] }));
        }
      } else {
        // Initialize with defaults if doesn't exist
        const defaults = ["educational", "creative", "action", "plushies"];
        await setDoc(docRef, { list: defaults });
        setCategories(defaults);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // NEW: Add a new category to Firestore
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const catValue = newCatName.toLowerCase().trim();
    try {
      const docRef = doc(db, "settings", "categories");
      await updateDoc(docRef, { list: arrayUnion(catValue) });
      setCategories(prev => [...prev, catValue]);
      setNewCatName('');
    } catch (err) {
      alert("Error adding category");
    }
  };

  // NEW: Remove a category from Firestore
  const handleRemoveCategory = async (cat) => {
    if (!confirm(`Remove "${cat}"? Products already assigned to this will remain unchanged.`)) return;
    try {
      const docRef = doc(db, "settings", "categories");
      await updateDoc(docRef, { list: arrayRemove(cat) });
      setCategories(prev => prev.filter(c => c !== cat));
    } catch (err) {
      alert("Error removing category");
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
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const finalData = {
        ...formData,
        price: parseFloat(formData.price),
        stockCount: parseInt(formData.stockCount) || 0,
        image: imageUrl
      };

      if (editingId) {
        await firestoreService.updateProduct(editingId, finalData);
      } else {
        await firestoreService.addProduct(finalData);
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
      stockCount: product.stockCount || 0,
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
    setFormData({ name: '', price: '', category: categories[0] || '', description: '', image: '', stockCount: '', isTrending: false });
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
        <div className="flex gap-3">
            <button 
                onClick={() => setShowCatManager(!showCatManager)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 transition-all"
            >
                <Settings2 className="w-4 h-4" /> Categories
            </button>
            <button 
                onClick={() => isAdding ? resetForm() : setIsAdding(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
                    isAdding ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
                {isAdding ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Toy</>}
            </button>
        </div>
      </div>

      {/* --- CATEGORY MANAGER DRAWER --- */}
      {showCatManager && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl mb-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black uppercase tracking-widest text-xs text-indigo-400">Manage Store Categories</h3>
                <button onClick={() => setShowCatManager(false)}><X size={18}/></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(cat => (
                    <div key={cat} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 group">
                        <span className="text-xs font-bold capitalize">{cat}</span>
                        <button onClick={() => handleRemoveCategory(cat)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    placeholder="New category name..."
                    className="flex-1 bg-slate-800 border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                />
                <button 
                    onClick={handleAddCategory}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all"
                >
                    Add
                </button>
            </div>
        </div>
      )}

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
                {/* DYNAMIC CATEGORY SELECT */}
                <select className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white capitalize font-bold text-gray-700"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                const isLowStock = product.stockCount < 5; 
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 flex items-center gap-4">
                      <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 shadow-sm"/>
                      <span className="font-bold text-gray-900">{product.name}</span>
                    </td>
                    <td className="p-5 text-gray-600 font-bold">₹{product.price.toLocaleString()}</td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-black text-sm ${isLowStock ? 'text-red-500' : 'text-gray-700'}`}>
                          {product.stockCount}
                        </span>
                        {isLowStock && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-red-400 uppercase animate-pulse">
                            <AlertCircle className="w-2.5 h-2.5" /> Low
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