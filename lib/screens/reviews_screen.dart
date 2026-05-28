import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../main.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/theme.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  List<Review> _reviews = [];
  bool _loading = true;
  final Map<int, String> _userMap = {};

  @override
  void initState() {
    super.initState();
    _fetchReviews();
  }

  Future<void> _fetchReviews() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final reviews = await ApiService.getReviews(workerId);
      
      reviews.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      if (mounted) {
        setState(() {
          _reviews = reviews;
          _loading = false;
        });
        _fetchCustomerNames();
      }
    } catch (e) {
      debugPrint('Error fetching reviews: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _fetchCustomerNames() async {
    final uniqueUserIds = _reviews.map((r) => r.userId).toSet().toList();
    for (final id in uniqueUserIds) {
      if (_userMap.containsKey(id)) continue;
      try {
        final details = await ApiService.getUserDetails(id);
        if (mounted) {
          setState(() {
            _userMap[id] = details.name;
          });
        }
      } catch (e) {
        debugPrint('Error fetching user ID #$id details: $e');
      }
    }
  }

  double get _averageRating {
    if (_reviews.isEmpty) return 4.9;
    final total = _reviews.fold<double>(0.0, (sum, r) => sum + r.rating);
    return total / _reviews.length;
  }

  Map<int, int> get _starCounts {
    final Map<int, int> counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    for (final r in _reviews) {
      final rounded = r.rating.round();
      if (counts.containsKey(rounded)) {
        counts[rounded] = counts[rounded]! + 1;
      }
    }
    return counts;
  }

  double _getDistributionPercentage(int star) {
    if (_reviews.isEmpty) {
      // Mock data percentages matching React
      final mock = {5: 80.0, 4: 15.0, 3: 3.0, 2: 1.0, 1: 1.0};
      return mock[star]!;
    }
    final count = _starCounts[star] ?? 0;
    return (count / _reviews.length) * 100;
  }

  int _getStarCountValue(int star) {
    if (_reviews.isEmpty) {
      final mock = {5: 12, 4: 2, 3: 1, 2: 0, 1: 0};
      return mock[star]!;
    }
    return _starCounts[star] ?? 0;
  }

  Widget _buildStars(double rating, {double size = 14}) {
    List<Widget> stars = [];
    int activeCount = rating.round();
    for (int i = 1; i <= 5; i++) {
      stars.add(
        Icon(
          i <= activeCount ? Icons.star : Icons.star_border,
          color: i <= activeCount ? AppColors.warning : AppColors.borderCustom,
          size: size,
        ),
      );
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: stars,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final totalReviews = _reviews.isNotEmpty ? _reviews.length : 15;
    final avgRating = _averageRating.toStringAsFixed(1);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _fetchReviews,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Rating overall summary panel
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderCustom),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        // Left: Overall Average Score
                        Expanded(
                          flex: 2,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                avgRating,
                                style: const TextStyle(
                                  fontSize: 48,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.text,
                                  height: 1.1,
                                ),
                              ),
                              _buildStars(_averageRating, size: 16),
                              const SizedBox(height: 8),
                              Text(
                                'RATA-RATA DARI $totalReviews ULASAN',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        Container(width: 1, height: 100, color: AppColors.borderCustom),
                        const SizedBox(width: 16),

                        // Right: Distribution Bars chart
                        Expanded(
                          flex: 3,
                          child: Column(
                            children: [5, 4, 3, 2, 1].map((star) {
                              final percent = _getDistributionPercentage(star);
                              final count = _getStarCountValue(star);

                              return Padding(
                                padding: const EdgeInsets.only(bottom: 4.0),
                                child: Row(
                                  children: [
                                    Text(
                                      '$star',
                                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.star, color: AppColors.warning, size: 10),
                                    const SizedBox(width: 8),
                                    
                                    // Progress bar
                                    Expanded(
                                      child: Container(
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF1F5F9),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: FractionallySizedBox(
                                          alignment: Alignment.centerLeft,
                                          widthFactor: percent / 100,
                                          child: Container(
                                            decoration: BoxDecoration(
                                              color: AppColors.primary,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),

                                    // Percent label
                                    Text(
                                      '${percent.round()}%',
                                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textMuted),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '($count)',
                                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Detailed list title
              const Text(
                'Ulasan Terbaru',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 12),

              // Reviews list
              if (_reviews.isEmpty)
                SizedBox(
                  width: double.infinity,
                  child: Card(
                    margin: EdgeInsets.zero,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40.0),
                      child: Column(
                        children: [
                          Icon(Icons.message_outlined, color: AppColors.textMuted.withOpacity(0.3), size: 40),
                          const SizedBox(height: 12),
                          const Text(
                            'Belum ada tanggapan/ulasan tertulis dari pelanggan.',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _reviews.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final review = _reviews[index];
                    final customerName = _userMap[review.userId] ?? 'Pelanggan';
                    final dateStr = DateFormat('dd/MM/yyyy').format(review.createdAt);
                    final timeStr = '${DateFormat('HH:mm').format(review.createdAt)} WIB';

                    return Card(
                      margin: EdgeInsets.zero,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        _buildStars(review.rating, size: 12),
                                        const SizedBox(width: 6),
                                        Text(
                                          '(${review.rating.toStringAsFixed(0)}/5)',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.person_outline, size: 12, color: AppColors.textMuted),
                                        const SizedBox(width: 4),
                                        Text(
                                          customerName,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w900,
                                            color: AppColors.text,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppColors.borderLight,
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            'ORDER #${review.orderId}',
                                            style: const TextStyle(
                                              color: AppColors.textMuted,
                                              fontSize: 8,
                                              fontWeight: FontWeight.w800,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 10, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Text(
                                      '$dateStr $timeStr',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        color: AppColors.textMuted,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFF1F5F9)),
                              ),
                              child: Text(
                                review.comment.isNotEmpty
                                    ? '"${review.comment}"'
                                    : '"Pelanggan tidak memberikan komentar tertulis."',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
