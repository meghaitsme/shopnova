import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setSubscribers(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching subscribers:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading subscribers...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Newsletter Subscribers</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Total subscribers: {subscribers.length}</p>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Email Address</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Date Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{sub.email}</td>
                  <td style={{ padding: '16px', color: '#6b7280' }}>
                    {new Date(sub.subscribedAt).toLocaleString()}
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