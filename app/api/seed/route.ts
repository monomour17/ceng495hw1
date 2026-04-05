import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("elob2b");
        const userscollection = db.collection("users");
        const itemscollection = db.collection("items");
        await userscollection.deleteMany({});
        await itemscollection.deleteMany({});

        const seedusers = [{
            username: "elo",
            password: "elo1",
            role: "admin",
            averageRating: 0,
            givenRatings: [],
            reviews: []
        }, {
            username: "user1",
            password: "user1",
            role: "user",
            averageRating: 0,
            givenRatings: [],
            reviews: []
        }, {
            username: "user2",
            password: "user2",
            role: "user",
            averageRating: 0,
            givenRatings: [],
            reviews: []
        }, {
            username: "user3",
            password: "user3",
            role: "user",
            averageRating: 0,
            givenRatings: [],
            reviews: []
        }];

        const seeditems = [{
            name: "Vinyl Record (The Beatles)",
            description: "Original pressing from the 1960s - The Beatles - 1962 - 1966 - ***Japan Pressing*** - Period Press Vinyl - Longplay - LP",
            price: 1500,
            seller: "World of Vinyls",
            image: "https://productimages.hepsiburada.net/s/777/424-600/110001178824289.jpg/format:webp",
            category: "Vinyls",
            condition: "used",
            age: 60,
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "French Antique Chair",
            description: "Hand-carved French Antique Chair from the 1800s, late 19th century",
            price: 5000,
            seller: "Ziya's Antiques",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwUEcQ2UBZVmIl1KwXrgWJ4VNL73cH0bkgng&s",
            category: "Antique Furniture",
            condition: "used",
            age: 120,
            material: "Wood",
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "GPS Running Watch",
            description: "Heart rate monitor and GPS enabled",
            price: 2500,
            seller: "Sports World",
            image: "https://m.media-amazon.com/images/I/71e1AtMFVwL._AC_SY300_SX300_QL70_ML2_.jpg",
            category: "GPS Sport Watches",
            condition: "new",
            batteryLife: "14 Days",
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "Nike GP Challenge Pro Running Shoes",
            description: "Comfortable and flexible running shoes",
            price: 5499,
            seller: "Shoe Center",
            image: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b3e20dce-72e7-4dc1-a855-11230c2af926/M+ZOOM+GP+CHALLENGE+PRO+HC.png",
            category: "Running Shoes",
            condition: "new",
            size: 42,
            material: "Fabric",
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "4-Person Camping Tent",
            description: "Waterproof, easy-setup camping tent",
            price: 3200,
            seller: "Camper Market",
            image: "https://cdn.akakce.com/z/quechua/quechua-arpenaz-4-1-family-4-kisilik.jpg",
            category: "Camping Tents",
            condition: "new",
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "Jazz Vinyl Collection",
            description: "Compilation from the best jazz artists",
            price: 800,
            seller: "Ahmet Plak",
            image: "https://preview.redd.it/coltrane-vinyl-collection-v0-s6zxvlv7k1rd1.jpg?width=1080&crop=smart&auto=webp&s=7ddeb35a75dc1ca0bb3f6bb2ab82622cd75d70cf",
            category: "Vinyls",
            condition: "used",
            age: 30,
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "Compact Smart Sport Watch",
            description: "Activity-tracking smart watch",
            price: 1500,
            seller: "Sports World",
            image: "https://m.media-amazon.com/images/I/612irKf4brL._AC_SY300_SX300_QL70_ML2_.jpg",
            category: "GPS Sport Watches",
            condition: "used",
            batteryLife: "7 Days",
            rating: 0,
            reviews: [],
            ratings: []
        }, {
            name: "Antique Table",
            description: "Handmade table crafted from walnut wood",
            price: 12000,
            seller: "Ziya's Antiques",
            image: "https://www.ahsapdiyarim.com/wp-content/uploads/2021/08/CEviz-Masa-4-600x450.jpeg",
            category: "Antique Furniture",
            condition: "used",
            age: 100,
            material: "Walnut",
            rating: 0,
            reviews: [],
            ratings: []
        }];

        await itemscollection.insertMany(seeditems);
        await userscollection.insertMany(seedusers);
        const insertedusers = await userscollection.find({}).toArray();
        const inserteditems = await itemscollection.find({}).toArray();

        // Loop: everyone rates every product once:
        for (const user of insertedusers) {
            // Rule: admin should not rate or review!
            if (user.role === "admin") continue;

            for (const item of inserteditems) {
                const randomscore = Math.floor(Math.random() * 5) + 1;
                const newrating = { userId: user._id.toString(), username: user.username, value: randomscore };
                const newreview = {
                    userId: user._id.toString(),
                    username: user.username,
                    text: `I found this product ${item.name} amazing, highly recommended!`,
                    createdAt: new Date().toISOString()
                };

                // Push rating and review objects into both user and item arrays
                await itemscollection.updateOne(
                    { _id: item._id },
                    { $push: { ratings: newrating, reviews: newreview } } as any
                );

                await userscollection.updateOne(
                    { _id: user._id },
                    {
                        $push: {
                            givenRatings: { itemId: item._id.toString(), itemName: item.name, value: randomscore },
                            reviews: { itemId: item._id.toString(), itemName: item.name, text: newreview.text }
                        }
                    } as any
                );
            }
        }

        // --- Average Rating Recalculation ---
        // Since random ratings were assigned to everything, recalculate averageRating and set them in the database
        const updatedItems = await itemscollection.find({}).toArray();
        for (const it of updatedItems) {
            if (it.ratings && it.ratings.length > 0) {
                const sum = it.ratings.reduce((acc: number, r: any) => acc + r.value, 0);
                const avg = sum / it.ratings.length;
                await itemscollection.updateOne({ _id: it._id }, { $set: { rating: parseFloat(avg.toFixed(1)) } });
            }
        }

        const updatedUsers = await userscollection.find({}).toArray();
        for (const usr of updatedUsers) {
            if (usr.givenRatings && usr.givenRatings.length > 0) {
                const sum = usr.givenRatings.reduce((acc: number, r: any) => acc + r.value, 0);
                const avg = sum / usr.givenRatings.length;
                await userscollection.updateOne({ _id: usr._id }, { $set: { averageRating: parseFloat(avg.toFixed(1)) } });
            }
        }

        return NextResponse.json({ message: "Database created." });
    } catch (error) {
        console.error("Database creation failed.", error);
        return NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
}
