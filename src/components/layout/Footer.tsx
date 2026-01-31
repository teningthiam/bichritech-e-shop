import { Link } from 'react-router-dom';
import { Laptop, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      {/* Main footer */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Laptop className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Bichri<span className="text-primary">Tech</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre partenaire de confiance pour l'achat d'ordinateurs de qualité au Sénégal. 
              Nous offrons les meilleures marques avec un service client exceptionnel.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-full bg-background/10 hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-background/10 hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-background/10 hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link to="/products?category=LAPTOP" className="text-muted-foreground hover:text-primary transition-colors">
                  PC Portables
                </Link>
              </li>
              <li>
                <Link to="/products?category=DESKTOP" className="text-muted-foreground hover:text-primary transition-colors">
                  PC de Bureau
                </Link>
              </li>
              <li>
                <Link to="/products?promo=true" className="text-muted-foreground hover:text-primary transition-colors">
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Service client</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-muted-foreground hover:text-primary transition-colors">
                  Livraison
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">+221 77 123 45 67</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">contact@bichritech.sn</span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Moyens de paiement</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-background/10 rounded text-xs font-medium">Wave</span>
                <span className="px-3 py-1 bg-background/10 rounded text-xs font-medium">Orange Money</span>
                <span className="px-3 py-1 bg-background/10 rounded text-xs font-medium">Free Money</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© 2024 BichriTech. Tous droits réservés.</p>
          <p>Fait avec ❤️ au Sénégal</p>
        </div>
      </div>
    </footer>
  );
}
