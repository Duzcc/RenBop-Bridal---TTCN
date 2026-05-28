import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/app_utils.dart';
import '../../../core/models/models.dart';

class OrderDetailScreen extends ConsumerWidget {
  final int orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text('Chi tiết Đơn hàng #$orderId'),
      ),
      body: orderAsync.when(
        data: (order) => _OrderDetailContent(order: order),
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
        error: (e, _) => Center(child: Text('Lỗi tải chi tiết đơn hàng: $e')),
      ),
    );
  }
}

class _OrderDetailContent extends StatelessWidget {
  final OrderModel order;

  const _OrderDetailContent({required this.order});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING': return AppColors.warning;
      case 'IN_PROGRESS': return AppColors.info;
      case 'COMPLETED': return AppColors.success;
      case 'CANCELLED': return AppColors.error;
      default: return AppColors.textMuted;
    }
  }

  Color _getStatusBgColor(String status) {
    switch (status) {
      case 'PENDING': return AppColors.warningSurface;
      case 'IN_PROGRESS': return AppColors.infoSurface;
      case 'COMPLETED': return AppColors.successSurface;
      case 'CANCELLED': return AppColors.errorSurface;
      default: return AppColors.surfaceElevated;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Status Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadius.borderLg,
              boxShadow: AppShadows.sm,
              border: Border.all(color: AppColors.border, width: 0.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Trạng thái', style: AppTextStyles.bodyMedium),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getStatusBgColor(order.status),
                        borderRadius: AppRadius.borderFull,
                      ),
                      child: Text(
                        AppUtils.orderStatusLabel(order.status),
                        style: AppTextStyles.labelMedium.copyWith(
                          color: _getStatusColor(order.status),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Ngày đặt', style: AppTextStyles.bodyMedium),
                    Text(AppUtils.formatDateTime(order.createdAt), style: AppTextStyles.titleMedium),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Loại đơn', style: AppTextStyles.bodyMedium),
                    Text(AppUtils.orderTypeLabel(order.orderType), style: AppTextStyles.titleMedium),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Items List
          Text('Sản phẩm', style: AppTextStyles.titleLarge),
          const SizedBox(height: 12),
          ...order.items.map((item) => _OrderItemCard(item: item)),
          const SizedBox(height: 24),

          // Note
          if (order.note != null && order.note!.isNotEmpty) ...[
            Text('Ghi chú', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadius.borderMd,
                border: Border.all(color: AppColors.border),
              ),
              child: Text(order.note!, style: AppTextStyles.bodyMedium),
            ),
            const SizedBox(height: 24),
          ],

          // Total
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.charcoal,
              borderRadius: AppRadius.borderLg,
              boxShadow: AppShadows.md,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Tổng thanh toán', style: AppTextStyles.titleMedium.copyWith(color: Colors.white)),
                Text(
                  AppUtils.formatCurrency(order.totalAmount),
                  style: AppTextStyles.headlineMedium.copyWith(color: AppColors.gold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _OrderItemCard extends StatelessWidget {
  final OrderItemModel item;
  const _OrderItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.borderMd,
        boxShadow: AppShadows.sm,
        border: Border.all(color: AppColors.border, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  item.productName ?? 'Sản phẩm ${item.productItemId}',
                  style: AppTextStyles.titleMedium,
                ),
              ),
              Text(AppUtils.formatCurrency(item.price), style: AppTextStyles.titleMedium.copyWith(color: AppColors.gold)),
            ],
          ),
          if (item.sku != null) ...[
            const SizedBox(height: 4),
            Text('Mã: ${item.sku}', style: AppTextStyles.bodySmall),
          ],
          if (item.rentalStartDate != null && item.rentalEndDate != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.gold),
                const SizedBox(width: 6),
                Text(
                  '${AppUtils.formatDate(item.rentalStartDate)} → ${AppUtils.formatDate(item.rentalEndDate)}',
                  style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
