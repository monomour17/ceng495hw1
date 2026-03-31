import { ObjectId } from 'mongodb';

// Kullanıcının attığı ratinglerin profilinde görünmesi için küçültülmüş bir kopyası
export interface GivenRating {
  itemId: string;
  itemName: string; // Adı hızlıca yazdırabilmek için tutuluyor
  value: number;
}

// Kullanıcının yazdığı yorumların profilinde görünmesi için kopya
export interface GivenReview {
  itemId: string;
  itemName: string;
  text: string;
}

export interface User {
  _id?: ObjectId | string;
  username: string;
  password?: string; // Veritabanından her zaman döndürmemek gerekecek, o yüzden opsiyonel bırakıyoruz
  role: 'admin' | 'user'; // Admin veya normal kullanıcı
  
  // Ödev kuralları: Kendi attığı puanların ortalaması ve attığı yorumlar
  averageRating: number; 
  givenRatings: GivenRating[]; 
  reviews: GivenReview[]; 
}
