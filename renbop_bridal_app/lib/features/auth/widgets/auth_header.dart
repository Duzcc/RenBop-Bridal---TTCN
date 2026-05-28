import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';

class AuthHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const AuthHeader({
    super.key,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Brand mark
        Row(
          children: [
            Container(
              width: 28,
              height: 1.5,
              color: AppColors.gold,
            ),
            const SizedBox(width: 10),
            Text(
              'RENBO BRIDAL',
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.gold,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        Text(
          title,
          style: AppTextStyles.displaySmall,
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
