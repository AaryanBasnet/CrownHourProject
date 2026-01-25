import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import SectionHeader from './SectionHeader';
import ProductCard from '../common/ProductCard';

const Collection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=3&sort=-createdAt');
        if (data.success) {
          const mappedProducts = data.data.products.map(p => ({
            id: p._id,
            slug: p.slug,  // Added slug for routing
            name: p.name,
            category: p.category.charAt(0).toUpperCase() + p.category.slice(1) + ' Collection',
            badge: p.isFeatured ? 'Featured' : (p.stock < 5 ? 'Limited' : 'New Arrival'),
            badgeType: p.stock < 5 ? 'limited' : 'new',
            specs: [
              p.specifications.movement,
              p.specifications.caseDiameter,
              p.specifications.waterResistance
            ].filter(Boolean),
            price: p.price,
            image: p.images[0]?.url
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch collection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="py-28 text-center">Loading Collection...</div>;

  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="The Collection"
          title="Masterfully Curated Timepieces"
          description="Each watch in our collection represents the pinnacle of Swiss horological excellence, combining timeless design with contemporary innovation."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collection;