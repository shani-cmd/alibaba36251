import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UtensilsCrossed, FolderOpen } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Category = Tables<"categories">;

interface ProductForm {
  id?: string;
  name_en: string;
  name_de: string;
  description_en: string;
  description_de: string;
  price: string;
  category_id: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
}

interface CategoryForm {
  id?: string;
  name_en: string;
  name_de: string;
  description_en: string;
  description_de: string;
  is_active: boolean;
}

const defaultProductForm: ProductForm = {
  name_en: "",
  name_de: "",
  description_en: "",
  description_de: "",
  price: "",
  category_id: "",
  image_url: "",
  is_available: true,
  is_featured: false,
};

const defaultCategoryForm: CategoryForm = {
  name_en: "",
  name_de: "",
  description_en: "",
  description_de: "",
  is_active: true,
};

export default function AdminMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(defaultCategoryForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from("products").select("*").order("sort_order"),
        supabase.from("categories").select("*").order("sort_order"),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name_en: productForm.name_en,
        name_de: productForm.name_de,
        description_en: productForm.description_en || null,
        description_de: productForm.description_de || null,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id || null,
        image_url: productForm.image_url || null,
        is_available: productForm.is_available,
        is_featured: productForm.is_featured,
      };

      if (isEditing && productForm.id) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productForm.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast.success("Product created successfully");
      }

      setProductDialogOpen(false);
      setProductForm(defaultProductForm);
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name_en: categoryForm.name_en,
        name_de: categoryForm.name_de,
        description_en: categoryForm.description_en || null,
        description_de: categoryForm.description_de || null,
        is_active: categoryForm.is_active,
      };

      if (isEditing && categoryForm.id) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", categoryForm.id);
        if (error) throw error;
        toast.success("Category updated successfully");
      } else {
        const { error } = await supabase.from("categories").insert(categoryData);
        if (error) throw error;
        toast.success("Category created successfully");
      }

      setCategoryDialogOpen(false);
      setCategoryForm(defaultCategoryForm);
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const editProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name_en: product.name_en,
      name_de: product.name_de,
      description_en: product.description_en || "",
      description_de: product.description_de || "",
      price: product.price.toString(),
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      is_available: product.is_available ?? true,
      is_featured: product.is_featured ?? false,
    });
    setIsEditing(true);
    setProductDialogOpen(true);
  };

  const editCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name_en: category.name_en,
      name_de: category.name_de,
      description_en: category.description_en || "",
      description_de: category.description_de || "",
      is_active: category.is_active ?? true,
    });
    setIsEditing(true);
    setCategoryDialogOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Product deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Category deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !product.is_available })
        .eq("id", product.id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name_en || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Menu Management
        </h2>
        <p className="text-muted-foreground">
          Manage your products and categories
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderOpen className="h-4 w-4 mr-2" />
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setProductForm(defaultProductForm);
                    setIsEditing(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name_en">Name (English) *</Label>
                      <Input
                        id="name_en"
                        value={productForm.name_en}
                        onChange={(e) =>
                          setProductForm({ ...productForm, name_en: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_de">Name (German) *</Label>
                      <Input
                        id="name_de"
                        value={productForm.name_de}
                        onChange={(e) =>
                          setProductForm({ ...productForm, name_de: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="desc_en">Description (English)</Label>
                      <Textarea
                        id="desc_en"
                        value={productForm.description_en}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description_en: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc_de">Description (German)</Label>
                      <Textarea
                        id="desc_de"
                        value={productForm.description_de}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description_de: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({ ...productForm, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={productForm.category_id}
                        onValueChange={(value) =>
                          setProductForm({ ...productForm, category_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={productForm.image_url}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_available"
                        checked={productForm.is_available}
                        onCheckedChange={(checked) =>
                          setProductForm({ ...productForm, is_available: checked })
                        }
                      />
                      <Label htmlFor="is_available">Available</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_featured"
                        checked={productForm.is_featured}
                        onCheckedChange={(checked) =>
                          setProductForm({ ...productForm, is_featured: checked })
                        }
                      />
                      <Label htmlFor="is_featured">Featured</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setProductDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {isEditing ? "Update" : "Create"} Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className={!product.is_available ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name_en}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                        <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate">{product.name_en}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getCategoryName(product.category_id)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {product.is_featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-primary mt-2">
                        €{Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.is_available ?? true}
                        onCheckedChange={() => toggleProductAvailability(product)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {product.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setCategoryForm(defaultCategoryForm);
                    setIsEditing(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Edit Category" : "Add New Category"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat_name_en">Name (English) *</Label>
                      <Input
                        id="cat_name_en"
                        value={categoryForm.name_en}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, name_en: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat_name_de">Name (German) *</Label>
                      <Input
                        id="cat_name_de"
                        value={categoryForm.name_de}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, name_de: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat_desc_en">Description (English)</Label>
                      <Textarea
                        id="cat_desc_en"
                        value={categoryForm.description_en}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            description_en: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat_desc_de">Description (German)</Label>
                      <Textarea
                        id="cat_desc_de"
                        value={categoryForm.description_de}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            description_de: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="cat_is_active"
                      checked={categoryForm.is_active}
                      onCheckedChange={(checked) =>
                        setCategoryForm({ ...categoryForm, is_active: checked })
                      }
                    />
                    <Label htmlFor="cat_is_active">Active</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCategoryDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {isEditing ? "Update" : "Create"} Category
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const productCount = products.filter(
                (p) => p.category_id === category.id
              ).length;
              return (
                <Card
                  key={category.id}
                  className={!category.is_active ? "opacity-60" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{category.name_en}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.name_de}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {productCount} products
                        </p>
                      </div>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-end gap-1 mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(category.id)}
                        disabled={productCount > 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
