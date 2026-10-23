import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 1. Fetch Users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetched: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          email: data.email || 'No email',
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt || '',
        });
      });
      setUsers(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Filter Search
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Manage Users</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>Total registered customers: {users.length}</p>
        </div>
        
        <input 
          type="text" 
          placeholder="Search by email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '1px solid #ccc', borderRadius: '6px', width: '250px' }}
        />
      </div>

      {/* Users Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Email</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Role</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>User ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: user.isAdmin ? '#fee2e2' : '#dcfce7',
                      color: user.isAdmin ? '#991b1b' : '#166534'
                    }}>
                      {user.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>
                    {user.id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}