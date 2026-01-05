import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export function ProductCard({ 
  id, 
  name, 
  description, 
  price, 
  imageUrl, 
  isAvailable, 
  isFeatured 
}: ProductCardProps) {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    
    setIsAdding(true);
    addItem({
      productId: id,
      name,
      price,
      quantity: 1,
    });
    
    toast.success(t.menu.added, {
      description: name,
    });

    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${!isAvailable ? 'opacity-60' : ''}`}>
      {/* Featured Badge */}
      {isFeatured && (
        <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground gap-1">
          <Star className="h-3 w-3 fill-current" />
          {t.menu.featured}
        </Badge>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay on hover */}
        {isAvailable && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        )}
      </div>

      <CardContent className="p-4">
        {/* Name & Description */}
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold line-clamp-1">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
          )}
        </div>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {t.common.currency}{price.toFixed(2)}
          </span>
          
          {isAvailable ? (
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              {isAdding ? t.menu.added : t.menu.addToCart}
            </Button>
          ) : (
            <Badge variant="secondary">{t.menu.notAvailable}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
