import React, { useState, useEffect } from 'react';
import { 
  adminsApi, categoriesApi, mediaApi, oemApi, ordersApi, partsApi, profilePhotosApi, reviewsApi, usersApi, cartApi, orderpartsApi, authApi
} from '../services/api';
import { 
  Users, Layers, Image, Hash, ShoppingBag, Box, Camera, Star, ShieldCheck, Plus, Pencil, Trash2, X, Check, Search,
  TrendingUp, Coins, FileText, Printer, ArrowUpRight, Percent, BarChart3, Download
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
    type: 'text' | 'number' | 'textarea' | 'password' | 'select';
    options?: string[];
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

  const [currentTab, setCurrentTab] = useState<'data' | 'reports'>('data');
  const [reportsData, setReportsData] = useState<{
    orders: any[];
    orderparts: any[];
    parts: any[];
    users: any[];
    loading: boolean;
  }>({
    orders: [],
    orderparts: [],
    parts: [],
    users: [],
    loading: false
  });

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
        { key: 'OrderDate', label: 'Дата заказа', type: 'text' },
        { key: 'Status', label: 'Статус', type: 'select', options: ['Новый', 'В обработке', 'Отправлен', 'Доставлен', 'Отменен'] }
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

  const fetchReportsData = async () => {
    setReportsData(prev => ({ ...prev, loading: true }));
    try {
      const [allOrders, allOrderParts, allParts, allUsers] = await Promise.all([
        ordersApi.getAll().catch(() => []),
        orderpartsApi.getAll().catch(() => []),
        partsApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => [])
      ]);
      setReportsData({
        orders: allOrders || [],
        orderparts: allOrderParts || [],
        parts: allParts || [],
        users: allUsers || [],
        loading: false
      });
    } catch (err) {
      console.error("Failed to load reports data:", err);
      setReportsData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (currentTab === 'reports') {
      fetchReportsData();
    }
  }, [currentTab]);

  const stats = React.useMemo(() => {
    const orders = reportsData.orders;
    const orderparts = reportsData.orderparts;
    const parts = reportsData.parts;
    const users = reportsData.users;

    const partMap = new Map<number, any>();
    parts.forEach(p => {
      const id = p.IdPart ?? p.idPart;
      if (id) partMap.set(Number(id), p);
    });

    const getOrderTotal = (orderItem: any) => {
      const oId = orderItem.IdOrder ?? orderItem.idOrder ?? orderItem.id;
      const relatedOps = orderparts.filter(op => {
        const opOrderId = op.IdOrder ?? op.idOrder;
        return Number(opOrderId) === Number(oId);
      });

      let total = 0;
      relatedOps.forEach(op => {
        const pId = op.IdPart ?? op.idPart;
        const amt = op.Amount ?? op.amount ?? 0;
        const p = partMap.get(Number(pId));
        if (p) {
          const price = p.Price ?? p.price ?? 0;
          total += price * amt;
        }
      });
      return total;
    };

    let totalRevenue = 0;
    let completedRevenue = 0;
    const orderCount = orders.length;
    const clientCount = users.length;

    const ordersWithTotal = orders.map(o => {
      const total = getOrderTotal(o);
      const status = o.Status ?? o.status ?? 'Новый';
      totalRevenue += total;
      if (status === 'Доставлен' || status === 'Отправлен') {
        completedRevenue += total;
      }
      return {
        ...o,
        total,
        status
      };
    });

    const averageCheck = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    const statusCounts: Record<string, { count: number; value: number }> = {
      'Новый': { count: 0, value: 0 },
      'В обработке': { count: 0, value: 0 },
      'Отправлен': { count: 0, value: 0 },
      'Доставлен': { count: 0, value: 0 },
      'Отменен': { count: 0, value: 0 }
    };

    ordersWithTotal.forEach(o => {
      const s = o.status;
      if (!statusCounts[s]) {
        statusCounts[s] = { count: 0, value: 0 };
      }
      statusCounts[s].count += 1;
      statusCounts[s].value += o.total;
    });

    const partSales: Record<number, { name: string; soldCount: number; revenue: number }> = {};
    orderparts.forEach(op => {
      const pId = op.IdPart ?? op.idPart;
      const amt = op.Amount ?? op.amount ?? 0;
      const p = partMap.get(Number(pId));
      if (p) {
        const id = Number(pId);
        if (!partSales[id]) {
          partSales[id] = {
            name: p.Name ?? p.name ?? '---',
            soldCount: 0,
            revenue: 0
          };
        }
        partSales[id].soldCount += amt;
        partSales[id].revenue += amt * (p.Price ?? p.price ?? 0);
      }
    });

    const topParts = Object.values(partSales)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    // Sales by date
    const salesByDate: Record<string, number> = {};
    ordersWithTotal.forEach(o => {
      const dateStr = o.OrderDate ?? o.orderDate;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const formatted = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
          salesByDate[formatted] = (salesByDate[formatted] || 0) + o.total;
        }
      }
    });

    const chartData = Object.entries(salesByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return {
      totalRevenue,
      completedRevenue,
      orderCount,
      clientCount,
      averageCheck,
      statusCounts,
      topParts,
      chartData,
      ordersWithTotal
    };
  }, [reportsData]);

  const getValue = (item: any, key: string) => {
    if (item[key] !== undefined && item[key] !== null) return item[key];
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    if (item[camelKey] !== undefined && item[camelKey] !== null) return item[camelKey];
    return null;
  };

  const resolveLabel = (key: string, value: any, fieldConfig: any) => {
    if (!fieldConfig.relation || value === null || value === undefined) return value;
    
    const relEntity = fieldConfig.relation.entity;
    const relData = relatedData[relEntity];
    if (!relData) return value;

    const relConfig = entityConfigs[relEntity as keyof typeof entityConfigs];
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
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 print:bg-white print:h-auto print:block print:overflow-visible">
      {/* Sidebar - Phone Settings Style */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-6 gap-6 print:hidden shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1 italic">
            Admin<span className="text-red-600">Panel</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Система управления</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setCurrentTab('data')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none ${
              currentTab === 'data'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Данные
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none ${
              currentTab === 'reports'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Отчеты
          </button>
        </div>

        {currentTab === 'data' ? (
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
                <span className="font-bold text-xs uppercase tracking-tight">{entityConfigs[key].name}</span>
              </button>
            ))}
          </nav>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-slate-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
            <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-none flex flex-col gap-2">
              <div className="text-[10px] text-slate-400 font-extrabold tracking-widest">Информация:</div>
              <div className="flex justify-between py-1 text-slate-600 text-[11px] font-black">
                <span>Всего продаж:</span>
                <span className="text-slate-800">{stats.totalRevenue.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 text-[11px] font-black">
                <span>Число заказов:</span>
                <span className="text-slate-800">{stats.orderCount} шт</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      {currentTab === 'data' ? (
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
      ) : (
        <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:block">
          <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 print:hidden">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
                Аналитика и Отчеты
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Продажи и статистика</p>
            </div>
            
            <button 
              onClick={() => window.print()}
              className="px-6 h-12 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-red-600 transition-all flex items-center gap-2 transform active:scale-95 shadow-xl shadow-slate-900/10 italic"
            >
              <Printer size={16} />
              Экспорт в PDF
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar print:overflow-visible print:p-0 print:m-0 print:bg-white">
            {reportsData.loading ? (
              <div className="flex items-center justify-center h-64 print:hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="space-y-8 print:space-y-6 max-w-5xl mx-auto print:max-w-none">
                {/* Official document header - ONLY visible during printing */}
                <div className="hidden print:block text-center border-b-2 border-slate-900 pb-6 mb-8">
                  <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">Официальный отчет о продажах автозапчастей</h1>
                  <p className="text-sm font-medium text-slate-600 mt-2">Система «БЫСТРЫЕ ДЕТАЛИ» — Панель управления</p>
                  <div className="flex justify-between text-xs text-slate-500 mt-4 font-bold">
                    <span>Дата генерации: {new Date().toLocaleDateString('ru-RU')}</span>
                    <span>Документ №: OP-{Math.floor(Math.random() * 900000 + 100000)}</span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
                  <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                      <Coins size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">Оборот (всего)</p>
                      <h4 className="text-xl font-black text-slate-900 mt-1">{stats.totalRevenue.toLocaleString()} ₽</h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">Выручка (завершено)</p>
                      <h4 className="text-xl font-black text-slate-900 mt-1">{stats.completedRevenue.toLocaleString()} ₽</h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">Число заказов</p>
                      <h4 className="text-xl font-black text-slate-900 mt-1">{stats.orderCount} шт</h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">Средний чек</p>
                      <h4 className="text-xl font-black text-slate-900 mt-1">{stats.averageCheck.toLocaleString()} ₽</h4>
                    </div>
                  </div>
                </div>

                {/* Top Selling Parts & Breakdown by status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6 print:space-y-0">
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 print:p-6">
                    <h3 className="text-md font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <TrendingUp size={18} className="text-red-600" />
                      Топ-5 продаваемых запчастей
                    </h3>
                    {stats.topParts.length === 0 ? (
                      <p className="text-slate-400 text-sm font-bold">Нет данных о продажах деталей</p>
                    ) : (
                      <div className="space-y-4">
                        {stats.topParts.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-colors">
                            <div className="flex items-center gap-3 pr-4">
                              <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 text-xs font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</span>
                            </div>
                            <div className="text-right shrink-0 font-bold">
                              <span className="text-xs font-black text-slate-950 uppercase block">{item.soldCount} шт</span>
                              <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">{item.revenue.toLocaleString()} ₽</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 print:p-6">
                    <h3 className="text-md font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <BarChart3 size={18} className="text-red-600" />
                      По статусам заказов
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(stats.statusCounts).map(([status, details]) => {
                        const percent = stats.orderCount > 0 ? Math.round((details.count / stats.orderCount) * 100) : 0;
                        const getStatusColor = (s: string) => {
                          switch (s) {
                            case 'Доставлен': return 'bg-emerald-500';
                            case 'Отправлен': return 'bg-indigo-500';
                            case 'В обработке': return 'bg-amber-500';
                            case 'Новый': return 'bg-sky-500';
                            default: return 'bg-rose-500';
                          }
                        };
                        return (
                          <div key={status} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 uppercase tracking-tight">
                              <span>{status} ({details.count} шт)</span>
                              <span>{details.value.toLocaleString()} ₽ ({percent}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${getStatusColor(status)}`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Operations table */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8 print:p-6 print:shadow-none print:border-slate-200">
                  <h3 className="text-md font-black text-slate-900 uppercase tracking-wider mb-6">
                    Операционная ведомость заказов
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                          <th className="px-4 py-3">ID Заказа</th>
                          <th className="px-4 py-3">Дата заказа</th>
                          <th className="px-4 py-2">Статус</th>
                          <th className="px-4 py-3 text-right">Сумма заказа</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-bold">
                        {stats.ordersWithTotal.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30">
                            <td className="px-4 py-4 text-slate-900 font-black">#{item.IdOrder ?? item.idOrder}</td>
                            <td className="px-4 py-4">{item.OrderDate ? new Date(item.OrderDate).toLocaleDateString('ru-RU') : '---'}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                                item.status === 'Доставлен' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                item.status === 'Отправлен' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                item.status === 'В обработке' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                item.status === 'Новый' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right text-slate-900 font-black">{(item.total || 0).toLocaleString()} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="hidden print:flex justify-between items-center mt-16 pt-12 border-t border-slate-200 text-xs font-bold text-slate-600 font-sans">
                  <div className="space-y-4">
                    <p>Ответственное лицо: ____________________ / ( ФИО )</p>
                    <p>Должность: Администратор системы БЫСТРЫЕ ДЕТАЛИ</p>
                  </div>
                  <div className="text-right space-y-4">
                    <p>Подпись: ____________________</p>
                    <p>М.П. (Печать предприятия)</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      )}

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
                    ) : f.type === 'select' ? (
                      <select
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 transition-colors"
                        value={formData[f.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      >
                        <option value="">Выберите {f.label}</option>
                        {f.options?.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
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
