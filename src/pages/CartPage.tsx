import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { t } = useLanguage();
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  const deliveryFee = 2.50;
  const freeDeliveryThreshold = 25;
  const actualDeliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
  const total = subtotal + actualDeliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">{t.cart.empty}</h2>
          <p className="text-muted-foreground mb-6">{t.cart.emptySubtitle}</p>
          <Link to="/menu">
            <Button>
              {t.cart.continueShopping}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{t.cart.title}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-primary font-medium">
                        {t.common.currency}{item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-semibold min-w-[60px] text-right">
                        {t.common.currency}{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display text-xl font-semibold">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.cart.subtotal} ({totalItems} items)</span>
                    <span>{t.common.currency}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.cart.deliveryFee}</span>
                    <span>
                      {actualDeliveryFee === 0 
                        ? t.checkout.free 
                        : `${t.common.currency}${actualDeliveryFee.toFixed(2)}`
                      }
                    </span>
                  </div>
                  {subtotal < freeDeliveryThreshold && (
                    <p className="text-xs text-muted-foreground">
                      Add {t.common.currency}{(freeDeliveryThreshold - subtotal).toFixed(2)} more for free delivery
                    </p>
                  )}
                </div>

                <hr />

                <div className="flex justify-between font-semibold text-lg">
                  <span>{t.cart.total}</span>
                  <span className="text-primary">{t.common.currency}{total.toFixed(2)}</span>
                </div>

                <Link to="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    {t.cart.checkout}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/menu" className="block">
                  <Button variant="outline" className="w-full">
                    {t.cart.continueShopping}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
