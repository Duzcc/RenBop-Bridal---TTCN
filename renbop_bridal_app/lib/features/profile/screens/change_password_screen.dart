import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';
import '../../auth/widgets/auth_text_field.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure1 = true;
  bool _obscure2 = true;
  bool _obscure3 = true;
  bool _loading = false;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    
    final ok = await ref.read(authProvider.notifier).changePassword(
          _currentCtrl.text,
          _newCtrl.text,
        );
        
    if (mounted) {
      setState(() => _loading = false);
      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đổi mật khẩu thành công'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      } else {
        final error = ref.read(authProvider).error;
        if (error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error), backgroundColor: AppColors.error),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: const Text('Đổi mật khẩu'),
        backgroundColor: AppColors.ivory,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AuthTextField(
                controller: _currentCtrl,
                label: 'Mật khẩu hiện tại',
                hint: '••••••••',
                icon: Icons.lock_outline_rounded,
                obscureText: _obscure1,
                suffix: IconButton(
                  onPressed: () => setState(() => _obscure1 = !_obscure1),
                  icon: Icon(_obscure1 ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppColors.textMuted, size: 20),
                ),
                validator: (v) => (v?.isEmpty ?? true) ? 'Vui lòng nhập mật khẩu hiện tại' : null,
              ),
              const SizedBox(height: 20),
              AuthTextField(
                controller: _newCtrl,
                label: 'Mật khẩu mới',
                hint: '••••••••',
                icon: Icons.lock_outline_rounded,
                obscureText: _obscure2,
                suffix: IconButton(
                  onPressed: () => setState(() => _obscure2 = !_obscure2),
                  icon: Icon(_obscure2 ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppColors.textMuted, size: 20),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu mới';
                  if (v.length < 6) return 'Mật khẩu ít nhất 6 ký tự';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              AuthTextField(
                controller: _confirmCtrl,
                label: 'Xác nhận mật khẩu mới',
                hint: '••••••••',
                icon: Icons.lock_outline_rounded,
                obscureText: _obscure3,
                suffix: IconButton(
                  onPressed: () => setState(() => _obscure3 = !_obscure3),
                  icon: Icon(_obscure3 ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppColors.textMuted, size: 20),
                ),
                validator: (v) {
                  if (v != _newCtrl.text) return 'Mật khẩu không khớp';
                  return null;
                },
              ),
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Cập nhật mật khẩu'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
