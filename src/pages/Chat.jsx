import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { ArrowLeft, Send, MessageSquare, Clock } from 'lucide-react';

export default function Chat() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [order] = useState(state?.order || { id: orderId, service_name: 'Layanan Kebersihan' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = String(workerData.id || 1);

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
    // Poll every 5 seconds for simulation
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
      alert(`Gagal mengirim pesan.`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-border-custom overflow-hidden">
      
      {/* Title Header */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-border-custom flex items-center gap-4 shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="text-text-secondary hover:text-text p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-extrabold text-text text-base leading-none mb-1">Chat Pelanggan</h2>
          <p className="text-xs font-semibold text-text-muted">
            Order #{order.id} — {order.service_name || `Layanan ID #${order.service_id}`}
          </p>
        </div>
      </div>

      {/* Message Bubbles Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 flex flex-col gap-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-text-muted mb-4 opacity-70">
              <MessageSquare size={24} />
            </div>
            <h4 className="font-extrabold text-text text-base">Belum ada pesan</h4>
            <p className="text-xs text-text-muted font-semibold mt-1">Kirim pesan pertama Anda untuk menyapa pelanggan.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderRole === 'worker' && String(msg.senderId) === WORKER_ID;
            return (
              <div 
                key={idx} 
                className={`max-w-[75%] rounded-2xl px-4 py-3 flex flex-col gap-1 shadow-sm ${
                  isMe 
                    ? 'bg-primary text-white self-end rounded-tr-none' 
                    : 'bg-white text-text border border-border-custom self-start rounded-tl-none'
                }`}
              >
                <p className="text-sm font-semibold leading-relaxed break-words">{msg.message}</p>
                <span className={`text-[9px] font-bold self-end mt-0.5 flex items-center gap-1 ${isMe ? 'text-white/70' : 'text-text-muted'}`}>
                  <Clock size={8} />
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Input Footer */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border-custom flex gap-3 shrink-0">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan untuk pelanggan..."
          className="flex-1 bg-slate-50 border border-border-custom rounded-2xl px-5 py-3 text-sm font-semibold text-text placeholder-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-primary hover:bg-primary-dark disabled:bg-slate-200 text-white disabled:text-text-muted w-11 h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
}
