import { ObjectId } from 'mongodb';

export type Category =
  | 'Vinyls'
  | 'Antique Furniture'
  | 'GPS Sport Watches'
  | 'Running Shoes'
  | 'Camping Tents';

// puan 
export interface Rating {
  userId: string;
  username: string;
  value: number; //yıldızı
}

// yorum
export interface Review {
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

//  ürünler   ana şema 
export interface Item {
  _id?: ObjectId | string;
  name: string;
  description: string;
  price: number;
  seller: string;
  image: string; // Resimlerin sadece URL olmasına izin verilmiş
  category: Category;
  condition: 'new' | 'used'; // Yeni mi ikinci el mi

  rating: number; // Ortalama Puan (Hızlı okunması için cache'lenmiş değer)
  reviews: Review[]; // Ürüne atılan yorumlar listesi
  ratings: Rating[]; // Her ratingi burada tutup, ortalama hesabı ve güncellemeyi kolay yapıyoruz

  //Kategoriye Özgü Opsiyonel Alanlar
  batteryLife?: string; // Sadece GPS Sport Watches için
  age?: string | number; // Sadece Antique Furniture ve Vinyls için
  size?: string | number; // Sadece Running Shoes için
  material?: string; // Sadece Antique Furniture ve Running Shoes için
}
