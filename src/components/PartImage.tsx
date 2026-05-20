import React from 'react';
import { Package } from 'lucide-react';

export const getPartImage = (part: any): string | null => {
  if (!part) return null;
  const media = part.Media || part.media;
  if (!media) return null;
  const content = media.Content || media.content || media.photo || media.Photo;
  if (content && typeof content === 'string' && content.trim() !== '') {
    return content;
  }
  return null;
};

interface PartImageProps {
  part: any;
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export const PartImage: React.FC<PartImageProps> = ({ 
  part, 
  className = "w-full h-full", 
  imgClassName = "w-full h-full object-cover", 
  alt = "Запчасть" 
}) => {
  const imageUrl = getPartImage(part);

  if (imageUrl) {
    return (
      <div className={className}>
        <img src={imageUrl} alt={alt} className={imgClassName} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center bg-slate-100/60 text-slate-400 ${className}`}>
      <Package size={32} className="stroke-[1.5] text-slate-400/80 mb-1" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 italic">Нет фото</span>
    </div>
  );
};
