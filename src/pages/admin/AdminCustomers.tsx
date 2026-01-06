import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, ShoppingBag, Mail, Phone, Euro } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Order = Tables<"orders">;

interface CustomerWithStats extends Profile {
  email?: string;
  orderCount: number;
  totalSpent: number;
  lastOrder?: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all orders to calculate stats
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total, created_at")
        .not("status", "eq", "cancelled");

      if (ordersError) throw ordersError;

      // Calculate customer stats
      const customerStats: Record<
        string,
        { orderCount: number; totalSpent: number; lastOrder?: string }
      > = {};

      orders?.forEach((order) => {
        if (order.user_id) {
          if (!customerStats[order.user_id]) {
            customerStats[order.user_id] = {
              orderCount: 0,
              totalSpent: 0,
            };
          }
          customerStats[order.user_id].orderCount++;
          customerStats[order.user_id].totalSpent += Number(order.total);
          if (
            !customerStats[order.user_id].lastOrder ||
            order.created_at > customerStats[order.user_id].lastOrder!
          ) {
            customerStats[order.user_id].lastOrder = order.created_at;
          }
        }
      });

      // Combine profiles with stats
      const customersWithStats: CustomerWithStats[] = (profiles || []).map(
        (profile) => ({
          ...profile,
          orderCount: customerStats[profile.user_id]?.orderCount || 0,
          totalSpent: customerStats[profile.user_id]?.totalSpent || 0,
          lastOrder: customerStats[profile.user_id]?.lastOrder,
        })
      );

      // Sort by total spent
      customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);

      setCustomers(customersWithStats);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);

    // Fetch customer orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", customer.user_id)
      .order("created_at", { ascending: false })
      .limit(10);

    setCustomerOrders(orders || []);
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success/20 text-success";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-warning/20 text-warning";
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Customer Management
          </h2>
          <p className="text-muted-foreground">
            View and manage your customer database
          </p>
        </div>
        <Badge variant="secondary" className="text-base">
          <Users className="h-4 w-4 mr-2" />
          {customers.length} customers
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No customers found" : "No registered customers yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => viewCustomerDetails(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {customer.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {customer.full_name || "Unnamed Customer"}
                      </p>
                      {customer.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="font-semibold flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" />
                      {customer.orderCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {customer.totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Last order: {formatDate(customer.lastOrder)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Details Dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {selectedCustomer?.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <p>{selectedCustomer?.full_name || "Unnamed Customer"}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  Customer since {formatDate(selectedCustomer?.created_at)}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-2">
                {selectedCustomer.phone && (
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedCustomer.phone}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{selectedCustomer.orderCount}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">
                    €{selectedCustomer.totalSpent.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">
                    €
                    {selectedCustomer.orderCount > 0
                      ? (
                          selectedCustomer.totalSpent / selectedCustomer.orderCount
                        ).toFixed(0)
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Order</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="font-semibold mb-3">Recent Orders</h4>
                <ScrollArea className="h-48">
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No orders yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {order.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <span className="font-semibold">
                              €{Number(order.total).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
