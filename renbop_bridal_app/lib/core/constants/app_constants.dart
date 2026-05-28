import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand Colors
  static const gold = Color(0xFFC9A96E);
  static const goldLight = Color(0xFFE2C08A);
  static const goldDark = Color(0xFFAD8A52);
  static const goldSurface = Color(0xFFF5EDD9);

  // Neutrals
  static const charcoal = Color(0xFF0D0E17);
  static const charcoalLight = Color(0xFF1A1B2E);
  static const charcoalMid = Color(0xFF2C2D45);
  static const ivory = Color(0xFFFAF8F4);
  static const ivoryDark = Color(0xFFF0ECE4);
  static const cream = Color(0xFFF7F3ED);

  // Text
  static const textPrimary = Color(0xFF0D0E17);
  static const textSecondary = Color(0xFF6B6B80);
  static const textMuted = Color(0xFF9999B0);
  static const textOnDark = Color(0xFFFFFFFF);
  static const textOnDarkMuted = Color(0xFFB0B0C0);

  // Semantic
  static const success = Color(0xFF10B981);
  static const successSurface = Color(0xFFD1FAE5);
  static const warning = Color(0xFFF59E0B);
  static const warningSurface = Color(0xFFFEF3C7);
  static const error = Color(0xFFEF4444);
  static const errorSurface = Color(0xFFFEE2E2);
  static const info = Color(0xFF3B82F6);
  static const infoSurface = Color(0xFFDBEAFE);

  // Borders
  static const border = Color(0xFFE8E8F0);
  static const borderDark = Color(0xFFD1D1E0);
  static const borderOnDark = Color(0x1AFFFFFF);

  // Backgrounds
  static const surface = Color(0xFFFFFFFF);
  static const surfaceElevated = Color(0xFFF8F8FC);
}

class AppTextStyles {
  AppTextStyles._();

  // Display — Cormorant Garamond (Luxury Serif)
  static TextStyle displayLarge = const TextStyle(
    fontFamily: 'CormorantGaramond',
    fontSize: 48,
    fontWeight: FontWeight.w600,
    height: 1.1,
    letterSpacing: -0.5,
    color: AppColors.textPrimary,
  );

  static TextStyle displayMedium = const TextStyle(
    fontFamily: 'CormorantGaramond',
    fontSize: 38,
    fontWeight: FontWeight.w600,
    height: 1.15,
    letterSpacing: -0.3,
    color: AppColors.textPrimary,
  );

  static TextStyle displaySmall = const TextStyle(
    fontFamily: 'CormorantGaramond',
    fontSize: 30,
    fontWeight: FontWeight.w500,
    height: 1.2,
    letterSpacing: -0.2,
    color: AppColors.textPrimary,
  );

  // Headlines — Cormorant Garamond
  static TextStyle headlineLarge = const TextStyle(
    fontFamily: 'CormorantGaramond',
    fontSize: 26,
    fontWeight: FontWeight.w600,
    height: 1.25,
    color: AppColors.textPrimary,
  );

  static TextStyle headlineMedium = const TextStyle(
    fontFamily: 'CormorantGaramond',
    fontSize: 22,
    fontWeight: FontWeight.w500,
    height: 1.3,
    color: AppColors.textPrimary,
  );

  static TextStyle headlineSmall = const TextStyle(
    fontFamily: 'CormorantGaramond',
    fontSize: 18,
    fontWeight: FontWeight.w500,
    height: 1.35,
    color: AppColors.textPrimary,
  );

  // Title — Inter (Sans)
  static TextStyle titleLarge = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w700,
    height: 1.4,
    color: AppColors.textPrimary,
  );

  static TextStyle titleMedium = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.45,
    color: AppColors.textPrimary,
  );

  static TextStyle titleSmall = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.5,
    letterSpacing: 0.1,
    color: AppColors.textPrimary,
  );

  // Body — Inter
  static TextStyle bodyLarge = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.6,
    color: AppColors.textPrimary,
  );

  static TextStyle bodyMedium = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.55,
    color: AppColors.textSecondary,
  );

  static TextStyle bodySmall = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textMuted,
  );

  // Label — Inter
  static TextStyle labelLarge = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w700,
    height: 1.4,
    letterSpacing: 0.1,
  );

  static TextStyle labelMedium = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.4,
    letterSpacing: 0.15,
  );

  static TextStyle labelSmall = const TextStyle(
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: FontWeight.w700,
    height: 1.4,
    letterSpacing: 0.5,
  );
}

class AppRadius {
  AppRadius._();
  static const xs = Radius.circular(6);
  static const sm = Radius.circular(10);
  static const md = Radius.circular(14);
  static const lg = Radius.circular(20);
  static const xl = Radius.circular(28);
  static const full = Radius.circular(999);

  static const borderXs = BorderRadius.all(xs);
  static const borderSm = BorderRadius.all(sm);
  static const borderMd = BorderRadius.all(md);
  static const borderLg = BorderRadius.all(lg);
  static const borderXl = BorderRadius.all(xl);
  static const borderFull = BorderRadius.all(full);
}

class AppSpacing {
  AppSpacing._();
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
  static const xxl = 48.0;
  static const xxxl = 64.0;
}

class AppShadows {
  AppShadows._();

  static const sm = [
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
    BoxShadow(
      color: Color(0x06000000),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  static const md = [
    BoxShadow(
      color: Color(0x10000000),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
  ];

  static const lg = [
    BoxShadow(
      color: Color(0x18000000),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color(0x10000000),
      blurRadius: 48,
      offset: Offset(0, 16),
    ),
  ];

  static const gold = [
    BoxShadow(
      color: Color(0x30C9A96E),
      blurRadius: 20,
      offset: Offset(0, 6),
    ),
  ];
}
