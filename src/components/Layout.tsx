import React from 'react';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isAdminPage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminPage && (
        <footer className="bg-slate-50 border-t border-slate-100 py-12">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </div>
                  <span className="text-lg font-black tracking-tighter uppercase text-slate-900 italic">
                    БЫСТРЫЕ<span className="text-red-600">ДЕТАЛИ</span>
                  </span>
                </div>
                <p className="text-slate-500 text-sm max-w-sm">
                  Мы создаем новый стандарт в поиске и покупке автозапчастей. 
                  Только проверенные поставщики и гарантия на каждую деталь.
                </p>
              </div>
              <div>
                <h4 className="label-caps mb-6">Информация</h4>
                <ul className="space-y-3 text-sm font-medium text-slate-600">
                  <li><a href="#" className="hover:text-red-600 transition-colors">О компании</a></li>
                  <li><a href="#" className="hover:text-red-600 transition-colors">Доставка и оплата</a></li>
                  <li><a href="#" className="hover:text-red-600 transition-colors">Возврат товара</a></li>
                </ul>
              </div>
              <div>
                <h4 className="label-caps mb-6">Поддержка</h4>
                <ul className="space-y-3 text-sm font-medium text-slate-600">
                  <li><a href="#" className="hover:text-red-600 transition-colors">Личный кабинет</a></li>
                  <li><a href="#" className="hover:text-red-600 transition-colors">Контакты</a></li>
                  <li><a href="#" className="hover:text-red-600 transition-colors">Частые вопросы</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              <div>© 2026 БЫСТРЫЕ ДЕТАЛИ. Все права защищены.</div>
              <div className="flex gap-8">
                <a href="#" className="hover:text-red-600 transition-colors">Условия</a>
                <a href="#" className="hover:text-red-600 transition-colors">Конфиденциальность</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
