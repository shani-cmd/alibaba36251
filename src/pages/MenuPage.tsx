import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/menu/ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name_en: string;
  name_de: string;
}

interface Product {
  id: string;
  category_id: string | null;
  name_en: string;
  name_de: string;
  description_en: string | null;
  description_de: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
}

const MenuPage = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_available', true).order('sort_order'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold">{t.menu.title}</h1>
          <p className="text-muted-foreground mt-2">{t.menu.subtitle}</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            {t.common.all}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
              size="sm"
            >
              {language === 'de' ? cat.name_de : cat.name_en}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
