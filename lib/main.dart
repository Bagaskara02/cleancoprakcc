import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'theme/theme.dart';
import 'services/state_manager.dart';
import 'services/notification_service.dart';
import 'screens/login_screen.dart';
import 'screens/main_layout.dart';

// Declare a single reactive global state instance for direct accessibility across screens
final WorkerState globalWorkerState = WorkerState();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local date symbols for Indonesian language localization
  await initializeDateFormatting('id_ID', null);
  
  // Initialize local and push notifications service
  await NotificationService.init();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CleanCo Mitra',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AppSessionLoader(),
    );
  }
}

class AppSessionLoader extends StatelessWidget {
  const AppSessionLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: globalWorkerState,
      builder: (context, _) {
        // Show loading splash if worker session hasn't completed loading from SharedPreferences
        if (!globalWorkerState.initialized) {
          return const Scaffold(
            backgroundColor: AppColors.primary,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Memuat Sesi Mitra...',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // Clean redirection gate based on authenticating session
        if (globalWorkerState.isAuthenticated) {
          return const MainLayout();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
