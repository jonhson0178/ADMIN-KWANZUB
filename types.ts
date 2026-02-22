

export enum SupplierStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Blocked = 'Blocked',
}

export enum ProductStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Removed = 'Removed',
  ChangesRequested = 'ChangesRequested',
}

export enum TransactionStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Blocked = 'Blocked',
  Refunded = 'Refunded',
}

export enum MarketplaceUserType {
    Supplier = 'Supplier',
    Buyer = 'Buyer',
}

export enum MarketplaceUserStatus {
    Active = 'Active',
    Suspended = 'Suspended',
    Pending = 'Pending',
}

export enum InternalUserRole {
    SuperAdmin = 'Super Admin',
    Admin = 'Admin',
    Moderator = 'Moderator',
}

export enum InternalUserStatus {
    Active = 'Active',
    Suspended = 'Suspended',
}


export enum DocumentStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Suspended = 'Suspended',
}

export enum OrderStatus {
    Pending = 'Pending',
    Processing = 'Processing',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
    Cancelled = 'Cancelled',
    Refunded = 'Refunded',
}

export enum PaymentStatus {
    Pending = 'Pending',
    Paid = 'Paid',
    Blocked = 'Blocked',
    Expired = 'Expired', // Can also mean Failed
}

export enum LogisticStatus {
    AwaitingShipment = 'Awaiting Shipment',
    InTransit = 'In Transit',
    OutForDelivery = 'Out for Delivery',
    Delivered = 'Delivered',
}


export enum AlertType {
    Payment = 'Payment',
    Complaint = 'Complaint',
    Store = 'Store',
    Badge = 'Badge',
    PaidVerification = 'PaidVerification',
    Dispute = 'Dispute',
}

export enum BadgeLevel {
    Basic = 'Basic',
    Premium = 'Premium',
}

export enum PaidVerificationPlan {
    BasicPaid = 'Básico Pago',
    PremiumGoldPaid = 'Premium Ouro Pago',
}

export enum DisputeStatus {
    Open = 'Open',
    UnderReview = 'Under Review',
    Resolved = 'Resolved',
    Closed = 'Closed',
}

export enum OrderItemStatus {
    Fulfilled = 'Fulfilled',
    Refunded = 'Refunded',
    Returned = 'Returned',
}

export enum StoreStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
}

// Communication Center Types
export enum ConversationType {
    Individual = 'Individual',
    Group = 'Group',
    Broadcast = 'Broadcast',
}

export enum MessageStatus {
    Sent = 'Sent',
    Delivered = 'Delivered',
    Read = 'Read',
}

export enum TicketStatus {
    Open = 'Open',
    InProgress = 'In Progress',
    Resolved = 'Resolved',
    Closed = 'Closed',
}

export enum TicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent',
}

export enum ProductType {
    Simple = 'Simple',
    Variable = 'Variable',
}

// Notification Center Types
export enum NotificationType {
    System = 'System',
    Manual = 'Manual',
}

export enum NotificationPriority {
    Info = 'Info',
    Alert = 'Alert',
    Critical = 'Critical',
}

export enum NotificationStatus {
    Read = 'Read',
    Unread = 'Unread',
}

// Marketing Types
export enum CouponType {
    Percentage = 'Percentage',
    Fixed = 'Fixed',
}

export enum CouponStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Expired = 'Expired',
}

// --- NEW: Commercial Plans Types ---
export interface Plan {
    id: string;
    name: string;
    monthlyVolumeLimit: number;
    transactionLimit: number;
    withdrawalRequestLimit: number;
    searchWeight: number; // peso_algoritmo
    allowsManualExpansion: boolean;
    createdAt: string;
    updatedAt: string;
}

export enum SellerSalesStatus {
    Active = 'Active',
    Blocked = 'Blocked',
}
// --- END: Commercial Plans Types ---


// Security & Permissions Module Types
export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'financialActions'
  | 'criticalStatusChange';

export type SystemModule =
  | 'Dashboard'
  | 'Users'
  | 'Products'
  | 'Orders'
  | 'Financials'
  | 'Moderation'
  | 'Communication'
  | 'Notifications'
  | 'Marketing'
  | 'Reports'
  | 'Logistics'
  | 'Security'
  | 'Integrations'
  | 'Settings'
  | 'Audit'
  | 'Permissions';

export type Permissions = Partial<Record<SystemModule, PermissionAction[]>>;

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permissions;
    userCount: number;
    hierarchyLevel: number;
}

export interface AuthSettings {
    enable2FA: boolean;
    forceAdmin2FA: boolean;
    sessionExpiration: number; // in hours
    lockoutAttempts: number;
    enableCaptcha: boolean;
}

export interface ActiveSession {
    id: string;
    userId: string;
    userName: string;
    ipAddress: string;
    location: string;
    device: string;
    loginTime: string;
    lastActivity: string;
}

export enum IpRuleType {
    Allow = 'allow',
    Deny = 'deny',
}

export interface IpRule {
    id: string;
    ip: string;
    type: IpRuleType;
    notes?: string;
    createdAt: string;
    createdBy: string;
}

export interface SecurityLog {
    id: string;
    timestamp: string;
    action: string;
    adminId: string;
    adminName: string;
    details: string;
}

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expirationDays: number;
    historyCount: number;
}

export interface ApiKey {
    id: string;
    keyPrefix: string;
    description: string;
    permissions: Permissions;
    rateLimit: number; // requests per minute
    createdAt: string;
    lastUsed?: string;
}

export interface FraudReport {
    id: string;
    entityType: 'user' | 'store';
    entityId: string;
    entityName: string;
    riskScore: number;
    reason: string;
    timestamp: string;
    status: 'pending' | 'resolved' | 'watching';
}

export interface ComplianceRequest {
    id: string;
    userId: string;
    userName: string;
    requestType: 'data_export' | 'data_deletion';
    status: 'pending' | 'completed';
    requestedAt: string;
    completedAt?: string;
}

export interface SecurityAlertConfig {
    id: string;
    eventName: string;
    description: string;
    enabled: boolean;
    notifyPanel: boolean;
    notifyEmail: boolean;
    notifyPush: boolean;
}


export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    status: CouponStatus;
    usageCount: number;
    usageLimit: number | null;
    expiresAt: string | null;
    createdAt: string;
}

export interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    content: string;
    status: NotificationStatus;
    timestamp: string;
    sender: string; // e.g., 'System' or an admin's name
    relatedEntity?: {
        type: 'order' | 'product' | 'user' | 'store' | 'ticket';
        id: string;
        displayText: string;
    };
}

// --- REFACTORED & NEW BADGE MANAGEMENT TYPES ---
export enum BadgeType {
    Verification = 'verificacao',
    Plan = 'plano',
    Trust = 'confianca',
    Promotional = 'promocional',
}

export enum SellerBadgeStatus {
    Active = 'ativo',
    Expired = 'expirado',
    Removed = 'removido',
}

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    type: BadgeType;
    icon: string; // Icon identifier or URL
    color: string; // Hex color
    visualLevel: 1 | 2 | 3; // 1=normal, 2=destaque, 3=maximo
    validForDays: number | null;
    isAutomatic: boolean;
    isActive: boolean;
    rules?: { // Simplified rules for automatic assignment
        planId?: string;
        minSales?: number;
        minRating?: number;
        noDisputes?: boolean;
    };
    createdAt: string;
    updatedAt: string;
// FIX: Add missing property `displayValidityPublicly` to fix type error in BadgeManagement.tsx
    displayValidityPublicly?: boolean;
}

export interface SellerBadge {
    id: string;
    sellerId: string;
    badgeId: string;
    startDate: string;
    expirationDate: string | null;
    status: SellerBadgeStatus;
    displayValidityPublicly: boolean;
}
// --- END BADGE MANAGEMENT TYPES ---


export interface PaidVerification {
    id: string;
    supplierId: string;
    plan: PaidVerificationPlan;
    businessType: string;
    paymentStatus: PaymentStatus;
    approvedBy: string; // admin_id
    approvedAt: string;
    expiresAt: string;
    active: boolean;
    criteria: Record<string, any>;
    price: number;
}

export interface PaidVerificationLog {
    id: string;
    verificationId: string;
    action: 'assigned' | 'removed' | 'renewed';
    performedBy: string; // admin_id
    timestamp: string;
    details: Record<string, any>;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  status: DocumentStatus;
  submittedDate: string;
}

export interface Store {
    id: string;
    name: string;
    supplierId: string;
    supplierName: string;
    isVerified: boolean;
    createdAt: string;
    productCount: number;
    status: StoreStatus;
    category: string;
    phone: string;
    totalSales: number;
    averageRating: number;
}

export interface StatusHistory {
  status: SupplierStatus;
  timestamp: string;
  changedBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  email: string;
  status: SupplierStatus;
  supplierScore: number;
  joinedDate: string;
  documents: Document[];
  averageRating: number;
  reviewCount: number;
  unresolvedComplaints: number;
  badges: SellerBadge[];
  paidVerifications: PaidVerification[];
  totalOrders: number;
  statusHistory: StatusHistory[];
  // NEW: Commercial Plan fields
  planId: string;
  monthlySalesVolume: number;
  cycleStartDate: string;
  cycleEndDate: string;
  salesStatus: SellerSalesStatus;
  manualExpansionAmount?: number;
}

export interface SEOInfo {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    keywords?: string;
}

export interface LogisticsInfo {
    weight: number; // in kg
    width: number; // in cm
    height: number; // in cm
    length: number; // in cm
    shippingClass?: string;
    freeShipping: boolean;
}

export interface Variation {
    id: string;
    attributes: Record<string, string>; // e.g., { "Color": "Blue", "Size": "M" }
    sku: string;
    price: number;
    stock: number;
    imageUrl?: string;
}

export interface Media {
    id: string;
    type: 'image' | 'video';
    url: string;
    isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  supplierId: string;
  supplierName: string;
  category: string;
  price: number;
  promoPrice?: number;
  cost?: number;
  status: ProductStatus;
  stock: number;
  imageUrl: string;
  sku: string;
  ean?: string;
  sales: number;
  createdAt: string;
  brand?: string;
  tags?: string[];
  type: ProductType;
  seo: SEOInfo;
  logistics: LogisticsInfo;
  variations?: Variation[];
  media?: Media[];
  rejectionReason?: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    status: OrderItemStatus;
}

export interface OrderEvent {
    status: OrderStatus | 'Payment Confirmed';
    timestamp: string;
    details: string;
}

export interface Order {
  id: string;
  date: string;
  buyerId: string;
  customerName: string;
  supplierId: string;
  supplierName: string;
  storeName: string;
  total: number;
  commission: number;
  marketplaceProfit: number;
  shippingCost: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  logisticStatus: LogisticStatus;
  paymentMethod: 'Stripe' | 'PayPal' | 'Pix';
  businessType: string;
  items: OrderItem[];
  events: OrderEvent[];
  // Shipping details
  shippingAddress: string;
  shippingCompany: string;
  trackingCode: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDelivery: string;
}


export interface Transaction {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  amount: number;
  commission: number;
  status: TransactionStatus;
  marketplace_profit: number;
  payment_method: 'Stripe' | 'PayPal' | 'Pix';
  category_type: string; // B2B, B2C, C2C
  type: 'sale' | 'commission' | 'refund' | 'selo_paid';
}

export interface Dispute {
    id: string;
    orderId: string;
    transactionId: string;
    supplierId: string;
    supplierName: string;
    customerName: string;
    reason: string;
    status: DisputeStatus;
    createdAt: string;
    resolvedAt: string | null;
}

export interface FinancialLog {
    id: string;
    timestamp: string;
    action: 'refund' | 'dispute_open' | 'dispute_resolved' | 'commission_change';
    entityType: 'transaction' | 'dispute' | 'system';
    entityId: string;
    details: Record<string, any>;
}


export interface MarketplaceUser {
  id: string;
  name: string;
  email: string;
  type: MarketplaceUserType;
  status: MarketplaceUserStatus;
  lastVisit: string;
  reputationScore: number;
  totalOrders: number;
  createdAt: string;
  // Details for modal
  orderHistory: Order[];
  financialHistory: Transaction[];
  activityLogs: AuditLog[];
}

export interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: InternalUserRole;
  status: InternalUserStatus;
  lastLogin: string;
  totalActions: number;
  createdAt: string;
  roleIds: string[];
  // Details for modal
  loginHistory: LoginAttempt[];
  actionHistory: AuditLog[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  isCritical: boolean;
  entityType?: 'order' | 'user' | 'product' | 'store' | 'security' | 'permission';
  entityId?: string;
}

export interface MonthlyData {
  name: string;
  revenue: number;
  sales: number;
  orders: number;
  stores: number;
  avgTicket: number;
  suppliers: number;
  revenueForecast?: number;
}

export interface Alert {
    id: string;
    type: AlertType;
    message: string;
    timestamp: string;
    relatedId: string;
}

export interface LoginAttempt {
    id: string;
    ipAddress: string;
    timestamp: string;
    status: 'Success' | 'Failed';
    userName: string;
    isSuspicious: boolean;
}

export interface CommissionSettings {
  global: number;
  categories: Record<string, number | ''>;
}


// --- Communication Center Interfaces ---

export interface MessageAttachment {
    fileName: string;
    fileUrl: string;
    fileType: 'image' | 'pdf' | 'other';
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    status: MessageStatus;
    attachment?: MessageAttachment;
}

export type ConversationParticipant = InternalUser | MarketplaceUser;

export interface Conversation {
    id: string;
    type: ConversationType;
    name?: string; // For group chats
    participants: ConversationParticipant[];
    lastMessage: Message;
    unreadCount: number;
    isOnline?: boolean;
    ticketId?: string;
}

export interface Ticket {
    id: string;
    conversationId: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    resolvedAt?: string;
    sla: number; // in hours
}

// FIX: Add missing Page and HighlightableEntity types to fix import errors.
// --- App-level Types ---
export type Page =
  | 'Dashboard'
  | 'Notification Center'
  | 'Communication Center'
  | 'Moderation'
  | 'Marketplace Users'
  | 'Internal Team'
  | 'Permissions'
  | 'Suppliers'
  | 'Stores'
  | 'Products'
  | 'Orders'
  | 'Financials'
  | 'Reputation'
  | 'Commercial Plans'
  | 'Badge Management'
  | 'Paid Verifications'
  | 'Marketing'
  | 'Documents'
  | 'Audit Logs'
  | 'Security'
  | 'Integrations'
  | 'Settings';

export type HighlightableEntityType = 
  | 'supplier' 
  | 'product' 
  | 'transaction' 
  | 'order' 
  | 'dispute' 
  | 'store' 
  | 'user' 
  | 'internalUser' 
  | 'ticket';

export interface HighlightableEntity {
    type: HighlightableEntityType;
    id: string;
}
// --- END: App-level Types ---
