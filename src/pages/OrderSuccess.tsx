import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <Layout>
      <div className="container-main py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>

          <h1 className="font-display text-3xl font-bold mb-4">
            Commande confirmée ! 🎉
          </h1>

          {orderNumber && (
            <p className="text-lg font-semibold text-primary mb-4">
              N° de commande : {orderNumber}
            </p>
          )}

          <p className="text-muted-foreground mb-8">
            Merci pour votre commande ! Vous recevrez bientôt un SMS avec les détails 
            de votre commande et les instructions de paiement.
          </p>

          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="font-semibold mb-3">Prochaines étapes</h3>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>Vous recevrez un SMS de confirmation avec le numéro de commande</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>Effectuez le paiement selon le mode choisi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>Nous préparons votre commande pour expédition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                <span>Livraison sous 24-72h selon votre localisation</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button className="btn-primary w-full sm:w-auto">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continuer les achats
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
