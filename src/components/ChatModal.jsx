import React, { useState, useEffect, useRef } from 'react';
import { apiUserOrder } from '../services/api';
import { Send, X, MessageSquare, Clock } from 'lucide-react';

export default function ChatModal({ isOpen, onClose, order }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = String(workerData.id || 1);

  // Fetch messages and setup polling
  useEffect(() => {
    if (!isOpen || !order?.id) return;

    const fetchMessages = async () => {
      try {
        const response = await apiUserOrder.get(`/api/v1/chats/${order.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Gagal mengambil pesan chat:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [isOpen, order?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !order?.id) return;

    const typedMsg = newMessage;
    setNewMessage('');

    try {
      const payload = {
        orderId: order.id,
        senderId: WORKER_ID,
        senderRole: 'worker',
        message: typedMsg
      };
      await apiUserOrder.post('/api/v1/chats', payload);
      
      // Fetch messages immediately for snappy feeling
      const response = await apiUserOrder.get(`/api/v1/chats/${order.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Gagal mengirim pesan chat:', error);
      alert('Gagal mengirim pesan.');
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content chat-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="chat-modal-header">
          <div className="min-w-0">
            <h3>Chat dengan Pelanggan</h3>
            <p className="text-xs font-semibold text-text-muted mt-0.5 truncate">
              {order.user_name || 'Pelanggan'} — Order #{order.id}
            </p>
          </div>
          <button className="chat-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Message area */}
        <div className="chat-modal-messages flex-1 p-3 overflow-y-auto bg-slate-50 rounded-2xl border border-border-custom flex flex-col gap-3">
          {loading && messages.length === 0 ? (
            <div className="chat-modal-spinner flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-modal-empty flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto py-10">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-text-muted mb-3 opacity-60">
                <MessageSquare size={20} />
              </div>
              <h4 className="font-extrabold text-text text-sm">Belum ada pesan</h4>
              <p className="text-xs text-text-muted font-semibold mt-1">Sapa pelanggan untuk mengoordinasikan pesanan.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderRole === 'worker' && String(msg.senderId) === WORKER_ID;
              return (
                <div 
                  key={idx} 
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 flex flex-col gap-1 shadow-sm ${
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

        {/* Modal input form */}
        <form onSubmit={handleSendMessage} className="chat-modal-input-bar">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            required
            autoFocus
          />
          <button type="submit" className="chat-modal-send-btn flex items-center justify-center">
            <Send size={15} className="mr-1" /> Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
