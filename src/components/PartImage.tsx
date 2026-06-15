import React from 'react';
import { Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const getPartImage = (part: any, mediaList?: any[]): string | null => {
  if (!part) return null;
  
  // 1. Check media relation on the part object
  const media = part.Media || part.media;
  if (media) {
    const content = media.Content || media.content || media.photo || media.Photo;
    if (content && typeof content === 'string' && content.trim() !== '') {
      return content.trim();
    }
  }

  // 2. Resolve IdMedia from cached mediaList if available
  const idMediaVal = part.IdMedia || part.idMedia;
  if (idMediaVal && mediaList && Array.isArray(mediaList)) {
    const foundMedia = mediaList.find(m => m.IdMedia === idMediaVal || m.idMedia === idMediaVal);
    if (foundMedia) {
      const content = foundMedia.Content || foundMedia.content || foundMedia.photo || foundMedia.Photo;
      if (content && typeof content === 'string' && content.trim() !== '') {
        return content.trim();
      }
    }
  }

  // 3. Direct fallback fields on the part object
  const directFields = ['Media', 'media', 'Photo', 'photo', 'Image', 'image', 'ImageUrl', 'imageUrl', 'Content', 'content'];
  for (const field of directFields) {
    const val = part[field];
    if (val && typeof val === 'string' && val.trim() !== '') {
      const trimmed = val.trim();
      // If it looks like a URL (http/https), a data URI, or a relative slash path
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
  const { mediaList } = useAppContext();
  const imageUrl = getPartImage(part, mediaList);

  if (imageUrl) {
    return (
      <div className={className}>
        <img 
          src={imageUrl} 
          alt={alt} 
          className={imgClassName} 
          referrerPolicy="no-referrer" 
        />
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
