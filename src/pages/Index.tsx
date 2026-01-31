import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, Monitor, Shield, Truck, CreditCard, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Layout } from '@/components/layout/Layout';
import { mockProducts } from '@/data/mockProducts';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-foreground pattern-overlay">
      <div className="container-main py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-6 text-background animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Livraison gratuite à partir de 500 000 FCFA
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              La <span className="gradient-text">technologie</span> de qualité, 
              accessible au <span className="text-accent">Sénégal</span>
            </h1>
            
            <p className="text-lg text-background/70 max-w-lg">
              Découvrez notre sélection d'ordinateurs portables et de bureau des meilleures marques. 
              Service client local, paiement mobile et livraison rapide.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="btn-primary text-base px-8">
                  Voir les produits
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/products?promo=true">
                <Button size="lg" variant="outline" className="text-base px-8 border-background/30 text-background hover:bg-background/10">
                  🔥 Promotions
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-background/60">
                <Shield className="w-5 h-5 text-success" />
                <span>Garantie incluse</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/60">
                <Truck className="w-5 h-5 text-accent" />
                <span>Livraison rapide</span>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full" />
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
              alt="MacBook Pro"
              className="relative w-full max-w-lg mx-auto animate-float drop-shadow-2xl rounded-2xl"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-card text-foreground p-4 rounded-xl shadow-xl animate-fade-in">
              <p className="text-sm font-medium">🔥 Offre spéciale</p>
              <p className="text-2xl font-bold text-primary">-12%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto fill-background">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const categories = [
    {
      id: 'LAPTOP',
      name: 'PC Portables',
      description: 'Travaillez partout avec style',
      icon: Laptop,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
      count: 45,
    },
    {
      id: 'DESKTOP',
      name: 'PC de Bureau',
      description: 'Puissance et performance',
      icon: Monitor,
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600',
      count: 28,
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container-main">
        <div className="text-center mb-10">
          <h2 className="section-title">Nos catégories</h2>
          <p className="text-muted-foreground mt-2">Trouvez l'ordinateur parfait pour vos besoins</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl h-64 md:h-80"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary rounded-lg">
                    <category.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-background/70">{category.count} produits</span>
                </div>
                <h3 className="font-display text-2xl font-bold">{category.name}</h3>
                <p className="text-background/70 mt-1">{category.description}</p>
                <div className="mt-4 flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                  Découvrir
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: 'Livraison rapide',
      description: 'Livraison dans tout le Sénégal sous 24-72h',
    },
    {
      icon: CreditCard,
      title: 'Paiement mobile',
      description: 'Wave, Orange Money, Free Money acceptés',
    },
    {
      icon: Shield,
      title: 'Garantie officielle',
      description: 'Tous nos produits sont garantis',
    },
    {
      icon: Headphones,
      title: 'Support local',
      description: 'Service client en français et wolof',
    },
  ];

  return (
    <section className="py-12 bg-secondary">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-card transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoSection() {
  const promoProducts = mockProducts.filter((p) => p.isPromo).slice(0, 4);

  return (
    <section className="py-16 bg-background">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">🔥 Promotions</h2>
            <p className="text-muted-foreground mt-1">Offres exceptionnelles à ne pas manquer</p>
          </div>
          <Link to="/products?promo=true">
            <Button variant="outline" className="hidden sm:flex">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <ProductGrid products={promoProducts} />
      </div>
    </section>
  );
}

function BestSellersSection() {
  const bestSellers = mockProducts.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-16 bg-muted">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">⭐ Meilleures ventes</h2>
            <p className="text-muted-foreground mt-1">Les produits préférés de nos clients</p>
          </div>
          <Link to="/products?bestseller=true">
            <Button variant="outline" className="hidden sm:flex">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <ProductGrid products={bestSellers} />
      </div>
    </section>
  );
}

function BrandsSection() {
  const brands = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer'];

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="container-main">
        <p className="text-center text-muted-foreground mb-6">Marques partenaires</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand) => (
            <Link
              key={brand}
              to={`/products?brand=${brand}`}
              className="text-xl md:text-2xl font-display font-bold text-muted-foreground/50 hover:text-primary transition-colors"
            >
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground pattern-overlay">
      <div className="container-main text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Prêt à trouver votre prochain ordinateur ?
        </h2>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Parcourez notre catalogue complet et bénéficiez de conseils personnalisés pour choisir 
          l'appareil qui correspond à vos besoins et votre budget.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/products">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Explorer le catalogue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 hover:bg-primary-foreground/10">
              Nous contacter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <PromoSection />
      <BestSellersSection />
      <BrandsSection />
      <CTASection />
    </Layout>
  );
}
