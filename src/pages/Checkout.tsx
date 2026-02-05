import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PaymentMethod } from '@/types';

const paymentMethods = [
  { id: 'WAVE', name: 'Wave', icon: '📱', description: 'Paiement instantané via Wave' },
  { id: 'ORANGE_MONEY', name: 'Orange Money', icon: '🟠', description: 'Paiement via Orange Money' },
  { id: 'FREE_MONEY', name: 'Free Money', icon: '🔵', description: 'Paiement via Free Money' },
  { id: 'CASH_ON_DELIVERY', name: 'Paiement à la livraison', icon: '💵', description: 'Payez à la réception' },
];

const cities = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Ziguinchor',
  'Kaolack',
  'Mbour',
  'Rufisque',
  'Touba',
  'Diourbel',
  'Louga',
];

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Check for payment error from redirect
  const hasPaymentError = searchParams.get('error') === 'true';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Dakar',
    region: user?.region || '',
    notes: '',
    paymentMethod: 'WAVE' as PaymentMethod,
  });

  const deliveryFee = cart.totalAmount >= 500000 ? 0 : 5000;
  const finalTotal = cart.totalAmount + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show error toast if redirected back with error
  if (hasPaymentError) {
    toast({
      title: 'Erreur de paiement',
      description: 'Le paiement a échoué. Veuillez réessayer.',
      variant: 'destructive',
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des produits à votre panier avant de commander',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get auth token if logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create order via edge function
      const response = await supabase.functions.invoke('create-order', {
        body: {
          items: cart.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productBrand: item.productBrand,
            productImageUrl: item.productImageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          subtotal: cart.totalAmount,
          deliveryFee: deliveryFee,
          totalAmount: finalTotal,
          paymentMethod: formData.paymentMethod,
          deliveryFirstName: formData.firstName,
          deliveryLastName: formData.lastName,
          deliveryPhone: formData.phone,
          deliveryAddress: formData.address,
          deliveryCity: formData.city,
          deliveryRegion: formData.region || null,
          deliveryNotes: formData.notes || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la création de la commande');
      }

      // If payment requires redirect (Wave, Orange Money, Free Money)
      if (result.payment?.paymentUrl) {
        window.location.href = result.payment.paymentUrl;
        return;
      }

      // For cash on delivery or simulated payments, redirect to success
      clearCart();
      toast({
        title: 'Commande confirmée ! 🎉',
        description: 'Vous recevrez un SMS avec les détails de votre commande',
      });

      navigate(`/order-success?order=${result.order.orderNumber}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Back button */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au panier
        </Link>

        <h1 className="section-title mb-8">Finaliser la commande</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Informations de livraison</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="77 123 45 67"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="address">Adresse complète *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Quartier, rue, point de repère..."
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes pour la livraison (optionnel)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Instructions spéciales pour le livreur..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Mode de paiement</h2>
                </div>

                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={method.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{method.icon}</span>
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-display text-xl font-bold">Votre commande</h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        <p className="text-sm font-bold text-primary">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-success">Gratuite</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Traitement en cours...'
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirmer la commande
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  En confirmant, vous acceptez nos conditions générales de vente
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
