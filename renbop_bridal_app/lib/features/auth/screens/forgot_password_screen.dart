import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../widgets/auth_header.dart';
import '../widgets/auth_text_field.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _sent = false;
  bool _loading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final ok = await ref.read(authProvider.notifier).forgotPassword(_emailCtrl.text.trim());
    if (mounted) setState(() { _loading = false; _sent = ok; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ivory,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: _sent ? _SuccessState(email: _emailCtrl.text) : Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 12),
                IconButton(
                  alignment: Alignment.centerLeft,
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                ),
                const SizedBox(height: 16),
                const AuthHeader(
                  title: 'Quên mật khẩu',
                  subtitle: 'Nhập email của bạn để nhận link đặt lại mật khẩu',
                ),
                const SizedBox(height: 40),
                AuthTextField(
                  controller: _emailCtrl,
                  label: 'Email',
                  hint: 'your@email.com',
                  icon: Icons.mail_outline_rounded,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập email';
                    if (!v.contains('@')) return 'Email không hợp lệ';
                    return null;
                  },
                ),
                const SizedBox(height: 32),
                Container(
                  height: 54,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.gold, AppColors.goldDark]),
                    borderRadius: AppRadius.borderMd,
                    boxShadow: AppShadows.gold,
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: AppRadius.borderMd,
                      onTap: _loading ? null : _submit,
                      child: Center(
                        child: _loading
                            ? const SizedBox(width: 22, height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                            : Text('Gửi email khôi phục', style: AppTextStyles.labelLarge.copyWith(color: Colors.white, fontSize: 16)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SuccessState extends StatelessWidget {
  final String email;
  const _SuccessState({required this.email});

  @override
  Widget build(BuildContext context) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Container(
        width: 80, height: 80,
        decoration: BoxDecoration(
          color: AppColors.successSurface,
          borderRadius: AppRadius.borderFull,
        ),
        child: const Icon(Icons.mark_email_read_outlined, color: AppColors.success, size: 36),
      ),
      const SizedBox(height: 24),
      Text('Email đã được gửi!', style: AppTextStyles.headlineMedium),
      const SizedBox(height: 12),
      Text(
        'Chúng tôi đã gửi link đặt lại mật khẩu đến\n$email',
        textAlign: TextAlign.center,
        style: AppTextStyles.bodyMedium,
      ),
      const SizedBox(height: 40),
      OutlinedButton(
        onPressed: () => context.go('/login'),
        child: const Text('Quay lại đăng nhập'),
      ),
    ],
  );
}
