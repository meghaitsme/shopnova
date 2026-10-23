import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot, deleteDoc, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setMessages(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
      showToast("Message deleted.", "success");
    } catch (err) {
      showToast("Failed to delete message.", "error");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { status: 'Read' });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading messages...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Support Inbox</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Total messages: {messages.length}</p>
      </div>

      {messages.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>No messages yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: msg.status === 'Unread' ? '#fef9c3' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '16px' }}>{msg.name}</strong>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>&lt;{msg.email}&gt;</span>
                  {msg.status === 'Unread' && (
                    <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>NEW</span>
                  )}
                </div>
                {msg.subject && <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#374151' }}>Subject: {msg.subject}</p>}
                <p style={{ margin: '0 0 8px 0', color: '#4b5563', whiteSpace: 'pre-line' }}>{msg.message}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{new Date(msg.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {msg.status === 'Unread' && (
                  <button onClick={() => handleMarkRead(msg.id)} style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mark Read</button>
                )}
                <button onClick={() => handleDelete(msg.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}