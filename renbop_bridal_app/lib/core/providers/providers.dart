import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../models/models.dart';

// ── Auth State ────────────────────────────────────────────────────────────────

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool clearUser = false,
  }) =>
      AuthState(
        user: clearUser ? null : user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final isAuth = await ApiClient.isAuthenticated();
    if (isAuth) {
      await refreshProfile();
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await ApiClient.instance.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = res.data['data'];
      await ApiClient.saveTokens(
        data['accessToken'] as String,
        data['refreshToken'] as String,
      );
      await refreshProfile();
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await ApiClient.instance.post('/auth/register', data: {
        'email': email,
        'password': password,
        'fullName': fullName,
        'phone': phone,
      });
      return await login(email, password);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      return false;
    }
  }

  Future<void> refreshProfile() async {
    try {
      final res = await ApiClient.instance.get('/auth/me');
      final user = UserModel.fromJson(res.data['data'] as Map<String, dynamic>);
      state = state.copyWith(user: user, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> updateProfile({
    required String fullName,
    String? phone,
  }) async {
    try {
      final res = await ApiClient.instance.put('/auth/me/profile', data: {
        'fullName': fullName,
        'phone': phone,
      });
      final user = UserModel.fromJson(res.data['data'] as Map<String, dynamic>);
      state = state.copyWith(user: user);
      return true;
    } catch (e) {
      state = state.copyWith(error: _parseError(e));
      return false;
    }
  }

  Future<bool> changePassword(
      String currentPassword, String newPassword) async {
    try {
      await ApiClient.instance.put('/auth/me/password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
      return true;
    } catch (e) {
      state = state.copyWith(error: _parseError(e));
      return false;
    }
  }

  Future<bool> forgotPassword(String email) async {
    try {
      await ApiClient.instance.post('/auth/forgot-password',
          data: {'email': email});
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiClient.instance.post('/auth/logout');
    } catch (_) {}
    await ApiClient.clearTokens();
    state = const AuthState();
  }

  String _parseError(dynamic e) {
    if (e is Exception) {
      final msg = e.toString();
      if (msg.contains('401')) return 'Email hoặc mật khẩu không đúng';
      if (msg.contains('409')) return 'Email này đã được đăng ký';
      if (msg.contains('404')) return 'Tài khoản không tồn tại';
    }
    return 'Đã có lỗi xảy ra, vui lòng thử lại';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);

// ── Cart State ────────────────────────────────────────────────────────────────

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void add(CartItem item) {
    final exists = state.any(
        (e) => e.productItem.id == item.productItem.id);
    if (!exists) {
      state = [...state, item];
    }
  }

  void remove(int productItemId) {
    state = state
        .where((e) => e.productItem.id != productItemId)
        .toList();
  }

  void updateDates(int productItemId, DateTime start, DateTime end) {
    state = [
      for (final item in state)
        if (item.productItem.id == productItemId)
          item.copyWith(rentalStart: start, rentalEnd: end)
        else
          item
    ];
  }

  void clear() => state = [];

  double get total =>
      state.fold(0, (sum, item) => sum + item.price);

  int get count => state.length;
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>(
  (ref) => CartNotifier(),
);

// ── Products Provider ─────────────────────────────────────────────────────────

final productsProvider = FutureProvider.family<List<ProductModel>, String?>(
  (ref, categorySlug) async {
    final params = <String, dynamic>{};
    if (categorySlug != null) params['category'] = categorySlug;

    final res = await ApiClient.instance.get('/products', params: params);
    final content = res.data['data']?['content'] ?? res.data['data'] ?? [];
    return (content as List)
        .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
        .toList();
  },
);

final productDetailProvider =
    FutureProvider.family<ProductModel, int>((ref, id) async {
  final res = await ApiClient.instance.get('/products/$id');
  return ProductModel.fromJson(res.data['data'] as Map<String, dynamic>);
});

final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final res = await ApiClient.instance.get('/categories');
  final data = res.data['data'];
  return (data as List)
      .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Orders Provider ───────────────────────────────────────────────────────────

final myOrdersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final res = await ApiClient.instance.get('/orders/me');
  final content = res.data['data']?['content'] ?? res.data['data'] ?? [];
  return (content as List)
      .map((e) => OrderModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final orderDetailProvider =
    FutureProvider.family<OrderModel, int>((ref, id) async {
  final res = await ApiClient.instance.get('/orders/$id');
  return OrderModel.fromJson(res.data['data'] as Map<String, dynamic>);
});

// ── Fitting Sessions Provider ─────────────────────────────────────────────────

final myFittingSessionsProvider =
    FutureProvider<List<FittingSessionModel>>((ref) async {
  final res = await ApiClient.instance.get('/fitting-sessions/me');
  final data = res.data['data'];
  return (data as List)
      .map((e) => FittingSessionModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Measurements Provider ─────────────────────────────────────────────────────

class MeasurementNotifier extends StateNotifier<AsyncValue<MeasurementModel?>> {
  MeasurementNotifier() : super(const AsyncValue.loading());

  Future<void> fetchLatest(int userId) async {
    try {
      final res = await ApiClient.instance.get('/measurements/user/$userId');
      final data = res.data['data'] as List;
      if (data.isNotEmpty) {
        // Lấy số đo mới nhất
        final measure = MeasurementModel.fromJson(data.first as Map<String, dynamic>);
        state = AsyncValue.data(measure);
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void clear() {
    state = const AsyncValue.data(null);
  }

  Future<bool> save({
    double? shoulder,
    double? armLength,
    double? bust,
    double? waist,
    double? hip,
  }) async {
    try {
      final res = await ApiClient.instance.post('/measurements', data: {
        'shoulder': shoulder,
        'armLength': armLength,
        'bust': bust,
        'waist': waist,
        'hip': hip,
      });
      final data = res.data['data'];
      final measure = MeasurementModel.fromJson(data as Map<String, dynamic>);
      state = AsyncValue.data(measure);
      return true;
    } catch (_) {
      return false;
    }
  }
}

final myMeasurementProvider =
    StateNotifierProvider<MeasurementNotifier, AsyncValue<MeasurementModel?>>((ref) {
  final notifier = MeasurementNotifier();
  final auth = ref.watch(authProvider);
  if (auth.user != null) {
    notifier.fetchLatest(auth.user!.id);
  } else {
    notifier.clear();
  }
  return notifier;
});
