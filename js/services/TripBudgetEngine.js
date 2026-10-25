/**
 * TripBudgetEngine.js
 * Real-time travel distance, travel duration, and realistic dynamic budget engine
 * Computes actual road / transit distances from origin, lodging tiers, and smart budget fitting.
 */

// Major Indian / Global Departure Hubs
export const ORIGIN_HUBS = [
  { id: "kolkata", name: "Kolkata (CCU)", lat: 22.5726, lon: 88.3639 },
  { id: "delhi", name: "New Delhi (DEL)", lat: 28.6139, lon: 77.2090 },
  { id: "mumbai", name: "Mumbai (BOM)", lat: 19.0760, lon: 72.8777 },
  { id: "bangalore", name: "Bengaluru (BLR)", lat: 12.9716, lon: 77.5946 },
  { id: "chennai", name: "Chennai (MAA)", lat: 13.0827, lon: 80.2707 },
  { id: "hyderabad", name: "Hyderabad (HYD)", lat: 17.3850, lon: 78.4867 },
  { id: "london", name: "London (LHR)", lat: 51.5074, lon: -0.1278 },
  { id: "paris", name: "Paris (CDG)", lat: 48.8566, lon: 2.3522 },
  { id: "newyork", name: "New York (JFK)", lat: 40.7128, lon: -74.0060 },
  { id: "tokyo", name: "Tokyo (HND)", lat: 35.6762, lon: 139.6503 }
];

export const TRANSPORT_MODES = {
  driving: {
    id: "driving",
    name: "Personal Car / SUV",
    icon: "🚗",
    speedKmh: 65,
    ratePerKm: 13, // Fuel + toll
    isPerPerson: false,
    minFare: 500
  },
  train: {
    id: "train",
    name: "Express Train / 3AC",
    icon: "🚆",
    speedKmh: 75,
    ratePerKm: 1.6, // Per passenger km
    isPerPerson: true,
    minFare: 350
  },
  flight: {
    id: "flight",
    name: "Commercial Flight",
    icon: "✈️",
    speedKmh: 650,
    ratePerKm: 4.5,
    isPerPerson: true,
    minFare: 3200
  },
  bus: {
    id: "bus",
    name: "AC Volvo / Intercity",
    icon: "🚌",
    speedKmh: 55,
    ratePerKm: 2.2,
    isPerPerson: true,
    minFare: 450
  }
};

export const STAY_TIERS = {
  budget: {
    id: "budget",
    name: "Backpacker & Homestay",
    icon: "🏕️",
    nightlyRate: 950,
    desc: "Cozy verified hostels, guesthouses & mountain home stays"
  },
  comfort: {
    id: "comfort",
    name: "Boutique 3-Star Hotel",
    icon: "🏨",
    nightlyRate: 2800,
    desc: "Comfortable air-conditioned rooms, breakfast & prime central location"
  },
  luxury: {
    id: "luxury",
    name: "Royal 5-Star Heritage / Resort",
    icon: "🏰",
    nightlyRate: 8500,
    desc: "Luxury suites, infinity pools, fine dining & curated concierge"
  }
};

export class TripBudgetEngine {
  /**
   * Great Circle Haversine Distance in Kilometers
   */
  static haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculates realistic road distance with terrain winding factor
   */
  static calculateRoadDistance(origin, destination) {
    const crowFly = this.haversineKm(origin.lat, origin.lon, destination.latitude, destination.longitude);
    // Road winding factor (mountains/hills have higher winding)
    const windingFactor = crowFly < 100 ? 1.35 : 1.22;
    return Math.max(15, Math.round(crowFly * windingFactor));
  }

  /**
   * Computes travel time based on transport mode and distance
   */
  static calculateTravelTime(distanceKm, modeKey = "driving") {
    const mode = TRANSPORT_MODES[modeKey] || TRANSPORT_MODES.driving;
    if (mode.id === "flight") {
      // 2h airport check-in + flight time
      const flightHours = distanceKm / mode.speedKmh;
      const totalMinutes = Math.round((flightHours + 2) * 60);
      return totalMinutes;
    }
    // Driving or Train
    const hours = distanceKm / mode.speedKmh;
    return Math.round(hours * 60);
  }

  /**
   * Computes comprehensive, itemized realistic budget
   */
  static calculateTripPlan({
    origin,
    destination,
    transportMode = "driving",
    stayTier = "comfort",
    days = 3,
    travelers = 2,
    userBudget = null
  }) {
    const distanceKm = this.calculateRoadDistance(origin, destination);
    const travelTimeMins = this.calculateTravelTime(distanceKm, transportMode);
    const nights = Math.max(1, days - 1);
    const rooms = Math.ceil(travelers / 2);

    const transport = TRANSPORT_MODES[transportMode] || TRANSPORT_MODES.driving;
    const stay = STAY_TIERS[stayTier] || STAY_TIERS.comfort;

    // 1. Transport Cost (Round trip: 2x distance)
    let transportCost = 0;
    if (transport.isPerPerson) {
      transportCost = Math.round(transport.ratePerKm * distanceKm * 2 * travelers);
      transportCost = Math.max(transport.minFare * travelers * 2, transportCost);
    } else {
      // Vehicle fuel + highway tolls
      transportCost = Math.round(transport.ratePerKm * distanceKm * 2);
      transportCost = Math.max(transport.minFare, transportCost);
    }

    // 2. Lodging Cost
    const lodgingCost = stay.nightlyRate * nights * rooms;

    // 3. Food & Daily Experiences (Per person per day)
    let dailyFoodRate = 750;
    if (stayTier === "budget") dailyFoodRate = 500;
    if (stayTier === "luxury") dailyFoodRate = 1800;
    const foodCost = dailyFoodRate * days * travelers;

    // 4. Sightseeing, entry tickets & local activities
    const activitiesCost = Math.round(450 * days * travelers);

    // 5. Emergency buffer (8%)
    const subtotal = transportCost + lodgingCost + foodCost + activitiesCost;
    const bufferCost = Math.round(subtotal * 0.08);

    const totalEstimatedCost = subtotal + bufferCost;

    // 6. Budget Comparison Analysis
    let budgetAnalysis = {
      userBudget: userBudget ? Number(userBudget) : null,
      fits: true,
      difference: 0,
      savings: 0,
      overspend: 0,
      recommendation: null
    };

    if (userBudget && Number(userBudget) > 0) {
      const budgetNum = Number(userBudget);
      budgetAnalysis.userBudget = budgetNum;
      if (totalEstimatedCost <= budgetNum) {
        budgetAnalysis.fits = true;
        budgetAnalysis.savings = budgetNum - totalEstimatedCost;
      } else {
        budgetAnalysis.fits = false;
        budgetAnalysis.overspend = totalEstimatedCost - budgetNum;

        // Formulate smart optimization advice
        if (stayTier === "luxury") {
          budgetAnalysis.recommendation = {
            suggestedStay: "comfort",
            suggestedTransport: transportMode,
            suggestedDays: days,
            reason: `Switch stay to "Boutique 3-Star" to save approx ₹${(STAY_TIERS.luxury.nightlyRate - STAY_TIERS.comfort.nightlyRate) * nights * rooms}`
          };
        } else if (transportMode === "flight") {
          budgetAnalysis.recommendation = {
            suggestedStay: stayTier,
            suggestedTransport: "train",
            suggestedDays: days,
            reason: `Switch to Express Train 🚆 to save approx ₹${Math.round(transportCost * 0.55)}`
          };
        } else if (days > 2) {
          budgetAnalysis.recommendation = {
            suggestedStay: stayTier,
            suggestedTransport: transportMode,
            suggestedDays: days - 1,
            reason: `Reduce trip to ${days - 1} days to fit your budget comfortably`
          };
        } else {
          budgetAnalysis.recommendation = {
            suggestedStay: "budget",
            suggestedTransport: "train",
            suggestedDays: days,
            reason: "Switch to Budget Homestay & Train for an affordable adventure"
          };
        }
      }
    }

    // 7. Day-by-Day Custom Itinerary
    const itinerary = [];
    const destName = destination.shortName || destination.name;
    for (let d = 1; d <= days; d++) {
      if (d === 1) {
        itinerary.push({
          day: 1,
          title: `Arrival & Heritage Orientation`,
          description: `Depart from ${origin.name} via ${transport.name}. Check in at ${stay.name}, acclimatize, and explore vibrant local evening markets.`
        });
      } else if (d === days) {
        itinerary.push({
          day: d,
          title: `Scenic Highlights & Return Journey`,
          description: `Morning sunrise viewpoint, souvenir shopping, and relaxing return journey back to ${origin.name}.`
        });
      } else {
        itinerary.push({
          day: d,
          title: `Signature Sightseeing & Cultural Discovery`,
          description: `Full day exploration of ${destName}'s most celebrated landmarks, nature trails, and authentic regional gastronomy.`
        });
      }
    }

    return {
      distanceKm,
      travelTimeMins,
      transportMode,
      stayTier,
      days,
      nights,
      travelers,
      breakdown: {
        transportCost,
        lodgingCost,
        foodCost,
        activitiesCost,
        bufferCost,
        total: totalEstimatedCost
      },
      budgetAnalysis,
      itinerary
    };
  }

  /**
   * Reverse Budget Matcher
   * Generates 3 viable travel cases given a user's target budget
   */
  static generateBudgetPackages({ origin, destination, userBudget = 25000, travelers = 2 }) {
    const budget = Number(userBudget) || 25000;
    const distanceKm = this.calculateRoadDistance(origin, destination);

    // Case 1: The Backpacker Explorer (Budget Stay + Train/Bus + Max Duration)
    let bDays = 5;
    let bPlan = null;
    while (bDays >= 2) {
      bPlan = this.calculateTripPlan({
        origin,
        destination,
        transportMode: distanceKm > 900 ? "train" : "driving",
        stayTier: "budget",
        days: bDays,
        travelers
      });
      if (bPlan.breakdown.total <= budget || bDays === 2) break;
      bDays--;
    }

    // Case 2: The Balanced Comfort Voyager (3-Star Hotel + Express Train / SUV)
    let cDays = 3;
    let cPlan = null;
    while (cDays >= 2) {
      cPlan = this.calculateTripPlan({
        origin,
        destination,
        transportMode: distanceKm > 1200 ? "flight" : "train",
        stayTier: "comfort",
        days: cDays,
        travelers
      });
      if (cPlan.breakdown.total <= budget || cDays === 2) break;
      cDays--;
    }

    // Case 3: The Curated Luxury Escape (5-Star Heritage / Flight / Luxury)
    let lDays = 2;
    let lPlan = this.calculateTripPlan({
      origin,
      destination,
      transportMode: "flight",
      stayTier: "luxury",
      days: lDays,
      travelers
    });
    if (lPlan.breakdown.total > budget * 1.3) {
      lPlan = this.calculateTripPlan({
        origin,
        destination,
        transportMode: "driving",
        stayTier: "luxury",
        days: 2,
        travelers
      });
    }

    return [
      {
        id: "case-backpacker",
        badge: "🎒 Maximum Explorer",
        title: "The Backpacker & Culture Trail",
        transportMode: bPlan.transportMode,
        stayTier: bPlan.stayTier,
        days: bPlan.days,
        travelers,
        plan: bPlan,
        savings: Math.max(0, budget - bPlan.breakdown.total),
        fits: bPlan.breakdown.total <= budget,
        highlights: [
          `Stay at authentic mountain homestay / verified hostel`,
          `Travel via ${TRANSPORT_MODES[bPlan.transportMode]?.name || "Train"}`,
          `Maximized ${bPlan.days} days exploration for deep local discovery`,
          `Street food trails, walking tours & scenic viewpoints`
        ]
      },
      {
        id: "case-comfort",
        badge: "⭐ Most Popular & Balanced",
        title: "The Boutique Comfort Journey",
        transportMode: cPlan.transportMode,
        stayTier: cPlan.stayTier,
        days: cPlan.days,
        travelers,
        plan: cPlan,
        savings: Math.max(0, budget - cPlan.breakdown.total),
        fits: cPlan.breakdown.total <= budget,
        highlights: [
          `Stay at 3-Star AC Boutique hotel with breakfast included`,
          `Fast comfortable transit via ${TRANSPORT_MODES[cPlan.transportMode]?.name || "Train"}`,
          `Curated ${cPlan.days}-day schedule balancing sightseeing & relaxation`,
          `Prime central location near top-rated restaurants & cafes`
        ]
      },
      {
        id: "case-luxe",
        badge: "👑 Royal Luxury Escape",
        title: "The Heritage & Grandeur Getaway",
        transportMode: lPlan.transportMode,
        stayTier: lPlan.stayTier,
        days: lPlan.days,
        travelers,
        plan: lPlan,
        savings: Math.max(0, budget - lPlan.breakdown.total),
        fits: lPlan.breakdown.total <= budget,
        highlights: [
          `5-Star Luxury Resort or Heritage Palace suite`,
          `Expedited premium travel via ${TRANSPORT_MODES[lPlan.transportMode]?.name || "Flight"}`,
          `Exclusive fine dining & sunset viewpoints`,
          `Curated private transfers & VIP sightseeing concierge`
        ]
      }
    ];
  }
}
