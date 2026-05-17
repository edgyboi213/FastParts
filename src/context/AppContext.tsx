import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, Part } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (part: Part, amount?: number) => void;
  removeFromCart: (cartId: number) => void;
  updateCartAmount: (cartId: number, amount: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: number[];
  toggleFavorite: (partId: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (part: Part, amount: number = 1) => {
    const partId = part.idPart || (part as any).IdPart;
    setCart(prev => {
      const existing = prev.find(item => item.idPart === partId || (item as any).IdPart === partId);
      if (existing) {
        return prev.map(item => 
          (item.idPart === partId || (item as any).IdPart === partId)
            ? { ...item, amount: item.amount + amount } 
            : item
        );
      }
      const newItem: CartItem = {
        idCart: Date.now(),
        idUser: user?.idUser || (user as any)?.IdUser || 0,
        idPart: partId,
        amount,
        part
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId: number) => {
    setCart(prev => prev.filter(item => item.idCart !== cartId));
  };

  const updateCartAmount = (cartId: number, amount: number) => {
    setCart(prev => prev.map(item => 
      item.idCart === cartId ? { ...item, amount: Math.max(1, amount) } : item
    ));
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (partId: number) => {
    setFavorites(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId) 
        : [...prev, partId]
    );
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      cart, addToCart, removeFromCart, updateCartAmount, clearCart,
      searchQuery, setSearchQuery,
      favorites, toggleFavorite
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
