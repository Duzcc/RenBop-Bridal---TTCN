package com.renbobridal.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility để tạo slug thân thiện với URL từ text tiếng Việt.
 * Ví dụ: "Váy Cưới Luxury" → "vay-cuoi-luxury"
 */
public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-+");
    private static final Pattern LEADING_TRAILING_DASHES = Pattern.compile("^-|-$");

    private SlugUtil() {}

    /**
     * Chuyển đổi chuỗi thành slug ASCII.
     *
     * @param text chuỗi đầu vào (có thể chứa tiếng Việt)
     * @return slug dạng lowercase, không dấu, ngăn cách bằng "-"
     */
    public static String toSlug(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        // 1. Normalize Unicode (NFD): tách ký tự + dấu
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);

        // 2. Bỏ dấu (combining characters)
        String noDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // 3. Xử lý một số ký tự đặc biệt tiếng Việt không bị bắt bởi NFD
        noDiacritics = noDiacritics
                .replace("đ", "d").replace("Đ", "d")
                .replace("ß", "ss");

        // 4. Chuyển về lowercase
        String lower = noDiacritics.toLowerCase(Locale.ROOT);

        // 5. Thay khoảng trắng bằng "-"
        String dashed = WHITESPACE.matcher(lower).replaceAll("-");

        // 6. Xóa ký tự không hợp lệ (chỉ giữ a-z, 0-9, -)
        String slug = NON_LATIN.matcher(dashed).replaceAll("");

        // 7. Xóa nhiều dấu "-" liên tiếp
        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");

        // 8. Xóa "-" ở đầu và cuối
        slug = LEADING_TRAILING_DASHES.matcher(slug).replaceAll("");

        return slug;
    }
}
