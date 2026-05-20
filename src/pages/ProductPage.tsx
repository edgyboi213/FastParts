import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { partsApi, reviewsApi, usersApi } from '../services/api';
import { Part, Review } from '../types';
import { Star, ShoppingCart, Heart, Shield, Truck, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { PartImage, getPartImage } from '../components/PartImage';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, favorites, toggleFavorite, user } = useAppContext();

  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form states
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadReviewsAndUsers = () => {
    if (id) {
      setLoadingReviews(true);
      Promise.all([
        reviewsApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => [])
      ]).then(([allReviews, allUsers]) => {
        setReviews(allReviews || []);
        setUsers(allUsers || []);
        setLoadingReviews(false);
      }).catch(err => {
        console.error("Error loading reviews", err);
        setLoadingReviews(false);
      });
    }
  };

  useEffect(() => {
    if (id) {
      partsApi.getById(Number(id)).then(data => {
        setPart(data);
        setLoading(false);
      });
      loadReviewsAndUsers();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!part) return <div className="container-custom py-20 text-center">Товар не найден.</div>;

  const getPrice = (p: any) => p.Price ?? p.price ?? 0;
  const getRating = (p: any) => p.Rating || p.rating || 4.8;
  const getName = (p: any) => p.Name || p.name || '---';
  const getId = (p: any) => p.IdPart || p.idPart;
  const getDesc = (p: any) => p.Description || p.description || '';
  const getWeight = (p: any) => p.Weight || p.weight || '---';
  const getVolume = (p: any) => p.Volume || p.volume || '---';
  const getAmountValue = (p: any) => {
    if (!p) return undefined;
    return p.Amount !== undefined && p.Amount !== null ? p.Amount : p.amount;
  };

  const partId = getId(part);
  const isInCart = cart.some(item => (item.idPart === partId || (item as any).IdPart === partId));
  const isFavorite = favorites.includes(partId);

  const partReviews = reviews.filter((r: any) => {
    const rPartId = r.IdPart !== undefined ? r.IdPart : r.idPart;
    return Number(rPartId) === Number(partId);
  });

  const getReviewerName = (review: any) => {
    const revUserId = review.IdUser !== undefined ? review.IdUser : review.idUser;
    const reviewUser = review.user || review.User;
    if (reviewUser) {
      const uName = reviewUser.FullName || reviewUser.fullName || reviewUser.Login || reviewUser.login;
      if (uName) return uName;
    }

    const matchedUser = users.find(u => {
      const uId = u.IdUser !== undefined ? u.IdUser : u.idUser;
      return Number(uId) === Number(revUserId);
    });
    if (matchedUser) {
      return matchedUser.FullName || matchedUser.fullName || matchedUser.Login || matchedUser.login || 'Пользователь';
    }
    return `Пользователь #${revUserId || ''}`;
  };

  const getReviewRating = (review: any) => {
    return review.Rating !== undefined ? review.Rating : (review.rating || 5);
  };

  const getReviewText = (review: any) => {
    return review.ReviewText !== undefined ? review.ReviewText : (review.reviewText || '');
  };

  const hasReviews = partReviews.length > 0;
  const averageRating = hasReviews 
    ? (partReviews.reduce((sum, r) => sum + getReviewRating(r), 0) / partReviews.length).toFixed(1)
    : getRating(part);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) {
      setSubmitError('Пожалуйста, напишите текст отзыва');
      return;
    }
    
    const currUserId = user?.idUser || (user as any)?.IdUser;
    if (!currUserId) {
      setSubmitError('Вы должны быть авторизованы, чтобы оставить отзыв');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const payload = {
        IdPart: partId,
        idPart: partId,
        IdUser: currUserId,
        idUser: currUserId,
        ReviewText: newReviewText,
        reviewText: newReviewText,
        Rating: newRating,
        rating: newRating,
        ReviewDate: new Date().toISOString(),
        reviewDate: new Date().toISOString()
      };

      await reviewsApi.create(payload);
      setSubmitSuccess(true);
      setNewReviewText('');
      setNewRating(5);
      loadReviewsAndUsers();
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Не удалось отправить отзыв. Попробуйте еще раз позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-10">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              <PartImage 
                part={part} 
                className="w-full h-full" 
                imgClassName="w-full h-full object-cover"
                alt={getName(part)}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{getName(part)}</h1>
              <button 
                onClick={() => toggleFavorite(partId)}
                className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingVal = Number(averageRating);
                  return (
                    <Star 
                      key={idx} 
                      size={18} 
                      className={idx < Math.round(ratingVal) ? "text-yellow-500" : "text-gray-300"}
                      fill={idx < Math.round(ratingVal) ? "currentColor" : "none"} 
                    />
                  );
                })}
                <span className="ml-2 text-gray-600 font-medium">
                  {averageRating} ({partReviews.length} {partReviews.length % 10 === 1 && partReviews.length % 100 !== 11 ? 'отзыв' : [2, 3, 4].includes(partReviews.length % 10) && ![12, 13, 14].includes(partReviews.length % 100) ? 'отзыва' : 'отзывов'})
                </span>
              </div>
              {getAmountValue(part) === 0 ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <Package size={16} /> Нет в наличии
                </span>
              ) : (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Package size={16} /> В наличии {getAmountValue(part) !== undefined && getAmountValue(part) !== null ? `(${getAmountValue(part)} шт.)` : ''}
                </span>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              {getAmountValue(part) === 0 ? (
                <div className="text-4xl font-bold text-red-600 mb-6 uppercase tracking-tight">нет в наличии</div>
              ) : (
                <div className="text-4xl font-bold text-gray-900 mb-6">{getPrice(part)} ₽</div>
              )}
              <div className="flex gap-4">
                {getAmountValue(part) === 0 ? (
                  <button 
                    disabled
                    className="flex-grow bg-slate-200 text-slate-400 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    Товар распродан
                  </button>
                ) : isInCart ? (
                  <Link to="/cart" className="flex-grow btn-primary bg-green-600 hover:bg-green-700 text-center py-4 rounded-xl font-bold text-lg text-white">
                    Перейти в корзину
                  </Link>
                ) : (
                  <button 
                    onClick={() => addToCart(part)}
                    className="flex-grow btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={22} />
                    Добавить в корзину
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Truck className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold">Быстрая доставка</div>
                  <div className="text-sm text-gray-500">Доставим завтра, от 300 ₽</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold">Гарантия качества</div>
                  <div className="text-sm text-gray-500">12 месяцев с момента покупки</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold mb-4">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">OEM номер:</span>
                  <span className="font-medium">OE-123456789</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Вес:</span>
                  <span className="font-medium">{getWeight(part)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Объем:</span>
                  <span className="font-medium">{getVolume(part)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Бренд:</span>
                  <span className="font-medium">FastParts Original</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="border-t border-gray-100 p-6 lg:p-10">
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Описание</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{getDesc(part)}</p>
          </div>

          <div className="border-t border-slate-100 pt-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Отзывы покупателей</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                {loadingReviews ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : partReviews.length === 0 ? (
                  <div className="bg-slate-50/50 rounded-2xl p-8 border border-dashed border-slate-200 text-center text-slate-500">
                    <p className="text-base font-medium mb-1">Отзывов пока нет</p>
                    <p className="text-sm text-slate-400">Будьте первым, кто оставит свой отзыв об этом товаре!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {partReviews.map((review, i) => {
                      const rating = getReviewRating(review);
                      const key = review.idReview || review.IdReview || i;
                      return (
                        <div key={key} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md/5 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-slate-800 text-base">{getReviewerName(review)}</div>
                              <div className="flex text-yellow-500 mt-1 gap-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <Star 
                                    key={s} 
                                    size={14} 
                                    className={s < rating ? "text-yellow-500" : "text-gray-200"}
                                    fill={s < rating ? "currentColor" : "none"} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">
                              {(() => {
                                const rDate = review.ReviewDate || review.reviewDate || review.CreatedAt || review.createdAt;
                                return rDate ? new Date(rDate).toLocaleDateString('ru-RU') : 'Недавно';
                              })()}
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{getReviewText(review)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leave a Review section */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 shadow-sm sticky top-24">
                  <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200/50">Оставить отзыв</h4>
                  
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Interactive Stars Selector */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Ваша оценка</label>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const starValue = idx + 1;
                            const isHighlighted = hoverRating !== null ? starValue <= hoverRating : starValue <= newRating;
                            return (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => setNewRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(null)}
                                className="text-yellow-500 focus:outline-none transition-transform active:scale-95"
                              >
                                <Star 
                                  size={26} 
                                  className={isHighlighted ? "text-yellow-500" : "text-slate-300"}
                                  fill={isHighlighted ? "currentColor" : "none"} 
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Comment body */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Комментарий</label>
                        <textarea
                          rows={4}
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="Поделитесь вашим мнением об этой детали..."
                          className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all placeholder:text-slate-400"
                        />
                      </div>

                      {submitError && (
                        <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                          {submitError}
                        </div>
                      )}

                      {submitSuccess && (
                        <div className="text-xs font-semibold text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-100">
                          Отзыв успешно опубликован! Спасибо!
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Отправка...' : 'Опубликовать'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm font-medium text-slate-500 mb-4">
                        Только зарегистрированные пользователи могут оставлять отзывы к товарам.
                      </p>
                      <Link 
                        to="/auth" 
                        className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm"
                      >
                        Войти в аккаунт
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
