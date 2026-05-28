import 'package:flutter/material.dart';
import '../../main.dart';
import '../theme/theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _updatingStatus = false;

  @override
  void initState() {
    super.initState();
    globalWorkerState.refreshProfile(); // Background refresh
  }

  Future<void> _handleToggleStatus(String currentStatus) async {
    if (currentStatus == 'busy') {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Status Sedang Bekerja'),
          content: const Text('Anda sedang dalam tugas aktif (Busy). Tidak dapat mengubah status menjadi Offline!'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Tutup'),
            ),
          ],
        ),
      );
      return;
    }

    setState(() {
      _updatingStatus = true;
    });

    final nextStatus = currentStatus == 'available' ? 'offline' : 'available';

    try {
      await globalWorkerState.updateStatus(nextStatus);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status berhasil diubah menjadi: ${nextStatus == 'available' ? 'Online' : 'Offline'}')),
      );
    } catch (e) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Gagal Memperbarui Status'),
          content: Text(e.toString().replaceAll('Exception:', '').trim()),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Tutup'),
            ),
          ],
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _updatingStatus = false;
        });
      }
    }
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Keluar'),
        content: const Text('Apakah Anda yakin ingin keluar dari akun mitra Anda?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              globalWorkerState.logout();
            },
            child: const Text('Keluar', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListenableBuilder(
        listenable: globalWorkerState,
        builder: (context, _) {
          final worker = globalWorkerState.currentWorker;
          if (worker == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return SingleChildScrollView(
            child: Column(
              children: [
                // Banner decorative header
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      height: 100,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primaryDark],
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: -36,
                      left: 20,
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: AppColors.primaryBgDeep,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            worker.name.isNotEmpty ? worker.name[0].toUpperCase() : 'W',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w900,
                              fontSize: 24,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 48),

                // Name & title subtitle
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            worker.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: AppColors.text,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.verified, color: AppColors.primary, size: 18),
                        ],
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Mitra Kebersihan',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Personal details cards
                      GridView.count(
                        crossAxisCount: 1,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        childAspectRatio: 5,
                        mainAxisSpacing: 10,
                        children: [
                          _buildProfileInfoCard(
                            icon: Icons.mail_outline,
                            title: 'ALAMAT EMAIL',
                            value: worker.email,
                          ),
                          _buildProfileInfoCard(
                            icon: Icons.phone_outlined,
                            title: 'NOMOR TELEPON',
                            value: worker.phone ?? '+62 812-3456-7890',
                          ),
                          _buildProfileInfoCard(
                            icon: Icons.person_outline,
                            title: 'ID MITRA',
                            value: '# ${worker.id}',
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Status Toggle Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.borderCustom),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Status Ketersediaan',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 14,
                                      color: AppColors.text,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Tentukan apakah Anda siap menerima tugas baru',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textMuted,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Interactive status button
                            _updatingStatus
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : ElevatedButton.icon(
                                    onPressed: () => _handleToggleStatus(worker.status),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: worker.status == 'available'
                                          ? const Color(0xFFE6F4F1)
                                          : worker.status == 'busy'
                                              ? const Color(0xFFFEF3C7)
                                              : AppColors.borderLight,
                                      foregroundColor: worker.status == 'available'
                                          ? AppColors.teal
                                          : worker.status == 'busy'
                                              ? const Color(0xFFB45309)
                                              : AppColors.textLight,
                                      elevation: 0,
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                        side: BorderSide(
                                          color: worker.status == 'available'
                                              ? const Color(0xFFBBE3DB)
                                              : worker.status == 'busy'
                                                  ? const Color(0xFFFDE68A)
                                                  : AppColors.borderCustom,
                                          width: 1,
                                        ),
                                      ),
                                    ),
                                    icon: const Icon(Icons.power_settings_new, size: 14),
                                    label: Text(
                                      worker.status == 'busy'
                                          ? 'Sedang Bekerja (Busy)'
                                          : worker.status == 'available'
                                              ? 'Aktif (Online)'
                                              : 'Nonaktif (Offline)',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                                    ),
                                  ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Logout button card
                      Card(
                        margin: EdgeInsets.zero,
                        color: Colors.white,
                        child: InkWell(
                          onTap: _handleLogout,
                          borderRadius: BorderRadius.circular(20),
                          child: const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.logout, color: AppColors.danger, size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'Keluar dari Akun Mitra',
                                  style: TextStyle(
                                    color: AppColors.danger,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileInfoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.borderLight.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderCustom, width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textMuted, size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textMuted,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  value,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
