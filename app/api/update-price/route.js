
export async function PATCH(request) {
  try {
    const { variantId, price } = await request.json();

    if (
      !variantId ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return Response.json(
        { success: false, error: "Valid variantId and non-negative price are required." },
        { status: 400 }
      );
    }

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
        { success: false, error: "Shopify authentication failed." },
        { status: 502 }
      );
    }

    const mutation = `
      mutation UpdateVariantPrice($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product {
            id
            title
          }
          productVariants {
            id
            price
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Shopify mutation needs the PRODUCT ID as well as the variant ID.
    // Get the parent product ID from the variant first.
    const lookupQuery = `
      query GetVariantProduct($id: ID!) {
        productVariant(id: $id) {
          id
          product {
            id
          }
        }
      }
    `;

    const apiUrl = `https://${shop}.myshopify.com/admin/api/2026-10/graphql.json`;
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": tokenData.access_token,
    };

    const lookupResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: lookupQuery,
        variables: { id: variantId },
      }),
    });

    const lookupResult = await lookupResponse.json();
    const productId = lookupResult.data?.productVariant?.product?.id;

    if (!lookupResponse.ok || lookupResult.errors || !productId) {
      return Response.json(
        { success: false, error: "Could not find the product variant." },
        { status: 400 }
      );
    }

    const updateResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: {
          productId,
          variants: [
            {
              id: variantId,
              price: Number(price).toFixed(2),
            },
          ],
        },
      }),
    });

    const updateResult = await updateResponse.json();

    if (!updateResponse.ok || updateResult.errors) {
      return Response.json(
        {
          success: false,
          error: updateResult.errors?.[0]?.message || "Shopify API request failed.",
        },
        { status: 502 }
      );
    }

    const payload = updateResult.data?.productVariantsBulkUpdate;

    if (payload?.userErrors?.length) {
      return Response.json(
        { success: false, errors: payload.userErrors },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      product: payload?.product,
      updatedVariants: payload?.productVariants,
    });
  } catch {
    return Response.json(
      { success: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
