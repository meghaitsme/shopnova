export default function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3', // Light grey
        borderTop: '5px solid #2874f0', // Flipkart Blue
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      
      {/* Inline CSS for the spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}