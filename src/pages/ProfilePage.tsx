import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User as UserIcon, Package, Heart, Settings, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ordersApi, usersApi } from '../services/api';
import { Order } from '../types';

type Tab = 'info' | 'orders' | 'favorites';

export const ProfilePage: React.FC = () => {
  const { user, setUser, favorites } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.FullName || user?.fullName || '',
    phone: user?.Phone || user?.phone || '',
    address: user?.DeliveryAddress || user?.address || ''
  });

  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    const userId = user?.IdUser || user?.idUser;
    if (userId && !hasRefreshed) {
      usersApi.getById(userId).then(fullUser => {
        if (fullUser) {
          // Merge ensuring PascalCase takes priority
          setUser({ 
            ...user, 
            ...fullUser,
            // Ensure ID is consistent
            IdUser: fullUser.IdUser || userId,
            FullName: fullUser.FullName || fullUser.fullName || user?.FullName || user?.fullName || '',
            Phone: fullUser.Phone || fullUser.phone || user?.Phone || user?.phone || '',
            DeliveryAddress: fullUser.DeliveryAddress || fullUser.address || user?.DeliveryAddress || user?.address || ''
          });
          setHasRefreshed(true);
        }
      }).catch(err => {
        console.error("Failed to refresh user info:", err);
        setHasRefreshed(true);
      });
    }
  }, [user?.IdUser, user?.idUser, hasRefreshed]);

  // Sync editData when user is loaded or changed
  useEffect(() => {
    if (user) {
      setEditData({
        fullName: user.FullName || user.fullName || '',
        phone: user.Phone || user.phone || '',
        address: user.DeliveryAddress || user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      setLoadingOrders(true);
      const userId = user.IdUser || user.idUser;
      if (userId) {
        ordersApi.getUserOrders(userId).then(data => {
          setOrders(data);
          setLoadingOrders(false);
        }).catch(() => setLoadingOrders(false));
      } else {
        setLoadingOrders(false);
      }
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Пожалуйста, войдите в аккаунт</h1>
        <Link to="/auth" className="btn-primary">Войти</Link>
      </div>
    );
  }

  const handleSave = async () => {
    const userId = user.IdUser || user.idUser;
    if (!userId) return;

    try {
      const updatedUser = { 
        ...user, 
        IdUser: userId,
        FullName: editData.fullName,
        Phone: editData.phone,
        DeliveryAddress: editData.address,
        // Fallback for types or legacy code
        idUser: userId,
        fullName: editData.fullName,
        phone: editData.phone,
        address: editData.address
      };

      await usersApi.update(userId, updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Не удалось сохранить изменения. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 text-center bg-gradient-to-br from-red-600 to-red-700 text-white">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 mx-auto flex items-center justify-center mb-4">
                <UserIcon size={48} />
              </div>
              <h2 className="text-xl font-bold">{user.FullName || user.fullName || user.Login || user.login || 'Пользователь'}</h2>
              <p className="text-red-100 text-sm mt-1">@{user.Login || user.login}</p>
            </div>
            
            <nav className="p-2">
              <button 
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'info' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <Settings size={20} />
                <span className="font-semibold">Мои данные</span>
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <Package size={20} />
                <span className="font-semibold">Мои заказы</span>
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'favorites' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <Heart size={20} />
                <span className="font-semibold">Избранное</span>
                <span className="ml-auto bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{favorites.length}</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-grow">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
            <AnimatePresence mode='wait'>
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Личная информация</h2>
                    <button 
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      {isEditing ? <><Save size={18} /> Сохранить</> : <><Edit2 size={18} /> Редактировать</>}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">ФИО</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          className="input-field" 
                          value={editData.fullName}
                          onChange={e => setEditData({...editData, fullName: e.target.value})}
                        />
                      ) : (
                        <div className="text-lg font-medium">{(user.FullName || user.fullName || '').trim() || 'Не указано'}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Номер телефона</label>
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-gray-400" />
                        {isEditing ? (
                          <input 
                            type="tel" 
                            className="input-field" 
                            value={editData.phone}
                            onChange={e => setEditData({...editData, phone: e.target.value})}
                          />
                        ) : (
                          <div className="text-lg font-medium">{(user.Phone || user.phone || '').trim() || 'Не указан'}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Адрес доставки</label>
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-gray-400" />
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="input-field" 
                            value={editData.address}
                            onChange={e => setEditData({...editData, address: e.target.value})}
                          />
                        ) : (
                          <div className="text-lg font-medium">{(user.DeliveryAddress || user.address || '').trim() || 'Не указан'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-8">История заказов</h2>
                  {loadingOrders ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">У вас пока нет заказов</div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.idOrder} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">Заказ №{order.idOrder}</span>
                            <span className="text-sm text-gray-500">
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '---'}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-sm text-gray-600">Заказ оформлен</div>
                            <div className="font-bold text-lg text-red-600">{order.totalAmount || 0} ₽</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-8">Избранное</h2>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Heart size={48} className="mx-auto mb-4 opacity-20" />
                      Пока здесь ничего нет
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favorites.map(id => (
                        <Link key={id} to={`/product/${id}`} className="flex gap-4 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                          <div className="w-16 h-16 rounded bg-gray-50 flex-shrink-0">
                            <img src={`https://loremflickr.com/100/100/car,part?lock=${id}`} className="w-full h-full object-cover rounded" />
                          </div>
                          <div>
                            <div className="font-bold text-sm line-clamp-1">Запчасть #{id}</div>
                            <div className="text-red-600 font-bold">1 200 ₽</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
