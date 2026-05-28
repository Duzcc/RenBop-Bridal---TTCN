import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../catalog/screens/home_screen.dart';
import '../catalog/screens/collection_screen.dart';
import '../orders/screens/orders_screen.dart';
import '../profile/screens/profile_screen.dart';
import '../../../core/constants/app_constants.dart';

class MainShell extends StatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _tabs = [
    const HomeScreen(),
    const CollectionScreen(),
    const OrdersScreen(),
    const ProfileScreen(),
  ];

  final _routes = ['/home', '/collection', '/orders', '/profile'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _tabs,
      ),
      bottomNavigationBar: _LuxuryBottomNav(
        currentIndex: _currentIndex,
        onTap: (i) {
          setState(() => _currentIndex = i);
          context.go(_routes[i]);
        },
      ),
    );
  }
}

class _LuxuryBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _LuxuryBottomNav({
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.home_rounded, Icons.home_outlined, 'Trang chủ'),
      (Icons.auto_awesome, Icons.auto_awesome_outlined, 'Bộ sưu tập'),
      (Icons.shopping_bag_rounded, Icons.shopping_bag_outlined, 'Đơn hàng'),
      (Icons.person_rounded, Icons.person_outlined, 'Hồ sơ'),
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.border, width: 0.8),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 62,
          child: Row(
            children: items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              final isActive = currentIndex == i;

              return Expanded(
                child: InkWell(
                  onTap: () => onTap(i),
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            isActive ? item.$1 : item.$2,
                            key: ValueKey(isActive),
                            color: isActive ? AppColors.gold : AppColors.textMuted,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.$3,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 10,
                            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                            color: isActive ? AppColors.gold : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 2),
                        // Active indicator dot
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          width: isActive ? 18 : 0,
                          height: 2,
                          decoration: BoxDecoration(
                            color: AppColors.gold,
                            borderRadius: AppRadius.borderFull,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
