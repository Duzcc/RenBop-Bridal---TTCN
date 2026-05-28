import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/api/api_client.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;
  late Animation<double> _slideAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _fadeAnim = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    );

    _scaleAnim = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic),
      ),
    );

    _slideAnim = Tween<double>(begin: 20, end: 0).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.3, 0.9, curve: Curves.easeOut),
      ),
    );

    _ctrl.forward();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(milliseconds: 2400));
    if (!mounted) return;

    final prefs = await SharedPreferences.getInstance();
    final seenOnboarding = prefs.getBool('seen_onboarding') ?? false;
    final isAuth = await ref.read(authProvider.notifier)._checkAuth();

    if (!mounted) return;
    if (isAuth) {
      context.go('/home');
    } else if (!seenOnboarding) {
      context.go('/onboarding');
    } else {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.charcoal,
      body: Center(
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (ctx, _) => Opacity(
            opacity: _fadeAnim.value,
            child: Transform.scale(
              scale: _scaleAnim.value,
              child: Transform.translate(
                offset: Offset(0, _slideAnim.value),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Gold ornament line
                    Container(
                      width: 48,
                      height: 1,
                      color: AppColors.gold.withValues(alpha: 0.6),
                    ),
                    const SizedBox(height: 20),

                    // Brand name
                    Text(
                      'RENBO',
                      style: TextStyle(
                        fontFamily: 'CormorantGaramond',
                        fontSize: 52,
                        fontWeight: FontWeight.w300,
                        color: Colors.white,
                        letterSpacing: 12,
                      ),
                    ),
                    Text(
                      'BRIDAL',
                      style: TextStyle(
                        fontFamily: 'CormorantGaramond',
                        fontSize: 26,
                        fontWeight: FontWeight.w300,
                        color: AppColors.gold,
                        letterSpacing: 18,
                      ),
                    ),

                    const SizedBox(height: 20),
                    Container(
                      width: 48,
                      height: 1,
                      color: AppColors.gold.withValues(alpha: 0.6),
                    ),

                    const SizedBox(height: 32),

                    // Tagline
                    Text(
                      'Vẻ đẹp hoàn hảo cho ngày trọng đại',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: Colors.white.withValues(alpha: 0.45),
                        letterSpacing: 1.5,
                      ),
                    ),

                    const SizedBox(height: 60),

                    // Loading dots
                    _LoadingDots(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _LoadingDots extends StatefulWidget {
  @override
  State<_LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<_LoadingDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (i) {
          final t = (_ctrl.value - i * 0.15).clamp(0.0, 1.0);
          final opacity = (t < 0.5 ? t * 2 : (1 - t) * 2).clamp(0.2, 1.0);
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: 5,
            height: 5,
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: opacity),
              shape: BoxShape.circle,
            ),
          );
        }),
      ),
    );
  }
}

// Expose check method on AuthNotifier
extension AuthNotifierSplash on AuthNotifier {
  Future<bool> _checkAuth() => ApiClient.isAuthenticated();
}

