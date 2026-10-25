/**
 * WikipediaService.js
 * Dynamic worldwide destination knowledge & real photography service
 * Fetches real high-res images, comprehensive history, geography, and cultural facts
 * for ANY location worldwide via Wikipedia REST & Media APIs (100% dynamic, 0 hardcoding).
 */

export class WikipediaService {
  /**
   * Fetches rich summary, authentic history, and original high-resolution hero photo
   * @param {string} placeName - e.g. "Kyoto", "Darjeeling", "Zurich", "Varanasi"
   */
  static async fetchPlaceSummary(placeName) {
    if (!placeName) return null;

    // Clean query (remove postal codes or trailing details like "Kyoto, Japan" -> "Kyoto")
    const cleanTitle = placeName.split(",")[0].trim();

    try {
      // 1. Try REST API Summary
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`;
      const res = await fetch(summaryUrl);

      if (res.ok) {
        const data = await res.json();
        const heroImage = data.originalimage?.source || data.thumbnail?.source || null;

        return {
          title: data.title || cleanTitle,
          description: data.description || "Historic Destination",
          extract: data.extract || "",
          heroImage,
          coordinates: data.coordinates || null,
          contentUrls: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle)}`
        };
      }
    } catch (e) {
      console.warn("[WikipediaService] REST summary fetch failed, trying search fallback:", e);
    }

    // Fallback: Search Wikipedia API if exact title differed
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTitle)}&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const sData = await searchRes.json();
        const firstMatch = sData.query?.search?.[0];
        if (firstMatch) {
          const detailUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstMatch.title)}`;
          const dRes = await fetch(detailUrl);
          if (dRes.ok) {
            const data = await dRes.json();
            return {
              title: data.title,
              description: data.description || "World Destination",
              extract: data.extract || "",
              heroImage: data.originalimage?.source || data.thumbnail?.source || null,
              coordinates: data.coordinates || null,
              contentUrls: data.content_urls?.desktop?.page || null
            };
          }
        }
      }
    } catch (err) {
      console.warn("[WikipediaService] Search fallback failed:", err);
    }

    return null;
  }

  /**
   * Fetches multiple real authentic photography gallery URLs from Wikimedia Commons
   * @param {string} placeName
   */
  static async fetchPlaceGallery(placeName) {
    const cleanTitle = placeName.split(",")[0].trim();
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanTitle)}&generator=images&gimlimit=10&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const pages = data.query?.pages || {};
        const images = Object.values(pages)
          .map(p => p.imageinfo?.[0]?.url)
          .filter(u => u && !u.endsWith(".svg") && !u.endsWith(".ogg") && !u.endsWith(".pdf") && !u.includes("Flag") && !u.includes("Coat_of_arms"));
        return images.slice(0, 6);
      }
    } catch (e) {
      console.warn("[WikipediaService] Gallery fetch failed:", e);
    }
    return [];
  }
}
