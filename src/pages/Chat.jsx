import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';

export default function Chat() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [order] = useState(state?.order || { id: orderId, service_name: 'Layanan Kebersihan' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const WORKER_ID = '1'; // Dummy worker ID for MVP

  useEffect(() => {
    if (!order) {
      navigate('/');
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
  }, [order, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const payload = {
        orderId: order.id,
        senderId: WORKER_ID,
        senderRole: 'worker',
        message: newMessage
      };
      await apiUserOrder.post('/api/v1/chats', payload);
      setNewMessage('');
      // Optimistic update
      setMessages([...messages, { ...payload, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error('Gagal mengirim pesan', error);
      alert('Gagal mengirim pesan');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-bold text-gray-800">Chat dengan Pelanggan</h2>
          <p className="text-xs text-gray-500">Order #{order.id} - {order.service_name}</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare size={48} className="mb-2 opacity-20" />
            <p>Belum ada pesan. Sapa pelanggan Anda!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderRole === 'worker' && msg.senderId === WORKER_ID;
            return (
              <div key={idx} className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isMe ? 'bg-sky-500 text-white self-end rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 self-start rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <span className={`text-[10px] mt-1 block ${isMe ? 'text-sky-100 text-right' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan untuk pelanggan..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors">
          <Send size={18} className="ml-1" />
        </button>
      </form>
    </div>
  );
}
