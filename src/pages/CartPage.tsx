import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { PartImage } from '../components/PartImage';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartAmount } = useAppContext();
  const navigate = useNavigate();

  const getPrice = (p: any) => p.Price ?? p.price ?? 0;
  const getName = (p: any) => p.Name || p.name || '---';
  const getId = (p: any) => p.IdPart || p.idPart;

  const total = cart.reduce((acc, item) => acc + getPrice(item.part) * item.amount, 0);

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="mb-6 flex justify-center text-gray-300">
          <Trash2 size={80} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Ваша корзина пуста</h1>
        <p className="text-gray-500 mb-8">Самое время добавить в нее что-нибудь полезное для вашего автомобиля!</p>
        <Link to="/" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
          <ArrowLeft size={20} />
          Вернуться к покупкам
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
              {cart.map((item) => {
                const partId = getId(item.part);
                return (
                  <motion.div
                    key={item.idCart}
                    layout
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <PartImage 
                        part={item.part} 
                        className="w-full h-full" 
                        imgClassName="w-full h-full object-cover"
                        alt={getName(item.part)}
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${partId}`} className="font-bold text-lg hover:text-red-600 transition-colors">
                            {getName(item.part)}
                          </Link>
                          <button 
                            onClick={() => removeFromCart(item.idCart)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Артикул: {partId}</div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateCartAmount(item.idCart, item.amount - 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-bold">{item.amount}</span>
                          <button 
                            onClick={() => updateCartAmount(item.idCart, item.amount + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-xl font-bold">{getPrice(item.part) * item.amount} ₽</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Детали заказа</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({cart.length})</span>
                <span>{total} ₽</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span className="text-green-600 font-medium">Бесплатно</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-2xl font-bold text-gray-900">
                <span>Итого</span>
                <span>{total} ₽</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <CreditCard size={22} />
              Оформить заказ
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями оферты и политикой конфиденциальности.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
