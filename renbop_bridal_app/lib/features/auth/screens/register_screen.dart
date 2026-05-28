import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../widgets/auth_header.dart';
import '../widgets/auth_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(authProvider.notifier).register(
          email: _emailCtrl.text.trim(),
          password: _passCtrl.text,
          fullName: _nameCtrl.text.trim(),
          phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        );
    if (ok && mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.ivory,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 12),
                Row(
                  children: [
                    IconButton(
                      onPressed: () => context.go('/login'),
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const AuthHeader(
                  title: 'Tạo tài khoản',
                  subtitle: 'Bắt đầu hành trình cô dâu của bạn',
                ),
                const SizedBox(height: 32),

                AuthTextField(
                  controller: _nameCtrl,
                  label: 'Họ và tên',
                  hint: 'Nguyễn Thị An',
                  icon: Icons.person_outline_rounded,
                  validator: (v) => (v?.isEmpty ?? true) ? 'Vui lòng nhập tên' : null,
                ),
                const SizedBox(height: 14),
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
                const SizedBox(height: 14),
                AuthTextField(
                  controller: _phoneCtrl,
                  label: 'Số điện thoại (tuỳ chọn)',
                  hint: '0901 234 567',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 14),
                AuthTextField(
                  controller: _passCtrl,
                  label: 'Mật khẩu',
                  hint: '••••••••',
                  icon: Icons.lock_outline_rounded,
                  obscureText: _obscure,
                  suffix: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      size: 20, color: AppColors.textMuted,
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu';
                    if (v.length < 6) return 'Mật khẩu ít nhất 6 ký tự';
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                AuthTextField(
                  controller: _confirmCtrl,
                  label: 'Xác nhận mật khẩu',
                  hint: '••••••••',
                  icon: Icons.lock_outline_rounded,
                  obscureText: _obscure,
                  validator: (v) {
                    if (v != _passCtrl.text) return 'Mật khẩu không khớp';
                    return null;
                  },
                ),
                const SizedBox(height: 28),

                if (auth.error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.errorSurface,
                      borderRadius: AppRadius.borderMd,
                    ),
                    child: Text(auth.error!, style: AppTextStyles.bodySmall.copyWith(color: AppColors.error)),
                  ),
                  const SizedBox(height: 16),
                ],

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
                      onTap: auth.isLoading ? null : _submit,
                      child: Center(
                        child: auth.isLoading
                            ? const SizedBox(width: 22, height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                            : Text('Tạo tài khoản', style: AppTextStyles.labelLarge.copyWith(color: Colors.white, fontSize: 16)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Đã có tài khoản? ', style: AppTextStyles.bodyMedium),
                    TextButton(
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                      onPressed: () => context.go('/login'),
                      child: Text('Đăng nhập', style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold)),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
