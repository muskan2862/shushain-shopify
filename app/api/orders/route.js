
export async function GET() {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!shop || !clientId || !clientSecret) {
      return Response.json(
        { success: false, error: "Shopify environment variables are missing." },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(
      `https://${shop}.myshopify.com/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return Response.json(
        {
          success: false,
          error: "Shopify authentication failed.",
          details:
            tokenData.error_description ||
            tokenData.error ||
            "Access token missing",
        },
        { status: 502 }
      );
    }

    const query = `
      query GetOrders {
        orders(first: 10, sortKey: CREATED_AT, reverse: true) {
          nodes {
            id
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
           
          }
        }
      }
    `;

    const response = await fetch(
      `https://${shop}.myshopify.com/admin/api/2026-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
        body: JSON.stringify({ query }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.errors) {
      return Response.json(
        {
          success: false,
          error: result.errors?.[0]?.message || "Could not fetch orders.",
          details: result.errors || null,
          httpStatus: response.status,
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      count: result.data.orders.nodes.length,
      orders: result.data.orders.nodes,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message || "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}
