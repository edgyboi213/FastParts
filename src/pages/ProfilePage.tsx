import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User as UserIcon, Package, Heart, Settings, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ordersApi, usersApi, partsApi, orderpartsApi, profilePhotosApi } from '../services/api';
import { Order, Part } from '../types';
import { PartImage } from '../components/PartImage';

type Tab = 'info' | 'orders' | 'favorites';

export const ProfilePage: React.FC = () => {
  const { user, setUser, favorites } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [favoriteParts, setFavoriteParts] = useState<Part[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [profilePhotos, setProfilePhotos] = useState<any[]>([]);
  const [editData, setEditData] = useState({
    fullName: user?.FullName || user?.fullName || '',
    phone: user?.Phone || user?.phone || '',
    address: user?.DeliveryAddress || user?.address || '',
    idProfilePhoto: user?.IdProfilePhoto || user?.idProfilePhoto || 1
  });

  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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

  // Load profile photos on mount
  useEffect(() => {
    profilePhotosApi.getAll().then(data => {
      setProfilePhotos(data || []);
    }).catch(err => {
      console.error("Failed to load profile photos:", err);
    });
  }, []);

  // Sync editData when user is loaded or changed
  useEffect(() => {
    if (user) {
      setEditData({
        fullName: user.FullName || user.fullName || '',
        phone: user.Phone || user.phone || '',
        address: user.DeliveryAddress || user.address || '',
        idProfilePhoto: user.IdProfilePhoto || user.idProfilePhoto || 1
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      setLoadingOrders(true);
      const userId = user.IdUser || user.idUser;
      if (userId) {
        Promise.all([
          ordersApi.getUserOrders(userId),
          orderpartsApi.getAll().catch(() => [] as any[]),
          partsApi.getAll().catch(() => [] as any[])
        ]).then(([userOrders, allOrderParts, allParts]) => {
          // Filter to only include orders belonging to the logged-in user
          const ownOrders = userOrders.filter(order => {
            const orderUserId = (order as any).IdUser ?? order.idUser;
            return Number(orderUserId) === Number(userId);
          });
          const updatedOrders = ownOrders.map(order => {
            const orderId = order.idOrder || (order as any).IdOrder || (order as any).id || (order as any).Id;
            
            // Find related order parts
            const relatedOrderParts = allOrderParts.filter((op: any) => {
              const opOrderId = op.idOrder || op.IdOrder;
              return opOrderId === orderId;
            });
            
            let totalAmount = 0;
            const mappedParts: any[] = [];
            
            if (relatedOrderParts.length > 0) {
              relatedOrderParts.forEach((op: any) => {
                const opPartId = op.idPart || op.IdPart;
                const amount = op.amount || op.Amount || 0;
                const part = allParts.find((p: any) => (p.idPart || p.IdPart) === opPartId);
                if (part) {
                  const price = part.Price ?? part.price ?? 0;
                  totalAmount += price * amount;
                  mappedParts.push({
                    idOrderPart: op.idOrderPart || op.IdOrderPart,
                    idPart: opPartId,
                    amount: amount,
                    part: part
                  });
                }
              });
            } else {
              totalAmount = order.totalAmount || (order as any).TotalAmount || 0;
            }
            
            return {
              ...order,
              totalAmount,
              parts: mappedParts
            };
          });
          
          setOrders(updatedOrders);
          setLoadingOrders(false);
        }).catch((err) => {
          console.error("Failed to load or process orders:", err);
          setLoadingOrders(false);
        });
      } else {
        setLoadingOrders(false);
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'favorites' && favorites.length > 0) {
      setLoadingFavorites(true);
      Promise.all(
        favorites.map(id => 
          partsApi.getById(id).catch(err => {
            console.error(`Failed to fetch part ${id}`, err);
            return null;
          })
        )
      ).then(results => {
        setFavoriteParts(results.filter((p): p is Part => p !== null));
        setLoadingFavorites(false);
      }).catch(() => {
        setLoadingFavorites(false);
      });
    } else {
      setFavoriteParts([]);
    }
  }, [activeTab, favorites]);

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
      // Create a clean object for the server that strictly matches the C# model
      const serverUser = {
        IdUser: userId,
        IdProfilePhoto: editData.idProfilePhoto || 1,
        FullName: editData.fullName || user.FullName || user.fullName || 'User',
        Login: user.Login || user.login || '',
        Password: user.Password || '', // Required by the server model!
        Phone: editData.phone,
        DeliveryAddress: editData.address
      };

      await usersApi.update(userId, serverUser);
      
      // Update local state with both casing for compatibility
      const updatedLocalUser = {
        ...user,
        ...serverUser,
        fullName: serverUser.FullName,
        phone: serverUser.Phone,
        address: serverUser.DeliveryAddress
      };
      
      setUser(updatedLocalUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Ошибка при сохранении: " + (error as any).response?.data || "Проверьте корректность данных.");
    }
  };

  const getUserAvatarUrl = () => {
    if (!user) return null;
    
    // 1. Check direct fields on the user object
    const directFields = ['Photo', 'photo', 'PhotoUrl', 'photoUrl', 'ProfilePhoto', 'profilePhoto', 'Avatar', 'avatar'];
    for (const field of directFields) {
      const val = (user as any)[field];
      if (val && typeof val === 'string' && val.trim() !== '') {
        const trimmed = val.trim();
        if (
          trimmed.startsWith('http://') || 
          trimmed.startsWith('https://') || 
          trimmed.startsWith('data:image/') || 
          trimmed.startsWith('//') ||
          trimmed.startsWith('/')
        ) {
          return trimmed;
        }
      }
    }

    // 2. Check IdProfilePhoto lookup
    const idPhoto = user.IdProfilePhoto || user.idProfilePhoto;
    if (idPhoto) {
      const foundPhoto = profilePhotos.find(p => p.IdProfilePhoto === idPhoto || p.idProfilePhoto === idPhoto);
      if (foundPhoto) {
        const content = foundPhoto.Photo || foundPhoto.photo || foundPhoto.content || foundPhoto.Content;
        if (content && typeof content === 'string' && content.trim() !== '') {
          return content.trim();
        }
      }
    }

    return null;
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    setIsUploadingPhoto(true);
    try {
      const url = newPhotoUrl.trim();
      const createdPhoto = await profilePhotosApi.create({
        Photo: url,
        photo: url
      });
      
      const newPhotoId = createdPhoto.IdProfilePhoto || createdPhoto.idProfilePhoto;
      
      if (!newPhotoId) {
        throw new Error("Не удалось получить ID нового фото");
      }

      const updatedPhotos = await profilePhotosApi.getAll().catch(() => []);
      setProfilePhotos(updatedPhotos);

      const userId = user.IdUser || user.idUser;
      if (userId) {
        const serverUser = {
          IdUser: userId,
          IdProfilePhoto: newPhotoId,
          FullName: user.FullName || user.fullName || 'User',
          Login: user.Login || user.login || '',
          Password: user.Password || '',
          Phone: user.Phone || user.phone || '',
          DeliveryAddress: user.DeliveryAddress || user.address || ''
        };
        await usersApi.update(userId, serverUser);

        setUser({
          ...user,
          ...serverUser,
          IdProfilePhoto: newPhotoId,
          idProfilePhoto: newPhotoId,
          Photo: url,
          photo: url,
          PhotoUrl: url,
          photoUrl: url
        });

        setEditData(prev => ({
          ...prev,
          idProfilePhoto: newPhotoId
        }));
      }

      setNewPhotoUrl('');
      setIsPhotoModalOpen(false);
    } catch (err) {
      console.error("Ошибка при добавлении фото:", err);
      alert("Не удалось добавить фото: " + ((err as any).message || "ошибка сети"));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const avatarUrl = getUserAvatarUrl();

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 text-center bg-gradient-to-br from-red-600 to-red-700 text-white flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 mx-auto flex items-center justify-center mb-4 bg-white/20 backdrop-blur-sm">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Аватар" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <UserIcon size={48} />
                )}
              </div>
              <h2 className="text-xl font-bold">{user.FullName || user.fullName || user.Login || user.login || 'Пользователь'}</h2>
              <p className="text-red-100 text-sm mt-1">@{user.Login || user.login}</p>
              <button 
                onClick={() => setIsPhotoModalOpen(true)}
                className="mt-4 px-4 py-1.5 bg-white/20 hover:bg-white/30 border border-white/25 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm"
              >
                Добавить фото
              </button>
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
                      {(() => {
                        const getStatusBadge = (status: string | undefined) => {
                          const s = status || 'Новый';
                          let bg = 'bg-yellow-50 text-yellow-700 border-yellow-200/55';
                          if (s === 'Новый') bg = 'bg-blue-50 text-blue-700 border-blue-200/55';
                          if (s === 'В обработке') bg = 'bg-amber-50 text-amber-700 border-amber-200/55';
                          if (s === 'Отправлен') bg = 'bg-indigo-50 text-indigo-700 border-indigo-200/55';
                          if (s === 'Доставлен') bg = 'bg-emerald-50 text-emerald-700 border-emerald-200/55';
                          if (s === 'Отменен') bg = 'bg-rose-50 text-rose-700 border-rose-200/55';
                          
                          return (
                            <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${bg}`}>
                              {s}
                            </span>
                          );
                        };

                        return orders.map(order => (
                          <div 
                            key={order.idOrder} 
                            className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => setExpandedOrderId(expandedOrderId === order.idOrder ? null : order.idOrder)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800">Заказ №{order.idOrder}</span>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(order.status || (order as any).Status)}
                                <span className="text-xs text-slate-400 font-bold">
                                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '---'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-end mt-4">
                              <div className="text-xs text-slate-500 font-medium">
                                {order.parts && order.parts.length > 0 
                                  ? `Товаров: ${order.parts.reduce((sum, item) => sum + (item.amount || 0), 0)}`
                                  : 'Состав заказа не указан'}
                              </div>
                              <div className="font-bold text-red-600">{order.totalAmount || 0} ₽</div>
                            </div>

                            {expandedOrderId === order.idOrder && order.parts && order.parts.length > 0 && (
                              <div 
                                className="mt-4 pt-4 border-t border-slate-100 space-y-3 cursor-default"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Состав заказа:</div>
                                {order.parts.map((pItem: any) => {
                                  const partObj = pItem.part || {};
                                  const price = partObj.Price ?? partObj.price ?? 0;
                                  const amount = pItem.amount || 0;
                                  const name = partObj.Name ?? partObj.name ?? 'Деталь';
                                  return (
                                    <div key={pItem.idOrderPart} className="flex items-center gap-4 py-2 hover:bg-white rounded-lg p-2 transition-colors border border-transparent hover:border-slate-100">
                                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <PartImage part={partObj} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <Link to={`/product/${partObj.IdPart || partObj.idPart}`} className="text-xs font-bold text-slate-900 hover:text-red-600 line-clamp-1">
                                          {name}
                                        </Link>
                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                          Количество: {amount} шт.
                                        </div>
                                      </div>
                                      <div className="text-right text-xs">
                                        <div className="font-bold text-slate-900">{price * amount} ₽</div>
                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">{price} ₽/шт</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ));
                      })()}
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
                  ) : loadingFavorites ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favoriteParts.map(part => {
                        const partId = part.idPart;
                        const partName = part.name || `Запчасть #${partId}`;
                        const partPrice = part.price || 990;
                        return (
                          <Link key={partId} to={`/product/${partId}`} className="flex gap-4 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                            <div className="w-16 h-16 rounded bg-gray-50 flex-shrink-0 overflow-hidden">
                              <PartImage 
                                part={part} 
                                className="w-full h-full" 
                                imgClassName="w-full h-full object-cover rounded"
                                alt={partName}
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <div className="font-bold text-sm line-clamp-1">{partName}</div>
                              <div className="text-red-600 font-bold mt-1">{partPrice} ₽</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modal for Adding Photo URL */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2">Добавить новое фото</h3>
              <p className="text-sm text-slate-500 mb-4">Вставьте URL-адрес изображения для вашего профиля.</p>
              
              <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Ссылка на изображение (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    required
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      setNewPhotoUrl('');
                    }}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingPhoto || !newPhotoUrl.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-2"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                        Сохранение...
                      </>
                    ) : (
                      'Добавить'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
