import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/models/models.dart';
import '../../../core/utils/app_utils.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: const Text('Giỏ hàng'),
        actions: [
          if (cart.isNotEmpty)
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Xóa giỏ hàng'),
                    content: const Text('Bạn có chắc muốn xóa tất cả sản phẩm?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Huỷ'),
                      ),
                      TextButton(
                        onPressed: () {
                          ref.read(cartProvider.notifier).clear();
                          Navigator.pop(context);
                        },
                        child: const Text('Xóa', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                );
              },
              child: const Text('Xóa hết', style: TextStyle(color: AppColors.error)),
            ),
        ],
      ),
      body: cart.isEmpty
          ? _EmptyCart()
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: cart.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => _CartItemCard(
                      item: cart[i],
                      onRemove: () => ref
                          .read(cartProvider.notifier)
                          .remove(cart[i].productItem.id),
                    ),
                  ),
                ),

                // Order summary + button
                _CartSummary(
                  total: ref.read(cartProvider.notifier).total,
                  onCheckout: () => context.push('/checkout'),
                ),
              ],
            ),
    );
  }
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;
  final VoidCallback onRemove;

  const _CartItemCard({required this.item, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.borderLg,
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        children: [
          // Product image
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(left: AppRadius.lg),
            child: SizedBox(
              width: 100,
              height: 120,
              child: item.product.firstImageUrl.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: item.product.firstImageUrl,
                      fit: BoxFit.cover,
                    )
                  : Container(
                      color: AppColors.ivoryDark,
                      child: const Icon(Icons.diamond_outlined,
                          color: AppColors.textMuted),
                    ),
            ),
          ),

          // Info
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.product.name,
                    style: AppTextStyles.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Size: ${item.productItem.size}',
                    style: AppTextStyles.bodySmall,
                  ),
                  if (item.rentalStart != null && item.rentalEnd != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${AppUtils.formatDate(item.rentalStart!.toIso8601String())} → ${AppUtils.formatDate(item.rentalEnd!.toIso8601String())}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.gold,
                        fontSize: 10,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        AppUtils.formatCurrency(item.price),
                        style: AppTextStyles.titleSmall.copyWith(
                          color: AppColors.gold,
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: onRemove,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.errorSurface,
                            borderRadius: AppRadius.borderSm,
                          ),
                          child: const Icon(Icons.delete_outline_rounded,
                              color: AppColors.error, size: 16),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CartSummary extends StatelessWidget {
  final double total;
  final VoidCallback onCheckout;

  const _CartSummary({required this.total, required this.onCheckout});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          24, 16, 24, MediaQuery.of(context).padding.bottom + 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tổng cộng', style: AppTextStyles.titleMedium),
              Text(
                AppUtils.formatCurrency(total),
                style: AppTextStyles.headlineSmall.copyWith(color: AppColors.gold),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: onCheckout,
              child: const Text('Tiến hành đặt hàng'),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyCart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.shopping_bag_outlined,
              size: 72, color: AppColors.textMuted.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('Giỏ hàng trống', style: AppTextStyles.headlineSmall),
          const SizedBox(height: 8),
          Text(
            'Hãy thêm những sản phẩm\nbạn yêu thích vào đây',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 28),
          ElevatedButton(
            onPressed: () => GoRouter.of(context).go('/collection'),
            child: const Text('Khám phá bộ sưu tập'),
          ),
        ],
      ),
    );
  }
}
