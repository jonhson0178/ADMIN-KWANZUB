
import { useState, useMemo, useCallback } from 'react';
import { ActiveSession, FraudReport, IpRule, IpRuleType, SecurityLog, Supplier, Product, Transaction, AuditLog, Order, MonthlyData, SupplierStatus, ProductStatus, TransactionStatus, DocumentStatus, Document, Store, OrderStatus, Alert, AlertType, LoginAttempt, MarketplaceUser, MarketplaceUserType, MarketplaceUserStatus, InternalUser, InternalUserRole, InternalUserStatus, BadgeDefinition, BadgeType, SellerBadge, SellerBadgeStatus, PaidVerification, PaidVerificationPlan, PaymentStatus, PaidVerificationLog, Dispute, DisputeStatus, FinancialLog, OrderEvent, LogisticStatus, OrderItemStatus, OrderItem, CommissionSettings, StoreStatus, StatusHistory, Conversation, Message, Ticket, ConversationType, MessageStatus, TicketStatus, TicketPriority, ConversationParticipant, ProductType, Notification, NotificationType, NotificationPriority, NotificationStatus, Coupon, CouponType, CouponStatus, Role, SystemModule, PermissionAction, Permissions, Plan, SellerSalesStatus } from '../types';

const today = new Date();
const getDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

const getDateTime = (daysAgo: number) => {
    const date = new Date();
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString();
}

// --- START COMMERCIAL PLANS DATA ---
const initialPlans: Plan[] = [
    { id: 'plan-silver', name: 'Silver', monthlyVolumeLimit: 600000, transactionLimit: 150000, withdrawalRequestLimit: 250000, searchWeight: 1, allowsManualExpansion: false, createdAt: getDate(365), updatedAt: getDate(10) },
    { id: 'plan-gold', name: 'Gold', monthlyVolumeLimit: 5000000, transactionLimit: 1000000, withdrawalRequestLimit: 3000000, searchWeight: 2, allowsManualExpansion: false, createdAt: getDate(365), updatedAt: getDate(10) },
    { id: 'plan-premium', name: 'Premium', monthlyVolumeLimit: 10000000, transactionLimit: 2000000, withdrawalRequestLimit: 10000000, searchWeight: 3, allowsManualExpansion: true, createdAt: getDate(365), updatedAt: getDate(10) },
];
// --- END COMMERCIAL PLANS DATA ---

// --- START PERMISSIONS (RBAC) DATA ---
export const SYSTEM_MODULES: SystemModule[] = ['Dashboard', 'Users', 'Products', 'Orders', 'Financials', 'Moderation', 'Communication', 'Notifications', 'Marketing', 'Reports', 'Logistics', 'Security', 'Integrations', 'Settings', 'Audit', 'Permissions'];
export const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'financialActions', 'criticalStatusChange'];

const initialRoles: Role[] = [
    {
        id: 'role-super-admin',
        name: 'Super Admin',
        description: 'Acesso total a todas as funcionalidades, incluindo gestão da equipa interna e permissões.',
        hierarchyLevel: 1,
        userCount: 0,
        permissions: {
            Dashboard: ['view'], Users: ['view', 'create', 'edit', 'delete'], Products: ['view', 'create', 'edit', 'delete', 'approve', 'export'], Orders: ['view', 'edit', 'criticalStatusChange'], Financials: ['view', 'financialActions', 'export'], Moderation: ['view', 'approve'], Communication: ['view', 'create', 'delete'], Notifications: ['view', 'create', 'delete'], Marketing: ['view', 'create', 'edit', 'delete'], Reports: ['view', 'export'], Logistics: ['view', 'edit'], Security: ['view', 'create', 'edit', 'delete'], Integrations: ['view', 'edit'], Settings: ['view', 'edit'], Audit: ['view', 'export'], Permissions: ['view', 'edit'],
        }
    },
    {
        id: 'role-admin',
        name: 'Admin Financeiro',
        description: 'Acesso a todas as funcionalidades financeiras, pedidos e relatórios.',
        hierarchyLevel: 2,
        userCount: 0,
        permissions: {
            Dashboard: ['view'], Financials: ['view', 'financialActions', 'export'], Orders: ['view', 'edit'], Reports: ['view', 'export'],
        }
    },
    {
        id: 'role-moderator',
        name: 'Moderador',
        description: 'Acesso a moderação de produtos, lojas e comunicação com usuários.',
        hierarchyLevel: 3,
        userCount: 0,
        permissions: {
            Dashboard: ['view'], Moderation: ['view', 'approve'], Products: ['view', 'edit', 'approve'], Communication: ['view'],
        }
    }
];
// --- END PERMISSIONS (RBAC) DATA ---


// --- START BADGE MANAGEMENT DATA ---
const initialBadgeDefinitions: BadgeDefinition[] = [
    { id: 'badge-verified', name: 'Selo Verificado', description: 'Atribuído automaticamente após a validação de BI ou NIF.', type: BadgeType.Verification, icon: 'ShieldCheckIcon', color: '#34D399', visualLevel: 2, validForDays: null, isAutomatic: true, isActive: true, rules: {}, createdAt: getDate(365), updatedAt: getDate(10) },
    { id: 'badge-gold', name: 'Vendedor Gold', description: 'Atribuído a vendedores com o plano Gold ativo.', type: BadgeType.Plan, icon: 'StarIcon', color: '#FBBF24', visualLevel: 2, validForDays: null, isAutomatic: true, isActive: true, rules: { planId: 'plan-gold' }, createdAt: getDate(365), updatedAt: getDate(10) },
    { id: 'badge-premium-angola', name: 'Premium Angola', description: 'Selo de destaque máximo para vendedores no plano Premium.', type: BadgeType.Plan, icon: 'SparklesIcon', color: '#A78BFA', visualLevel: 3, validForDays: 365, isAutomatic: true, isActive: true, rules: { planId: 'plan-premium' }, createdAt: getDate(365), updatedAt: getDate(10) },
    { id: 'badge-trust', name: 'Vendedor Confiável', description: 'Atribuído a vendedores com mais de 50 vendas, avaliação mínima de 4.5 e sem disputas.', type: BadgeType.Trust, icon: 'BadgeCheckIcon', color: '#60A5FA', visualLevel: 2, validForDays: 180, isAutomatic: true, isActive: true, rules: { minSales: 50, minRating: 4.5, noDisputes: true }, createdAt: getDate(365), updatedAt: getDate(10) },
    { id: 'badge-promo-2024', name: 'Promo Black Friday 2024', description: 'Selo para a campanha especial Black Friday.', type: BadgeType.Promotional, icon: 'TagIcon', color: '#F472B6', visualLevel: 1, validForDays: 30, isAutomatic: false, isActive: false, rules: {}, createdAt: getDate(90), updatedAt: getDate(20) },
];

const initialSellerBadges: SellerBadge[] = [
    { id: 'sb1', sellerId: 'sup1', badgeId: 'badge-verified', startDate: getDate(300), expirationDate: null, status: SellerBadgeStatus.Active, displayValidityPublicly: false },
    { id: 'sb2', sellerId: 'sup1', badgeId: 'badge-premium-angola', startDate: getDate(250), expirationDate: getDateTime(-115), status: SellerBadgeStatus.Active, displayValidityPublicly: true },
    { id: 'sb3', sellerId: 'sup3', badgeId: 'badge-verified', startDate: getDate(400), expirationDate: null, status: SellerBadgeStatus.Active, displayValidityPublicly: false },
    { id: 'sb4', sellerId: 'sup3', badgeId: 'badge-gold', startDate: getDate(350), expirationDate: getDateTime(-15), status: SellerBadgeStatus.Active, displayValidityPublicly: true },
    { id: 'sb5', sellerId: 'sup5', badgeId: 'badge-verified', startDate: getDate(150), expirationDate: null, status: SellerBadgeStatus.Active, displayValidityPublicly: false },
    { id: 'sb6', sellerId: 'sup4', badgeId: 'badge-verified', startDate: getDate(450), expirationDate: getDate(400), status: SellerBadgeStatus.Expired, displayValidityPublicly: false },
    { id: 'sb7', sellerId: 'sup2', badgeId: 'badge-verified', startDate: getDate(200), expirationDate: null, status: SellerBadgeStatus.Active, displayValidityPublicly: false },
     { id: 'sb8', sellerId: 'sup5', badgeId: 'badge-trust', startDate: getDate(25), expirationDate: getDateTime(155), status: SellerBadgeStatus.Active, displayValidityPublicly: true },
];
// --- END BADGE MANAGEMENT DATA ---


const initialActiveSessions: ActiveSession[] = [
    { id: 'sess1', userId: 'int-usr1', userName: 'Alice Johnson', ipAddress: '203.0.113.55', location: 'Luanda, Angola', device: 'Chrome on macOS', loginTime: getDate(0) + 'T09:00:00Z', lastActivity: getDate(0) + 'T11:05:00Z' },
    { id: 'sess2', userId: 'int-usr2', userName: 'Bob Williams', ipAddress: '198.51.100.12', location: 'Benguela, Angola', device: 'Firefox on Windows', loginTime: getDate(1) + 'T14:30:00Z', lastActivity: getDate(0) + 'T10:30:00Z' },
];

const initialIpRules: IpRule[] = [
    { id: 'ipr1', ip: '192.0.2.200', type: IpRuleType.Deny, notes: 'Suspicious login attempts against Bob Williams', createdAt: getDateTime(2), createdBy: 'Alice Johnson' },
    { id: 'ipr2', ip: '10.0.0.0/8', type: IpRuleType.Allow, notes: 'Internal network range', createdAt: getDateTime(30), createdBy: 'Alice Johnson' },
];

const initialSecurityLogs: SecurityLog[] = [
    { id: 'seclog1', timestamp: getDateTime(1), action: 'IP Rule Added', adminId: 'int-usr1', adminName: 'Alice Johnson', details: 'Denied IP 192.0.2.200' },
    { id: 'seclog2', timestamp: getDateTime(2), action: 'Password Policy Changed', adminId: 'int-usr1', adminName: 'Alice Johnson', details: 'Minimum password length set to 10' },
];

const initialFraudReports: FraudReport[] = [
    { id: 'fr1', entityType: 'user', entityId: 'sup4', entityName: 'Office Supplies Ltd.', riskScore: 8.5, reason: 'High rate of complaints and document rejection.', timestamp: getDate(4) + 'T10:00:00Z', status: 'resolved' },
    { id: 'fr2', entityType: 'user', entityId: 'buy3', entityName: 'Carlos Neto', riskScore: 6.0, reason: 'Unusual purchase patterns.', timestamp: getDate(10) + 'T14:00:00Z', status: 'watching' },
];

const initialPaidVerifications: PaidVerification[] = [
    { id: 'pv1', supplierId: 'sup1', plan: PaidVerificationPlan.PremiumGoldPaid, businessType: 'B2B', paymentStatus: PaymentStatus.Paid, approvedBy: 'int-usr1', approvedAt: '2024-01-01T10:00:00Z', expiresAt: '2025-01-01T10:00:00Z', active: true, price: 50000, criteria: { "cnpj": "valid", "order_volume": ">100/month", "contracts": "signed" } },
    { id: 'pv2', supplierId: 'sup3', plan: PaidVerificationPlan.BasicPaid, businessType: 'B2C', paymentStatus: PaymentStatus.Paid, approvedBy: 'int-usr2', approvedAt: '2023-11-15T10:00:00Z', expiresAt: '2024-11-15T10:00:00Z', active: true, price: 15000, criteria: { "cpf": "valid", "delivery_history": "ok", "support_response_time": "<24h" } },
    { id: 'pv3', supplierId: 'sup4', plan: PaidVerificationPlan.BasicPaid, businessType: 'C2C', paymentStatus: PaymentStatus.Expired, approvedBy: 'int-usr1', approvedAt: '2023-03-10T10:00:00Z', expiresAt: '2024-03-10T10:00:00Z', active: false, price: 15000, criteria: { "cpf": "valid", "sales_history": ">10", "positive_feedback": ">90%" } },
];

const initialPaidVerificationLogs: PaidVerificationLog[] = [
    { id: 'pvl1', verificationId: 'pv1', action: 'assigned', performedBy: 'int-usr1', timestamp: '2024-01-01T10:00:00Z', details: { note: 'Initial assignment for Premium Gold.' } },
    { id: 'pvl2', verificationId: 'pv2', action: 'assigned', performedBy: 'int-usr2', timestamp: '2023-11-15T10:00:00Z', details: { note: 'Basic verification approved.' } },
];

const initialStoresData: Omit<Store, 'totalSales' | 'averageRating' | 'status' | 'category' | 'phone'>[] = [
    { id: 'store1', name: 'TechHub', supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', isVerified: true, createdAt: '2023-01-15', productCount: 2 },
    { id: 'store2', name: 'GlobalMart', supplierId: 'sup2', supplierName: 'Global Goods Co.', isVerified: false, createdAt: '2023-03-22', productCount: 0 },
    { id: 'store3', name: 'Handmade Haven', supplierId: 'sup3', supplierName: 'Artisan Crafts', isVerified: true, createdAt: '2022-11-30', productCount: 1 },
    { id: 'store4', name: 'OfficePro', supplierId: 'sup4', supplierName: 'Office Supplies Ltd.', isVerified: true, createdAt: '2023-02-10', productCount: 1 },
    { id: 'store5', name: 'FarmFresh', supplierId: 'sup5', supplierName: 'Green Produce', isVerified: false, createdAt: '2023-05-01', productCount: 1 },
];

const initialSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Tech Solutions Inc.', storeId: 'store1', storeName: 'TechHub', email: 'contact@techsolutions.com', status: SupplierStatus.Approved, supplierScore: 95, joinedDate: '2023-01-15', averageRating: 4.8, reviewCount: 150, unresolvedComplaints: 1, totalOrders: 160, documents: [
    { id: 'doc1', name: 'Contrato Social', url: 'https://placehold.co/600x800/2d3748/e2e8f0?text=Contrato+Social', status: DocumentStatus.Approved, submittedDate: '2023-01-10' },
    { id: 'doc2', name: 'Comprovante de Endereço', url: 'https://placehold.co/600x800/2d3748/e2e8f0?text=Comprovante+de+Endereço', status: DocumentStatus.Approved, submittedDate: '2023-01-10' },
  ], badges: initialSellerBadges.filter(b => b.sellerId === 'sup1'), paidVerifications: initialPaidVerifications.filter(pv => pv.supplierId === 'sup1'), statusHistory: [
      { status: SupplierStatus.Pending, timestamp: '2023-01-14T10:00:00Z', changedBy: 'System' },
      { status: SupplierStatus.Approved, timestamp: '2023-01-15T12:30:00Z', changedBy: 'Alice Johnson' }
  ], planId: 'plan-premium', monthlySalesVolume: 8500000, cycleStartDate: getDate(20), cycleEndDate: getDate(-10), salesStatus: SellerSalesStatus.Active, manualExpansionAmount: 12000000 },
  { id: 'sup2', name: 'Global Goods Co.', storeId: 'store2', storeName: 'GlobalMart', email: 'support@globalgoods.co', status: SupplierStatus.Pending, supplierScore: 78, joinedDate: '2023-03-22', averageRating: 4.2, reviewCount: 80, unresolvedComplaints: 3, totalOrders: 90, documents: [
    { id: 'doc3', name: 'ID do Vendedor', url: 'https://placehold.co/600x800/2d3748/e2e8f0?text=ID+do+Vendedor', status: DocumentStatus.Pending, submittedDate: '2023-03-20' },
  ], badges: initialSellerBadges.filter(b => b.sellerId === 'sup2'), paidVerifications: [], statusHistory: [
      { status: SupplierStatus.Pending, timestamp: '2023-03-22T10:00:00Z', changedBy: 'System' }
  ], planId: 'plan-silver', monthlySalesVolume: 550000, cycleStartDate: getDate(15), cycleEndDate: getDate(-15), salesStatus: SellerSalesStatus.Active },
  { id: 'sup3', name: 'Artisan Crafts', storeId: 'store3', storeName: 'Handmade Haven', email: 'artisan@crafts.com', status: SupplierStatus.Approved, supplierScore: 92, joinedDate: '2022-11-30', averageRating: 4.9, reviewCount: 250, unresolvedComplaints: 0, totalOrders: 260, documents: [
    { id: 'doc4', name: 'Certificado de Artesão', url: 'https://placehold.co/600x800/2d3748/e2e8f0?text=Certificado', status: DocumentStatus.Approved, submittedDate: '2022-11-28' },
  ], badges: initialSellerBadges.filter(b => b.sellerId === 'sup3'), paidVerifications: initialPaidVerifications.filter(pv => pv.supplierId === 'sup3'), statusHistory: [
      { status: SupplierStatus.Pending, timestamp: '2022-11-29T10:00:00Z', changedBy: 'System' },
      { status: SupplierStatus.Approved, timestamp: '2022-11-30T15:00:00Z', changedBy: 'Bob Williams' }
  ], planId: 'plan-gold', monthlySalesVolume: 4800000, cycleStartDate: getDate(25), cycleEndDate: getDate(-5), salesStatus: SellerSalesStatus.Active },
  { id: 'sup4', name: 'Office Supplies Ltd.', storeId: 'store4', storeName: 'OfficePro', email: 'sales@officesupplies.com', status: SupplierStatus.Blocked, supplierScore: 65, joinedDate: '2023-02-10', averageRating: 3.5, reviewCount: 45, unresolvedComplaints: 8, totalOrders: 50, documents: [
    { id: 'doc5', name: 'Registro Comercial', url: 'https://placehold.co/600x800/2d3748/e2e8f0?text=Registro+Comercial', status: DocumentStatus.Rejected, submittedDate: '2023-02-08' },
  ], badges: initialSellerBadges.filter(b => b.sellerId === 'sup4'), paidVerifications: initialPaidVerifications.filter(pv => pv.supplierId === 'sup4'), statusHistory: [
      { status: SupplierStatus.Pending, timestamp: '2023-02-09T10:00:00Z', changedBy: 'System' },
      { status: SupplierStatus.Approved, timestamp: '2023-02-10T11:00:00Z', changedBy: 'Alice Johnson' },
      { status: SupplierStatus.Blocked, timestamp: '2024-05-10T18:00:00Z', changedBy: 'Alice Johnson' }
  ], planId: 'plan-silver', monthlySalesVolume: 600000, cycleStartDate: getDate(18), cycleEndDate: getDate(-12), salesStatus: SellerSalesStatus.Blocked },
  { id: 'sup5', name: 'Green Produce', storeId: 'store5', storeName: 'FarmFresh', email: 'contact@greenproduce.farm', status: SupplierStatus.Approved, supplierScore: 88, joinedDate: '2023-05-01', averageRating: 4.6, reviewCount: 120, unresolvedComplaints: 2, totalOrders: 130, documents: [
    { id: 'doc6', name: 'Certificação Orgânica', url: 'https://placehold.co/600x800/2d3748/e2e8f0?text=Certificação+Orgânica', status: DocumentStatus.Approved, submittedDate: '2023-04-28' },
  ], badges: initialSellerBadges.filter(b => b.sellerId === 'sup5'), paidVerifications: [], statusHistory: [
       { status: SupplierStatus.Pending, timestamp: '2023-04-30T10:00:00Z', changedBy: 'System' },
       { status: SupplierStatus.Approved, timestamp: '2023-05-01T10:00:00Z', changedBy: 'Bob Williams' }
  ], planId: 'plan-gold', monthlySalesVolume: 1200000, cycleStartDate: getDate(22), cycleEndDate: getDate(-8), salesStatus: SellerSalesStatus.Active },
];

const initialProducts: Product[] = [
  { id: 'prod1', name: 'Laptop Gamer Pro X', shortDescription: "Potência máxima para jogos.", description: "High-end gaming laptop with RTX 4090, 32GB RAM, 2TB SSD.", imageUrl: "https://placehold.co/600x400/1a202c/e2e8f0?text=Laptop+Pro+X", supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', category: 'Electronics', price: 950000, promoPrice: 925000, cost: 700000, status: ProductStatus.Approved, stock: 50, sales: 120, createdAt: getDate(150), sku: 'LPX-4090-TS', ean: '1234567890123', brand: 'ProGamer', tags: ['gaming', 'laptop', 'rtx'], type: ProductType.Simple, 
    seo: { metaTitle: 'Laptop Gamer Pro X | Kwanzub', metaDescription: 'O melhor laptop gamer com RTX 4090 para performance extrema.', slug: 'laptop-gamer-pro-x', keywords: 'laptop, gamer, rtx 4090'}, 
    logistics: { weight: 2.5, width: 35, height: 2, length: 25, shippingClass: 'Eletrônicos Grandes', freeShipping: false },
    media: [
        {id: 'm1', url: "https://placehold.co/600x400/1a202c/e2e8f0?text=Laptop+Pro+X+1", type: 'image', isPrimary: true},
        {id: 'm2', url: "https://placehold.co/600x400/1a202c/e2e8f0?text=Laptop+Pro+X+2", type: 'image', isPrimary: false},
    ]
  },
  { id: 'prod2', name: 'Teclado Mecânico RGB', shortDescription: "Clicky e colorido.", description: "Mechanical keyboard with customizable RGB backlighting and Cherry MX Blue switches.", imageUrl: "https://placehold.co/600x400/1a202c/e2e8f0?text=Teclado+RGB", supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', category: 'Electronics', price: 85000, cost: 50000, status: ProductStatus.Approved, stock: 0, sales: 350, createdAt: getDate(120), sku: 'KBD-RGB-TS', brand: 'ClickyKeys', tags: ['keyboard', 'rgb', 'mechanical'], type: ProductType.Variable, 
    seo: { metaTitle: 'Teclado Mecânico RGB | Kwanzub', metaDescription: 'Teclado mecânico com iluminação RGB e switches a sua escolha.', slug: 'teclado-mecanico-rgb', keywords: 'teclado, mecanico, rgb'}, 
    logistics: { weight: 1.1, width: 44, height: 4, length: 14, freeShipping: true },
    variations: [
        { id: 'var1', attributes: { 'Switch': 'Blue', 'Layout': 'ABNT2' }, sku: 'KBD-RGB-TS-BL-ABNT', price: 85000, stock: 70 },
        { id: 'var2', attributes: { 'Switch': 'Red', 'Layout': 'ABNT2' }, sku: 'KBD-RGB-TS-RD-ABNT', price: 87000, stock: 50 },
        { id: 'var3', attributes: { 'Switch': 'Brown', 'Layout': 'US' }, sku: 'KBD-RGB-TS-BR-US', price: 86000, stock: 30 },
    ],
    media: [
        {id: 'm3', url: "https://placehold.co/600x400/1a202c/e2e8f0?text=Teclado+RGB+1", type: 'image', isPrimary: true},
    ]
  },
  { id: 'prod3', name: 'Vaso de Cerâmica Artesanal', description: "Handmade ceramic vase, unique design.", imageUrl: "https://placehold.co/600x400/1a202c/e2e8f0?text=Vaso+Artesanal", supplierId: 'sup3', supplierName: 'Artisan Crafts', category: 'Home Decor', price: 12500, status: ProductStatus.Pending, stock: 30, sales: 80, createdAt: getDate(90), sku: 'VC-HMD-AC', type: ProductType.Simple, seo: { metaTitle: 'Vaso de Cerâmica Artesanal | Kwanzub', metaDescription: 'Vaso de cerâmica feito à mão.', slug: 'vaso-ceramica-artesanal'}, logistics: { weight: 0.8, width: 15, height: 25, length: 15, freeShipping: true } },
  { id: 'prod4', name: 'Resma de Papel A4', description: "500 sheets of A4 paper.", imageUrl: "https://placehold.co/600x400/1a202c/e2e8f0?text=Papel+A4", supplierId: 'sup4', supplierName: 'Office Supplies Ltd.', category: 'Office', price: 2500, status: ProductStatus.Removed, stock: 0, sales: 500, createdAt: getDate(200), sku: 'PPR-A4-OS', type: ProductType.Simple, seo: { metaTitle: 'Resma de Papel A4 | Kwanzub', metaDescription: 'Papel A4 de alta qualidade.', slug: 'resma-papel-a4'}, logistics: { weight: 2.2, width: 21, height: 5, length: 30, freeShipping: false }, rejectionReason: 'Fornecedor bloqueado.' },
  { id: 'prod5', name: 'Cesta de Vegetais Orgânicos', description: "Weekly basket of fresh organic vegetables.", imageUrl: "https://placehold.co/600x400/1a202c/e2e8f0?text=Cesta+Orgânica", supplierId: 'sup5', supplierName: 'Green Produce', category: 'Groceries', price: 7500, status: ProductStatus.ChangesRequested, stock: 25, sales: 150, createdAt: getDate(60), sku: 'VEG-BSK-GP', type: ProductType.Simple, seo: { metaTitle: 'Cesta de Vegetais Orgânicos | Kwanzub', metaDescription: 'Vegetais frescos e orgânicos entregues em sua casa.', slug: 'cesta-vegetais-organicos'}, logistics: { weight: 5.0, width: 30, height: 20, length: 40, freeShipping: true }, rejectionReason: 'A imagem principal precisa ser de melhor qualidade.' },
];


const initialOrderItems = {
    order1: [
        { id: 'oi1', productId: 'prod1', productName: 'Laptop Gamer Pro X', quantity: 1, unitPrice: 950000, status: OrderItemStatus.Fulfilled },
        { id: 'oi2', productId: 'prod2', productName: 'Teclado Mecânico RGB', quantity: 1, unitPrice: 85000, status: OrderItemStatus.Fulfilled },
    ],
    order2: [{ id: 'oi3', productId: 'prod3', productName: 'Vaso de Cerâmica Artesanal', quantity: 2, unitPrice: 12500, status: OrderItemStatus.Fulfilled }],
    order3: [{ id: 'oi4', productId: 'prod5', productName: 'Cesta de Vegetais Orgânicos', quantity: 1, unitPrice: 7500, status: OrderItemStatus.Refunded }],
    order4: [{ id: 'oi5', productId: 'prod2', productName: 'Teclado Mecânico RGB', quantity: 5, unitPrice: 80000, status: OrderItemStatus.Fulfilled }],
    order5: [{ id: 'oi6', productId: 'prod1', productName: 'Laptop Gamer Pro X', quantity: 1, unitPrice: 940000, status: OrderItemStatus.Returned }],
};

const initialOrders: Order[] = [
  { id: 'ord1', date: getDate(5), buyerId: 'buy1', customerName: 'João Silva', supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', storeName: 'TechHub', total: 1045000, commission: 104500, marketplaceProfit: 94050, shippingCost: 10000, status: OrderStatus.Delivered, paymentStatus: PaymentStatus.Paid, logisticStatus: LogisticStatus.Delivered, paymentMethod: 'Stripe', businessType: 'B2C', items: initialOrderItems.order1, shippingAddress: 'Rua das Flores, 123, Luanda', shippingCompany: 'DHL', trackingCode: 'LP123456789', shippedAt: getDate(4), deliveredAt: getDate(1), estimatedDelivery: getDate(1), events: [
      {status: 'Payment Confirmed', timestamp: new Date(getDate(5)).toISOString(), details: 'Payment processed successfully.'},
      {status: OrderStatus.Processing, timestamp: new Date(getDate(5)).toISOString(), details: 'Order received and is being processed.'},
      {status: OrderStatus.Shipped, timestamp: new Date(getDate(4)).toISOString(), details: 'Package shipped with DHL.'},
      {status: OrderStatus.Delivered, timestamp: new Date(getDate(1)).toISOString(), details: 'Package delivered.'},
  ]},
  { id: 'ord2', date: getDate(12), buyerId: 'buy2', customerName: 'Maria Santos', supplierId: 'sup3', supplierName: 'Artisan Crafts', storeName: 'Handmade Haven', total: 28000, commission: 3500, marketplaceProfit: 3000, shippingCost: 3000, status: OrderStatus.Shipped, paymentStatus: PaymentStatus.Paid, logisticStatus: LogisticStatus.InTransit, paymentMethod: 'PayPal', businessType: 'C2C', items: initialOrderItems.order2, shippingAddress: 'Av. Brasil, 456, Benguela', shippingCompany: 'Correios', trackingCode: 'BR987654321', shippedAt: getDate(10), deliveredAt: null, estimatedDelivery: getDate(-2), events: [
       {status: 'Payment Confirmed', timestamp: new Date(getDate(12)).toISOString(), details: 'Payment processed successfully.'},
       {status: OrderStatus.Processing, timestamp: new Date(getDate(11)).toISOString(), details: 'Order received and is being processed.'},
       {status: OrderStatus.Shipped, timestamp: new Date(getDate(10)).toISOString(), details: 'Package shipped with Correios.'},
  ]},
  { id: 'ord3', date: getDate(25), buyerId: 'buy1', customerName: 'João Silva', supplierId: 'sup5', supplierName: 'Green Produce', storeName: 'FarmFresh', total: 9500, commission: 950, marketplaceProfit: 800, shippingCost: 2000, status: OrderStatus.Refunded, paymentStatus: PaymentStatus.Expired, logisticStatus: LogisticStatus.AwaitingShipment, paymentMethod: 'Pix', businessType: 'B2C', items: initialOrderItems.order3, shippingAddress: 'Rua das Flores, 123, Luanda', shippingCompany: 'N/A', trackingCode: 'N/A', shippedAt: null, deliveredAt: null, estimatedDelivery: getDate(22), events: [
       {status: OrderStatus.Pending, timestamp: new Date(getDate(25)).toISOString(), details: 'Awaiting payment confirmation.'},
       {status: OrderStatus.Cancelled, timestamp: new Date(getDate(23)).toISOString(), details: 'Payment expired.'},
       {status: OrderStatus.Refunded, timestamp: new Date(getDate(23)).toISOString(), details: 'Order refunded.'},
  ]},
  { id: 'ord4', date: getDate(35), buyerId: 'buy3', customerName: 'Carlos Neto', supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', storeName: 'TechHub', total: 420000, commission: 42000, marketplaceProfit: 37800, shippingCost: 20000, status: OrderStatus.Processing, paymentStatus: PaymentStatus.Paid, logisticStatus: LogisticStatus.AwaitingShipment, paymentMethod: 'Stripe', businessType: 'B2B', items: initialOrderItems.order4, shippingAddress: 'Rua Principal, 789, Huambo', shippingCompany: 'FedEx', trackingCode: 'FX112233445', shippedAt: null, deliveredAt: null, estimatedDelivery: getDate(30), events: [
       {status: 'Payment Confirmed', timestamp: new Date(getDate(35)).toISOString(), details: 'Payment processed successfully.'},
       {status: OrderStatus.Processing, timestamp: new Date(getDate(35)).toISOString(), details: 'Order received and is being processed.'},
  ]},
  { id: 'ord5', date: getDate(40), buyerId: 'buy2', customerName: 'Maria Santos', supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', storeName: 'TechHub', total: 950000, commission: 95000, marketplaceProfit: 85500, shippingCost: 10000, status: OrderStatus.Cancelled, paymentStatus: PaymentStatus.Blocked, logisticStatus: LogisticStatus.AwaitingShipment, paymentMethod: 'PayPal', businessType: 'B2C', items: initialOrderItems.order5, shippingAddress: 'Av. Brasil, 456, Benguela', shippingCompany: 'N/A', trackingCode: 'N/A', shippedAt: null, deliveredAt: null, estimatedDelivery: getDate(35), events: [
      {status: OrderStatus.Pending, timestamp: new Date(getDate(40)).toISOString(), details: 'Awaiting payment confirmation.'},
      {status: OrderStatus.Cancelled, timestamp: new Date(getDate(38)).toISOString(), details: 'Order cancelled by customer.'},
  ]},
];

const initialTransactions: Transaction[] = [
  { id: 'txn1', date: getDate(5), supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', orderId: 'ord1', amount: 1045000, commission: 104500, status: TransactionStatus.Paid, marketplace_profit: 94050, payment_method: 'Stripe', category_type: 'B2C', type: 'sale' },
  { id: 'txn2', date: getDate(12), supplierId: 'sup3', supplierName: 'Artisan Crafts', orderId: 'ord2', amount: 28000, commission: 3500, status: TransactionStatus.Paid, marketplace_profit: 3000, payment_method: 'PayPal', category_type: 'C2C', type: 'sale' },
  { id: 'txn3', date: getDate(23), supplierId: 'sup5', supplierName: 'Green Produce', orderId: 'ord3', amount: 9500, commission: 0, status: TransactionStatus.Refunded, marketplace_profit: 0, payment_method: 'Pix', category_type: 'B2C', type: 'refund' },
  { id: 'txn4', date: getDate(35), supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', orderId: 'ord4', amount: 420000, commission: 42000, status: TransactionStatus.Pending, marketplace_profit: 37800, payment_method: 'Stripe', category_type: 'B2B', type: 'sale' },
  { id: 'txn5', date: getDate(39), supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', orderId: 'ord5', amount: 950000, commission: 0, status: TransactionStatus.Blocked, marketplace_profit: 0, payment_method: 'PayPal', category_type: 'B2C', type: 'sale' },
  { id: 'txn6', date: '2024-01-01', supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', orderId: 'N/A', amount: 50000, commission: 0, status: TransactionStatus.Paid, marketplace_profit: 50000, payment_method: 'Stripe', category_type: 'B2B', type: 'selo_paid' },
];

const initialDisputes: Dispute[] = [
    { id: 'disp1', orderId: 'ord5', transactionId: 'txn5', supplierId: 'sup1', supplierName: 'Tech Solutions Inc.', customerName: 'Maria Santos', reason: 'Item not as described', status: DisputeStatus.Open, createdAt: getDate(37), resolvedAt: null },
    { id: 'disp2', orderId: 'ord3', transactionId: 'txn3', supplierId: 'sup5', supplierName: 'Green Produce', customerName: 'João Silva', reason: 'Never received', status: DisputeStatus.Resolved, createdAt: getDate(20), resolvedAt: getDate(18) },
];

const initialMarketplaceUsers: MarketplaceUser[] = [
    ...initialSuppliers.map(s => ({
        id: s.id, name: s.name, email: s.email, type: MarketplaceUserType.Supplier, status: s.status === 'Approved' ? MarketplaceUserStatus.Active : (s.status === 'Blocked' ? MarketplaceUserStatus.Suspended : MarketplaceUserStatus.Pending), lastVisit: getDate(Math.floor(Math.random() * 30)), reputationScore: s.supplierScore, totalOrders: s.totalOrders, createdAt: s.joinedDate,
        orderHistory: initialOrders.filter(o => o.supplierId === s.id),
        financialHistory: initialTransactions.filter(t => t.supplierId === s.id),
        activityLogs: []
    })),
    { id: 'buy1', name: 'João Silva', email: 'joao.silva@example.com', type: MarketplaceUserType.Buyer, status: MarketplaceUserStatus.Active, lastVisit: getDate(1), reputationScore: 98, totalOrders: 2, createdAt: '2022-08-10', orderHistory: initialOrders.filter(o => o.buyerId === 'buy1'), financialHistory: [], activityLogs: [] },
    { id: 'buy2', name: 'Maria Santos', email: 'maria.santos@example.com', type: MarketplaceUserType.Buyer, status: MarketplaceUserStatus.Active, lastVisit: getDate(3), reputationScore: 95, totalOrders: 2, createdAt: '2022-09-20', orderHistory: initialOrders.filter(o => o.buyerId === 'buy2'), financialHistory: [], activityLogs: [] },
    { id: 'buy3', name: 'Carlos Neto', email: 'carlos.neto@example.com', type: MarketplaceUserType.Buyer, status: MarketplaceUserStatus.Suspended, lastVisit: getDate(40), reputationScore: 80, totalOrders: 1, createdAt: '2023-01-05', orderHistory: initialOrders.filter(o => o.buyerId === 'buy3'), financialHistory: [], activityLogs: [] },
];

const initialInternalUsers: InternalUser[] = [
    { id: 'int-usr1', name: 'Alice Johnson', email: 'alice.j@kwanzub.com', role: InternalUserRole.SuperAdmin, status: InternalUserStatus.Active, lastLogin: getDate(0), totalActions: 152, createdAt: '2022-01-10', roleIds: ['role-super-admin'], loginHistory: [
        { id: 'lh1', ipAddress: '203.0.113.55', timestamp: getDate(0), status: 'Success', userName: 'Alice Johnson', isSuspicious: false }
    ], actionHistory: [] },
    { id: 'int-usr2', name: 'Bob Williams', email: 'bob.w@kwanzub.com', role: InternalUserRole.Admin, status: InternalUserStatus.Active, lastLogin: getDate(1), totalActions: 230, createdAt: '2022-02-15', roleIds: ['role-admin'], loginHistory: [
        { id: 'lh2', ipAddress: '198.51.100.12', timestamp: getDate(1), status: 'Success', userName: 'Bob Williams', isSuspicious: false },
        { id: 'lh3', ipAddress: '192.0.2.200', timestamp: getDate(2), status: 'Failed', userName: 'Bob Williams', isSuspicious: true }
    ], actionHistory: [] },
    { id: 'int-usr3', name: 'Charlie Brown', email: 'charlie.b@kwanzub.com', role: InternalUserRole.Moderator, status: InternalUserStatus.Suspended, lastLogin: getDate(30), totalActions: 88, createdAt: '2022-03-20', roleIds: ['role-moderator'], loginHistory: [], actionHistory: [] },
];

const initialAuditLogs: AuditLog[] = [
    { id: 'log1', timestamp: getDate(1), userId: 'int-usr1', userName: 'Alice Johnson', action: 'SupplierStatusChanged', details: 'Supplier "Tech Solutions Inc." approved.', isCritical: true, entityType: 'user', entityId: 'sup1' },
    { id: 'log2', timestamp: getDate(2), userId: 'int-usr2', userName: 'Bob Williams', action: 'ProductStatusChanged', details: 'Product "Laptop Gamer Pro X" approved.', isCritical: false, entityType: 'product', entityId: 'prod1' },
    { id: 'log3', timestamp: getDate(3), userId: 'int-usr1', userName: 'Alice Johnson', action: 'UserSuspended', details: 'User "Carlos Neto" suspended for suspicious activity.', isCritical: true, entityType: 'user', entityId: 'buy3' },
    { id: 'log4', timestamp: getDate(4), userId: 'int-usr2', userName: 'Bob Williams', action: 'OrderStatusChanged', details: 'Order "ord2" status changed to Shipped.', isCritical: false, entityType: 'order', entityId: 'ord2' },
    { id: 'log5', timestamp: getDate(5), userId: 'System', userName: 'System', action: 'PaymentFailed', details: 'Payment for order "ord3" failed (expired).', isCritical: false, entityType: 'order', entityId: 'ord3' },
];
// FIX: Link some logs to users for modal display
initialInternalUsers[0].actionHistory.push(initialAuditLogs[0], initialAuditLogs[2]);
initialInternalUsers[1].actionHistory.push(initialAuditLogs[1], initialAuditLogs[3]);
initialMarketplaceUsers[3].activityLogs.push(initialAuditLogs[2]);


const monthlyData: MonthlyData[] = [
  { name: 'Jan', revenue: 4000000, sales: 2400, orders: 2000, stores: 10, avgTicket: 1739, suppliers: 5, revenueForecast: 3800000 },
  { name: 'Fev', revenue: 3000000, sales: 1398, orders: 1800, stores: 12, avgTicket: 1666, suppliers: 7, revenueForecast: 3200000 },
  { name: 'Mar', revenue: 2000000, sales: 9800, orders: 2290, stores: 15, avgTicket: 873, suppliers: 8, revenueForecast: 2100000 },
  { name: 'Abr', revenue: 2780000, sales: 3908, orders: 2000, stores: 18, avgTicket: 1390, suppliers: 10, revenueForecast: 2800000 },
  { name: 'Mai', revenue: 1890000, sales: 4800, orders: 2181, stores: 20, avgTicket: 866, suppliers: 12, revenueForecast: 1900000 },
  { name: 'Jun', revenue: 2390000, sales: 3800, orders: 2500, stores: 22, avgTicket: 956, suppliers: 15, revenueForecast: 2400000 },
  { name: 'Jul', revenue: 3490000, sales: 4300, orders: 2100, stores: 25, avgTicket: 1661, suppliers: 18 },
];

const alerts: Alert[] = [
    { id: 'alert1', type: AlertType.Payment, message: 'Payment of Kz 420,000.00 for order #ord4 is pending confirmation.', timestamp: getDate(2), relatedId: 'txn4' },
    { id: 'alert2', type: AlertType.Complaint, message: 'Supplier "Office Supplies Ltd." received 3 new high-priority complaints.', timestamp: getDate(3), relatedId: 'sup4' },
    { id: 'alert3', type: AlertType.Dispute, message: 'New dispute opened for order #ord5.', timestamp: getDate(4), relatedId: 'disp1' },
];

const loginAttempts: LoginAttempt[] = [
    { id: 'la1', ipAddress: '192.0.2.200', timestamp: getDate(1), status: 'Failed', userName: 'Bob Williams', isSuspicious: true },
    { id: 'la2', ipAddress: '203.0.113.55', timestamp: getDate(0), status: 'Success', userName: 'Alice Johnson', isSuspicious: false },
    { id: 'la3', ipAddress: '198.51.100.12', timestamp: getDate(1), status: 'Success', userName: 'Bob Williams', isSuspicious: false },
];

const initialCommissionSettings: CommissionSettings = {
    global: 15,
    categories: {
        'Electronics': 12,
        'Home Decor': 20,
        'Groceries': 8,
        'Office': '',
    }
};

const initialNotifications: Notification[] = [
    { id: 'notif1', type: NotificationType.System, priority: NotificationPriority.Critical, title: 'Security Alert: Failed Login', content: 'Suspicious login attempt failed for user Bob Williams from IP 192.0.2.200.', status: NotificationStatus.Unread, timestamp: getDate(1), sender: 'System' },
    { id: 'notif2', type: NotificationType.System, priority: NotificationPriority.Alert, title: 'New Supplier Pending Approval', content: 'Supplier "Global Goods Co." has registered and is awaiting document verification and approval.', status: NotificationStatus.Unread, timestamp: getDate(3), sender: 'System', relatedEntity: { type: 'user', id: 'sup2', displayText: 'Global Goods Co.' } },
    { id: 'notif3', type: NotificationType.Manual, priority: NotificationPriority.Info, title: 'Platform Maintenance', content: 'Scheduled maintenance will occur this Sunday from 2 AM to 4 AM. Some services may be unavailable.', status: NotificationStatus.Unread, timestamp: getDate(0), sender: 'Alice Johnson' },
    { id: 'notif4', type: NotificationType.System, priority: NotificationPriority.Alert, title: 'New Dispute Opened', content: 'A new dispute has been opened for order #ord5.', status: NotificationStatus.Read, timestamp: getDate(4), sender: 'System', relatedEntity: { type: 'order', id: 'ord5', displayText: '#ord5' } },
];

const initialCoupons: Coupon[] = [
    { id: 'coup1', code: 'BEMVINDO10', type: CouponType.Percentage, value: 10, status: CouponStatus.Active, usageCount: 25, usageLimit: 100, expiresAt: null, createdAt: getDate(30) },
    { id: 'coup2', code: 'FRETEGRATIS', type: CouponType.Fixed, value: 5000, status: CouponStatus.Active, usageCount: 15, usageLimit: null, expiresAt: getDate(-30), createdAt: getDate(60) },
    { id: 'coup3', code: 'INVERNO2023', type: CouponType.Percentage, value: 15, status: CouponStatus.Expired, usageCount: 150, usageLimit: 150, expiresAt: getDate(10), createdAt: getDate(90) },
];


export const useMockData = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [marketplaceUsers, setMarketplaceUsers] = useState<MarketplaceUser[]>(initialMarketplaceUsers);
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>(initialInternalUsers);
  const [badgeDefinitions, setBadgeDefinitions] = useState<BadgeDefinition[]>(initialBadgeDefinitions);
  const [sellerBadges, setSellerBadges] = useState<SellerBadge[]>(initialSellerBadges);
  const [paidVerifications, setPaidVerifications] = useState<PaidVerification[]>(initialPaidVerifications);
  const [paidVerificationLogs, setPaidVerificationLogs] = useState<PaidVerificationLog[]>(initialPaidVerificationLogs);
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>(initialCommissionSettings);
  const [stores, setStores] = useState<Store[]>(() => initialStoresData.map(store => {
      const storeTransactions = initialTransactions.filter(t => initialSuppliers.find(s=>s.id === t.supplierId)?.storeId === store.id);
      const supplier = initialSuppliers.find(s => s.id === store.supplierId);
      return {
          ...store,
          totalSales: storeTransactions.reduce((acc, t) => acc + (t.type === 'sale' ? t.amount : 0), 0),
          averageRating: supplier?.averageRating || 0,
          status: supplier?.status === SupplierStatus.Approved ? StoreStatus.Active : (supplier?.status === SupplierStatus.Blocked ? StoreStatus.Inactive : StoreStatus.Pending),
          category: initialProducts.find(p => p.supplierId === store.supplierId)?.category || 'General',
          phone: '9XX XXX XXX',
      }
  }));
  const [conversations, setConversations] = useState<Conversation[]>(() => [
      { id: 'conv1', type: ConversationType.Individual, participants: [initialInternalUsers[1], initialMarketplaceUsers[0]], lastMessage: { id: 'msg1', conversationId: 'conv1', senderId: initialMarketplaceUsers[0].id, content: "Olá, tenho uma dúvida sobre meu último pedido.", timestamp: getDate(0) + 'T10:00:00Z', status: MessageStatus.Read }, unreadCount: 1, isOnline: true, ticketId: 't1' },
      { id: 'conv2', type: ConversationType.Individual, participants: [initialInternalUsers[2], initialMarketplaceUsers[4]], lastMessage: { id: 'msg2', conversationId: 'conv2', senderId: 'int-usr3', content: "Sua documentação foi aprovada.", timestamp: getDate(1) + 'T14:30:00Z', status: MessageStatus.Delivered }, unreadCount: 0, isOnline: false },
      { id: 'conv3', type: ConversationType.Group, name: "Equipa de Moderação", participants: initialInternalUsers, lastMessage: { id: 'msg3', conversationId: 'conv3', senderId: 'int-usr1', content: "Pessoal, vamos focar nos produtos pendentes hoje.", timestamp: getDate(0) + 'T09:00:00Z', status: MessageStatus.Read }, unreadCount: 0 },
  ]);
  const [messages, setMessages] = useState<Message[]>([
        { id: 'msg1', conversationId: 'conv1', senderId: 'sup1', content: "Olá, tenho uma dúvida sobre meu último pedido.", timestamp: getDate(0) + 'T10:00:00Z', status: MessageStatus.Read },
        { id: 'msg1.1', conversationId: 'conv1', senderId: 'int-usr2', content: "Claro, qual é o ID do pedido?", timestamp: getDate(0) + 'T10:01:00Z', status: MessageStatus.Read },
        { id: 'msg2', conversationId: 'conv2', senderId: 'int-usr3', content: "Sua documentação foi aprovada.", timestamp: getDate(1) + 'T14:30:00Z', status: MessageStatus.Delivered },
        { id: 'msg3', conversationId: 'conv3', senderId: 'int-usr1', content: "Pessoal, vamos focar nos produtos pendentes hoje.", timestamp: getDate(0) + 'T09:00:00Z', status: MessageStatus.Read },
  ]);
  const [tickets, setTickets] = useState<Ticket[]>([
      { id: 't1', conversationId: 'conv1', status: TicketStatus.Open, priority: TicketPriority.High, createdAt: getDate(0) + 'T09:58:00Z', sla: 24 },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [roles, setRoles] = useState<Role[]>(() => {
    const userCounts = initialInternalUsers.reduce((acc, user) => {
        user.roleIds.forEach(roleId => {
            acc[roleId] = (acc[roleId] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);
    return initialRoles.map(role => ({ ...role, userCount: userCounts[role.id] || 0 }));
  });
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(initialActiveSessions);
  const [ipRules, setIpRules] = useState<IpRule[]>(initialIpRules);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>(initialFraudReports);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(initialSecurityLogs);

  // --- START COMMERCIAL PLANS STATE & HANDLERS ---
  const [plans, setPlans] = useState<Plan[]>(initialPlans);

  const updateSupplierPlan = (supplierId: string, newPlanId: string) => {
      setSuppliers(prev => prev.map(s => s.id === supplierId ? {...s, planId: newPlanId} : s));
  };

  const updateSupplierSalesStatus = (supplierId: string, newStatus: SellerSalesStatus) => {
      setSuppliers(prev => prev.map(s => s.id === supplierId ? {...s, salesStatus: newStatus} : s));
  };

  const approveManualExpansion = (supplierId: string, newLimit: number) => {
      setSuppliers(prev => prev.map(s => s.id === supplierId ? {...s, manualExpansionAmount: newLimit} : s));
  };
  
  const updatePlan = (updatedPlan: Plan) => {
      setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };
  // --- END COMMERCIAL PLANS STATE & HANDLERS ---
  
  const addLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `log${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const updateSupplierStatus = useCallback((id: string, status: SupplierStatus) => {
    setSuppliers(prev => prev.map(s => {
        if (s.id === id) {
            const newHistoryEntry = {
                status,
                timestamp: new Date().toISOString(),
                changedBy: 'Alice Johnson', // Mock admin user
            };
            return {
                ...s,
                status,
                statusHistory: [...s.statusHistory, newHistoryEntry]
            };
        }
        return s;
    }));
    addLog({
        userId: 'int-usr1',
        userName: 'Alice Johnson',
        action: 'SupplierStatusChanged',
        details: `Supplier "${suppliers.find(s=>s.id===id)?.name}" status changed to ${status}.`,
        isCritical: true,
        entityType: 'user',
        entityId: id
    });
  }, [addLog, suppliers]);

  const updateDocumentStatus = useCallback((supplierId: string, docId: string, status: DocumentStatus) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          documents: s.documents.map(d => d.id === docId ? { ...d, status } : d)
        };
      }
      return s;
    }));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, status: PaymentStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
  }, []);

  const updateOrderItemStatus = useCallback((orderId: string, itemId: string, status: OrderItemStatus) => {
    setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
            return {
                ...o,
                items: o.items.map(i => i.id === itemId ? {...i, status} : i)
            };
        }
        return o;
    }))
  }, []);

  const updateTransactionStatus = useCallback((id: string, status: TransactionStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);
  
  const updateDisputeStatus = useCallback((id: string, status: DisputeStatus) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status, resolvedAt: status === DisputeStatus.Resolved ? new Date().toISOString() : d.resolvedAt } : d));
  }, []);
  
  const updateProductStatus = useCallback((id: string, status: ProductStatus, reason?: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status, rejectionReason: reason || p.rejectionReason } : p));
  }, []);

  const updateMarketplaceUserStatus = useCallback((id: string, status: MarketplaceUserStatus) => {
    setMarketplaceUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    if (suppliers.some(s => s.id === id)) {
      const supStatus = status === MarketplaceUserStatus.Active ? SupplierStatus.Approved : (status === MarketplaceUserStatus.Suspended ? SupplierStatus.Blocked : SupplierStatus.Pending);
      updateSupplierStatus(id, supStatus);
    }
  }, [suppliers, updateSupplierStatus]);
  
  const updateInternalUserStatus = useCallback((id: string, status: InternalUserStatus) => {
    setInternalUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  }, []);
  
  const updateInternalUserRole = useCallback((id: string, role: InternalUserRole) => {
    setInternalUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  }, []);
  
  const updateCommissionSettings = useCallback((settings: CommissionSettings) => {
    setCommissionSettings(settings);
  }, []);
  
  const updateStoreStatus = useCallback((id: string, status: StoreStatus) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }, []);

  // --- NEW: BADGE MANAGEMENT HANDLERS ---
  const saveBadgeDefinition = useCallback((badge: BadgeDefinition) => {
    setBadgeDefinitions(prev => {
        const index = prev.findIndex(b => b.id === badge.id);
        if (index > -1) {
            const newBadges = [...prev];
            newBadges[index] = badge;
            return newBadges;
        }
        return [...prev, badge];
    });
  }, []);
  
  const assignSellerBadge = useCallback((sellerId: string, badgeId: string) => {
      const badgeDef = badgeDefinitions.find(b => b.id === badgeId);
      if (!badgeDef) return;

      const newBadge: SellerBadge = {
          id: `sb-${Date.now()}`,
          sellerId,
          badgeId,
          startDate: new Date().toISOString(),
          expirationDate: badgeDef.validForDays ? new Date(new Date().setDate(new Date().getDate() + badgeDef.validForDays)).toISOString() : null,
          status: SellerBadgeStatus.Active,
          displayValidityPublicly: false, // Default
      };
      
      setSellerBadges(prev => [...prev, newBadge]);
      setSuppliers(prev => prev.map(s => s.id === sellerId ? {...s, badges: [...s.badges, newBadge]} : s));
      addLog({ userId: 'int-usr1', userName: 'Alice Johnson', action: 'BadgeAssigned', details: `Selo "${badgeDef.name}" atribuído ao vendedor "${suppliers.find(s=>s.id === sellerId)?.name}".`, isCritical: false, entityType: 'user', entityId: sellerId });
  }, [badgeDefinitions, suppliers, addLog]);

  const revokeSellerBadge = useCallback((sellerBadgeId: string) => {
      const badgeToRemove = sellerBadges.find(b => b.id === sellerBadgeId);
      if (!badgeToRemove) return;
      
      setSellerBadges(prev => prev.filter(b => b.id !== sellerBadgeId));
      setSuppliers(prev => prev.map(s => s.id === badgeToRemove.sellerId ? {...s, badges: s.badges.filter(b => b.id !== sellerBadgeId)} : s));
      addLog({ userId: 'int-usr1', userName: 'Alice Johnson', action: 'BadgeRevoked', details: `Selo removido do vendedor "${suppliers.find(s=>s.id === badgeToRemove.sellerId)?.name}".`, isCritical: true, entityType: 'user', entityId: badgeToRemove.sellerId });
  }, [sellerBadges, suppliers, addLog]);
  // --- END: BADGE MANAGEMENT HANDLERS ---

    const assignPaidVerification = useCallback((supplierId: string, plan: PaidVerificationPlan, businessType: 'B2B' | 'B2C' | 'C2C') => {
        const newVerification: PaidVerification = {
            id: `pv-${Date.now()}`,
            supplierId,
            plan,
            businessType,
            paymentStatus: PaymentStatus.Paid,
            approvedBy: 'int-usr1',
            approvedAt: new Date().toISOString(),
            expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            active: true,
            criteria: {},
            price: plan === PaidVerificationPlan.BasicPaid ? 15000 : 50000,
        };
        setPaidVerifications(prev => [...prev, newVerification]);
        setSuppliers(prev => prev.map(s => s.id === supplierId ? {...s, paidVerifications: [...s.paidVerifications, newVerification]} : s));
    }, []);

    const renewPaidVerification = useCallback((verificationId: string) => {
        const updatedVerification = paidVerifications.find(pv => pv.id === verificationId);
        if (!updatedVerification) return;

        const renewed = {
            ...updatedVerification,
            expiresAt: new Date(new Date(updatedVerification.expiresAt).setFullYear(new Date(updatedVerification.expiresAt).getFullYear() + 1)).toISOString(),
            paymentStatus: PaymentStatus.Paid,
            active: true,
        };
        
        setPaidVerifications(prev => prev.map(pv => pv.id === verificationId ? renewed : pv));
        setSuppliers(prev => prev.map(s => s.id === renewed.supplierId ? {
            ...s,
            paidVerifications: s.paidVerifications.map(pv => pv.id === verificationId ? renewed : pv)
        } : s));
    }, [paidVerifications]);

    const removePaidVerification = useCallback((verificationId: string) => {
        const verification = paidVerifications.find(pv => pv.id === verificationId);
        if (!verification) return;

        setPaidVerifications(prev => prev.filter(pv => pv.id !== verificationId));
        setSuppliers(prev => prev.map(s => {
            if (s.id === verification.supplierId) {
                return {...s, paidVerifications: s.paidVerifications.filter(pv => pv.id !== verificationId)};
            }
            return s;
        }));
    }, [paidVerifications]);
    
    const addCoupon = useCallback((couponData: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => {
        const newCoupon: Coupon = {
            id: `coup-${Date.now()}`,
            usageCount: 0,
            createdAt: new Date().toISOString(),
            ...couponData,
        };
        setCoupons(prev => [newCoupon, ...prev]);
    }, []);

    const updateCoupon = useCallback((coupon: Coupon) => {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c));
    }, []);

    const sendMessage = useCallback((conversationId: string, content: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId: 'int-usr1', // Mock admin user
            content,
            timestamp: new Date().toISOString(),
            status: MessageStatus.Sent,
        };
        setMessages(prev => [...prev, newMessage]);
        setConversations(prev => prev.map(c => c.id === conversationId ? {...c, lastMessage: newMessage, unreadCount: 0} : c));
    }, []);

    const saveRole = useCallback((role: Role) => {
        setRoles(prev => {
            const index = prev.findIndex(r => r.id === role.id);
            if (index > -1) {
                const newRoles = [...prev];
                newRoles[index] = role;
                return newRoles;
            }
            return [...prev, role];
        });
    }, []);

    const updatePermission = useCallback((roleId: string, module: SystemModule, action: PermissionAction, granted: boolean) => {
        setRoles(prev => prev.map(role => {
            if (role.id === roleId) {
                const newPermissions = { ...role.permissions };
                const modulePermissions = newPermissions[module] || [];
                if (granted) {
                    if (!modulePermissions.includes(action)) {
                        newPermissions[module] = [...modulePermissions, action];
                    }
                } else {
                    newPermissions[module] = modulePermissions.filter(p => p !== action);
                }
                return { ...role, permissions: newPermissions };
            }
            return role;
        }));
    }, []);
    
    const updateNotificationStatus = useCallback((notificationId: string, status: NotificationStatus) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, status } : n));
    }, []);

    const addIpRule = useCallback((rule: Omit<IpRule, 'id' | 'createdAt' | 'createdBy'>) => {
        const newRule: IpRule = {
            id: `ipr${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdBy: 'Alice Johnson', // Mock admin
            ...rule,
        };
        setIpRules(prev => [newRule, ...prev]);
        const newLog: SecurityLog = {
            id: `seclog${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'IP Rule Added',
            adminId: 'int-usr1',
            adminName: 'Alice Johnson',
            details: `${rule.type === 'allow' ? 'Allowed' : 'Denied'} IP ${rule.ip}`,
        };
        setSecurityLogs(prev => [newLog, ...prev]);
    }, []);

    const removeIpRule = useCallback((id: string) => {
        const ruleToRemove = ipRules.find(r => r.id === id);
        if (!ruleToRemove) return;

        setIpRules(prev => prev.filter(r => r.id !== id));
        const newLog: SecurityLog = {
            id: `seclog${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'IP Rule Removed',
            adminId: 'int-usr1',
            adminName: 'Alice Johnson',
            details: `Removed rule for IP ${ruleToRemove.ip}`,
        };
        setSecurityLogs(prev => [newLog, ...prev]);
    }, [ipRules]);

    const stats = useMemo(() => {
        const activeSuppliers = suppliers.filter(s => s.status === SupplierStatus.Approved);
        return {
          totalUsers: marketplaceUsers.length,
          verifiedStores: stores.filter(s => s.isVerified).length,
          activeProducts: products.filter(p => p.status === ProductStatus.Approved).length,
          totalBadges: sellerBadges.length,
          totalRevenue: transactions.filter(t => t.status === TransactionStatus.Paid).reduce((sum, t) => sum + t.amount, 0),
          totalCommission: transactions.filter(t => t.status === TransactionStatus.Paid).reduce((sum, t) => sum + t.commission, 0),
          unreadNotifications: notifications.filter(n => n.status === NotificationStatus.Unread).length,
          activeBuyers: marketplaceUsers.filter(u => u.type === MarketplaceUserType.Buyer && u.status === MarketplaceUserStatus.Active).length,
          activeSuppliers: activeSuppliers.length,
          suspendedUsers: marketplaceUsers.filter(u => u.status === MarketplaceUserStatus.Suspended).length,
          newUsersThisMonth: marketplaceUsers.filter(u => new Date(u.createdAt) > new Date(new Date().setDate(new Date().getDate() - 30))).length,
          totalInternalMembers: internalUsers.length,
          totalAdmins: internalUsers.filter(u => u.role === InternalUserRole.Admin).length,
          totalModerators: internalUsers.filter(u => u.role === InternalUserRole.Moderator).length,
          activeInternalMembers: internalUsers.filter(u => u.status === InternalUserStatus.Active).length,
          newInternalMembersThisMonth: internalUsers.filter(u => new Date(u.createdAt) > new Date(new Date().setDate(new Date().getDate() - 30))).length,
          totalStores: stores.length,
          activeStores: stores.filter(s => s.status === StoreStatus.Active).length,
          totalStoreSales: stores.reduce((acc, s) => acc + s.totalSales, 0),
          averageStoreRating: stores.length > 0 ? stores.reduce((acc, s) => acc + s.averageRating, 0) / stores.length : 0,
          premiumBadges: sellerBadges.filter(sb => badgeDefinitions.find(bd => bd.id === sb.badgeId)?.visualLevel === 3).length,
          activePaidVerifications: paidVerifications.filter(pv => pv.active).length,
          expiredPaidVerifications: paidVerifications.filter(pv => !pv.active).length,
          paidVerificationsRevenue: transactions.filter(t => t.type === 'selo_paid' && t.status === TransactionStatus.Paid).reduce((sum, t) => sum + t.amount, 0),
        };
    }, [suppliers, marketplaceUsers, stores, products, sellerBadges, transactions, notifications, internalUsers, badgeDefinitions, paidVerifications]);

    const securityStats = useMemo(() => ({
        failedLogins: loginAttempts.filter(l => l.status === 'Failed' && new Date(l.timestamp) > new Date(new Date().setDate(new Date().getDate() - 7))).length,
        usersBlocked: marketplaceUsers.filter(u => u.status === MarketplaceUserStatus.Suspended).length + internalUsers.filter(u => u.status === InternalUserStatus.Suspended).length,
        activeSessions: activeSessions.length,
        criticalEvents: auditLogs.filter(l => l.isCritical).length,
        ipsBlocked: ipRules.filter(r => r.type === 'deny').length,
        avgRiskScore: fraudReports.length > 0 ? fraudReports.reduce((sum, r) => sum + r.riskScore, 0) / fraudReports.length : 0,
    }), [marketplaceUsers, internalUsers, activeSessions, auditLogs, ipRules, fraudReports]);

    const productCategories = useMemo(() => [...new Set(initialProducts.map(p => p.category))], []);
    const storeCategories = useMemo(() => [...new Set(stores.map(s => s.category))], [stores]);

    return {
        suppliers,
        products,
        transactions,
        auditLogs,
        orders,
        marketplaceUsers,
        internalUsers,
        badgeDefinitions,
        sellerBadges,
        paidVerifications,
        paidVerificationLogs,
        disputes,
        commissionSettings,
        stores,
        conversations,
        messages,
        tickets,
        notifications,
        coupons,
        roles,
        activeSessions,
        ipRules,
        fraudReports,
        securityLogs,
        plans,
        setProducts,
        updateSupplierPlan,
        updateSupplierSalesStatus,
        approveManualExpansion,
        updatePlan,
        addLog,
        updateSupplierStatus,
        updateDocumentStatus,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderItemStatus,
        updateTransactionStatus,
        updateDisputeStatus,
        updateProductStatus,
        updateMarketplaceUserStatus,
        updateInternalUserStatus,
        updateInternalUserRole,
        updateCommissionSettings,
        updateStoreStatus,
        saveBadgeDefinition,
        assignSellerBadge,
        revokeSellerBadge,
        assignPaidVerification,
        renewPaidVerification,
        removePaidVerification,
        addCoupon,
        updateCoupon,
        sendMessage,
        saveRole,
        updatePermission,
        stats,
        securityStats,
        productCategories,
        storeCategories,
        monthlyData,
        alerts,
        loginAttempts,
        updateNotificationStatus,
        addIpRule,
        removeIpRule,
    };
};
