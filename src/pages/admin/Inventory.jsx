// Filename: src/pages/admin/Inventory.jsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Package, X } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track which product we are editing
  const [imageNumber, setImageNumber] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'educational',
    description: '',
    image: '',
    isTrending: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      setProducts(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this toy?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
      
      // If we deleted the item currently being edited, close the form
      if (editingId === id) resetForm();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // NEW: Handle Edit Click
  const handleEdit = (product) => {
    setEditingId(product.id);
    setIsAdding(true); // Open the form container
    
    // Attempt to extract the number from the path (e.g. "/images/img21.jpg" -> "21")
    let imgNum = '';
    const match = product.image?.match(/\/images\/img(\d+)\.jpg/);
    if (match) imgNum = match[1];

    setImageNumber(imgNum);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image,
      isTrending: !!product.isTrending
    });
    
    // Smooth scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'educational', description: '', image: '', isTrending: false });
    setImageNumber('');
  };

  const handleImageNumberChange = (e) => {
    const val = e.target.value;
    setImageNumber(val);
    setFormData(prev => ({ ...prev, image: `/images/img${val}.jpg` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Determine Method and URL based on mode
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert(editingId ? "Product Updated!" : "Product Added!");
        resetForm();
        fetchProducts(); 
      } else {
        alert("Operation failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Inventory...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Package className="w-6 h-6"/>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Inventory Management</h1>
        </div>
        <button 
          onClick={() => {
             if (isAdding) resetForm(); // If open, close it
             else setIsAdding(true);    // If closed, open it (Add mode)
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
            isAdding ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isAdding ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Product</>}
        </button>
      </div>

      {/* Form Section */}
      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-10 animate-pop-in">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
             {editingId && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold">Editing ID: {editingId}</span>}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Super Robot" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                <input required type="number" step="0.01" className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none" 
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="2499" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none bg-white"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="educational">Educational</option>
                  <option value="creative">Creative</option>
                  <option value="action">Action Figures</option>
                  <option value="plushies">Plushies</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image Number</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl px-4 py-3 text-gray-500 font-mono text-sm select-none">img</span>
                  <input required type="number" placeholder="21" className="w-full p-3 border border-gray-200 focus:border-indigo-500 outline-none font-mono text-sm" 
                    value={imageNumber} onChange={handleImageNumberChange} />
                  <span className="bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl px-4 py-3 text-gray-500 font-mono text-sm select-none">.jpg</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1">Path: {formData.image || "/images/img....jpg"}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none h-24 resize-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short description..." />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="trending" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" 
                  checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} />
                <label htmlFor="trending" className="text-sm font-bold text-gray-700">Mark as Trending</label>
              </div>
            </div>

            <div className="md:col-span-2 pt-4 flex gap-4">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
                {editingId ? 'Save Changes' : 'Confirm & Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">Product</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">Price</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">Category</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 flex items-center gap-4">
                  <img src={product.image || "https://placehold.co/50"} alt="" className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100"/>
                  <span className="font-bold text-gray-900">{product.name}</span>
                </td>
                <td className="p-5 text-gray-600">₹{product.price.toFixed(2)}</td>
                <td className="p-5"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{product.category}</span></td>
                <td className="p-5 text-center">
                  {product.isTrending ? <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold">Trending</span> : <span className="text-gray-400 text-xs">-</span>}
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* NEW: Edit Button */}
                    <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors" title="Edit">
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}