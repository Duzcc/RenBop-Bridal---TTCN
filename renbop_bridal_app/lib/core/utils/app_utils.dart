import 'package:intl/intl.dart';

class AppUtils {
  AppUtils._();

  static final _vndFormat = NumberFormat.currency(
    locale: 'vi_VN',
    symbol: '₫',
    decimalDigits: 0,
  );

  static String formatCurrency(double amount) => _vndFormat.format(amount);

  static String formatDate(String? isoString) {
    if (isoString == null) return '—';
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('dd/MM/yyyy', 'vi').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  static String formatDateTime(String? isoString) {
    if (isoString == null) return '—';
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('HH:mm • dd/MM/yyyy', 'vi').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  static String timeAgo(String? isoString) {
    if (isoString == null) return '';
    try {
      final dt = DateTime.parse(isoString).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Vừa xong';
      if (diff.inHours < 1) return '${diff.inMinutes} phút trước';
      if (diff.inDays < 1) return '${diff.inHours} giờ trước';
      if (diff.inDays < 30) return '${diff.inDays} ngày trước';
      return formatDate(isoString);
    } catch (_) {
      return '';
    }
  }

  static String orderStatusLabel(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  static String fittingStatusLabel(String status) {
    switch (status) {
      case 'SCHEDULED':
        return 'Đã đặt lịch';
      case 'IN_PROGRESS':
        return 'Đang thử';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  static String orderTypeLabel(String type) {
    switch (type) {
      case 'RENTAL':
        return 'Thuê váy';
      case 'TAILORING':
        return 'May đo';
      default:
        return type;
    }
  }
}
