import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!order || !userId) {
      navigate('/orders');
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await apiUserOrder.get(`/api/v1/chats/${order.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Gagal mengambil pesan', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // Simulate real-time by polling every 5 seconds (untuk MVP)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [order, userId, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const payload = {
        orderId: order.id,
        senderId: userId,
        senderRole: 'user',
        message: newMessage
      };
      await apiUserOrder.post('/api/v1/chats', payload);
      setNewMessage('');
    } catch (error) {
      console.error('Gagal mengirim pesan', error);
      alert('Gagal mengirim pesan');
    }
  };

  if (!order) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', display: 'flex', flexDirection: 'column', height: '80vh', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee', backgroundColor: '#f8fafc', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <h2 style={{ margin: 0 }}>Chat Pesanan #{order.id}</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{order.service_name || 'Layanan Kebersihan'}</p>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && messages.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Memuat obrolan...</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Belum ada pesan. Mulai sapa petugas Anda!</p>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderRole === 'user' && msg.senderId === userId;
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', backgroundColor: isMe ? '#0ea5e9' : '#f1f5f9', color: isMe ? 'white' : 'black', padding: '10px 15px', borderRadius: '15px', maxWidth: '70%' }}>
                <p style={{ margin: 0 }}>{msg.message}</p>
                <span style={{ fontSize: '10px', opacity: 0.8, display: 'block', marginTop: '5px', textAlign: 'right' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
          Kirim
        </button>
      </form>
    </div>
  );
}
