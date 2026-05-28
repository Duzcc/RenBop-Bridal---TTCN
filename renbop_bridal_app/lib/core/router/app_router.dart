import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import '../providers/providers.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/onboarding_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/main/main_shell.dart';
import '../../features/catalog/screens/product_detail_screen.dart';
import '../../features/orders/screens/order_detail_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/profile/screens/measurement_screen.dart';
import '../../features/profile/screens/change_password_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/cart/screens/checkout_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final loc = state.uri.toString();

      final publicRoutes = ['/splash', '/onboarding', '/login', '/register', '/forgot-password'];
      final isPublic = publicRoutes.any((r) => loc.startsWith(r));

      if (!isAuth && !isPublic) return '/login';
      if (isAuth && (loc == '/login' || loc == '/register')) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (ctx, s) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (ctx, s) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (ctx, s) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (ctx, s) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (ctx, s) => const ForgotPasswordScreen(),
      ),

      // Main shell with bottom nav
      ShellRoute(
        builder: (ctx, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (ctx, s) => const HomeTab(),
          ),
          GoRoute(
            path: '/collection',
            builder: (ctx, s) => const CollectionTab(),
          ),
          GoRoute(
            path: '/orders',
            builder: (ctx, s) => const OrdersTab(),
          ),
          GoRoute(
            path: '/profile',
            builder: (ctx, s) => const ProfileTab(),
          ),
        ],
      ),

      // Detail screens (outside shell)
      GoRoute(
        path: '/products/:id',
        builder: (ctx, s) =>
            ProductDetailScreen(productId: int.parse(s.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/orders/:id',
        builder: (ctx, s) =>
            OrderDetailScreen(orderId: int.parse(s.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/cart',
        builder: (ctx, s) => const CartScreen(),
      ),
      GoRoute(
        path: '/checkout',
        builder: (ctx, s) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/edit-profile',
        builder: (ctx, s) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/measurements',
        builder: (ctx, s) => const MeasurementScreen(),
      ),
      GoRoute(
        path: '/change-password',
        builder: (ctx, s) => const ChangePasswordScreen(),
      ),
    ],
  );
});

// Tab placeholder imports (resolved in main shell)
class HomeTab extends StatelessWidget {
  const HomeTab({super.key});
  @override
  Widget build(BuildContext context) => const SizedBox();
}

class CollectionTab extends StatelessWidget {
  const CollectionTab({super.key});
  @override
  Widget build(BuildContext context) => const SizedBox();
}

class OrdersTab extends StatelessWidget {
  const OrdersTab({super.key});
  @override
  Widget build(BuildContext context) => const SizedBox();
}

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});
  @override
  Widget build(BuildContext context) => const SizedBox();
}
