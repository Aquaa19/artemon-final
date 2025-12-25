// Filename: src/components/product/ProductList.jsx
import ProductCard from './ProductCard';

export default function ProductList({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="text-6xl mb-4 animate-bounce">🧸</div>
        <h3 className="text-xl font-black text-gray-900">No toys found here!</h3>
        <p className="text-gray-500 mt-2 font-medium">Try selecting a different category or search term.</p>
      </div>
    );
  }

  return (
    /* OPTIMIZATION: Added 'contain-intrinsic-size' logic via CSS (optional) 
       and ensured the grid has a consistent gap to prevent jitter during lazy loading.
    */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 min-h-[400px]">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}