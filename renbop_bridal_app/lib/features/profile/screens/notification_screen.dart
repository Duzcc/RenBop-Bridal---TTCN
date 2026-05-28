import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // In a real app, this would use a provider to fetch notifications from the server
    final notifications = _dummyNotifications;

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: const Text('Thông báo'),
        backgroundColor: AppColors.ivory,
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã đánh dấu đọc tất cả')),
              );
            },
            icon: const Icon(Icons.done_all_rounded),
          ),
        ],
      ),
      body: notifications.isEmpty
          ? const _EmptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (_, i) => _NotificationItem(notification: notifications[i]),
            ),
    );
  }
}

class _NotificationItem extends StatelessWidget {
  final Map<String, dynamic> notification;

  const _NotificationItem({required this.notification});

  @override
  Widget build(BuildContext context) {
    final bool isUnread = notification['isUnread'] as bool? ?? false;
    final String type = notification['type'] as String? ?? 'GENERAL';

    IconData getIcon() {
      switch (type) {
        case 'ORDER': return Icons.local_shipping_outlined;
        case 'FITTING': return Icons.event_available_outlined;
        case 'PROMO': return Icons.local_offer_outlined;
        default: return Icons.notifications_outlined;
      }
    }

    Color getIconColor() {
      switch (type) {
        case 'ORDER': return AppColors.info;
        case 'FITTING': return AppColors.success;
        case 'PROMO': return AppColors.warning;
        default: return AppColors.gold;
      }
    }

    Color getIconBgColor() {
      switch (type) {
        case 'ORDER': return AppColors.infoSurface;
        case 'FITTING': return AppColors.successSurface;
        case 'PROMO': return AppColors.warningSurface;
        default: return AppColors.goldSurface;
      }
    }

    return InkWell(
      onTap: () {
        // Handle notification tap
        if (type == 'ORDER' && notification['orderId'] != null) {
          context.push('/orders/${notification['orderId']}');
        }
      },
      borderRadius: AppRadius.borderLg,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isUnread ? AppColors.gold.withValues(alpha: 0.05) : Colors.white,
          borderRadius: AppRadius.borderLg,
          border: Border.all(
            color: isUnread ? AppColors.gold.withValues(alpha: 0.3) : AppColors.border,
            width: isUnread ? 1 : 0.5,
          ),
          boxShadow: isUnread ? [] : AppShadows.sm,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: getIconBgColor(),
                shape: BoxShape.circle,
              ),
              child: Icon(getIcon(), color: getIconColor(), size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notification['title'] as String,
                          style: AppTextStyles.titleMedium.copyWith(
                            fontWeight: isUnread ? FontWeight.w700 : FontWeight.w500,
                          ),
                        ),
                      ),
                      if (isUnread)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.gold,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notification['body'] as String,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: isUnread ? AppColors.textPrimary : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    notification['time'] as String,
                    style: AppTextStyles.labelSmall.copyWith(color: AppColors.textMuted),
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

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off_outlined, size: 64, color: AppColors.textMuted.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('Chưa có thông báo nào', style: AppTextStyles.titleLarge),
          const SizedBox(height: 8),
          Text(
            'Bạn sẽ nhận được thông báo về\nđơn hàng và lịch hẹn tại đây',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium,
          ),
        ],
      ),
    );
  }
}

final _dummyNotifications = [
  {
    'id': '1',
    'title': 'Đơn hàng #1002 đã được xác nhận',
    'body': 'Đơn hàng thuê váy cưới của bạn đã được xác nhận thành công. Vui lòng kiểm tra chi tiết đơn hàng.',
    'type': 'ORDER',
    'orderId': 1002,
    'time': '10 phút trước',
    'isUnread': true,
  },
  {
    'id': '2',
    'title': 'Nhắc nhở lịch hẹn thử đồ',
    'body': 'Bạn có một lịch hẹn thử đồ vào ngày mai lúc 14:00 tại showroom. Vui lòng đến đúng giờ.',
    'type': 'FITTING',
    'time': '2 giờ trước',
    'isUnread': true,
  },
  {
    'id': '3',
    'title': 'Ưu đãi mùa cưới 2025',
    'body': 'Giảm ngay 20% cho tất cả các mẫu váy cưới trong BST mới nhất. Khám phá ngay!',
    'type': 'PROMO',
    'time': '1 ngày trước',
    'isUnread': false,
  },
];
