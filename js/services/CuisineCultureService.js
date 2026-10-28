/**
 * CuisineCultureService.js
 * Dynamic Gastronomy & Cultural Heritage Discovery Engine for Any Destination Worldwide
 * Generates authentic signature dishes, legendary street food corridors, historic cafes,
 * artisan craft quarters, and living seasonal traditions with high-res foodie photography.
 */

export class CuisineCultureService {
  /**
   * Fetch complete gastronomy and cultural heritage data for a destination
   * @param {Object} dest Destination object { name, shortName, latitude, longitude, ... }
   * @param {Object} wikiData Wikipedia summary extract & metadata
   */
  static getCuisineAndCulture(dest = {}, wikiData = {}) {
    const rawName = (dest.shortName || dest.name || wikiData.title || "").toLowerCase();
    const cleanName = dest.shortName || dest.name || wikiData.title || "Destination";
    const desc = `${rawName} ${dest.desc || ""} ${wikiData.extract || ""}`.toLowerCase();

    // 1. Kolkata (The Cultural & Culinary Capital of India)
    if (rawName.includes("kolkata") || rawName.includes("calcutta")) {
      return {
        tagline: "The City of Joy's Legendary Culinary Legacy & Cultural Renaissance",
        quote: "In Kolkata, food is not merely sustenance — it is a passionate intellectual religion and an emotional poetry celebrated at every street corner.",
        signatureDishes: [
          {
            id: "kol_biryani",
            name: "Royal Kolkata Dum Biryani",
            localName: "কলকাতা দম বিরিয়ানি",
            tag: "Awadhi Royal Legacy",
            diet: "Non-Veg",
            rating: "4.9",
            price: "₹ 260 - ₹ 420",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
            desc: "Fragrant long-grain basmati infused with saffron, mace, and rose essence, crowned with a melt-in-mouth slow-cooked spiced potato (aloo) and boiled egg.",
            famousSpot: "Arsalan (Park Circus) & Shiraz Golden Restaurant",
            timing: "Best for Lunch & Dinner (12 PM - 11 PM)"
          },
          {
            id: "kol_sweets",
            name: "Claypot Mishti Doi & Warm Baked Rosogolla",
            localName: "মিষ্টি দই ও স্পঞ্জ রসগোল্লা",
            tag: "Centuries-Old Confectionery",
            diet: "Veg",
            rating: "5.0",
            price: "₹ 40 - ₹ 150",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
            desc: "Caramelized earthen-fermented sweetened curd alongside spongy cottage cheese orbs bathed in hot cardamom syrup, crafted to royal 19th-century recipes.",
            famousSpot: "Balaram Mullick, K.C. Das & Nobin Chandra Das",
            timing: "All Day (8 AM - 10 PM)"
          },
          {
            id: "kol_kathi_roll",
            name: "Nizam's Crispy Mutton Kathi Kebab Roll",
            localName: "নিজামের কাঠি রোল",
            tag: "World-Famous Street Icon",
            diet: "Non-Veg",
            rating: "4.8",
            price: "₹ 80 - ₹ 180",
            image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80",
            desc: "Charcoal-smoked tender mutton boti rolled inside a flaky, golden layered paratha with crisp red onions, green chillies, and a spritz of fresh lime.",
            famousSpot: "Nizam's (New Market) & Kusum Rolls (Park Street)",
            timing: "Evening Street Food (4 PM - 11 PM)"
          },
          {
            id: "kol_puchka",
            name: "Kolkata Phuchka with Gondhoraj Lemon Water",
            localName: "কলকাতার ফুচকা",
            tag: "Crispy Street Sensation",
            diet: "Veg",
            rating: "4.9",
            price: "₹ 30 - ₹ 60 (6 pcs)",
            image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80",
            desc: "Ultra-crisp wholewheat shells filled with warm spiced mashed potato, black chickpeas, and immersed in tangy tamarind water laced with Gondhoraj lime.",
            famousSpot: "Dacres Lane & Vivekananda Park Phuchka Vendors",
            timing: "Evening Promenade (3:30 PM - 9:30 PM)"
          },
          {
            id: "kol_indo_chinese",
            name: "Tangra Chilli Garlic Hakka Chowmein",
            localName: "টাংরা চাইনিজ চাউমিন",
            tag: "Historic Indo-Chinese Fusion",
            diet: "Non-Veg",
            rating: "4.7",
            price: "₹ 180 - ₹ 340",
            image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80",
            desc: "Wok-tossed noodles with smoky spring onions, fiery dark soy, fresh green chillies, and shredded chicken born in India's only authentic Chinatown.",
            famousSpot: "Beijing Restaurant & Kim Ling (Tangra Chinatown)",
            timing: "Dinner (6 PM - 11 PM)"
          },
          {
            id: "kol_macher_jhol",
            name: "Steamed Ilish Paturi & Macher Jhol",
            localName: "ইলিশ পাতুড়ি ও ভাপা মাছ",
            tag: "Quintessential Bengali Heritage",
            diet: "Non-Veg",
            rating: "4.9",
            price: "₹ 350 - ₹ 650",
            image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80",
            desc: "Tender Hilsa fish wrapped in fresh banana leaves, steamed in stone-ground mustard paste, green chilli oil, and served over piping hot fragrant rice.",
            famousSpot: "6 Ballygunge Place, Oh! Calcutta & Kasturi",
            timing: "Traditional Lunch (12:30 PM - 4 PM)"
          }
        ],
        streetEateries: [
          {
            name: "Dacres Lane (James Hickey Sarani)",
            badge: "Historic British Era Food Alley",
            hours: "10:00 AM - 8:30 PM",
            specialty: "Chitto Da's Chicken Stew, butter toast & crunchy fish roll",
            vibe: "Buzzing lunch-hour corridor teeming with office crowds & heritage aroma",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
            priceRange: "₹ 60 - ₹ 150 per person"
          },
          {
            name: "Indian Coffee House (College Street)",
            badge: "Intellectual Adda Landmark (Est. 1876)",
            hours: "9:00 AM - 8:30 PM",
            specialty: "Hot Infusion Black Coffee, Mutton Cutlet & Toast",
            vibe: "High colonial ceilings, spinning fan blades & animated student debates",
            image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
            priceRange: "₹ 40 - ₹ 120 per person"
          },
          {
            name: "Flurys Tearoom & Bakery (Park Street)",
            badge: "European Nostalgia Tearoom (Est. 1927)",
            hours: "7:30 AM - 10:30 PM",
            specialty: "Darjeeling First Flush Tea, Rum Balls & English Breakfast",
            vibe: "Gentlemanly vintage elegance, pastel pink decor & heritage confectionery",
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            priceRange: "₹ 350 - ₹ 800 per person"
          },
          {
            name: "Tiretta Bazaar Early Morning Chinese Breakfast",
            badge: "Dawn Street Market (India's Old Chinatown)",
            hours: "6:00 AM - 8:30 AM (Sun & Daily Dawn)",
            specialty: "Steaming Pork Momos, Tai Pao Buns & Fish Meatball Soup",
            vibe: "Atmospheric lantern-lit dawn market prepared fresh on street steamers",
            image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
            priceRange: "₹ 80 - ₹ 180 per person"
          }
        ],
        craftsAndArts: [
          {
            title: "Kumartuli Clay Idol Sculptors Quarter",
            category: "Centuries-Old Living Guild",
            desc: "Labyrinthine riverfront atelier where generational master craftsmen sculpt monumental clay effigies using sacred Hooghly silt and straw frames.",
            souvenir: "Miniature handcrafted clay figurines & terracotta artifacts",
            image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
          },
          {
            title: "Handloom Baluchari & Jamdani Silk Weaving",
            category: "Heritage Textile Guilds",
            desc: "Legendary handwoven Bengal sarees depicting intricate mythological scenes, fine muslin gossamer threads, and royal courtly patterns.",
            souvenir: "Certified authentic Handloom Jamdani stoles & sarees",
            image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
          },
          {
            title: "Kalighat Patachitra & Terracotta Craft",
            category: "Traditional Folk Visual Art",
            desc: "Folk scroll paintings with sweeping expressive brushstrokes and clay pottery originating from the ancient Kalighat temple quarter.",
            souvenir: "Framed handmade Patachitra folk paintings",
            image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80"
          }
        ],
        festivalsAndTraditions: [
          {
            title: "Durga Puja Spectacle (UNESCO Heritage)",
            season: "Autumn • Ashwin Month (Sept - Oct)",
            desc: "The world's largest ephemeral open-air art installation festival featuring thousands of architectural pandals, dhak drummers, and ecstatic evening dhunuchi dances.",
            highlight: "UNESCO Intangible Cultural Heritage of Humanity"
          },
          {
            title: "The Art of 'Adda' (Intellectual Banter)",
            season: "Year-Round Evening Ritual",
            desc: "An unbroken tradition of gathering on street corners, tea shacks, and verandahs to dissect politics, poetry, football, and cinema over clay cups of cha.",
            highlight: "Essential social fabric of Bengali everyday life"
          },
          {
            title: "Historic Tram Car Promenade",
            season: "Daily Morning & Sunset",
            desc: "Asia's oldest operating electric tram network rattling gently through the lush emerald green Maidan and historic colonial boulevards.",
            highlight: "Romantic, slow-travel heritage experience"
          }
        ],
        etiquette: [
          "🍵 Sip roadside 'Bhaanr er Cha' (tea in disposable terracotta earthen cups) for the earthiest aroma.",
          "🚖 Kolkata yellow ambassador taxis operate on regulated meter rates or fixed pre-paid airport/station booths.",
          "🤝 A friendly conversation about local football (East Bengal vs Mohun Bagan) or Rabindranath Tagore instantly wins hearts.",
          "🌶️ Traditional Bengali cuisine is eaten in courses: bitter (shukto) first, then lentils, followed by fish/meat, and sweet dessert last."
        ]
      };
    }

    // 2. Darjeeling (Queen of the Hills)
    if (rawName.includes("darjeeling") || rawName.includes("kurseong")) {
      return {
        tagline: "Himalayan Mist, First-Flush Teas & Tibetan Mountain Gastronomy",
        quote: "Sip golden champagne teas overlooking snow-clad Kanchenjunga while momo steamers whisper in the mountain breeze.",
        signatureDishes: [
          {
            id: "darj_tea",
            name: "Darjeeling First Flush Spring Muscatel Tea",
            localName: "দার্জিলিং চা",
            tag: "The Champagne of Teas",
            diet: "Veg",
            rating: "5.0",
            price: "₹ 80 - ₹ 250",
            image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
            desc: "Delicate amber liquor picked from high-altitude misty slopes with floral muscatel notes, served plain without milk to honor pure terroir.",
            famousSpot: "Nathmulls Tea Lounge & Glenary's (Mall Road)",
            timing: "Sunrise to Sunset (7 AM - 7 PM)"
          },
          {
            id: "darj_momos",
            name: "Himalayan Steamed Momos with Fire Dalle Chutney",
            localName: "মোমো ও ডাল্লে চাটনি",
            tag: "Himalayan Mountain Comfort",
            diet: "Non-Veg",
            rating: "4.9",
            price: "₹ 80 - ₹ 150",
            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80",
            desc: "Juicy hand-pinched dumplings packed with spiced minced pork or chicken, served with a fiery chutney made from local round Dalle Khursani chillies.",
            famousSpot: "Kunga Restaurant & Dekevas (Gandhi Road)",
            timing: "Lunch & Evening (11 AM - 8:30 PM)"
          },
          {
            id: "darj_thukpa",
            name: "Tibetan Artisan Thukpa Noodle Broth",
            localName: "তিব্বতি ঠুকপা",
            tag: "Soul-Warming Mountain Soup",
            diet: "Non-Veg",
            rating: "4.8",
            price: "₹ 110 - ₹ 190",
            image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
            desc: "Handmade wheat noodles bathed in a slow-simmered herbal broth with mountain cabbage, coriander, and thinly sliced seasoned meats.",
            famousSpot: "Kunga Restaurant & Sonam's Kitchen",
            timing: "Ideal for chilly misty afternoons"
          },
          {
            id: "darj_glenarys",
            name: "Glenary's Apple Pie & Fresh Cinnamon Buns",
            localName: "গ্লেনারিজ পেস্ট্রি",
            tag: "Colonial Bakery Tradition",
            diet: "Veg",
            rating: "4.9",
            price: "₹ 90 - ₹ 220",
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
            desc: "Freshly baked warm flaky crust with spiced cinnamon apples and dark rum balls crafted since 1913 inside an alpine stone bakery.",
            famousSpot: "Glenary's Bakery & Cafe (Nehru Road)",
            timing: "Morning Breakfast & Teatime"
          }
        ],
        streetEateries: [
          {
            name: "Glenary's Bakery, Cafe & Pub (Est. 1913)",
            badge: "Centennial Alpine Tearoom",
            hours: "7:00 AM - 9:30 PM",
            specialty: "English Roast Breakfast, Apple Strudel & Red Wine",
            vibe: "Panoramic mountain glass windows overlooking the Himalayan valley",
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
            priceRange: "₹ 250 - ₹ 600 per person"
          },
          {
            name: "Keventer's Open Roof Restaurant (Est. 1911)",
            badge: "Himalayan Heritage Terrace",
            hours: "8:00 AM - 6:30 PM",
            specialty: "Full English breakfast, meat platter & cold chocolate shake",
            vibe: "Open-air wooden terrace facing the snow-capped peak of Kanchenjunga",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
            priceRange: "₹ 200 - ₹ 450 per person"
          }
        ],
        craftsAndArts: [
          {
            title: "Tibetan Refugee Self Help Center Weaving",
            category: "Handknotted Mountain Craft",
            desc: "Traditional woolen carpets, yak-wool stoles, and woodcarvings hand-knotted by Tibetan master craftspeople.",
            souvenir: "Pure woolen prayer shawls & singing bowls",
            image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
          }
        ],
        festivalsAndTraditions: [
          {
            title: "Tibetan Losar New Year Celebrations",
            season: "Winter • February",
            desc: "Monastery trumpet ceremonies, sacred Cham mask dances, and lighting of thousand butter lamps at Ghoom Monastery.",
            highlight: "Ancient spiritual mountain heritage"
          }
        ],
        etiquette: [
          "☕ Never add milk to high-grade Darjeeling First Flush tea — it masks the delicate floral notes.",
          "🏔️ Dress in flexible layers; mountain temperatures change drastically when clouds roll over the ridge."
        ]
      };
    }

    // 3. Tokyo / Japan
    if (rawName.includes("tokyo") || rawName.includes("kyoto") || rawName.includes("osaka") || rawName.includes("japan")) {
      return {
        tagline: "Edo Culinary Precision, Michelin Ramen & Zen Artisanship",
        quote: "Japanese cuisine (Washoku) reveres seasonality and the sacred balance between flavor, aesthetic elegance, and mindfulness.",
        signatureDishes: [
          {
            id: "tokyo_ramen",
            name: "Tokyo Shoyu & Tonkotsu Chashu Ramen",
            localName: "東京醤油ラーメン",
            tag: "Legendary Noodle Craft",
            diet: "Non-Veg",
            rating: "4.9",
            price: "¥ 950 - ¥ 1,450",
            image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
            desc: "Slow-simmered 18-hour broth, springy handmade alkaline noodles, melt-in-mouth braised pork chashu, and a soft-boiled soy-marinated ajitsuke tamago.",
            famousSpot: "Ramen Street (Tokyo Station) & Ichiran Shibuya",
            timing: "All Day (11 AM - Midnight)"
          },
          {
            id: "tokyo_sushi",
            name: "Edomae Nigiri Omakase Sushi",
            localName: "江戸前握り寿司",
            tag: "Culinary Artistry Masterclass",
            diet: "Non-Veg",
            rating: "5.0",
            price: "¥ 3,500 - ¥ 12,000",
            image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
            desc: "Fresh morning tuna (Otoro), sea urchin (Uni), and sweet prawns hand-brushed with nikiri soy sauce over seasoned warm Akasu vinegar rice.",
            famousSpot: "Tsukiji Outer Market & Ginza Kyubey",
            timing: "Breakfast & Dinner"
          },
          {
            id: "tokyo_wagyu",
            name: "A5 Black Wagyu Sukiyaki & Teppanyaki",
            localName: "A5 黒毛和牛すき焼き",
            tag: "Imperial Luxury Beef",
            diet: "Non-Veg",
            rating: "5.0",
            price: "¥ 6,000 - ¥ 18,000",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
            desc: "Heavily marbled A5 Miyazaki beef slices seared in sweet soy broth and dipped in pasteurized fresh egg for velvety decadence.",
            famousSpot: "Ningyocho Imahan & Shinjuku Teppan",
            timing: "Dinner (5 PM - 10:30 PM)"
          }
        ],
        streetEateries: [
          {
            name: "Omoide Yokocho (Memory Lane, Shinjuku)",
            badge: "Vintage Post-War Lantern Alley",
            hours: "5:00 PM - 1:00 AM",
            specialty: "Charcoal Yakitori skewers, highballs & gyoza",
            vibe: "Atmospheric smoky alleys with tiny 6-seater izakaya bars",
            image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
            priceRange: "¥ 1,500 - ¥ 3,000 per person"
          }
        ],
        craftsAndArts: [
          {
            title: "Edo Kiriko Cut Glass & Damascus Chef Knives",
            category: "Centuries-Old Metal & Glass Guilds",
            desc: "Hand-ground geometric crystal glassware and hand-forged 67-layer Japanese kitchen knives revered by chefs worldwide.",
            souvenir: "Custom engraved Santoku kitchen knife",
            image: "https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?auto=format&fit=crop&w=800&q=80"
          }
        ],
        festivalsAndTraditions: [
          {
            title: "Sakura Cherry Blossom Hanami Picnics",
            season: "Spring • Late March - Early April",
            desc: "Gathering under blooming cherry canopies along the Meguro River and Ueno Park with bento boxes and celebratory sake.",
            highlight: "National seasonal celebration of transient beauty"
          }
        ],
        etiquette: [
          "🍜 Slurping your hot noodles loudly is considered polite and shows appreciation to the chef.",
          "💴 Tipping is not customary in Japan and may cause confusion; exceptional service is already standard."
        ]
      };
    }

    // 4. Paris / France
    if (rawName.includes("paris") || rawName.includes("france") || rawName.includes("nice") || rawName.includes("lyon")) {
      return {
        tagline: "Haute Cuisine, Artisan Boulangeries & Parisian Bistro Romance",
        quote: "To eat in Paris is to participate in an ancient civil art form celebrating butter, wine, and unhurried conversation.",
        signatureDishes: [
          {
            id: "paris_croissant",
            name: "Artisan Laminated Butter Croissant",
            localName: "Croissant au Beurre Artisanal",
            tag: "Boulangerie Golden Icon",
            diet: "Veg",
            rating: "5.0",
            price: "€ 1.50 - € 3.20",
            image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
            desc: "Shatteringly crisp golden honeycomb layers made with Normandy PDO cultured butter, pillowy soft inside with rich nutty aroma.",
            famousSpot: "Du Pain et des Idées & Cedric Grolet",
            timing: "Morning Breakfast (7 AM - 11 AM)"
          },
          {
            id: "paris_steak_frites",
            name: "Entrecôte Steak Frites with Herb Butter Sauce",
            localName: "Steak Frites Sauce Secrète",
            tag: "Classic French Bistro Standard",
            diet: "Non-Veg",
            rating: "4.9",
            price: "€ 22 - € 38",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
            desc: "Charred grass-fed ribeye carved into medallions, drenched in emerald tarragon butter sauce, accompanied by endless crispy fries.",
            famousSpot: "Le Relais de l'Entrecôte & Bouillon Chartier",
            timing: "Lunch & Dinner"
          }
        ],
        streetEateries: [
          {
            name: "Café de Flore (Saint-Germain-des-Prés)",
            badge: "Historic Literary Cafe (Est. 1887)",
            hours: "7:30 AM - 1:30 AM",
            specialty: "Chocolat Chaud l'Ancienne & Croque Monsieur",
            vibe: "Sidewalk wicker chairs where Sartre, Picasso and Hemingway once wrote",
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            priceRange: "€ 15 - € 35 per person"
          }
        ],
        craftsAndArts: [
          {
            title: "Atelier Haute Perfumery & Seine Bouquinistes",
            category: "Heritage Artisan Traditions",
            desc: "Bespoke fragrance laboratories crafting scents and green open-air wooden bookstalls lining the Left Bank of the Seine.",
            souvenir: "Custom artisan perfume & vintage prints",
            image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80"
          }
        ],
        festivalsAndTraditions: [
          {
            title: "Fête de la Musique (Solstice Music Festival)",
            season: "Summer • June 21",
            desc: "The entire city transforms into an open amphitheater with free live concerts echoing on bridges, courtyards, and plazas.",
            highlight: "City-wide celebration of sonic arts"
          }
        ],
        etiquette: [
          "🥖 Always greet the shopkeeper with 'Bonjour Madame/Monsieur' before ordering.",
          "🍷 Dinners in Parisian bistros are leisurely; it is customary to keep your table for the whole evening."
        ]
      };
    }

    // 5. Dynamic Intelligent Adaptor for ANY Global Destination
    const isCoastal = desc.includes("coast") || desc.includes("sea") || desc.includes("beach") || desc.includes("island") || desc.includes("ocean");
    const isMountain = desc.includes("mountain") || desc.includes("hill") || desc.includes("peak") || desc.includes("alps") || desc.includes("altitude");
    const isIndia = desc.includes("india") || desc.includes("bengal") || desc.includes("pradesh") || desc.includes("karnataka") || desc.includes("rajasthan") || desc.includes("tamil");

    let dish1, dish2, dish3, dish4;

    if (isCoastal) {
      dish1 = {
        id: "gen_seafood",
        name: `Fresh Coastal Seafood & Catch of the Day in ${cleanName}`,
        localName: "Regional Catch",
        tag: "Fresh Ocean Terroir",
        diet: "Non-Veg",
        rating: "4.9",
        price: isIndia ? "₹ 350 - ₹ 600" : "$ 18 - $ 35",
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80",
        desc: `Wild-caught fish and succulent prawns grilled over fragrant coastal woods, seasoned with indigenous herbs and cold-pressed local oils.`,
        famousSpot: `Local Harbour Promenade & Traditional Fishermen Taverns`,
        timing: "Lunch & Dinner"
      };
      dish2 = {
        id: "gen_coastal_stew",
        name: `Spiced Coconut Seafood Stew & Fragrant Rice`,
        localName: "Coastal Special",
        tag: "Coastal Home Tradition",
        diet: "Non-Veg",
        rating: "4.8",
        price: isIndia ? "₹ 240 - ₹ 450" : "$ 16 - $ 28",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
        desc: `Creamy coconut milk broth simmered with local tamarind, aromatic curry leaves, and tender seafood dumplings.`,
        famousSpot: `Harbour Viewpoint Bistros & Beachside Shacks`,
        timing: "Evening Sunset Special"
      };
    } else if (isMountain) {
      dish1 = {
        id: "gen_alpine_stew",
        name: `Alpine Stone-Baked Bread & Mountain Broth`,
        localName: "High Altitude Feast",
        tag: "Alpine Warmth",
        diet: "Veg",
        rating: "4.9",
        price: isIndia ? "₹ 180 - ₹ 350" : "$ 14 - $ 25",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
        desc: `Slow-simmered highland vegetable and herb soup paired with freshly baked wood-fired sourdough crusts.`,
        famousSpot: `Mountain Ridge Cafes & Village Bakeries`,
        timing: "Chilly Afternoons & Evenings"
      };
      dish2 = {
        id: "gen_mountain_cheese",
        name: `Artisanal Aged Highland Cheese & Wild Berries`,
        localName: "Mountain Dairy Heritage",
        tag: "Organic Highland Craft",
        diet: "Veg",
        rating: "4.8",
        price: isIndia ? "₹ 220 - ₹ 420" : "$ 12 - $ 22",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
        desc: `Handcrafted semi-hard cheese aged in cool mountain cellars, accompanied by wild mountain berry preserves.`,
        famousSpot: `Alpine Co-operative Dairies & Ridge Lodges`,
        timing: "Teatime & Breakfast"
      };
    } else {
      dish1 = {
        id: "gen_heritage_curry",
        name: `Signature Regional Feast & Hearth Stew of ${cleanName}`,
        localName: "Signature Special",
        tag: "Generational Heritage Recipe",
        diet: "Non-Veg",
        rating: "4.9",
        price: isIndia ? "₹ 250 - ₹ 480" : "$ 16 - $ 32",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
        desc: `Traditional slow-cooked recipe honoring centuries of ${cleanName}'s authentic culinary roots, spices, and hearth cooking.`,
        famousSpot: `Heritage Old Town Quarter & Celebrated Family Kitchens`,
        timing: "Lunch & Dinner"
      };
      dish2 = {
        id: "gen_artisan_pastry",
        name: `Handmade Regional Confectionery & Sweet Pastries`,
        localName: "Artisan Dessert",
        tag: "Sweet Local Tradition",
        diet: "Veg",
        rating: "4.8",
        price: isIndia ? "₹ 60 - ₹ 180" : "$ 5 - $ 12",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
        desc: `Crisp flaky crusts stuffed with local sweet delicacies, caramelized fruits, and wild blossom honeys.`,
        famousSpot: `Old Town Central Bakeries & Tea Lounges`,
        timing: "Morning to Evening"
      };
    }

    dish3 = {
      id: "gen_street_special",
      name: `Signature Street Savory Platter of ${cleanName}`,
      localName: "Street Delicacy",
      tag: "Buzzing Street Culture",
      diet: "Veg",
      rating: "4.8",
      price: isIndia ? "₹ 80 - ₹ 180" : "$ 8 - $ 15",
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80",
      desc: `Crisp golden street fritters and savory street delicacies freshly prepared on open hot plates across market corners.`,
      famousSpot: `Central Market Plaza & Twilight Bazaar`,
      timing: "Evening Promenade (4 PM - 10 PM)"
    };

    dish4 = {
      id: "gen_beverage",
      name: `Artisanal Regional Brew & Infusion of ${cleanName}`,
      localName: "Local Roast",
      tag: "Indigenous Drink",
      diet: "Veg",
      rating: "4.9",
      price: isIndia ? "₹ 40 - ₹ 140" : "$ 4 - $ 8",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
      desc: `Locally roasted beans or wild alpine herbal infusions brewed fresh to accompany animated street conversation.`,
      famousSpot: `Historic Square Cafes & Tea Stalls`,
      timing: "Morning & Sunset"
    };

    return {
      tagline: `Gastronomic Tapestry & Living Heritage of ${cleanName}`,
      quote: `Every authentic dish in ${cleanName} carries the soul of its landscape, historical dynasties, and generational craftsmanship.`,
      signatureDishes: [dish1, dish2, dish3, dish4],
      streetEateries: [
        {
          name: `${cleanName} Historic Old Town Bazaar & Alley`,
          badge: "Heritage Food Corridor",
          hours: "9:00 AM - 9:30 PM",
          specialty: `Authentic regional skewers, hot savory pastries & spiced tea`,
          vibe: "Cobblestone alleyway with vibrant street aromas & friendly master cooks",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          priceRange: isIndia ? "₹ 100 - ₹ 250" : "$ 10 - $ 25"
        },
        {
          name: `${cleanName} Central Grand Tearoom`,
          badge: "Vintage Heritage Gathering Place",
          hours: "8:00 AM - 8:00 PM",
          specialty: "Fresh baked artisan buns, roasted house blend & local savories",
          vibe: "Relaxed historic ambiance overlooking the main town square",
          image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
          priceRange: isIndia ? "₹ 150 - ₹ 400" : "$ 12 - $ 28"
        }
      ],
      craftsAndArts: [
        {
          title: `Traditional Master Artisanship & Guilds of ${cleanName}`,
          category: "Living Heritage Art",
          desc: `Generationally preserved handcrafted wares, textiles, and fine pottery made using ancient indigenous techniques.`,
          souvenir: `Handcrafted regional art & locally woven textiles`,
          image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80"
        }
      ],
      festivalsAndTraditions: [
        {
          title: `${cleanName} Seasonal Harvest & Folklore Carnival`,
          season: "Annual Regional Calendar",
          desc: `Vibrant traditional dances, folk melodies, and colorful public feasts celebrating community heritage and local folklore.`,
          highlight: "Vibrant regional celebration of cultural pride"
        }
      ],
      etiquette: [
        `🍽️ Seek out busy family-run kitchens where locals gather for authentic home flavors.`,
        `🤝 Greet shopkeepers and artisans with courteous local salutations to build instant rapport.`
      ]
    };
  }
}
