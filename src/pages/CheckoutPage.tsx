import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, Truck, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ordersApi } from '../services/api';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const STORE_LOCATION = { lat: 64.5511, lng: 40.5401 };

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart, user } = useAppContext();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [payment, setPayment] = useState<'online' | 'receipt'>('online');
  const [formData, setFormData] = useState({
    firstName: (user?.FullName || user?.fullName || '').split(' ')[0] || '',
    lastName: (user?.FullName || user?.fullName || '').split(' ')[1] || '',
    phone: user?.Phone || user?.phone || '',
    address: user?.DeliveryAddress || user?.address || ''
  });
  const [isOrdered, setIsOrdered] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.part.price || 990) * item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    try {
      await ordersApi.create({
        userId: user?.IdUser || user?.idUser,
        orderDate: new Date().toISOString(),
        totalAmount: total,
        orderDetails: cart.map(item => ({
          idPart: item.part.idPart,
          amount: item.amount,
          price: item.part.price
        }))
      });
      setIsOrdered(true);
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Ошибка при оформлении заказа');
    }
  };

  if (isOrdered) {
    return (
      <div className="container-custom py-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <CheckCircle2 size={100} className="text-green-500 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Заказ оформлен!</h1>
          <p className="text-xl text-gray-500 mb-8">Спасибо за заказ. Наш менеджер свяжется с вами в ближайшее время.</p>
          <p className="text-gray-400">Перенаправление на главную...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Контактные данные</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input 
                  type="text" required 
                  className="input-field" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                <input 
                  type="text" required 
                  className="input-field" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
                <input 
                  type="tel" required placeholder="+7 (___) ___-__-__" 
                  className="input-field" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Delivery Method */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Способ получения</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setMethod('pickup')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${method === 'pickup' ? 'border-red-600 bg-red-50' : 'border-gray-100'}`}
              >
                <MapPin className={method === 'pickup' ? 'text-red-600' : 'text-gray-400'} />
                <div className="text-left">
                  <div className="font-bold">Самовывоз</div>
                  <div className="text-xs text-gray-500">Из нашего магазина</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod('delivery')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${method === 'delivery' ? 'border-red-600 bg-red-50' : 'border-gray-100'}`}
              >
                <Truck className={method === 'delivery' ? 'text-red-600' : 'text-gray-400'} />
                <div className="text-left">
                  <div className="font-bold">Доставка</div>
                  <div className="text-xs text-gray-500">Курьером до двери</div>
                </div>
              </button>
            </div>

            {method === 'pickup' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                  Наш магазин находится по адресу: Проспект Обводный канал, 37 корпус 2, Архангельск. Режим работы: 09:00 - 21:00.
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-200 relative">
                  {!hasValidKey ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                      <div className="text-slate-900 font-bold mb-2 uppercase tracking-tight">Требуется API ключ Google Maps</div>
                      <p className="text-xs text-slate-500 mb-4 max-w-xs">
                        Пожалуйста, добавьте <code>GOOGLE_MAPS_PLATFORM_KEY</code> в секреты AI Studio (иконка шестеренки → Secrets).
                      </p>
                      <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-600 hover:underline">
                        Получить ключ
                      </a>
                    </div>
                  ) : (
                    <APIProvider apiKey={API_KEY} version="weekly">
                      <Map
                        defaultCenter={STORE_LOCATION}
                        defaultZoom={15}
                        mapId="STORE_LOCATION_MAP"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                        gestureHandling={'greedy'}
                        disableDefaultUI={false}
                      >
                        <AdvancedMarker position={STORE_LOCATION} title="БЫСТРЫЕ ДЕТАЛИ">
                          <Pin background="#dc2626" glyphColor="#fff" borderColor="#991b1b" />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
                <textarea 
                  required rows={3} 
                  className="input-field" 
                  placeholder="Город, улица, дом, квартира..."
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Способ оплаты</h3>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payment === 'online' ? 'border-red-600 bg-red-50' : 'border-gray-100'}`}>
                <input type="radio" name="payment" className="hidden" checked={payment === 'online'} onChange={() => setPayment('online')} />
                <CreditCard className={payment === 'online' ? 'text-red-600' : 'text-gray-400'} />
                <div className="flex-grow">
                  <div className="font-bold">Онлайн оплата</div>
                  <div className="text-xs text-gray-500">Картой или через СБП</div>
                </div>
              </label>
              
              {payment === 'online' && (
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                  Мы поддерживаем все современные способы оплаты. Шаблон платежной системы будет добавлен позже.
                </div>
              )}

              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payment === 'receipt' ? 'border-red-600 bg-red-50' : 'border-gray-100'}`}>
                <input type="radio" name="payment" className="hidden" checked={payment === 'receipt'} onChange={() => setPayment('receipt')} />
                <Wallet className={payment === 'receipt' ? 'text-red-600' : 'text-gray-400'} />
                <div className="flex-grow">
                  <div className="font-bold">При получении</div>
                  <div className="text-xs text-gray-500">Картой или наличными курьеру</div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Total Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Ваш заказ</h3>
            <div className="max-h-64 overflow-y-auto space-y-3 mb-6 pr-2">
              {cart.map(item => (
                <div key={item.idCart} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-grow pr-4">{item.part.name} x {item.amount}</span>
                  <span className="font-bold whitespace-nowrap">{(item.part.price || 990) * item.amount} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Сумма покупок</span>
                <span>{total} ₽</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                <span>Итого</span>
                <span>{total} ₽</span>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full btn-primary py-4 rounded-xl font-bold text-lg mt-6"
            >
              Подтвердить заказ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
