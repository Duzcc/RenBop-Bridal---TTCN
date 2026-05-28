import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../../core/constants/app_constants.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _currentPage = 0;

  final _pages = [
    _OnboardingPage(
      gradient: [AppColors.charcoal, const Color(0xFF1A1B2E)],
      accentColor: AppColors.gold,
      icon: Icons.diamond_outlined,
      title: 'Bộ sưu tập\nVáy cưới cao cấp',
      subtitle: 'Khám phá hàng trăm mẫu váy cưới sang trọng, được tuyển chọn kỹ lưỡng từ các nhà thiết kế hàng đầu.',
      tag: 'WEDDING COLLECTION',
    ),
    _OnboardingPage(
      gradient: [const Color(0xFF1A0E00), const Color(0xFF2D1A00)],
      accentColor: AppColors.goldLight,
      icon: Icons.content_cut_outlined,
      title: 'May đo\nTheo số đo của bạn',
      subtitle: 'Dịch vụ may đo riêng với đội ngũ thợ lành nghề, đảm bảo bộ váy vừa vặn hoàn hảo với vóc dáng của bạn.',
      tag: 'BESPOKE TAILORING',
    ),
    _OnboardingPage(
      gradient: [const Color(0xFF0A0A14), const Color(0xFF14142A)],
      accentColor: AppColors.gold,
      icon: Icons.calendar_today_outlined,
      title: 'Đặt lịch thử\nTrải nghiệm hoàn hảo',
      subtitle: 'Đặt lịch thử đồ thuận tiện, được tư vấn trực tiếp bởi stylist chuyên nghiệp tại cửa hàng.',
      tag: 'PERSONAL STYLING',
    ),
  ];

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('seen_onboarding', true);
    if (mounted) context.go('/login');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.charcoal,
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemCount: _pages.length,
            itemBuilder: (ctx, i) => _OnboardingPageView(page: _pages[i]),
          ),

          // Bottom controls
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _BottomControls(
              controller: _controller,
              currentPage: _currentPage,
              pageCount: _pages.length,
              onFinish: _finish,
            ),
          ),

          // Skip button
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 20,
            child: TextButton(
              onPressed: _finish,
              child: Text(
                'Bỏ qua',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withValues(alpha: 0.55),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingPage {
  final List<Color> gradient;
  final Color accentColor;
  final IconData icon;
  final String title;
  final String subtitle;
  final String tag;

  const _OnboardingPage({
    required this.gradient,
    required this.accentColor,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.tag,
  });
}

class _OnboardingPageView extends StatelessWidget {
  final _OnboardingPage page;
  const _OnboardingPageView({required this.page});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: page.gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(32, 60, 32, 160),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Decorative Icon
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: page.accentColor.withValues(alpha: 0.12),
                  borderRadius: AppRadius.borderXl,
                  border: Border.all(
                    color: page.accentColor.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Icon(
                  page.icon,
                  color: page.accentColor,
                  size: 32,
                ),
              ),

              const Spacer(flex: 2),

              // Tag
              Text(
                page.tag,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2.5,
                  color: page.accentColor.withValues(alpha: 0.8),
                ),
              ),
              const SizedBox(height: 16),

              // Title
              Text(
                page.title,
                style: TextStyle(
                  fontFamily: 'CormorantGaramond',
                  fontSize: 40,
                  fontWeight: FontWeight.w600,
                  height: 1.15,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 20),

              // Subtitle
              Text(
                page.subtitle,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  height: 1.65,
                  color: Colors.white.withValues(alpha: 0.55),
                ),
              ),

              const Spacer(flex: 3),
            ],
          ),
        ),
      ),
    );
  }
}

class _BottomControls extends StatelessWidget {
  final PageController controller;
  final int currentPage;
  final int pageCount;
  final VoidCallback onFinish;

  const _BottomControls({
    required this.controller,
    required this.currentPage,
    required this.pageCount,
    required this.onFinish,
  });

  @override
  Widget build(BuildContext context) {
    final isLast = currentPage == pageCount - 1;

    return Container(
      padding: EdgeInsets.fromLTRB(
          32, 24, 32, MediaQuery.of(context).padding.bottom + 32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.transparent, Colors.black.withValues(alpha: 0.6)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Row(
        children: [
          // Page indicator
          SmoothPageIndicator(
            controller: controller,
            count: pageCount,
            effect: ExpandingDotsEffect(
              activeDotColor: AppColors.gold,
              dotColor: Colors.white.withValues(alpha: 0.25),
              dotWidth: 6,
              dotHeight: 6,
              expansionFactor: 3,
              spacing: 5,
            ),
          ),

          const Spacer(),

          // Next / Get Started button
          GestureDetector(
            onTap: () {
              if (isLast) {
                onFinish();
              } else {
                controller.nextPage(
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOutCubic,
                );
              }
            },
            child: Container(
              height: 52,
              padding: EdgeInsets.symmetric(
                  horizontal: isLast ? 28 : 0),
              width: isLast ? 140 : 52,
              decoration: BoxDecoration(
                color: AppColors.gold,
                borderRadius: AppRadius.borderFull,
                boxShadow: AppShadows.gold,
              ),
              child: isLast
                  ? Center(
                      child: Text(
                        'Bắt đầu',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    )
                  : const Center(
                      child: Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
