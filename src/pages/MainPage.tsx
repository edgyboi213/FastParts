import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { categoriesApi } from '../services/api';
import { Category } from '../types';
import { ChevronRight, Filter, Lightbulb, Disc, Zap, Package } from 'lucide-react';

export const MainPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.getAll()
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setError('Не удалось загрузить категории. Проверьте подключение к серверу.');
        setLoading(false);
      });
  }, []);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('фильтр')) return <Filter size={48} />;
    if (n.includes('ламп')) return <Lightbulb size={48} />;
    if (n.includes('тормоз')) return <Disc size={48} />;
    if (n.includes('зажиг')) return <Zap size={48} />;
    return <Package size={48} />;
  };

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
      {/* Promo Section */}
      <div className="mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex-1 z-10 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
              Акция месяца
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-none uppercase tracking-tighter">
              Скидка 15% на все <span className="text-red-600">запчасти BOSCH</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto md:mx-0 font-medium">
              Обеспечьте надежность своего автомобиля оригинальными комплектующими. Акция действует до 31 мая.
            </p>
            <button className="px-10 h-14 bg-white text-slate-900 font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg">
              Перейти в каталог
            </button>
          </div>
          
          <div className="w-64 h-64 bg-slate-800 rounded-3xl flex items-center justify-center rotate-6 border border-slate-700 shadow-2xl shrink-0 group hover:rotate-0 transition-transform duration-500">
            <svg className="w-32 h-32 text-red-600 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
            </svg>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Категории</h2>
        <div className="flex gap-4 label-caps font-black">
          <span className="text-red-600 cursor-pointer hover:underline underline-offset-4">Все категории</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((category, idx) => (
          <motion.div
            key={category.idCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              to={`/category/${category.idCategory}`}
              className="card-geometric group flex flex-col items-center py-10 px-6"
            >
              <div className="h-40 w-full mb-6 bg-slate-50 rounded-2xl flex items-center justify-center relative group-hover:bg-red-50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 text-red-600 group-hover:scale-110 transition-transform duration-500">
                  {getCategoryIcon(category.name)}
                </div>
              </div>
              <div className="text-center group">
                <h3 className="font-black text-xl mb-2 text-slate-800 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                  {category.name}
                </h3>
                <p className="label-caps font-black opacity-60">Посмотреть каталог</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
