
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const FALLBACK_IMAGE = 'https://placehold.co/400x400';

interface Product {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string | string[];
  imageUrl?: string;
  [key: string]: unknown;
}

interface ProductResponse {
  product?: Product;
  item?: Product;
  items?: Product[];
  products?: Product[];
  [key: string]: unknown;
}

const getProduct = (data: ProductResponse): Product | null => {
  const candidate = data.product || data.item || data;

  if (
    !candidate ||
    typeof candidate !== 'object' ||
    !('_id' in candidate) ||
    !('name' in candidate)
  ) {
    return null;
  }

  return candidate as Product;
};

const getProducts = (data: unknown): Product[] => {
  if (Array.isArray(data)) {
    return data as Product[];
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const response = data as ProductResponse;

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.products)) {
    return response.products;
  }

  return [];
};

const getImage = (product: Product): string => {
  const image = product.image || product.imageUrl;

  if (Array.isArray(image)) {
    return image[0] || FALLBACK_IMAGE;
  }

  if (typeof image === 'string' && image.trim()) {
    return image.split(',')[0].trim() || FALLBACK_IMAGE;
  }

  return FALLBACK_IMAGE;
};

const getNumber = (value: unknown, fallback = 0): number => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

export default function PDP() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Fetch product and related products.
  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      if (!id || !id.trim()) {
        setProduct(null);
        setRelatedProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setProduct(null);
      setRelatedProducts([]);
      setQuantity(1);

      try {
        const response = await fetch(
          `${API_URL}/api/products/${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json'
            }
          }
        );

        if (response.status === 404) {
          throw new Error('Product not found');
        }

        if (!response.ok) {
          throw new Error(`Product API error: ${response.status}`);
        }

        const data = await response.json();
        const currentProduct = getProduct(data);

        if (!currentProduct) {
          throw new Error('Invalid product response from server');
        }

        setProduct(currentProduct);

        // Fetch related products only when a category exists.
        if (currentProduct.category) {
          try {
            const relatedResponse = await fetch(
              `${API_URL}/api/products?category=${encodeURIComponent(
                currentProduct.category
              )}&limit=12`,
              {
                signal: controller.signal,
                headers: {
                  Accept: 'application/json'
                }
              }
            );

            if (!relatedResponse.ok) {
              throw new Error(
                `Related products API error: ${relatedResponse.status}`
              );
            }

            const relatedData = await relatedResponse.json();

            const related = getProducts(relatedData)
              .filter(
                (item) =>
                  item._id &&
                  item._id !== currentProduct._id
              )
              .slice(0, 4);

            setRelatedProducts(related);
          } catch (error) {
            if (
              error instanceof Error &&
              error.name === 'AbortError'
            ) {
              return;
            }

            console.error('Related products error:', error);
            setRelatedProducts([]);
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          return;
        }

        console.error('Product fetching error:', error);

        setProduct(null);
        setRelatedProducts([]);

        showToast(
          'Unable to load product details. Please try again.',
          'error'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [id, showToast]);

  // Product values.
  const stock = Math.max(
    0,
    Math.floor(getNumber(product?.stock))
  );

  const price = Math.max(0, getNumber(product?.price));

  const originalPrice = Math.max(
    0,
    getNumber(product?.originalPrice)
  );

  const discountPercent =
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) / originalPrice) * 100
        )
      : 0;

  // Validate quantity before cart operations.
  const validatePurchase = (): boolean => {
    if (!product || !product._id) {
      showToast('Product information is unavailable.', 'error');
      return false;
    }

    if (stock <= 0) {
      showToast('This product is out of stock.', 'error');
      return false;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > stock
    ) {
      showToast('Please select a valid quantity.', 'error');
      return false;
    }

    return true;
  };

  // Add to cart.
  const handleAddToCart = () => {
    if (!validatePurchase() || !product) return;

    try {
      addToCart(
        {
          ...product,
          id: product._id
        },
        quantity
      );

      showToast('Product added to cart!', 'success');
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast('Unable to add product to cart.', 'error');
    }
  };

  // Buy now.
  const handleBuyNow = () => {
    if (!validatePurchase() || !product) return;

    try {
      addToCart(
        {
          ...product,
          id: product._id
        },
        quantity
      );

      navigate('/cart');
    } catch (error) {
      console.error('Buy now error:', error);
      showToast('Unable to process your purchase.', 'error');
    }
  };

  // Quantity controls.
  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(stock, previous + 1)
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products">Go back to products</Link>
      </div>
    );
  }

  const image = getImage(product);

  return (
    <div
      style={{
        backgroundColor: '#f1f3f6',
        minHeight: '100vh',
        padding: '30px 20px'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* PRODUCT DETAILS */}

        <div
          style={{
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}
        >
          {/* PRODUCT IMAGE */}

          <div
            style={{
              flex: '1',
              minWidth: '300px',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <img
              src={image}
              alt={product.name || 'Product'}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain'
              }}
            />

            {/* QUANTITY */}

            <div
              style={{
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <strong>Quantity:</strong>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  style={{
                    padding: '6px 16px',
                    border: 'none',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  -
                </button>

                <span
                  style={{
                    padding: '6px 16px',
                    fontWeight: 'bold'
                  }}
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= stock}
                  aria-label="Increase quantity"
                  style={{
                    padding: '6px 16px',
                    border: 'none',
                    cursor: quantity >= stock ? 'not-allowed' : 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* BULK DISCOUNT NOTICE */}

            <div
              style={{
                backgroundColor: '#fef9c3',
                color: '#854d0e',
                padding: '10px',
                borderRadius: '6px',
                marginTop: '15px'
              }}
            >
              Select your quantity to see available offers at checkout.
            </div>

            {/* CART BUTTONS */}

            <div
              style={{
                display: 'flex',
                gap: '15px',
                marginTop: '20px'
              }}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock <= 0}
                style={{
                  flex: 1,
                  backgroundColor: stock <= 0 ? '#d1d5db' : '#ff9f00',
                  color: 'white',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: stock <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {stock <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock <= 0}
                style={{
                  flex: 1,
                  backgroundColor: stock <= 0 ? '#d1d5db' : '#fb641b',
                  color: 'white',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: stock <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {stock <= 0 ? 'Unavailable' : '⚡ Buy Now'}
              </button>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}

          <div
            style={{
              flex: '1.5',
              minWidth: '300px',
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px'
            }}
          >
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
              {product.name}
            </h1>

            <p
              style={{
                color: '#388e3c',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Special Price
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap',
                marginBottom: '20px'
              }}
            >
              <h2 style={{ margin: 0, fontSize: '36px' }}>
                {formatPrice(price)}
              </h2>

              {discountPercent > 0 && (
                <>
                  <span
                    style={{
                      fontSize: '20px',
                      color: '#9ca3af',
                      textDecoration: 'line-through'
                    }}
                  >
                    {formatPrice(originalPrice)}
                  </span>

                  <span
                    style={{
                      color: '#10b981',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p style={{ color: '#555', lineHeight: '1.6' }}>
              {product.description || 'No description available.'}
            </p>

            <ul
              style={{
                color: '#555',
                marginTop: '15px',
                paddingLeft: '20px'
              }}
            >
              <li>
                <strong>Category:</strong>{' '}
                {product.category || 'Uncategorized'}
              </li>

              <li>
                <strong>Availability: </strong>

                <span
                  style={{
                    color: stock > 0 ? '#388e3c' : '#ef4444',
                    fontWeight: 'bold'
                  }}
                >
                  {stock > 0
                    ? `In Stock (${stock} left)`
                    : 'Out of Stock'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RELATED PRODUCTS */}

        {relatedProducts.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              marginTop: '30px'
            }}
          >
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                marginBottom: '20px',
                borderBottom: '1px solid #eee',
                paddingBottom: '12px'
              }}
            >
              Similar Products
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
              }}
            >
              {relatedProducts.map((prod) => (
                <Link
                  key={prod._id}
                  to={`/product/${prod._id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '180px',
                        backgroundColor: '#f3f4f6',
                        padding: '10px'
                      }}
                    >
                      <img
                        src={getImage(prod)}
                        alt={prod.name || 'Product'}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    <div style={{ padding: '12px' }}>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          margin: '0 0 8px 0'
                        }}
                      >
                        {prod.name}
                      </h4>

                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          margin: 0
                        }}
                      >
                        {formatPrice(getNumber(prod.price))}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT INFORMATION */}

        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '30px'
          }}
        >
          <h3>Product information</h3>

          <p style={{ color: '#666' }}>
            Product details and similar products are loaded
            from your MongoDB backend.
          </p>

          <p style={{ color: '#666', fontSize: '13px' }}>
            Wishlist and reviews will be connected after their
            MongoDB API endpoints are implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
