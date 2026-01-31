import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, Check, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/products/ProductGrid';
import { mockProducts } from '@/data/mockProducts';
import { formatPrice, calculateDiscount, getCategoryLabel } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = mockProducts.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <Layout>
        <div className="container-main py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Link to="/products">
            <Button>Retour aux produits</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = calculateDiscount(product.originalPrice || 0, product.price);
  const allImages = [product.imageUrl, ...product.additionalImages];
  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: 'Produit ajouté',
      description: `${product.name} a été ajouté au panier`,
    });
  };

  const specs = [
    { label: 'Processeur', value: product.processor },
    { label: 'RAM', value: product.ram },
    { label: 'Stockage', value: product.storage },
    { label: 'Carte graphique', value: product.graphics },
    { label: 'Écran', value: product.screenSize },
    { label: 'Système', value: product.os },
  ].filter((spec) => spec.value);

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Produits</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary">
            {getCategoryLabel(product.category)}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Back button - Mobile */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Product main section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isPromo && discount > 0 && (
                  <span className="badge-promo text-sm">-{discount}%</span>
                )}
                {product.isNew && <span className="badge-new text-sm">Nouveau</span>}
                {product.isBestSeller && <span className="badge-bestseller text-sm">Best-seller</span>}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Brand */}
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>

            {/* Title */}
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviewCount} avis)</span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-success font-medium">
                  Économisez {formatPrice((product.originalPrice || 0) - product.price)}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-success" />
                  <span className="text-success font-medium">En stock</span>
                  {product.stock <= 5 && (
                    <span className="text-muted-foreground">
                      (Plus que {product.stock} disponibles)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-destructive font-medium">Rupture de stock</span>
              )}
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border-2 border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1 btn-primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInCart(product.id) ? 'Ajouter encore' : 'Ajouter au panier'}
              </Button>

              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Livraison rapide</p>
                  <p className="text-xs text-muted-foreground">24-72h au Sénégal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Garantie incluse</p>
                  <p className="text-xs text-muted-foreground">12 mois minimum</p>
                </div>
              </div>
            </div>

            {/* Quick specs */}
            {specs.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-3">Caractéristiques principales</h3>
                <div className="grid grid-cols-2 gap-2">
                  {specs.slice(0, 4).map((spec) => (
                    <div key={spec.label} className="text-sm">
                      <span className="text-muted-foreground">{spec.label}: </span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Caractéristiques
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Avis ({product.reviewCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Les avis clients seront bientôt disponibles.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="section-title mb-6">Produits similaires</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </Layout>
  );
}
