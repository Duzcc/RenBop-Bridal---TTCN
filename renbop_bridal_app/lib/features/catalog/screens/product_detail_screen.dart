import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/models/models.dart';
import '../../../core/utils/app_utils.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final int productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState
    extends ConsumerState<ProductDetailScreen> {
  int _currentImage = 0;
  ProductItemModel? _selectedItem;
  DateTime? _rentalStart;
  DateTime? _rentalEnd;
  final _pageCtrl = PageController();

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDateRange(BuildContext context) async {
    final now = DateTime.now();
    final range = await showDateRangePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
      initialDateRange: _rentalStart != null && _rentalEnd != null
          ? DateTimeRange(start: _rentalStart!, end: _rentalEnd!)
          : null,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.gold,
            onPrimary: Colors.white,
            surface: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (range != null) {
      setState(() {
        _rentalStart = range.start;
        _rentalEnd = range.end;
      });
    }
  }

  void _addToCart(ProductModel product) {
    if (_selectedItem == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn size')),
      );
      return;
    }

    ref.read(cartProvider.notifier).add(
          CartItem(
            product: product,
            productItem: _selectedItem!,
            price: product.displayPrice,
            rentalStart: _rentalStart,
            rentalEnd: _rentalEnd,
          ),
        );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            const Text('Đã thêm vào giỏ hàng'),
            const Spacer(),
            TextButton(
              style: TextButton.styleFrom(padding: EdgeInsets.zero),
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
                context.push('/cart');
              },
              child: const Text('Xem giỏ', style: TextStyle(color: AppColors.gold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => context.pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.9),
              shape: BoxShape.circle,
              boxShadow: AppShadows.sm,
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          ),
        ),
        actions: [
          GestureDetector(
            onTap: () => context.push('/cart'),
            child: Container(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.9),
                shape: BoxShape.circle,
                boxShadow: AppShadows.sm,
              ),
              child: const Icon(Icons.shopping_bag_outlined, size: 20),
            ),
          ),
        ],
      ),
      body: productAsync.when(
        data: (product) => _ProductContent(
          product: product,
          currentImage: _currentImage,
          selectedItem: _selectedItem,
          rentalStart: _rentalStart,
          rentalEnd: _rentalEnd,
          pageCtrl: _pageCtrl,
          onImageChanged: (i) => setState(() => _currentImage = i),
          onItemSelected: (item) => setState(() => _selectedItem = item),
          onPickDate: () => _pickDateRange(context),
          onAddToCart: () => _addToCart(product),
          onBuyNow: () {
            _addToCart(product);
            context.push('/cart');
          },
        ),
        loading: () => const _ProductDetailShimmer(),
        error: (e, _) => Center(child: Text('Lỗi: $e')),
      ),
    );
  }
}

class _ProductContent extends StatelessWidget {
  final ProductModel product;
  final int currentImage;
  final ProductItemModel? selectedItem;
  final DateTime? rentalStart;
  final DateTime? rentalEnd;
  final PageController pageCtrl;
  final ValueChanged<int> onImageChanged;
  final ValueChanged<ProductItemModel> onItemSelected;
  final VoidCallback onPickDate;
  final VoidCallback onAddToCart;
  final VoidCallback onBuyNow;

  const _ProductContent({
    required this.product,
    required this.currentImage,
    required this.selectedItem,
    required this.rentalStart,
    required this.rentalEnd,
    required this.pageCtrl,
    required this.onImageChanged,
    required this.onItemSelected,
    required this.onPickDate,
    required this.onAddToCart,
    required this.onBuyNow,
  });

  @override
  Widget build(BuildContext context) {
    final availableItems =
        product.items.where((i) => i.isAvailable).toList();
    final sizes = availableItems.map((i) => i.size).toSet().toList();

    return Column(
      children: [
        // Image carousel
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.5,
          child: Stack(
            children: [
              PageView.builder(
                controller: pageCtrl,
                onPageChanged: onImageChanged,
                itemCount: product.imageUrls.isEmpty ? 1 : product.imageUrls.length,
                itemBuilder: (_, i) {
                  final url = product.imageUrls.isEmpty ? '' : product.imageUrls[i];
                  return url.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: url,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          placeholder: (_, __) => Shimmer.fromColors(
                            baseColor: AppColors.border,
                            highlightColor: AppColors.ivory,
                            child: Container(color: Colors.white),
                          ),
                        )
                      : Container(
                          color: AppColors.ivoryDark,
                          child: const Center(
                            child: Icon(Icons.diamond_outlined,
                                size: 64, color: AppColors.textMuted),
                          ),
                        );
                },
              ),

              // Image dots
              if (product.imageUrls.length > 1)
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: product.imageUrls.asMap().entries.map((e) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: currentImage == e.key ? 18 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: currentImage == e.key
                              ? AppColors.gold
                              : Colors.white.withValues(alpha: 0.6),
                          borderRadius: AppRadius.borderFull,
                        ),
                      );
                    }).toList(),
                  ),
                ),

              // Discount badge
              if (product.hasDiscount)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 56,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      borderRadius: AppRadius.borderFull,
                    ),
                    child: Text(
                      '-${(((product.basePrice - product.salePrice!) / product.basePrice) * 100).round()}%',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: Colors.white,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),

        // Content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category tag
                if (product.category != null)
                  Text(
                    product.category!.name.toUpperCase(),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.gold,
                      letterSpacing: 1.5,
                    ),
                  ),
                const SizedBox(height: 8),

                // Name
                Text(product.name, style: AppTextStyles.headlineLarge),
                const SizedBox(height: 12),

                // Price
                Row(
                  children: [
                    Text(
                      AppUtils.formatCurrency(product.displayPrice),
                      style: AppTextStyles.headlineSmall.copyWith(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (product.hasDiscount) ...[
                      const SizedBox(width: 10),
                      Text(
                        AppUtils.formatCurrency(product.basePrice),
                        style: AppTextStyles.bodyMedium.copyWith(
                          decoration: TextDecoration.lineThrough,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 20),

                // Size selector
                if (sizes.isNotEmpty) ...[
                  Text('Chọn kích cỡ', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: sizes.map((size) {
                      final item = availableItems.firstWhere((i) => i.size == size);
                      final isSelected = selectedItem?.id == item.id;
                      return GestureDetector(
                        onTap: () => onItemSelected(item),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 18, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.charcoal : Colors.white,
                            borderRadius: AppRadius.borderMd,
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.charcoal
                                  : AppColors.border,
                              width: 1.5,
                            ),
                          ),
                          child: Text(
                            size,
                            style: AppTextStyles.labelMedium.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                ],

                // Rental dates
                Text('Ngày thuê', style: AppTextStyles.titleMedium),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: onPickDate,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceElevated,
                      borderRadius: AppRadius.borderMd,
                      border: Border.all(
                        color: rentalStart != null
                            ? AppColors.gold
                            : AppColors.border,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.calendar_today_outlined,
                          size: 18,
                          color: rentalStart != null
                              ? AppColors.gold
                              : AppColors.textMuted,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          rentalStart != null && rentalEnd != null
                              ? '${AppUtils.formatDate(rentalStart!.toIso8601String())} → ${AppUtils.formatDate(rentalEnd!.toIso8601String())}'
                              : 'Chọn ngày thuê',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: rentalStart != null
                                ? AppColors.textPrimary
                                : AppColors.textMuted,
                            fontWeight: rentalStart != null
                                ? FontWeight.w600
                                : FontWeight.w400,
                          ),
                        ),
                        const Spacer(),
                        const Icon(Icons.chevron_right_rounded,
                            color: AppColors.textMuted, size: 18),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Description
                if (product.description?.isNotEmpty == true) ...[
                  Text('Mô tả sản phẩm', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    product.description!,
                    style: AppTextStyles.bodyMedium.copyWith(height: 1.7),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ── Bottom action bar ─────────────────────────────────────────────────────────
// Note: Uses a custom bottom positioned overlay via Stack in parent. For now, using persistent
// bottom sheet approach via SafeArea + bottom fixed container.
// This is rendered separately as a floating action section.

class _ProductDetailShimmer extends StatelessWidget {
  const _ProductDetailShimmer();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.border,
      highlightColor: AppColors.ivory,
      child: Column(
        children: [
          Expanded(flex: 5, child: Container(color: Colors.white)),
          Expanded(
            flex: 5,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 14, width: 80, color: Colors.white),
                  const SizedBox(height: 12),
                  Container(height: 28, width: double.infinity, color: Colors.white),
                  const SizedBox(height: 8),
                  Container(height: 28, width: 200, color: Colors.white),
                  const SizedBox(height: 20),
                  Container(height: 22, width: 120, color: Colors.white),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
