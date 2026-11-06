
import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/firebase';

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp
} from 'firebase/firestore';

// ==========================================
// 1. TYPES
// ==========================================

interface Coupon {
  id: string;
  code: string;
  discountValue: number;
  minAmount: number;
}

const SHIPPING_COST = 2;
const MAX_COUPONS_DISPLAYED = 10;

// ==========================================
// 2. COMPONENT
// ==========================================

const Checkout = () => {
  const { cart, clearCart, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Available coupons
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prevent rapid duplicate submissions.
  const processingRef = useRef(false);

  // ==========================================
  // 3. CALCULATE TOTALS
  // ==========================================

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const safeDiscount = Math.min(
    Math.max(0, discount),
    subtotal
  );

  const shipping = SHIPPING_COST;

  const finalTotal = Math.max(
    0,
    subtotal + shipping - safeDiscount
  );

  // ==========================================
  // 4. FETCH AVAILABLE COUPONS
  // ==========================================

  useEffect(() => {
    let active = true;

    const fetchCoupons = async () => {
      try {
        const couponsQuery = query(
          collection(db, 'coupons'),
          limit(MAX_COUPONS_DISPLAYED)
        );

        const snapshot = await getDocs(couponsQuery);

        if (!active) return;

        const coupons: Coupon[] = snapshot.docs
          .map((couponDoc) => {
            const data = couponDoc.data();

            return {
              id: couponDoc.id,
              code: String(data.code || '').trim().toUpperCase(),
              discountValue: Number(data.discountValue),
              minAmount: Number(data.minAmount || 0)
            };
          })
          .filter(
            (coupon) =>
              coupon.code.length > 0 &&
              Number.isFinite(coupon.discountValue) &&
              coupon.discountValue > 0 &&
              Number.isFinite(coupon.minAmount) &&
              coupon.minAmount >= 0
          );

        setAvailableCoupons(coupons);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // 5. CHECK WHETHER COUPON WAS USED
  // ==========================================

  const checkCouponUsage = async (code: string): Promise<boolean> => {
    if (!user?.uid) return false;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      where('couponUsed', '==', code),
      limit(1)
    );

    const ordersSnapshot = await getDocs(ordersQuery);

    return !ordersSnapshot.empty;
  };

  // ==========================================
  // 6. APPLY COUPON
  // ==========================================

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!user?.uid) {
      setCouponMessage('Please log in to use coupons.');
      setDiscount(0);
      setAppliedCoupon(null);
      return;
    }

    if (!normalizedCode) {
      setCouponMessage('Please enter a coupon code.');
      setDiscount(0);
      setAppliedCoupon(null);
      return;
    }

    if (subtotal <= 0) {
      setCouponMessage('Your cart total is invalid.');
      return;
    }

    if (couponLoading || isProcessing) return;

    setCouponLoading(true);
    setCouponMessage('');
    setDiscount(0);
    setAppliedCoupon(null);

    try {
      const couponQuery = query(
        collection(db, 'coupons'),
        where('code', '==', normalizedCode),
        limit(1)
      );

      const couponSnapshot = await getDocs(couponQuery);

      if (couponSnapshot.empty) {
        setCouponMessage('Invalid coupon code.');
        return;
      }

      const couponData = couponSnapshot.docs[0].data();

      const discountAmount = Number(couponData.discountValue);
      const minAmount = Number(couponData.minAmount || 0);

      if (
        !Number.isFinite(discountAmount) ||
        discountAmount <= 0 ||
        !Number.isFinite(minAmount) ||
        minAmount < 0
      ) {
        setCouponMessage('This coupon has invalid configuration.');
        return;
      }

      if (subtotal < minAmount) {
        setCouponMessage(
          `Add ₹${(minAmount - subtotal).toFixed(2)} more to use this coupon.`
        );
        return;
      }

      const alreadyUsed = await checkCouponUsage(normalizedCode);

      if (alreadyUsed) {
        setCouponMessage('You have already used this coupon.');
        return;
      }

      const validDiscount = Math.min(discountAmount, subtotal);

      setDiscount(validDiscount);
      setAppliedCoupon(normalizedCode);
      setCouponCode(normalizedCode);

      setCouponMessage(
        `Coupon applied! ₹${validDiscount.toFixed(2)} off.`
      );
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponMessage('Unable to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  // ==========================================
  // 7. CART VALIDATION
  // ==========================================

  const validateCart = (): boolean => {
    if (!cart.length) {
      setErrorMessage('Your cart is empty.');
      return false;
    }

    for (const item of cart) {
      if (
        !item.id ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        setErrorMessage('Your cart contains invalid product information.');
        return false;
      }
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      setErrorMessage('Invalid cart total.');
      return false;
    }

    return true;
  };

  // ==========================================
  // 8. FORM VALIDATION
  // ==========================================

  const validateForm = (): boolean => {
    const cleanAddress = address.trim();
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (cleanAddress.length < 10) {
      setErrorMessage('Please enter a complete shipping address.');
      return false;
    }

    if (cleanAddress.length > 500) {
      setErrorMessage('Shipping address is too long.');
      return false;
    }

    // Accept Indian 10-digit mobile numbers
    // and optional +91 / 91 prefixes.
    if (!/^(?:(?:\+91|91))?[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Indian mobile number.');
      return false;
    }

    return true;
  };

  // ==========================================
  // 9. PLACE ORDER
  // ==========================================

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (processingRef.current) return;

    setErrorMessage('');

    if (!user?.uid) {
      navigate('/login');
      return;
    }

    if (cartLoading) {
      setErrorMessage('Please wait while your cart loads.');
      return;
    }

    if (!validateCart() || !validateForm()) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Recheck coupon before order creation.
      let verifiedDiscount = 0;
      let verifiedCoupon: string | null = null;

      if (appliedCoupon) {
        const couponQuery = query(
          collection(db, 'coupons'),
          where('code', '==', appliedCoupon),
          limit(1)
        );

        const couponSnapshot = await getDocs(couponQuery);

        if (couponSnapshot.empty) {
          throw new Error('Applied coupon is no longer valid.');
        }

        const couponData = couponSnapshot.docs[0].data();

        const discountAmount = Number(couponData.discountValue);
        const minAmount = Number(couponData.minAmount || 0);

        if (
          !Number.isFinite(discountAmount) ||
          discountAmount <= 0 ||
          !Number.isFinite(minAmount) ||
          minAmount < 0 ||
          subtotal < minAmount
        ) {
          throw new Error('Coupon is no longer applicable.');
        }

        const alreadyUsed = await checkCouponUsage(appliedCoupon);

        if (alreadyUsed) {
          throw new Error('You have already used this coupon.');
        }

        verifiedDiscount = Math.min(discountAmount, subtotal);
        verifiedCoupon = appliedCoupon;
      }

      const verifiedTotal = Math.max(
        0,
        subtotal + shipping - verifiedDiscount
      );

      const orderData = {
        userId: user.uid,
        customerEmail: user.email || '',
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal,
        shipping,
        discountApplied: verifiedDiscount,
        couponUsed: verifiedCoupon,
        totalAmount: verifiedTotal,
        shippingAddress: address.trim(),
        phoneNumber: phone.replace(/[\s-]/g, ''),
        status: 'Pending',
        createdAt: serverTimestamp()
      };

      // IMPORTANT:
      // This is a transitional client-side order write.
      // Production checkout must use a trusted backend that
      // verifies prices, stock, coupons and payment.

      await addDoc(collection(db, 'orders'), orderData);

      clearCart();

      alert('Order placed successfully!');

      navigate('/');
    } catch (error) {
      console.error('Order placement error:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to place order. Please try again.'
      );
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  // ==========================================
  // 10. LOADING STATE
  // ==========================================

  if (cartLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        Loading your cart...
      </div>
    );
  }

  // ==========================================
  // 11. EMPTY CART
  // ==========================================

  if (cart.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          Go Shopping
        </button>
      </div>
    );
  }

  // ==========================================
  // 12. CHECKOUT UI
  // ==========================================

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap'
      }}
    >
      {/* LEFT SIDE: SHIPPING DETAILS */}

      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>Checkout</h2>
        <h3>Shipping Details</h3>

        <form
          onSubmit={handlePlaceOrder}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Full Address:
            </label>

            <textarea
              required
              minLength={10}
              maxLength={500}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your full shipping address"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Phone Number:
            </label>

            <input
              type="tel"
              required
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your Indian mobile number"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              style={{
                color: '#dc2626',
                fontSize: '14px'
              }}
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isProcessing || couponLoading || cartLoading}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '5px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '10px',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            {isProcessing
              ? 'Processing...'
              : `Place Order (₹${finalTotal.toFixed(2)})`}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: ORDER SUMMARY */}

      <div
        style={{
          flex: 1,
          minWidth: '300px',
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px'
        }}
      >
        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '10px',
              fontSize: '14px'
            }}
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px'
          }}
        >
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px'
          }}
        >
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>

        {safeDiscount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
              color: 'green'
            }}
          >
            <span>Discount</span>
            <span>-₹{safeDiscount.toFixed(2)}</span>
          </div>
        )}

        <hr
          style={{
            margin: '20px 0',
            border: 'none',
            borderTop: '1px solid #e5e7eb'
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >
          <span>Total</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>

        {/* COUPON SECTION */}

        <div style={{ marginTop: '30px' }}>
          <h4 style={{ marginBottom: '10px' }}>
            Have a coupon?
          </h4>

          {availableCoupons.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}
              >
                Available Offers
              </p>

              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fffbeb',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '8px',
                    border: '1px dashed #f59e0b'
                  }}
                >
                  <div>
                    <strong>{coupon.code}</strong>

                    <span
                      style={{
                        marginLeft: '10px',
                        fontSize: '13px',
                        color: '#4b5563'
                      }}
                    >
                      ₹{coupon.discountValue} OFF
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={couponLoading || isProcessing}
                    onClick={() => {
                      setCouponCode(coupon.code);
                      setDiscount(0);
                      setAppliedCoupon(null);
                      setCouponMessage('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="ENTER CODE"
              value={couponCode}
              disabled={isProcessing}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setDiscount(0);
                setAppliedCoupon(null);
                setCouponMessage('');
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />

            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading || isProcessing}
              style={{
                backgroundColor: '#334155',
                color: 'white',
                padding: '8px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {couponLoading ? 'Checking...' : 'Apply'}
            </button>
          </div>

          {couponMessage && (
            <p
              role="status"
              style={{
                color: discount > 0 ? 'green' : '#dc2626',
                marginTop: '10px',
                fontSize: '14px'
              }}
            >
              {couponMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
