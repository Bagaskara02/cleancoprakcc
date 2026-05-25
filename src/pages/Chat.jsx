import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { Send, ArrowLeft } from 'lucide-react';

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
        console.error('Gagal mengambil pesan', error, error.response?.data?.detail);
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
        mix_blend_mode: 'normal', // Unrelated, just structure
        message: newMessage
      };
      await apiUserOrder.post('/api/v1/chats', payload);
      setNewMessage('');
    } catch (error) {
      const detail = error.response?.data?.detail || '';
      console.error('Gagal mengirim pesan', error);
      alert(`Gagal mengirim pesan. ${detail}`);
    }
  };

  if (!order) return null;

  return (
    <div className='chat-container-wrapper'>
      <button className='btn-back-circle' onClick={() => navigate('/orders')}>
        <ArrowLeft size={20} />
      </button>
      <div className='chat-page'>
        <div className='chat-header'>
          <h2>Chat Pesanan #{order.id}</h2>
          <p>{order.service_name || 'Layanan Kebersihan'}</p>
        </div>

        <div className='chat-messages'>
          {loading && messages.length === 0 ? (
            <div className='loading-spinner'>Memuat obrolan...</div>
          ) : messages.length === 0 ? (
            <div className='empty-state'>Belum ada pesan. Mulai sapa petugas Anda!</div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderRole === 'user' && msg.senderId === userId;
              return (
                <div key={idx} className={`chat-bubble ${isMe ? 'sent' : 'received'}`}>
                  <p>{msg.message}</p>
                  <span className='bubble-time'>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <form className='chat-input-bar' onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Ketik pesan...'
          />
          <button type='submit' className='chat-send-btn'>
            <Send size={18} /> Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
