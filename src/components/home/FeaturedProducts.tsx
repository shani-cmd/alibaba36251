import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/menu/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name_en: string;
  name_de: string;
  description_en: string | null;
  description_de: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
}

export function FeaturedProducts() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_available', true)
        .limit(4);

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t.menu.featured}</h2>
            <p className="text-muted-foreground mt-2">{t.menu.subtitle}</p>
          </div>
          <Link to="/menu">
            <Button variant="outline" className="gap-2">
              {t.hero.viewMenu}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={language === 'de' ? product.name_de : product.name_en}
              description={language === 'de' ? product.description_de ?? undefined : product.description_en ?? undefined}
              price={Number(product.price)}
              imageUrl={product.image_url ?? undefined}
              isAvailable={product.is_available}
              isFeatured={product.is_featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
