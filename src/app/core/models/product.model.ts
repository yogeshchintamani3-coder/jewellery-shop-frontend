export interface Product {
  readonly productId: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly price: number;
  readonly discountPrice: number;
  readonly weight: string;
  readonly material: string;
  readonly imageUrls: string[];
  readonly stock: number;
  readonly featured: boolean;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Category {
  readonly categoryId: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly displayOrder: number;
  readonly active: boolean;
}

export interface CartItem {
  readonly cartItemId: string;
  readonly userId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly addedAt: string;
  product?: Product;
}

export interface Order {
  readonly orderId: string;
  readonly userId: string;
  readonly items: string;
  readonly totalAmount: number;
  readonly status: string;
  readonly shippingAddress: string;
  readonly paymentId: string;
  readonly paymentStatus: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: string;
}

export interface SalesSummary {
  readonly totalOrders: number;
  readonly confirmedOrders: number;
  readonly pendingOrders: number;
  readonly deliveredOrders: number;
  readonly cancelledOrders: number;
  readonly totalRevenue: number;
  readonly paidRevenue: number;
}

export interface UserStats {
  readonly totalUsers: number;
  readonly adminUsers: number;
  readonly regularUsers: number;
}

export interface InvoiceItem {
  readonly productId: string;
  readonly productName: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly hsnCode: string;
}

export interface Invoice {
  readonly invoiceId: string;
  readonly invoiceNumber: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly customerPhone: string;
  readonly customerAddress: string;
  readonly items: InvoiceItem[];
  readonly subtotal: number;
  readonly taxRate: number;
  readonly taxAmount: number;
  readonly discountPercent: number;
  readonly discountAmount: number;
  readonly totalAmount: number;
  readonly notes: string;
  readonly status: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
