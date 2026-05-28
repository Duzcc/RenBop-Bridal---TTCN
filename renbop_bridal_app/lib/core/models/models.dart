// Data models for Renbop Bridal app

class UserModel {
  final int id;
  final String email;
  final String fullName;
  final String? phone;
  final String? avatarUrl;
  final String role;

  const UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    this.avatarUrl,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> j) => UserModel(
        id: j['id'] as int,
        email: j['email'] as String,
        fullName: j['fullName'] as String,
        phone: j['phone'] as String?,
        avatarUrl: j['avatarUrl'] as String?,
        role: j['role'] as String? ?? 'CUSTOMER',
      );

  UserModel copyWith({
    String? email,
    String? fullName,
    String? phone,
    String? avatarUrl,
  }) =>
      UserModel(
        id: id,
        email: email ?? this.email,
        fullName: fullName ?? this.fullName,
        phone: phone ?? this.phone,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        role: role,
      );
}

// ── Category ──────────────────────────────────────────────────────────────────

class CategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? imageUrl;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.imageUrl,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> j) => CategoryModel(
        id: j['id'] as int,
        name: j['name'] as String,
        slug: j['slug'] as String,
        imageUrl: j['imageUrl'] as String?,
      );
}

// ── Product ───────────────────────────────────────────────────────────────────

class ProductItemModel {
  final int id;
  final String sku;
  final String size;
  final String? color;
  final String status; // AVAILABLE | RENTED | UNAVAILABLE

  const ProductItemModel({
    required this.id,
    required this.sku,
    required this.size,
    this.color,
    required this.status,
  });

  factory ProductItemModel.fromJson(Map<String, dynamic> j) => ProductItemModel(
        id: j['id'] as int,
        sku: j['sku'] as String,
        size: j['size'] as String,
        color: j['color'] as String?,
        status: j['status'] as String,
      );

  bool get isAvailable => status == 'AVAILABLE';
}

class ProductModel {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final double basePrice;
  final double? salePrice;
  final List<String> imageUrls;
  final CategoryModel? category;
  final List<ProductItemModel> items;

  const ProductModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.basePrice,
    this.salePrice,
    required this.imageUrls,
    this.category,
    required this.items,
  });

  factory ProductModel.fromJson(Map<String, dynamic> j) => ProductModel(
        id: j['id'] as int,
        name: j['name'] as String,
        slug: j['slug'] as String,
        description: j['description'] as String?,
        basePrice: (j['basePrice'] as num).toDouble(),
        salePrice: j['salePrice'] != null
            ? (j['salePrice'] as num).toDouble()
            : null,
        imageUrls: (j['imageUrls'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        category: j['category'] != null
            ? CategoryModel.fromJson(j['category'] as Map<String, dynamic>)
            : null,
        items: (j['items'] as List<dynamic>?)
                ?.map((e) =>
                    ProductItemModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );

  double get displayPrice => salePrice ?? basePrice;
  bool get hasDiscount => salePrice != null && salePrice! < basePrice;
  String get firstImageUrl => imageUrls.isNotEmpty ? imageUrls.first : '';
}

// ── Cart ──────────────────────────────────────────────────────────────────────

class CartItem {
  final ProductModel product;
  final ProductItemModel productItem;
  final double price;
  final DateTime? rentalStart;
  final DateTime? rentalEnd;
  final String? notes;

  const CartItem({
    required this.product,
    required this.productItem,
    required this.price,
    this.rentalStart,
    this.rentalEnd,
    this.notes,
  });

  CartItem copyWith({
    DateTime? rentalStart,
    DateTime? rentalEnd,
    String? notes,
  }) =>
      CartItem(
        product: product,
        productItem: productItem,
        price: price,
        rentalStart: rentalStart ?? this.rentalStart,
        rentalEnd: rentalEnd ?? this.rentalEnd,
        notes: notes ?? this.notes,
      );
}

// ── Order ─────────────────────────────────────────────────────────────────────

class OrderItemModel {
  final int id;
  final int? productItemId;
  final String? productName;
  final String? sku;
  final double price;
  final String? rentalStartDate;
  final String? rentalEndDate;
  final String? notes;

  const OrderItemModel({
    required this.id,
    this.productItemId,
    this.productName,
    this.sku,
    required this.price,
    this.rentalStartDate,
    this.rentalEndDate,
    this.notes,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> j) => OrderItemModel(
        id: j['id'] as int,
        productItemId: j['productItemId'] as int?,
        productName: j['productName'] as String?,
        sku: j['sku'] as String?,
        price: (j['price'] as num).toDouble(),
        rentalStartDate: j['rentalStartDate'] as String?,
        rentalEndDate: j['rentalEndDate'] as String?,
        notes: j['notes'] as String?,
      );
}

class OrderModel {
  final int id;
  final String orderType; // RENTAL | TAILORING
  final String status; // PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  final double totalAmount;
  final String? note;
  final String? createdAt;
  final String? customerName;
  final String? staffName;
  final List<OrderItemModel> items;

  const OrderModel({
    required this.id,
    required this.orderType,
    required this.status,
    required this.totalAmount,
    this.note,
    this.createdAt,
    this.customerName,
    this.staffName,
    required this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> j) => OrderModel(
        id: j['id'] as int,
        orderType: j['orderType'] as String,
        status: j['status'] as String,
        totalAmount: (j['totalAmount'] as num).toDouble(),
        note: j['note'] as String?,
        createdAt: j['createdAt'] as String?,
        customerName: j['customerName'] as String?,
        staffName: j['staffName'] as String?,
        items: (j['items'] as List<dynamic>?)
                ?.map((e) =>
                    OrderItemModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

// ── Fitting Session ───────────────────────────────────────────────────────────

class FittingSessionModel {
  final int id;
  final int? tailoringOrderId;
  final String? staffName;
  final String? fittingDate;
  final String status; // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  final String? notes;
  final String? customerName;
  final String? productName;

  const FittingSessionModel({
    required this.id,
    this.tailoringOrderId,
    this.staffName,
    this.fittingDate,
    required this.status,
    this.notes,
    this.customerName,
    this.productName,
  });

  factory FittingSessionModel.fromJson(Map<String, dynamic> j) =>
      FittingSessionModel(
        id: j['id'] as int,
        tailoringOrderId: j['tailoringOrderId'] as int?,
        staffName: j['staffName'] as String?,
        fittingDate: j['fittingDate'] as String?,
        status: j['status'] as String,
        notes: j['notes'] as String?,
        customerName: j['customerName'] as String?,
        productName: j['productName'] as String?,
      );
}

// ── Measurement ───────────────────────────────────────────────────────────────

class MeasurementModel {
  final int id;
  final double? bust;
  final double? waist;
  final double? hip;
  final double? shoulder;
  final double? armLength;
  final String? note;

  const MeasurementModel({
    required this.id,
    this.bust,
    this.waist,
    this.hip,
    this.shoulder,
    this.armLength,
    this.note,
  });

  factory MeasurementModel.fromJson(Map<String, dynamic> j) =>
      MeasurementModel(
        id: j['id'] as int,
        bust: j['bust'] != null ? (j['bust'] as num).toDouble() : null,
        waist: j['waist'] != null ? (j['waist'] as num).toDouble() : null,
        hip: j['hip'] != null ? (j['hip'] as num).toDouble() : null,
        shoulder:
            j['shoulder'] != null ? (j['shoulder'] as num).toDouble() : null,
        armLength: j['armLength'] != null
            ? (j['armLength'] as num).toDouble()
            : null,
        note: j['note'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'bust': bust,
        'waist': waist,
        'hip': hip,
        'shoulder': shoulder,
        'armLength': armLength,
        'note': note,
      };
}
