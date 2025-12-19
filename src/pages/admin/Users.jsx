// Filename: src/pages/admin/Users.jsx
import { useEffect, useState } from 'react';
import { Users as UsersIcon, Trash2, Shield, Loader2 } from 'lucide-react';
import { firestoreService } from '../../services/db'; // Import cloud service

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users directly from Firestore collection
      const data = await firestoreService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching cloud users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this user from the database? This will not delete their Auth account but will remove their profile.")) return;
    try {
      // We use the document ID (UID) to delete the Firestore profile
      await firestoreService.deleteUser(id); 
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user profile from Firestore.");
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-gray-500 font-medium">Syncing User Directory...</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <UsersIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500 font-medium">Manage cloud-registered accounts and roles.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg border border-indigo-100">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-tight">{user.displayName || 'Anonymous User'}</p>
                      <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5" /> Master Admin
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">Customer</span>
                  )}
                </td>
                <td className="p-5 text-sm font-bold text-gray-500">
                  {/* Convert Firestore Timestamp to readable date */}
                  {user.createdAt?.toDate 
                    ? user.createdAt.toDate().toLocaleDateString() 
                    : new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    title="Remove Profile"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-bold">
            No registered users found in Firestore.
          </div>
        )}
      </div>
    </div>
  );
}