import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/app_utils.dart';
import '../../../core/models/models.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final products = ref.watch(productsProvider(null));
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: AppColors.ivory,
      body: CustomScrollView(
        slivers: [
          // SliverAppBar with greeting
          SliverAppBar(
            pinned: false,
            floating: true,
            expandedHeight: 0,
            backgroundColor: AppColors.ivory,
            elevation: 0,
            flexibleSpace: Container(),
            title: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Xin chào,',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textMuted,
                      ),
                    ),
                    Text(
                      auth.user?.fullName.split(' ').last ?? 'Khách',
                      style: AppTextStyles.titleLarge,
                    ),
                  ],
                ),
                const Spacer(),
                // Cart icon
                _CartBadge(onTap: () => context.push('/cart')),
              ],
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero Banner
                _HeroBanner(),
                const SizedBox(height: 32),

                // Categories
                _SectionHeader(
                  title: 'Danh mục',
                  onSeeAll: () => context.go('/collection'),
                ),
                const SizedBox(height: 16),
                categories.when(
                  data: (cats) => _CategoryChips(categories: cats),
                  loading: () => _CategoryChipsShimmer(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 32),

                // Featured Products
                _SectionHeader(
                  title: 'Nổi bật',
                  subtitle: 'Bộ sưu tập được yêu thích nhất',
                  onSeeAll: () => context.go('/collection'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),

          // Product grid
          products.when(
            data: (list) => SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => ProductCard(product: list[i]),
                  childCount: list.take(6).length,
                ),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.65,
                ),
              ),
            ),
            loading: () => SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                delegate: SliverChildBuilderDelegate(
                  (_, __) => _ProductCardShimmer(),
                  childCount: 4,
                ),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.65,
                ),
              ),
            ),
            error: (e, _) => SliverToBoxAdapter(
              child: Center(child: Text('Lỗi tải sản phẩm: $e')),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 32)),

          // Testimonials / Brand section
          SliverToBoxAdapter(child: _BrandSection()),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}

// ── Hero Banner ───────────────────────────────────────────────────────────────
class _HeroBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      height: 220,
      decoration: BoxDecoration(
        borderRadius: AppRadius.borderXl,
        gradient: const LinearGradient(
          colors: [AppColors.charcoal, AppColors.charcoalLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: AppShadows.lg,
      ),
      child: Stack(
        children: [
          // Gold blur accent
          Positioned(
            right: -30,
            top: -30,
            child: Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    borderRadius: AppRadius.borderFull,
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    'MÙA CƯỚI 2025',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.gold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Váy cưới\nnhư mơ',
                  style: TextStyle(
                    fontFamily: 'CormorantGaramond',
                    fontSize: 34,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    height: 1.2,
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => GoRouter.of(context).go('/collection'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.gold,
                      borderRadius: AppRadius.borderFull,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Khám phá ngay',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 16),
                      ],
                    ),
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

// ── Section Header ────────────────────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final VoidCallback? onSeeAll;

  const _SectionHeader({required this.title, this.subtitle, this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTextStyles.headlineSmall),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: AppTextStyles.bodySmall),
              ],
            ],
          ),
          const Spacer(),
          if (onSeeAll != null)
            TextButton(
              onPressed: onSeeAll,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                minimumSize: Size.zero,
              ),
              child: Row(
                children: [
                  Text('Xem tất cả', style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold)),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.gold, size: 18),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
class _CategoryChips extends StatelessWidget {
  final List<CategoryModel> categories;
  const _CategoryChips({required this.categories});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          _CategoryChip(label: 'Tất cả', isSelected: true, onTap: () => context.go('/collection')),
          ...categories.map((c) => _CategoryChip(
                label: c.name,
                onTap: () => context.go('/collection?category=${c.slug}'),
              )),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({required this.label, this.isSelected = false, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 10),
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

class _CategoryChipsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: List.generate(
          4,
          (_) => Shimmer.fromColors(
            baseColor: AppColors.border,
            highlightColor: AppColors.ivory,
            child: Container(
              margin: const EdgeInsets.only(right: 10),
              width: 90,
              height: 38,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadius.borderFull,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Product Card ──────────────────────────────────────────────────────────────
class ProductCard extends StatelessWidget {
  final ProductModel product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/products/${product.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadius.borderLg,
          boxShadow: AppShadows.sm,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
                child: product.firstImageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: product.firstImageUrl,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (_, __) => Shimmer.fromColors(
                          baseColor: AppColors.border,
                          highlightColor: AppColors.ivory,
                          child: Container(color: Colors.white),
                        ),
                        errorWidget: (_, __, ___) => Container(
                          color: AppColors.ivoryDark,
                          child: const Icon(Icons.image_not_supported_outlined,
                              color: AppColors.textMuted),
                        ),
                      )
                    : Container(
                        color: AppColors.ivoryDark,
                        child: const Center(
                          child: Icon(Icons.diamond_outlined,
                              color: AppColors.textMuted, size: 32),
                        ),
                      ),
              ),
            ),

            // Info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: AppTextStyles.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (product.hasDiscount) ...[
                        Text(
                          AppUtils.formatCurrency(product.basePrice),
                          style: AppTextStyles.bodySmall.copyWith(
                            decoration: TextDecoration.lineThrough,
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Text(
                        AppUtils.formatCurrency(product.displayPrice),
                        style: AppTextStyles.titleSmall.copyWith(
                          color: AppColors.gold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
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

// ── Cart Badge ────────────────────────────────────────────────────────────────
class _CartBadge extends ConsumerWidget {
  final VoidCallback onTap;
  const _CartBadge({required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartProvider).length;

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadius.borderMd,
              boxShadow: AppShadows.sm,
            ),
            child: const Icon(Icons.shopping_bag_outlined, size: 20),
          ),
          if (count > 0)
            Positioned(
              top: -4,
              right: -4,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppColors.gold,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$count',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: Colors.white,
                    fontSize: 9,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Brand Section ─────────────────────────────────────────────────────────────
class _BrandSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.charcoal, AppColors.charcoalLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadius.borderXl,
      ),
      child: Column(
        children: [
          Text(
            'RENBO BRIDAL',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.gold,
              letterSpacing: 3,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '"Mỗi cô dâu đều\nxứng đáng được\nlộng lẫy nhất"',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'CormorantGaramond',
              fontSize: 24,
              fontWeight: FontWeight.w400,
              fontStyle: FontStyle.italic,
              color: Colors.white,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _StatItem(value: '500+', label: 'Mẫu váy'),
              _Dot(),
              _StatItem(value: '2000+', label: 'Cô dâu hài lòng'),
              _Dot(),
              _StatItem(value: '5★', label: 'Đánh giá'),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(value, style: AppTextStyles.titleLarge.copyWith(color: AppColors.gold)),
      const SizedBox(height: 2),
      Text(label, style: AppTextStyles.bodySmall.copyWith(color: Colors.white54, fontSize: 10)),
    ],
  );
}

class _Dot extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    child: Container(width: 1, height: 32, color: Colors.white12),
  );
}
