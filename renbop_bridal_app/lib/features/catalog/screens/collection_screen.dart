import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import 'home_screen.dart';

final _selectedCategoryProvider = StateProvider<String?>((ref) => null);
final _searchQueryProvider = StateProvider<String>((ref) => '');

class CollectionScreen extends ConsumerStatefulWidget {
  const CollectionScreen({super.key});

  @override
  ConsumerState<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends ConsumerState<CollectionScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedCategory = ref.watch(_selectedCategoryProvider);
    final products = ref.watch(productsProvider(selectedCategory));
    final categories = ref.watch(categoriesProvider);
    final searchQuery = ref.watch(_searchQueryProvider);

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        backgroundColor: AppColors.ivory,
        title: const Text('Bộ sưu tập'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: _CartBadgeSmall(onTap: () => context.push('/cart')),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (v) =>
                  ref.read(_searchQueryProvider.notifier).state = v,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Tìm kiếm váy cưới...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          ref.read(_searchQueryProvider.notifier).state = '';
                        },
                      )
                    : null,
              ),
            ),
          ),

          // Categories filter
          categories.when(
            data: (cats) => SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: cats.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  if (i == 0) {
                    return _FilterChip(
                      label: 'Tất cả',
                      isSelected: selectedCategory == null,
                      onTap: () =>
                          ref.read(_selectedCategoryProvider.notifier).state = null,
                    );
                  }
                  final cat = cats[i - 1];
                  return _FilterChip(
                    label: cat.name,
                    isSelected: selectedCategory == cat.slug,
                    onTap: () => ref
                        .read(_selectedCategoryProvider.notifier)
                        .state = cat.slug,
                  );
                },
              ),
            ),
            loading: () => const SizedBox(height: 44),
            error: (_, __) => const SizedBox(height: 44),
          ),

          const SizedBox(height: 16),

          // Grid
          Expanded(
            child: products.when(
              data: (list) {
                final filtered = searchQuery.isEmpty
                    ? list
                    : list
                        .where((p) => p.name
                            .toLowerCase()
                            .contains(searchQuery.toLowerCase()))
                        .toList();

                if (filtered.isEmpty) {
                  return _EmptyState(
                    icon: Icons.search_off_rounded,
                    title: 'Không tìm thấy sản phẩm',
                    subtitle: 'Thử thay đổi từ khoá hoặc danh mục',
                  );
                }

                return RefreshIndicator(
                  color: AppColors.gold,
                  onRefresh: () async {
                    // ignore: unused_result
                    ref.refresh(productsProvider(null));
                  },
                  child: GridView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 16,
                    ),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.65,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => ProductCard(product: filtered[i]),
                  ),
                );
              },
              loading: () => GridView.builder(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.65,
                ),
                itemCount: 6,
                itemBuilder: (_, __) => _ProductCardShimmer(),
              ),
              error: (e, _) => Center(
                child: Text('Lỗi: $e', style: AppTextStyles.bodyMedium),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold : Colors.white,
          borderRadius: AppRadius.borderFull,
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.border,
          ),
          boxShadow: isSelected ? AppShadows.gold : AppShadows.sm,
        ),
        child: Text(
          label,
          style: AppTextStyles.labelMedium.copyWith(
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _CartBadgeSmall extends ConsumerWidget {
  final VoidCallback onTap;
  const _CartBadgeSmall({required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartProvider).length;
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          const Icon(Icons.shopping_bag_outlined, size: 24),
          if (count > 0)
            Positioned(
              top: -6,
              right: -6,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(
                  color: AppColors.gold,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$count',
                  style: AppTextStyles.labelSmall.copyWith(color: Colors.white, fontSize: 9),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text(title, style: AppTextStyles.titleLarge),
            const SizedBox(height: 6),
            Text(subtitle, style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
          ],
        ),
      );
}

class _ProductCardShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.border,
      highlightColor: AppColors.ivory,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadius.borderLg,
        ),
      ),
    );
  }
}
