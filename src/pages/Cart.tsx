import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatters';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const deliveryFee = cart.totalAmount >= 500000 ? 0 : 5000;
  const finalTotal = cart.totalAmount + deliveryFee;

  if (cart.items.length === 0) {
    return (
      <Layout>
        <div className="container-main py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Link to="/products">
              <Button className="btn-primary">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Voir les produits
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Mon panier</h1>
            <p className="text-muted-foreground mt-1">{cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}</p>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Vider le panier
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border"
              >
                {/* Image */}
                <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{item.productBrand}</p>
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatPrice(item.subtotal)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unitPrice)} / unité
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">Résumé</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-success">Gratuite</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {cart.totalAmount < 500000 && (
                  <p className="text-xs text-muted-foreground">
                    💡 Livraison gratuite à partir de 500 000 FCFA
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Link to="/checkout" className="block">
                <Button className="w-full btn-primary" size="lg">
                  Commander
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to="/products" className="block">
                <Button variant="outline" className="w-full">
                  Continuer mes achats
                </Button>
              </Link>

              {/* Payment methods */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Moyens de paiement acceptés
                </p>
                <div className="flex justify-center gap-2">
                  <span className="px-2 py-1 bg-secondary rounded text-xs">Wave</span>
                  <span className="px-2 py-1 bg-secondary rounded text-xs">Orange Money</span>
                  <span className="px-2 py-1 bg-secondary rounded text-xs">Free Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
