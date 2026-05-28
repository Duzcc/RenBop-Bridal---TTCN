import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;

    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      backgroundColor: AppColors.ivory,
      body: RefreshIndicator(
        color: AppColors.gold,
        onRefresh: () => ref.read(authProvider.notifier).refreshProfile(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.charcoal,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.charcoal, AppColors.charcoalLight],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20),
                      // Avatar
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.gold, width: 2),
                          image: user.avatarUrl != null
                              ? DecorationImage(
                                  image: CachedNetworkImageProvider(user.avatarUrl!),
                                  fit: BoxFit.cover,
                                )
                              : null,
                        ),
                        child: user.avatarUrl == null
                            ? const Icon(Icons.person, size: 50, color: AppColors.gold)
                            : null,
                      ),
                      const SizedBox(height: 16),
                      // Name & Email
                      Text(
                        user.fullName,
                        style: AppTextStyles.displaySmall.copyWith(color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: AppTextStyles.bodyMedium.copyWith(color: Colors.white70),
                      ),
                      const SizedBox(height: 12),
                      // Edit Button
                      OutlinedButton(
                        onPressed: () => context.push('/edit-profile'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white30),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: AppRadius.borderFull),
                        ),
                        child: const Text('Chỉnh sửa hồ sơ', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _MenuSection(
                    title: 'Tài khoản',
                    items: [
                      _MenuItem(
                        icon: Icons.straighten_outlined,
                        title: 'Số đo cơ thể',
                        subtitle: 'Cập nhật số đo để thử đồ chính xác hơn',
                        onTap: () => context.push('/measurements'),
                      ),
                      _MenuItem(
                        icon: Icons.lock_outline_rounded,
                        title: 'Đổi mật khẩu',
                        onTap: () => context.push('/change-password'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _MenuSection(
                    title: 'Khác',
                    items: [
                      _MenuItem(
                        icon: Icons.headset_mic_outlined,
                        title: 'Trung tâm trợ giúp',
                        onTap: () {}, // TODO: Open support link
                      ),
                      _MenuItem(
                        icon: Icons.description_outlined,
                        title: 'Điều khoản dịch vụ',
                        onTap: () {}, // TODO: Open terms link
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton.icon(
                      onPressed: () {
                        ref.read(authProvider.notifier).logout();
                        context.go('/login');
                      },
                      icon: const Icon(Icons.logout_rounded, color: AppColors.error),
                      label: Text('Đăng xuất', style: AppTextStyles.titleMedium.copyWith(color: AppColors.error)),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppColors.errorSurface,
                        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderMd),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(title, style: AppTextStyles.titleMedium),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadius.borderLg,
            boxShadow: AppShadows.sm,
            border: Border.all(color: AppColors.border, width: 0.5),
          ),
          child: Column(
            children: items.asMap().entries.map((e) {
              final isLast = e.key == items.length - 1;
              return Column(
                children: [
                  e.value,
                  if (!isLast) const Divider(indent: 56, endIndent: 16),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.borderLg,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.surfaceElevated,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.charcoal, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.titleMedium),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!, style: AppTextStyles.bodySmall),
                  ],
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
          ],
        ),
      ),
    );
  }
}
