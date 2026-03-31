import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
//const uri = ""; debug için şifreyi buraya yazmıstım. lazım olur diye kalsın.

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Geliştirme (development) ortamında, modüllerin (HMR) yeniden yüklenmesinden
  // kaynaklanan çoklu bağlantı limitine ulaşmamak için global bir değişken kullanıyoruz.
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Üretim (production/Vercel) ortamında normal bağlantı başlatılır.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Tüm projede bu promise kullanılarak DB'ye erişilecek.
export default clientPromise;
