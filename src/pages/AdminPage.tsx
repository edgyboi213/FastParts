import React, { useState, useEffect } from 'react';
import { 
  adminsApi, categoriesApi, mediaApi, oemApi, ordersApi, partsApi, profilePhotosApi, reviewsApi, usersApi, cartApi, orderpartsApi, authApi
} from '../services/api';
import { 
  Users, Layers, Image, Hash, ShoppingBag, Box, Camera, Star, ShieldCheck, Plus, Pencil, Trash2, X, Check, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type EntityType = 'admins' | 'categories' | 'media' | 'oemnumbers' | 'orders' | 'parts' | 'profilephotoes' | 'reviews' | 'users' | 'orderparts';

interface EntityConfig {
  name: string;
  icon: React.ReactNode;
  api: any;
  idField: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'password';
    relation?: {
      entity: EntityType;
      displayKey: string;
    };
  }[];
}

export const AdminPage: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [adminLoginData, setAdminLoginData] = useState({ login: '', password: '' });
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeEntity, setActiveEntity] = useState<EntityType>('parts');
  const [data, setData] = useState<any[]>([]);
  const [relatedData, setRelatedData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAdminAuthError('');
    try {
      // Use the model provided by the user (PascalCase Login/Password usually in ASP.NET)
      await authApi.adminLogin({ Login: adminLoginData.login, Password: adminLoginData.password });
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
    } catch (err) {
      console.error('Admin login failed:', err);
      setAdminAuthError('Неверный логин или пароль администратора');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const entityConfigs: Record<EntityType, EntityConfig> = {
    admins: {
      name: 'Администраторы',
      icon: <ShieldCheck size={20} />,
      api: adminsApi,
      idField: 'IdAdmin',
      fields: [
        { key: 'FullName', label: 'ФИО', type: 'text' },
        { key: 'Login', label: 'Логин', type: 'text' },
        { key: 'Password', label: 'Пароль', type: 'password' }
      ]
    },
    categories: {
      name: 'Категории',
      icon: <Layers size={20} />,
      api: categoriesApi,
      idField: 'IdCategory',
      fields: [
        { key: 'Name', label: 'Название', type: 'text' }
      ]
    },
    media: {
      name: 'Медиа',
      icon: <Image size={20} />,
      api: mediaApi,
      idField: 'IdMedia',
      fields: [
        { key: 'Content', label: 'Контент (URL)', type: 'text' }
      ]
    },
    oemnumbers: {
      name: 'OEM Номера',
      icon: <Hash size={20} />,
      api: oemApi,
      idField: 'IdOemNumber',
      fields: [
        { key: 'Number', label: 'Номер', type: 'text' }
      ]
    },
    orders: {
      name: 'Заказы',
      icon: <ShoppingBag size={20} />,
      api: ordersApi,
      idField: 'IdOrder',
      fields: [
        { key: 'IdUser', label: 'Пользователь', type: 'number', relation: { entity: 'users', displayKey: 'FullName' } },
        { key: 'OrderDate', label: 'Дата заказа', type: 'text' }
      ]
    },
    parts: {
      name: 'Запчасти',
      icon: <Box size={20} />,
      api: partsApi,
      idField: 'IdPart',
      fields: [
        { key: 'IdMedia', label: 'Медиа ID', type: 'number', relation: { entity: 'media', displayKey: 'Content' } },
        { key: 'IdCategory', label: 'Категория', type: 'number', relation: { entity: 'categories', displayKey: 'Name' } },
        { key: 'IdOemNumber', label: 'OEM ID', type: 'number', relation: { entity: 'oemnumbers', displayKey: 'Number' } },
        { key: 'Name', label: 'Название', type: 'text' },
        { key: 'Amount', label: 'Количество', type: 'number' },
        { key: 'Description', label: 'Описание', type: 'textarea' },
        { key: 'Weight', label: 'Вес', type: 'text' },
        { key: 'Volume', label: 'Объем', type: 'text' },
        { key: 'Price', label: 'Цена', type: 'number' }
      ]
    },
    profilephotoes: {
      name: 'Фото профиля',
      icon: <Camera size={20} />,
      api: profilePhotosApi,
      idField: 'IdProfilePhoto',
      fields: [
        { key: 'Photo', label: 'Путь к фото', type: 'text' }
      ]
    },
    reviews: {
      name: 'Отзывы',
      icon: <Star size={20} />,
      api: reviewsApi,
      idField: 'IdReview',
      fields: [
        { key: 'IdPart', label: 'Запчасть', type: 'number', relation: { entity: 'parts', displayKey: 'Name' } },
        { key: 'IdUser', label: 'Пользователь', type: 'number', relation: { entity: 'users', displayKey: 'FullName' } },
        { key: 'ReviewText', label: 'Текст отзыва', type: 'textarea' },
        { key: 'Rating', label: 'Рейтинг', type: 'number' },
        { key: 'ReviewDate', label: 'Дата отзыва', type: 'text' }
      ]
    },
    users: {
      name: 'Пользователи',
      icon: <Users size={20} />,
      api: usersApi,
      idField: 'IdUser',
      fields: [
        { key: 'IdProfilePhoto', label: 'Фото профиля', type: 'number', relation: { entity: 'profilephotoes', displayKey: 'Photo' } },
        { key: 'FullName', label: 'ФИО', type: 'text' },
        { key: 'Login', label: 'Логин', type: 'text' },
        { key: 'Password', label: 'Пароль', type: 'password' },
        { key: 'Phone', label: 'Телефон', type: 'text' },
        { key: 'DeliveryAddress', label: 'Адрес доставки', type: 'text' }
      ]
    },
    orderparts: {
      name: 'Состав заказов',
      icon: <Layers size={20} />,
      api: orderpartsApi,
      idField: 'IdOrderPart',
      fields: [
        { key: 'IdOrder', label: 'Заказ #', type: 'number' },
        { key: 'IdPart', label: 'Запчасть', type: 'number', relation: { entity: 'parts', displayKey: 'Name' } },
        { key: 'Amount', label: 'Количество', type: 'number' }
      ]
    }
  };

  const currentConfig = entityConfigs[activeEntity];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch main data
      const result = await currentConfig.api.getAll();
      setData(result || []);

      // Fetch required related data
      const entitiesToFetch = new Set<EntityType>();
      currentConfig.fields.forEach(f => {
        if (f.relation) entitiesToFetch.add(f.relation.entity);
      });

      const updatedRelatedData = { ...relatedData };
      await Promise.allSettled(
        Array.from(entitiesToFetch).map(async (entity) => {
          if (!updatedRelatedData[entity]) {
            const relResult = await entityConfigs[entity].api.getAll();
            updatedRelatedData[entity] = relResult || [];
          }
        })
      );
      setRelatedData(updatedRelatedData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeEntity]);

  const getValue = (item: any, key: string) => {
    if (item[key] !== undefined && item[key] !== null) return item[key];
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    if (item[camelKey] !== undefined && item[camelKey] !== null) return item[camelKey];
    return null;
  };

  const resolveLabel = (key: string, value: any, fieldConfig: any) => {
    if (!fieldConfig.relation || value === null || value === undefined) return value;
    
    const relEntity = fieldConfig.relation.entity as EntityType;
    const relData = relatedData[relEntity];
    if (!relData) return value;

    const relConfig = entityConfigs[relEntity];
    const relatedItem = relData.find(item => getValue(item, relConfig.idField) === value);
    
    if (relatedItem) {
      return getValue(relatedItem, fieldConfig.relation.displayKey) || value;
    }
    
    return value;
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      const normalizedData: any = {};
      currentConfig.fields.forEach(f => {
        normalizedData[f.key] = getValue(item, f.key) ?? '';
      });
      setFormData(normalizedData);
    } else {
      setEditingItem(null);
      const initialForm: any = {};
      currentConfig.fields.forEach(f => {
        initialForm[f.key] = f.type === 'number' ? 0 : '';
      });
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      const payload: any = {};
      
      const sanitizeDateValue = (val: any) => {
        if (val === '' || val === null || val === undefined) {
          return null;
        }
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (!trimmed) return null;
          // Try to parse standard Russian date "DD.MM.YYYY" or "DD.MM.YYYY HH:MM:ss"
          const ruDateRegex = /^(\d{2})\.(\d{2})\.(\d{4})(.*)$/;
          const match = trimmed.match(ruDateRegex);
          if (match) {
            const [_, day, month, year, timePart] = match;
            let isoStr = `${year}-${month}-${day}`;
            if (timePart && timePart.trim()) {
              isoStr += `T${timePart.trim()}`;
            } else {
              isoStr += `T12:00:00Z`; // safe default midday
            }
            const parsed = new Date(isoStr);
            if (!isNaN(parsed.getTime())) {
              return parsed.toISOString();
            }
          }
          
          // Try passing to standard Date constructor
          const parsed = new Date(trimmed);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString();
          }
        }
        return val;
      };

      currentConfig.fields.forEach(f => {
        const val = formData[f.key];
        let finalizedValue: any = val;
        
        if (f.key.toLowerCase().includes('date')) {
          finalizedValue = sanitizeDateValue(val);
        } else if (f.type === 'number') {
          if (val === '' || val === null || val === undefined) {
            finalizedValue = null;
          } else {
            const num = Number(val);
            finalizedValue = isNaN(num) ? null : num;
          }
        }
        
        payload[f.key] = finalizedValue;
        
        // Match both camelCase and PascalCase
        const camelKey = f.key.charAt(0).toLowerCase() + f.key.slice(1);
        payload[camelKey] = finalizedValue;
      });

      // Ensure mandatory relations are never NaN or null regardless of action (Create or Update)
      if (activeEntity === 'parts') {
        if (payload['IdMedia'] === null || payload['IdMedia'] === undefined || isNaN(payload['IdMedia'])) payload['IdMedia'] = 1;
        if (payload['IdCategory'] === null || payload['IdCategory'] === undefined || isNaN(payload['IdCategory'])) payload['IdCategory'] = 1;
        if (payload['IdOemNumber'] === null || payload['IdOemNumber'] === undefined || isNaN(payload['IdOemNumber'])) payload['IdOemNumber'] = 1;
        
        payload['idMedia'] = payload['IdMedia'];
        payload['idCategory'] = payload['IdCategory'];
        payload['idOemNumber'] = payload['IdOemNumber'];
      }

      if (activeEntity === 'reviews') {
        if (payload['IdPart'] === null || payload['IdPart'] === undefined || isNaN(payload['IdPart'])) payload['IdPart'] = 1;
        if (payload['IdUser'] === null || payload['IdUser'] === undefined || isNaN(payload['IdUser'])) payload['IdUser'] = 1;
        
        payload['idPart'] = payload['IdPart'];
        payload['idUser'] = payload['IdUser'];
      }

      if (editingItem) {
        const idVal = getValue(editingItem, currentConfig.idField);
        if (idVal !== null && idVal !== undefined) {
          const idNum = Number(idVal);
          payload[currentConfig.idField] = idNum;
          const camelId = currentConfig.idField.charAt(0).toLowerCase() + currentConfig.idField.slice(1);
          payload[camelId] = idNum;
        }
        await currentConfig.api.update(getValue(editingItem, currentConfig.idField), payload);
      } else {
        await currentConfig.api.create(payload);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Ошибка при сохранении. Проверьте правильность заполнения полей.');
    }
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;
    try {
      await currentConfig.api.delete(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Ошибка при удалении');
    }
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Admin Access</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Требуется авторизация</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Логин</label>
              <input 
                type="text"
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors"
                value={adminLoginData.login}
                onChange={e => setAdminLoginData({...adminLoginData, login: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Пароль</label>
              <input 
                type="password"
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors"
                value={adminLoginData.password}
                onChange={e => setAdminLoginData({...adminLoginData, password: e.target.value})}
              />
            </div>

            {adminAuthError && (
              <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">{adminAuthError}</p>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-600 transition-all transform active:scale-95 shadow-xl shadow-slate-900/10 italic flex items-center justify-center gap-2"
            >
              {isLoggingIn ? 'Вход...' : (
                <>
                  <Check size={18} />
                  Войти в панель
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50">
      {/* Sidebar - Phone Settings Style */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-6 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1 italic">
            Admin<span className="text-red-600">Panel</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Система управления</p>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {(Object.keys(entityConfigs) as EntityType[]).map(key => (
            <button
              key={key}
              onClick={() => setActiveEntity(key)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeEntity === key 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                activeEntity === key ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'
              }`}>
                {entityConfigs[key].icon}
              </div>
              <span className="font-bold text-sm uppercase tracking-tight">{entityConfigs[key].name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
              {currentConfig.name}
            </h2>
            <div className="max-w-md w-full relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Поиск по таблице..." 
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-red-600 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="px-6 h-12 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-red-600 transition-all flex items-center gap-2 transform active:scale-95 shadow-xl shadow-slate-900/10 italic"
          >
            <Plus size={18} />
            Добавить
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      ID
                    </th>
                    {currentConfig.fields.map(f => (
                      <th key={f.key} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-black text-slate-900">
                        #{getValue(item, currentConfig.idField)}
                      </td>
                      {currentConfig.fields.map(f => {
                        const rawValue = getValue(item, f.key);
                        const value = resolveLabel(f.key, rawValue, f);
                        
                        const displayValue = (value !== undefined && value !== null) 
                          ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
                          : '---';
                          
                        return (
                          <td key={f.key} className="px-6 py-5 text-sm font-bold text-slate-600">
                            {f.type === 'textarea' ? (
                              <span className="line-clamp-1 max-w-[200px]">{displayValue}</span>
                            ) : f.type === 'password' ? (
                              <span className="font-mono">••••••••</span>
                            ) : (
                              displayValue
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(getValue(item, currentConfig.idField))}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal - CRUD Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                    {editingItem ? 'Редактировать' : 'Добавить'} {currentConfig.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Заполните все поля</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {currentConfig.fields.map(f => (
                  <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">
                      {f.label}
                    </label>
                    {f.relation ? (
                      <select
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors"
                        value={formData[f.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value === '' ? '' : Number(e.target.value) })}
                      >
                        <option value="">Выберите {f.label}</option>
                        {relatedData[f.relation.entity]?.map(relItem => {
                          const relId = getValue(relItem, entityConfigs[f.relation!.entity].idField);
                          const relLabel = getValue(relItem, f.relation!.displayKey);
                          return (
                            <option key={relId} value={relId}>
                              {relLabel} (ID: {relId})
                            </option>
                          );
                        })}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors resize-none"
                        value={formData[f.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      ></textarea>
                    ) : (
                      <input 
                        type={f.type === 'password' ? 'password' : f.type}
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors"
                        value={formData[f.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.key]: f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 h-14 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-slate-900 transition-all transform active:scale-95 shadow-xl shadow-red-600/20 italic flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Сохранить изменения
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="px-8 h-14 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all transform active:scale-95 italic"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
