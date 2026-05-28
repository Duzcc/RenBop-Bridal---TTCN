import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/providers.dart';

class MeasurementScreen extends ConsumerStatefulWidget {
  const MeasurementScreen({super.key});

  @override
  ConsumerState<MeasurementScreen> createState() => _MeasurementScreenState();
}

class _MeasurementScreenState extends ConsumerState<MeasurementScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _shoulderCtrl = TextEditingController();
  final _armLengthCtrl = TextEditingController();
  final _bustCtrl = TextEditingController();
  final _waistCtrl = TextEditingController();
  final _hipCtrl = TextEditingController();
  
  bool _loading = false;
  bool _initialized = false;

  @override
  void dispose() {
    _shoulderCtrl.dispose();
    _armLengthCtrl.dispose();
    _bustCtrl.dispose();
    _waistCtrl.dispose();
    _hipCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    
    final ok = await ref.read(myMeasurementProvider.notifier).save(
          shoulder: double.tryParse(_shoulderCtrl.text),
          armLength: double.tryParse(_armLengthCtrl.text),
          bust: double.tryParse(_bustCtrl.text),
          waist: double.tryParse(_waistCtrl.text),
          hip: double.tryParse(_hipCtrl.text),
        );
        
    if (mounted) {
      setState(() => _loading = false);
      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã lưu số đo cơ thể'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Có lỗi xảy ra, vui lòng thử lại'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final measurementAsync = ref.watch(myMeasurementProvider);
    
    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: const Text('Số đo cơ thể'),
        backgroundColor: AppColors.ivory,
      ),
      body: measurementAsync.when(
        data: (measure) {
          if (!_initialized) {
            if (measure != null) {
              _shoulderCtrl.text = measure.shoulder?.toString() ?? '';
              _armLengthCtrl.text = measure.armLength?.toString() ?? '';
              _bustCtrl.text = measure.bust?.toString() ?? '';
              _waistCtrl.text = measure.waist?.toString() ?? '';
              _hipCtrl.text = measure.hip?.toString() ?? '';
            }
            _initialized = true;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.goldSurface,
                      borderRadius: AppRadius.borderMd,
                      border: Border.all(color: AppColors.gold),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, color: AppColors.gold),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Cung cấp số đo chính xác giúp chúng tôi tư vấn và chuẩn bị váy cưới vừa vặn nhất cho bạn.',
                            style: AppTextStyles.bodySmall.copyWith(color: AppColors.goldDark),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _shoulderCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Rộng vai',
                            suffixText: 'cm',
                            prefixIcon: Icon(Icons.straighten_outlined),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _armLengthCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Dài tay',
                            suffixText: 'cm',
                            prefixIcon: Icon(Icons.straighten_outlined),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _bustCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Vòng 1 (Ngực)',
                      suffixText: 'cm',
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _waistCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Vòng 2 (Eo)',
                      suffixText: 'cm',
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _hipCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Vòng 3 (Mông)',
                      suffixText: 'cm',
                    ),
                  ),
                  const SizedBox(height: 40),
                  ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const SizedBox(
                            width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Lưu số đo'),
                  ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
        error: (e, _) => Center(child: Text('Lỗi tải thông tin: $e')),
      ),
    );
  }
}
