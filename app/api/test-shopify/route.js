
export async function GET() {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!shop || !clientId || !clientSecret) {
      return Response.json(
        { error: "Shopify environment variables are missing." },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(
      `https://${shop}.myshopify.com/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        cache: "no-store",
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Shopify token request failed:", tokenResponse.status);

      return Response.json(
        {
          error: "Could not get Shopify access token.",
          status: tokenResponse.status,
        },
        { status: 502 }
      );
    }

    const productsResponse = await fetch(
      `https://${shop}.myshopify.com/admin/api/2026-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
        body: JSON.stringify({
          query: `{
            products(first: 50) {
              nodes {
                id
                title
                variants(first: 5) {
                  nodes {
                    id
                    price
                  }
                }
              }
            }
          }`,
        }),
        cache: "no-store",
      }
    );

    const result = await productsResponse.json();

    if (!productsResponse.ok || result.errors) {
      console.error("Shopify products request failed:", productsResponse.status);

      return Response.json(
        { error: "Shopify products request failed." },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      products: result.data.products.nodes,
    });
  } catch (error) {
    console.error("Shopify connection failed:", error.message);

    return Response.json(
      { error: "Unexpected Shopify connection error." },
      { status: 500 }
    );
  }
}
