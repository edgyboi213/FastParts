import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { partsApi, categoriesApi } from '../services/api';
import { Part, Category } from '../types';
import { Star, ShoppingCart, Filter, ArrowUpDown, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [parts, setParts] = useState<Part[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, cart } = useAppContext();

  // Filters
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortOrder, setSortOrder] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      Promise.all([
        partsApi.getByCategory(Number(id)),
        categoriesApi.getById(Number(id))
      ]).then(([partsData, catData]) => {
        setParts(partsData);
        setCategory(catData);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch category data:', err);
        setError('Не удалось загрузить данные. Проверьте соединение с сервером.');
        setLoading(false);
      });
    }
  }, [id]);

  const getPrice = (p: any) => p.Price || p.price || 990;
  const getRating = (p: any) => p.Rating || p.rating || 4.0;
  const getName = (p: any) => p.Name || p.name || '---';
  const getId = (p: any) => p.IdPart || p.idPart;

  const sortedParts = [...parts]
    .filter(p => getPrice(p) <= priceRange[1])
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return getPrice(a) - getPrice(b);
      if (sortOrder === 'price-desc') return getPrice(b) - getPrice(a);
      return getRating(b) - getRating(a);
    });

  const isInCart = (partId: number) => cart.some(item => (item.idPart === partId || (item as any).IdPart === partId));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-12 max-w-2xl mx-auto">
          <Package size={48} className="mx-auto mb-4 text-red-600 opacity-50" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Ошибка загрузки</h2>
          <p className="text-slate-500 font-medium mb-8">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 h-14 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-slate-900 transition-all transform active:scale-95 shadow-lg shadow-red-600/20 italic"
          >
            Попробовать еще раз
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <div className="flex items-center gap-3 label-caps font-black text-slate-900 mb-8">
              <Filter size={18} className="text-red-600" />
              Фильтрация
            </div>

            <div className="mb-10">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Цена до: {priceRange[1]} ₽</label>
              <input 
                type="range" 
                min="0" max="50000" step="500"
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600" 
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Сортировать</label>
              <div className="relative">
                <select 
                  className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none outline-none focus:border-red-600 transition-colors"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="rating">По рейтингу</option>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown size={16} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Parts Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-end mb-10">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {category?.name || 'Запчасти'}
            </h1>
            <span className="label-caps font-black">{sortedParts.length} позиций</span>
          </div>

          {sortedParts.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Ничего не найдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedParts.map((part) => {
                const partId = getId(part);
                return (
                  <motion.div
                    key={partId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-geometric group flex flex-col"
                  >
                    <Link to={`/product/${partId}`} className="block aspect-[4/3] overflow-hidden bg-slate-50 relative">
                      <img 
                        src={`https://loremflickr.com/450/350/car,part?lock=${partId}`} 
                        alt={getName(part)} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100">
                          Top Rated
                        </span>
                      </div>
                    </Link>
                    <div className="p-6 flex-grow flex flex-col">
                      <Link to={`/product/${partId}`} className="text-lg font-black text-slate-900 hover:text-red-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tight mb-2">
                        {getName(part)}
                      </Link>
                      <div className="flex items-center gap-1.5 text-red-600 mb-6">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{getRating(part)}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 italic">{getPrice(part)} ₽</span>
                        {isInCart(partId) ? (
                          <Link to="/cart" className="bg-emerald-500 text-white px-5 h-11 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 italic">
                            В корзине
                          </Link>
                        ) : (
                          <button 
                            onClick={() => addToCart(part)}
                            className="px-6 h-11 bg-red-600 text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-slate-900 transition-all transform active:scale-95 shadow-xl shadow-red-600/20 italic flex items-center gap-2"
                          >
                            <ShoppingCart size={16} />
                            Купить
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
