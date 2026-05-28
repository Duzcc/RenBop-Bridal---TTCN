import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform, TargetPlatform;

String get _baseUrl {
  if (kIsWeb) return 'http://localhost:8080/api';
  if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:8080/api';
  return 'http://localhost:8080/api';
}

const _storage = FlutterSecureStorage();

class ApiClient {
  ApiClient._();
  static final ApiClient _instance = ApiClient._();
  static ApiClient get instance => _instance;

  late final Dio _dio = _buildDio();

  Dio get dio => _dio;

  Dio _buildDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Logger (debug only)
    if (const bool.fromEnvironment('dart.vm.product') == false) {
      dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: false,
          requestBody: true,
          responseBody: true,
          error: true,
          compact: true,
        ),
      );
    }

    // Auth interceptor with auto token refresh
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'access_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            final refreshed = await _tryRefreshToken(dio);
            if (refreshed) {
              final token = await _storage.read(key: 'access_token');
              final opts = error.requestOptions;
              opts.headers['Authorization'] = 'Bearer $token';
              try {
                final response = await dio.fetch(opts);
                handler.resolve(response);
                return;
              } catch (_) {}
            }
            // Refresh failed — clear tokens
            await clearTokens();
          }
          handler.next(error);
        },
      ),
    );

    return dio;
  }

  Future<bool> _tryRefreshToken(Dio dio) async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      if (refreshToken == null) return false;

      final refreshDio = Dio(BaseOptions(baseUrl: _baseUrl));
      final res = await refreshDio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = res.data['data'];
      if (data != null) {
        await _storage.write(key: 'access_token', value: data['accessToken']);
        await _storage.write(key: 'refresh_token', value: data['refreshToken']);
        return true;
      }
    } catch (_) {}
    return false;
  }

  static Future<void> saveTokens(
      String accessToken, String refreshToken) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
  }

  static Future<void> clearTokens() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  static Future<String?> getAccessToken() =>
      _storage.read(key: 'access_token');

  static Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }
}

/// Shorthand helpers
extension ApiClientX on ApiClient {
  Future<Response> get(String path,
          {Map<String, dynamic>? params}) =>
      _dio.get(path, queryParameters: params);

  Future<Response> post(String path, {dynamic data}) =>
      _dio.post(path, data: data);

  Future<Response> put(String path, {dynamic data}) =>
      _dio.put(path, data: data);

  Future<Response> delete(String path) => _dio.delete(path);
}
