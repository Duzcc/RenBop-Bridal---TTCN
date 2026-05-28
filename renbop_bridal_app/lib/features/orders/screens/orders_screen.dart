import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/utils/app_utils.dart';
import '../../../core/models/models.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.ivory,
        appBar: AppBar(
          title: const Text('Quản lý Đơn hàng'),
          backgroundColor: AppColors.ivory,
          bottom: TabBar(
            indicatorColor: AppColors.gold,
            labelColor: AppColors.gold,
            unselectedLabelColor: AppColors.textMuted,
            labelStyle: AppTextStyles.labelMedium,
            indicatorWeight: 3,
            tabs: const [
              Tab(text: 'Lịch sử thuê váy'),
              Tab(text: 'Lịch hẹn thử đồ'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _OrdersListTab(),
            _FittingSessionsTab(),
          ],
        ),
      ),
    );
  }
}

class _OrdersListTab extends ConsumerWidget {
  const _OrdersListTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return ordersAsync.when(
      data: (orders) {
        return RefreshIndicator(
          color: AppColors.gold,
          onRefresh: () => ref.refresh(myOrdersProvider.future),
          child: orders.isEmpty
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: const _EmptyOrdersState(),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (_, i) => _OrderCard(order: orders[i]),
                ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
      error: (e, _) => Center(child: Text('Lỗi tải danh sách đơn hàng: $e')),
    );
  }
}

class _FittingSessionsTab extends ConsumerWidget {
  const _FittingSessionsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionsAsync = ref.watch(myFittingSessionsProvider);

    return sessionsAsync.when(
      data: (sessions) {
        return RefreshIndicator(
          color: AppColors.gold,
          onRefresh: () => ref.refresh(myFittingSessionsProvider.future),
          child: sessions.isEmpty
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: const Center(child: Text('Chưa có lịch hẹn thử đồ nào.')),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: sessions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (_, i) => _FittingSessionCard(session: sessions[i]),
                ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
      error: (e, _) => Center(child: Text('Lỗi tải lịch hẹn: $e')),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;

  const _OrderCard({required this.order});

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
    return GestureDetector(
      onTap: () => context.push('/orders/${order.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
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
                Text(
                  'Đơn hàng #${order.id}',
                  style: AppTextStyles.titleMedium,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusBgColor(order.status),
                    borderRadius: AppRadius.borderFull,
                  ),
                  child: Text(
                    AppUtils.orderStatusLabel(order.status),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: _getStatusColor(order.status),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Loại đơn:', style: AppTextStyles.bodySmall),
                Text(AppUtils.orderTypeLabel(order.orderType), style: AppTextStyles.labelMedium),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Ngày đặt:', style: AppTextStyles.bodySmall),
                Text(AppUtils.formatDateTime(order.createdAt), style: AppTextStyles.labelMedium),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Tổng tiền', style: AppTextStyles.titleMedium),
                Text(
                  AppUtils.formatCurrency(order.totalAmount),
                  style: AppTextStyles.titleLarge.copyWith(color: AppColors.gold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FittingSessionCard extends StatelessWidget {
  final FittingSessionModel session;

  const _FittingSessionCard({required this.session});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'SCHEDULED': return AppColors.info;
      case 'IN_PROGRESS': return AppColors.warning;
      case 'COMPLETED': return AppColors.success;
      case 'CANCELLED': return AppColors.error;
      default: return AppColors.textMuted;
    }
  }
  
  Color _getStatusBgColor(String status) {
    switch (status) {
      case 'SCHEDULED': return AppColors.infoSurface;
      case 'IN_PROGRESS': return AppColors.warningSurface;
      case 'COMPLETED': return AppColors.successSurface;
      case 'CANCELLED': return AppColors.errorSurface;
      default: return AppColors.surfaceElevated;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
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
              Text(
                'Lịch thử đồ #${session.id}',
                style: AppTextStyles.titleMedium,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusBgColor(session.status),
                  borderRadius: AppRadius.borderFull,
                ),
                child: Text(
                  AppUtils.fittingStatusLabel(session.status),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: _getStatusColor(session.status),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 16, color: AppColors.textMuted),
              const SizedBox(width: 8),
              Text(
                AppUtils.formatDateTime(session.fittingDate),
                style: AppTextStyles.bodyMedium,
              ),
            ],
          ),
          if (session.productName != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.diamond_outlined, size: 16, color: AppColors.gold),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    session.productName!,
                    style: AppTextStyles.bodyMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
          if (session.staffName != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.person_outline, size: 16, color: AppColors.textMuted),
                const SizedBox(width: 8),
                Text(
                  'Stylist: ${session.staffName!}',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _EmptyOrdersState extends StatelessWidget {
  const _EmptyOrdersState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 64, color: AppColors.textMuted.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('Chưa có đơn hàng nào', style: AppTextStyles.titleLarge),
          const SizedBox(height: 8),
          Text(
            'Hãy khám phá bộ sưu tập và\nchọn cho mình bộ váy ưng ý nhé',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/collection'),
            child: const Text('Xem Bộ Sưu Tập'),
          ),
        ],
      ),
    );
  }
}
