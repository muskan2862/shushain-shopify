
"use client";

import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [message, setMessage] = useState("");
  const [prices, setPrices] = useState({});
  const [updating, setUpdating] = useState("");

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/test-shopify");
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Could not load products");
      }

      const list =
        data.products?.nodes ||
        data.products ||
        data.data?.products?.nodes ||
        data.data?.products ||
        [];

      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      setMessage("Products error: " + error.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not load orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setMessage("Orders error: " + error.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  async function updatePrice(product) {
    const variants = product.variants?.nodes || product.variants || [];
    const variant = variants[0];

    if (!variant?.id) {
      setMessage("No product variant found for this product.");
      return;
    }

    const newPrice = prices[product.id];
    if (newPrice === undefined || newPrice === "" || Number(newPrice) < 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    setUpdating(product.id);
    setMessage("");

    try {
      const res = await fetch("/api/update-price", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          price: String(newPrice),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Price update failed");
      }

      setMessage("Price updated successfully!");
      await loadProducts();
    } catch (error) {
      setMessage("Price update failed: " + error.message);
    } finally {
      setUpdating("");
    }
  }

 
const money = (value, currency = "INR") => {
  const amount =
    typeof value === "object"
      ? value?.amount ?? value?.shopMoney?.amount
      : value;

  if (amount == null) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
};


  const card = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
  };

  const button = {
    background: "#166534",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f7f6",
      color: "#17211b",
      padding: "32px 18px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28
        }}>
          <div>
            <p style={{ color: "#166534", fontWeight: 700, margin: "0 0 8px" }}>
              SHOPIFY ADMIN INTEGRATION
            </p>
            <h1 style={{ fontSize: 30, margin: 0 }}>
              Store Dashboard
            </h1>
            <p style={{ color: "#647067", marginBottom: 0 }}>
              Products, price management and recent orders
            </p>
          </div>
          <button
            style={button}
            onClick={() => {
              setMessage("");
              loadProducts();
              loadOrders();
            }}
          >
            Refresh data
          </button>
        </header>

        {message && (
          <div role="status" style={{
            ...card,
            marginBottom: 20,
            background: "#f0fdf4",
            borderColor: "#bbf7d0",
            overflowWrap: "anywhere"
          }}>
            {message}
            <button
              onClick={() => setMessage("")}
              style={{
                float: "right",
                border: 0,
                background: "transparent",
                cursor: "pointer"
              }}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 26
        }}>
          <div style={card}>
            <p style={{ color: "#647067", marginTop: 0 }}>Products loaded</p>
            <h2 style={{ fontSize: 32, margin: 0 }}>
              {loadingProducts ? "…" : products.length}
            </h2>
          </div>
          <div style={card}>
            <p style={{ color: "#647067", marginTop: 0 }}>Orders loaded</p>
            <h2 style={{ fontSize: 32, margin: 0 }}>
              {loadingOrders ? "…" : orders.length}
            </h2>
          </div>
        </section>

        <section style={{ ...card, marginBottom: 26 }}>
          <h2 style={{ marginTop: 0 }}>Products & Price Updates</h2>
          {loadingProducts ? (
            <p>Loading products from Shopify…</p>
          ) : products.length === 0 ? (
            <p>No products returned. Check the products API response.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left"
              }}>
                <thead>
                  <tr style={{ background: "#f8faf9" }}>
                    {["Product", "Current price", "New price", "Action"].map(
                      (heading) => (
                        <th key={heading} style={{
                          padding: 12,
                          borderBottom: "1px solid #e5e7eb"
                        }}>
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const variants =
                      product.variants?.nodes || product.variants || [];
                    const variant = variants[0];
                    const currentPrice =
                      variant?.price ?? product.price ?? product.priceRange?.minVariantPrice?.amount;
                    const currency =
                      variant?.priceCurrency ||
                      product.priceRange?.minVariantPrice?.currencyCode ||
                      "USD";

                    return (
                      <tr key={product.id}>
                        <td style={{
                          padding: 12,
                          borderBottom: "1px solid #e5e7eb",
                          minWidth: 190
                        }}>
                          <strong>{product.title || product.name || "Untitled product"}</strong>
                        </td>
                        <td style={{
                          padding: 12,
                          borderBottom: "1px solid #e5e7eb",
                          whiteSpace: "nowrap"
                        }}>
                          {money(currentPrice, currency)}
                        </td>
                        <td style={{
                          padding: 12,
                          borderBottom: "1px solid #e5e7eb"
                        }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            aria-label={`New price for ${product.title}`}
                            placeholder={String(currentPrice ?? "")}
                            value={prices[product.id] ?? ""}
                            onChange={(e) =>
                              setPrices((old) => ({
                                ...old,
                                [product.id]: e.target.value,
                              }))
                            }
                            style={{
                              width: 115,
                              padding: 9,
                              border: "1px solid #d1d5db",
                              borderRadius: 7
                            }}
                          />
                        </td>
                        <td style={{
                          padding: 12,
                          borderBottom: "1px solid #e5e7eb"
                        }}>
                          <button
                            style={{
                              ...button,
                              opacity: updating === product.id ? 0.6 : 1
                            }}
                            disabled={updating === product.id}
                            onClick={() => updatePrice(product)}
                          >
                            {updating === product.id ? "Updating…" : "Update"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ color: "#647067", fontSize: 13 }}>
            Price updates change the selected product's first variant in Shopify.
          </p>
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Recent Orders</h2>
          {loadingOrders ? (
            <p>Loading orders from Shopify…</p>
          ) : orders.length === 0 ? (
            <p>No orders found in the store.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left"
              }}>
                <thead>
                  <tr style={{ background: "#f8faf9" }}>
                    {["Order", "Created", "Total", "Payment", "Fulfillment"].map(
                      (heading) => (
                        <th key={heading} style={{
                          padding: 12,
                          borderBottom: "1px solid #e5e7eb"
                        }}>
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        <strong>{order.name}</strong>
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>
                        {money(
                          order.totalPriceSet?.shopMoney?.amount,
                          order.totalPriceSet?.shopMoney?.currencyCode || "USD"
                        )}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {order.displayFinancialStatus || "Pending"}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                        {order.displayFulfillmentStatus || "Unfulfilled"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer style={{
          textAlign: "center",
          color: "#647067",
          fontSize: 13,
          padding: "24px 0"
        }}>
          Shopify Admin API · Live store data
        </footer>
      </div>
    </main>
  );
}
