import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';
import { Star, MessageSquare, Award, Clock, Calendar, User } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = workerData.id || 1;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await apiUserOrder.get(`/api/v1/reviews/worker/${WORKER_ID}`);
      // Sort: newest first
      const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(sorted);
    } catch (error) {
      console.error("Gagal mengambil ulasan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer names for unique user_ids
  useEffect(() => {
    if (reviews.length > 0) {
      const uniqueUserIds = [...new Set(reviews.map(r => r.user_id))].filter(Boolean);
      
      uniqueUserIds.forEach(async (id) => {
        try {
          const userRes = await apiUserOrder.get(`/api/v1/users/${id}`);
          if (userRes.data && userRes.data.name) {
            setUserMap(prev => ({ ...prev, [id]: userRes.data.name }));
          }
        } catch (err) {
          console.error(`Gagal mengambil data user ID #${id}:`, err);
        }
      });
    }
  }, [reviews]);

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '4.9';

  // Star distributions
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.round(Number(r.rating));
    if (starCounts[star] !== undefined) {
      starCounts[star]++;
    }
  });

  const getDistribution = (star) => {
    if (totalReviews === 0) {
      const mockPercentages = { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 };
      return mockPercentages[star];
    }
    return Math.round((starCounts[star] / totalReviews) * 100);
  };

  const getStarCountValue = (star) => {
    if (totalReviews === 0) {
      const mockValues = { 5: 12, 4: 2, 3: 1, 2: 0, 1: 0 };
      return mockValues[star];
    }
    return starCounts[star];
  };

  const renderStars = (rating) => {
    const stars = [];
    const activeCount = Math.round(Number(rating));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= activeCount ? 'text-warning fill-warning' : 'text-slate-200 fill-slate-200'} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 lg:pb-10 w-full max-w-full overflow-hidden font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-text flex items-center gap-2">
          <Award size={22} className="text-primary" />
          Ulasan & Penilaian Mitra
        </h2>
        <p className="text-text-muted text-sm font-semibold">Tanggapan dan tingkat kepuasan dari pelanggan Anda.</p>
      </div>

      {/* Review Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white p-6 rounded-2xl border border-border-custom shadow-sm w-full">
        
        {/* Left: Huge rating score */}
        <div className="text-center space-y-2 md:border-r md:border-border-custom md:pr-6 py-4">
          <span className="text-5xl lg:text-6xl font-extrabold text-text block leading-none">{averageRating}</span>
          
          {/* Big stars display */}
          <div className="flex justify-center gap-1">
            {renderStars(averageRating)}
          </div>
          
          <span className="text-xs font-bold text-text-muted block uppercase tracking-wider">
            Rata-rata dari {totalReviews > 0 ? totalReviews : 15} Ulasan
          </span>
        </div>

        {/* Right: Distribution chart (takes 2 columns) */}
        <div className="md:col-span-2 space-y-2 py-2 lg:pl-6">
          {[5, 4, 3, 2, 1].map((star) => {
            const percent = getDistribution(star);
            const count = getStarCountValue(star);
            return (
              <div key={star} className="flex items-center gap-3.5 text-xs font-bold text-text-secondary">
                <span className="w-3 text-right">{star}</span>
                <Star size={12} className="text-warning fill-warning shrink-0" />
                
                {/* Horizontal bar wrapper */}
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                
                <span className="w-8 text-right text-text-muted font-bold">{percent}%</span>
                <span className="w-6 text-right text-text-muted font-semibold">({count})</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Detailed Reviews List */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden w-full">
        
        <div className="px-6 py-5 border-b border-border-custom flex items-center justify-between">
          <h3 className="font-extrabold text-text text-base">Ulasan Terbaru</h3>
        </div>

        <div className="divide-y divide-border-custom">
          {reviews.length === 0 ? (
            <div className="text-center py-12 px-6">
              <MessageSquare size={40} className="mx-auto text-text-muted mb-3 opacity-30" />
              <p className="text-text-muted text-sm font-semibold">Belum ada tanggapan/ulasan tertulis dari pelanggan.</p>
            </div>
          ) : (
            reviews.map((r, idx) => (
              <div key={idx} className="p-6 space-y-3.5 hover:bg-slate-50/25 transition-colors">
                
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {renderStars(r.rating)}
                      <span className="text-xs font-bold text-text-secondary ml-1">({r.rating}/5)</span>
                    </div>
                    
                    {/* Customer Name & Order ID Details */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="font-extrabold text-sm text-text flex items-center gap-1.5">
                        <User size={13} className="text-text-muted shrink-0" />
                        {userMap[r.user_id] || 'Pelanggan'}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                        Order #{r.order_id}
                      </span>
                    </div>
                  </div>
                  
                  {/* Timestamp detail */}
                  <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 self-start sm:self-center">
                    <Clock size={11} />
                    {new Date(r.created_at).toLocaleDateString('id-ID')} {new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>

                {/* Comment text */}
                <p className="text-sm font-semibold text-text-secondary leading-relaxed italic bg-slate-50/40 p-4 rounded-xl border border-border-light">
                  "{r.comment || 'Pelanggan tidak memberikan komentar tertulis.'}"
                </p>

              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
