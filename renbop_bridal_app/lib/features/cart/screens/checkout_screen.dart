import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/app_utils.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _noteCtrl = TextEditingController();
  bool _loading = false;
  String _paymentMethod = 'CASH'; // CASH | VNPAY

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) return;

    setState(() => _loading = true);

    try {
      // Build order payload
      final items = cart.map((c) => {
        'productItemId': c.productItem.id,
        'price': c.price,
        'rentalStartDate': c.rentalStart?.toIso8601String().split('T')[0],
        'rentalEndDate': c.rentalEnd?.toIso8601String().split('T')[0],
        'notes': c.notes,
      }).toList();

      final res = await ApiClient.instance.post('/orders', data: {
        'orderType': 'RENTAL',
        'note': _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
        'items': items,
      });

      final orderId = res.data['data']['id'] as int;

      if (_paymentMethod == 'VNPAY') {
        // Get VNPay URL
        final payRes = await ApiClient.instance.post(
          '/orders/$orderId/payments',
          data: {
            'method': 'VNPAY',
            'amount': ref.read(cartProvider.notifier).total,
          },
        );

        // Create VNPay URL
        final paymentId = payRes.data['data']['id'];
        final vnpayRes = await ApiClient.instance.post('/payments/vnpay/create-url', data: {
          'orderId': orderId,
          'paymentId': paymentId,
          'amount': ref.read(cartProvider.notifier).total,
          'returnUrl': 'renbopbridal://payment-result',
        });

        final paymentUrl = vnpayRes.data['data']['paymentUrl'] as String?;
        if (paymentUrl != null) {
          final uri = Uri.parse(paymentUrl);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
        }
      }

      ref.read(cartProvider.notifier).clear();

      if (mounted) {
        context.go('/orders/$orderId');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Đặt hàng thành công!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final total = ref.read(cartProvider.notifier).total;

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(title: const Text('Xác nhận đơn hàng')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order items summary
                  Text('Sản phẩm đặt hàng', style: AppTextStyles.titleLarge),
                  const SizedBox(height: 12),
                  ...cart.map((c) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: AppRadius.borderMd,
                        boxShadow: AppShadows.sm,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(c.product.name, style: AppTextStyles.titleSmall),
                                const SizedBox(height: 2),
                                Text('Size: ${c.productItem.size}', style: AppTextStyles.bodySmall),
                                if (c.rentalStart != null)
                                  Text(
                                    '${AppUtils.formatDate(c.rentalStart!.toIso8601String())} → ${AppUtils.formatDate(c.rentalEnd!.toIso8601String())}',
                                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.gold),
                                  ),
                              ],
                            ),
                          ),
                          Text(AppUtils.formatCurrency(c.price), style: AppTextStyles.titleSmall.copyWith(color: AppColors.gold)),
                        ],
                      ),
                    ),
                  )),

                  const SizedBox(height: 20),

                  // Note
                  Text('Ghi chú', style: AppTextStyles.titleLarge),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _noteCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Thêm ghi chú cho đơn hàng...',
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Payment method
                  Text('Phương thức thanh toán', style: AppTextStyles.titleLarge),
                  const SizedBox(height: 12),
                  _PaymentMethodCard(
                    icon: Icons.payments_outlined,
                    title: 'Thanh toán tiền mặt',
                    subtitle: 'Thanh toán tại cửa hàng',
                    isSelected: _paymentMethod == 'CASH',
                    onTap: () => setState(() => _paymentMethod = 'CASH'),
                  ),
                  const SizedBox(height: 10),
                  _PaymentMethodCard(
                    icon: Icons.qr_code_rounded,
                    title: 'VNPay',
                    subtitle: 'Thanh toán qua ví điện tử / thẻ ngân hàng',
                    isSelected: _paymentMethod == 'VNPAY',
                    onTap: () => setState(() => _paymentMethod = 'VNPAY'),
                  ),
                ],
              ),
            ),
          ),

          // Bottom summary
          Container(
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
                    Text('Tổng thanh toán', style: AppTextStyles.titleMedium),
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
                    onPressed: _loading ? null : _placeOrder,
                    child: _loading
                        ? const SizedBox(
                            width: 22, height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                          )
                        : Text(_paymentMethod == 'VNPAY' ? 'Thanh toán VNPay' : 'Đặt hàng'),
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

class _PaymentMethodCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethodCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.goldSurface : Colors.white,
          borderRadius: AppRadius.borderMd,
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected ? AppShadows.gold : AppShadows.sm,
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.gold : AppColors.textMuted, size: 24),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.titleMedium),
                  Text(subtitle, style: AppTextStyles.bodySmall),
                ],
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.gold : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.gold : AppColors.border,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? const Icon(Icons.check_rounded, size: 12, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
