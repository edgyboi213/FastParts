import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Header: React.FC = () => {
  const { user, setUser, cart, searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().toLowerCase() === '/admin' || searchQuery.trim().toLowerCase() === 'admin') {
      navigate('/admin');
      setSearchQuery('');
      return;
    }
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.amount, 0);

  return (
    <header className="h-20 border-b border-slate-100 flex items-center bg-white sticky top-0 z-50 shrink-0">
      <div className="container-custom flex items-center justify-between w-full">
        <div className="flex items-center gap-2 mr-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-slate-900 hidden sm:inline">
              БЫСТРЫЕ<span className="text-red-600">ДЕТАЛИ</span>
            </span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Поиск по названию или артикулу..." 
            className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-red-600 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="ml-2 px-6 h-11 bg-red-600 text-white font-semibold rounded-full text-sm hover:bg-red-700 transition-colors hidden md:block">
            Найти
          </button>
        </form>

        <div className="flex items-center gap-6 ml-8">
          {user ? (
            <Link to="/profile" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-red-600 group">
              <UserIcon size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Профиль</span>
            </Link>
          ) : (
            <Link to="/auth" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-red-600 group">
              <UserIcon size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Войти</span>
            </Link>
          )}

          <Link to="/cart" className="relative flex flex-col items-center gap-0.5 text-slate-500 hover:text-red-600 group">
            <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">Корзина</span>
          </Link>

          {user && (
            <button 
              onClick={() => setUser(null)}
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-red-600"
              title="Выйти"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Выход</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
