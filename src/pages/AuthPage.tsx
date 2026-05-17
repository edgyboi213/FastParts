import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authApi } from '../services/api';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ login: '', password: '', fullName: '' });
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const user = await authApi.login({ login: formData.login, password: formData.password });
        setUser(user);
      } else {
        await authApi.register(formData);
        const user = await authApi.login({ login: formData.login, password: formData.password });
        setUser(user);
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      alert('Ошибка при входе или регистрации');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div 
        layout
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{isLogin ? 'С возвращением!' : 'Создать аккаунт'}</h1>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Войдите, чтобы продолжить покупки' : 'Присоединяйтесь к нам и получайте бонусы'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  key="full-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" required 
                      className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-300" 
                      placeholder="Иванов Иван Иванович"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required 
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-300" 
                  placeholder="example@mail.ru"
                  value={formData.login}
                  onChange={e => setFormData({...formData, login: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required 
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-300" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 rounded-xl text-lg font-bold mt-4 flex items-center justify-center gap-2">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              {isLogin ? 'Впервые у нас?' : 'Уже есть аккаунт?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-red-600 font-bold hover:underline"
              >
                {isLogin ? 'Создать аккаунт' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
