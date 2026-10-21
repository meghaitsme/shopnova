import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { formatPrice } from '../../utils/format';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px', 
      overflow: 'hidden', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Image */}
      <Link to={`/product/${product._id}`}>
        <div style={{ height: '200px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
          <img 
            src={product.image || "https://placehold.co/300x300?text=No+Image"} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        </div>
      </Link>
      
      {/* Details */}
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: '#333' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.name}
          </h3>
        </Link>
        
        <p style={{ color: '#388e3c', fontSize: '13px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
          {product.category || 'General'}
        </p>
        
        <div style={{ marginTop: 'auto' }}>
          <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '20px', color: '#212121' }}>
            {formatPrice(product.price)}
          </p>
          <Link 
            to={`/product/${product._id}`}
            style={{ 
              display: 'block', 
              textAlign: 'center', 
              backgroundColor: '#ff9f00', 
              color: 'white', 
              padding: '10px', 
              textDecoration: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}