import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X, ChevronDown, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { mockProducts, brands, categories } from '@/data/mockProducts';
import { formatPrice, getCategoryLabel } from '@/lib/formatters';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';
  const isPromo = searchParams.get('promo') === 'true';
  const isBestSeller = searchParams.get('bestseller') === 'true';

  // Filter products
  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    // Category filter
    if (categoryParam) {
      products = products.filter((p) => p.category === categoryParam);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Promo filter
    if (isPromo) {
      products = products.filter((p) => p.isPromo);
    }

    // Best seller filter
    if (isBestSeller) {
      products = products.filter((p) => p.isBestSeller);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      products = products.filter((p) => selectedBrands.includes(p.brand));
    }

    // Price filter
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return products;
  }, [categoryParam, searchQuery, isPromo, isBestSeller, selectedBrands, priceRange, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 2000000]);
    setSearchParams({});
  };

  const hasActiveFilters = selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 2000000;

  // Get page title
  const getPageTitle = () => {
    if (searchQuery) return `Résultats pour "${searchQuery}"`;
    if (isPromo) return '🔥 Promotions';
    if (isBestSeller) return '⭐ Meilleures ventes';
    if (categoryParam) return getCategoryLabel(categoryParam);
    return 'Tous les produits';
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                categoryParam === cat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={2000000}
          step={50000}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Marques</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick filters */}
      <div>
        <h3 className="font-semibold mb-3">Filtres rapides</h3>
        <div className="space-y-2">
          <Link
            to="/products?promo=true"
            className={`block p-2 rounded-lg transition-colors ${
              isPromo ? 'bg-destructive text-destructive-foreground' : 'hover:bg-secondary'
            }`}
          >
            🔥 En promotion
          </Link>
          <Link
            to="/products?bestseller=true"
            className={`block p-2 rounded-lg transition-colors ${
              isBestSeller ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary'
            }`}
          >
            ⭐ Meilleures ventes
          </Link>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <span className="text-foreground">{getPageTitle()}</span>
        </nav>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <h2 className="font-display text-xl font-bold">Filtres</h2>
              <FiltersContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="section-title">{getPageTitle()}</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filtres
                      {hasActiveFilters && (
                        <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          !
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filtres</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récents</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="rating">Mieux notés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters tags */}
            {(selectedBrands.length > 0 || categoryParam || isPromo || isBestSeller) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categoryParam && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {getCategoryLabel(categoryParam)}
                    <button onClick={() => setSearchParams({})}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {brand}
                    <button onClick={() => toggleBrand(brand)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
