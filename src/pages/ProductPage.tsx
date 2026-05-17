import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { partsApi } from '../services/api';
import { Part, Review } from '../types';
import { Star, ShoppingCart, Heart, Shield, Truck, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, favorites, toggleFavorite } = useAppContext();

  useEffect(() => {
    if (id) {
      partsApi.getById(Number(id)).then(data => {
        setPart(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!part) return <div className="container-custom py-20 text-center">Товар не найден.</div>;

  const getPrice = (p: any) => p.Price || p.price || 990;
  const getRating = (p: any) => p.Rating || p.rating || 4.8;
  const getName = (p: any) => p.Name || p.name || '---';
  const getId = (p: any) => p.IdPart || p.idPart;
  const getDesc = (p: any) => p.Description || p.description || '';
  const getWeight = (p: any) => p.Weight || p.weight || '---';
  const getVolume = (p: any) => p.Volume || p.volume || '---';

  const partId = getId(part);
  const isInCart = cart.some(item => (item.idPart === partId || (item as any).IdPart === partId));
  const isFavorite = favorites.includes(partId);

  return (
    <div className="container-custom py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-10">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              <img 
                src={`https://loremflickr.com/800/800/car,part?lock=${partId}`} 
                alt={getName(part)} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer hover:border-red-500 transition-colors">
                  <img src={`https://loremflickr.com/200/200/engine,detail?lock=${partId + i}`} alt="Detail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{getName(part)}</h1>
              <button 
                onClick={() => toggleFavorite(partId)}
                className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <span className="ml-2 text-gray-600 font-medium">{getRating(part)} (24 отзыва)</span>
              </div>
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Package size={16} /> В наличии
              </span>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <div className="text-4xl font-bold text-gray-900 mb-6">{getPrice(part)} ₽</div>
              <div className="flex gap-4">
                {isInCart ? (
                  <Link to="/cart" className="flex-grow btn-primary bg-green-600 hover:bg-green-700 text-center py-4 rounded-xl font-bold text-lg text-white">
                    Перейти в корзину
                  </Link>
                ) : (
                  <button 
                    onClick={() => addToCart(part)}
                    className="flex-grow btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={22} />
                    Добавить в корзину
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Truck className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold">Быстрая доставка</div>
                  <div className="text-sm text-gray-500">Доставим завтра, от 300 ₽</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold">Гарантия качества</div>
                  <div className="text-sm text-gray-500">12 месяцев с момента покупки</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold mb-4">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">OEM номер:</span>
                  <span className="font-medium">OE-123456789</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Вес:</span>
                  <span className="font-medium">{getWeight(part)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Объем:</span>
                  <span className="font-medium">{getVolume(part)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Бренд:</span>
                  <span className="font-medium">FastParts Original</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="border-t border-gray-100 p-6 lg:p-10">
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4">Описание</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{getDesc(part)}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Отзывы покупателей</h3>
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="border-b border-gray-100 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">Иван Петров</div>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-gray-600">Отличная деталь, подошла идеально. Качество на высоте, рекомендую!</p>
                  <div className="text-xs text-gray-400 mt-2">12.05.2024</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
