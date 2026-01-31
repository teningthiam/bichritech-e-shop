// Format price in FCFA
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Format date
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

// Format phone number (Senegalese format)
export function formatPhone(phone: string): string {
  // Clean the phone number
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XX XXX XX XX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

// Get order status label in French
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PROCESSING: 'En préparation',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  };
  return labels[status] || status;
}

// Get payment method label
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    WAVE: 'Wave',
    ORANGE_MONEY: 'Orange Money',
    FREE_MONEY: 'Free Money',
    CASH_ON_DELIVERY: 'Paiement à la livraison',
  };
  return labels[method] || method;
}

// Get category label in French
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    LAPTOP: 'PC Portables',
    DESKTOP: 'PC de Bureau',
    ACCESSORY: 'Accessoires',
  };
  return labels[category] || category;
}
