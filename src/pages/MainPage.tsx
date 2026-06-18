import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { categoriesApi } from '../services/api';
import { Category } from '../types';
import { ChevronRight, Filter, Lightbulb, Disc, Zap, Package, Accessibility, GalleryVerticalEnd } from 'lucide-react';

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

  const getCategoryIcon = () => {
    return <GalleryVerticalEnd size={48} />;
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
                  {getCategoryIcon()}
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
