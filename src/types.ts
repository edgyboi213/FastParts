export interface Admin {
  idAdmin: number;
  fullName: string;
  login: string;
  password?: string;
}

export interface ProfilePhoto {
  idProfilePhoto: number;
  photo: string;
}

export interface Category {
  idCategory: number;
  name: string;
}

export interface Media {
  idMedia: number;
  content: string;
}

export interface OemNumber {
  idOemNumber: number;
  number: string;
}

export interface Part {
  idPart: number;
  idMedia: number;
  idCategory: number;
  idOemNumber: number;
  name: string;
  amount: number;
  Amount?: number;
  description: string;
  weight: string;
  volume: string;
  price?: number;
  Price?: number;
  rating?: number;
  media?: Media;
  category?: Category;
  oemNumber?: OemNumber;
}

export interface User {
  // PascalCase (Server Model)
  IdUser: number;
  IdProfilePhoto: number;
  FullName: string;
  Login: string;
  Password?: string;
  Phone?: string;
  DeliveryAddress?: string;

  // camelCase (Compatibility layer)
  idUser?: number;
  idProfilePhoto?: number;
  fullName?: string;
  login?: string;
  phone?: string;
  address?: string;

  Photo?: string;
  photo?: string;
  PhotoUrl?: string;
  photoUrl?: string;
}

export interface CartItem {
  idCart: number;
  idUser: number;
  idPart: number;
  amount: number;
  part: Part;
}

export interface Review {
  idReview: number;
  idPart: number;
  idUser: number;
  reviewText: string;
  rating: number;
  reviewDate?: string;
  ReviewDate?: string;
  user?: User;
}

export interface Order {
  idOrder: number;
  idUser: number;
  orderDate: string;
  totalAmount?: number;
  parts?: OrderPart[];
  status?: string;
  Status?: string;
}

export interface OrderPart {
  IdOrderPart: number;
  IdOrder: number;
  IdPart: number;
  Amount: number;
  // Compatibility
  idOrderPart?: number;
  idOrder?: number;
  idPart?: number;
  amount?: number;
  part?: Part;
}
