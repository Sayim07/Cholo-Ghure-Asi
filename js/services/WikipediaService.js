/**
 * WikipediaService.js
 * Dynamic worldwide destination knowledge & real photography service
 * Fetches real high-res images, comprehensive history, geography, and cultural facts
 * for ANY location worldwide via Wikipedia REST & Media APIs (100% dynamic, 0 hardcoding).
 * Enhanced with disambiguation auto-resolution and strict icon/lock/symbol filtering.
 */

export class WikipediaService {
  /**
   * Fetches rich summary, authentic history, and original high-resolution hero photo
   * @param {string} placeName - e.g. "Kyoto", "Darjeeling", "Zurich", "Varanasi", "New York"
   */
  static async fetchPlaceSummary(placeName) {
    if (!placeName) return null;

    // Clean query (remove postal codes or administrative suffixes like "Kolkata metropolitan area" -> "Kolkata")
    let cleanTitle = placeName.split(",")[0].trim();
    cleanTitle = cleanTitle.replace(/\b(metropolitan area|urban agglomeration|municipality|district|division|taluk|tehsil|mandal)\b/gi, "").trim();

    try {
      // 1. Try REST API Summary
      let summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`;
      let res = await fetch(summaryUrl);

      if (res.ok) {
        let data = await res.json();

        // Check if disambiguation page (e.g., "New York most commonly refers to: New York City...")
        if (data.type === "disambiguation" || (data.extract && data.extract.toLowerCase().includes("most commonly refers to"))) {
          const refinedTitle = `${cleanTitle} City`;
          const subRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(refinedTitle)}`);
          if (subRes.ok) {
            data = await subRes.json();
            cleanTitle = refinedTitle;
          }
        }

        const heroImage = data.originalimage?.source || data.thumbnail?.source || null;

        return {
          title: data.title || cleanTitle,
          description: data.description || "Historic Global Destination",
          extract: data.extract || "",
          heroImage: this.isValidScenicImage(heroImage) ? heroImage : null,
          coordinates: data.coordinates || null,
          contentUrls: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle)}`
        };
      }
    } catch (e) {
      console.warn("[WikipediaService] REST summary fetch failed, trying search fallback:", e);
    }

    // Fallback: Search Wikipedia API if exact title differed
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTitle + " travel city")}&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const sData = await searchRes.json();
        const firstMatch = sData.query?.search?.[0];
        if (firstMatch) {
          const detailUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstMatch.title)}`;
          const dRes = await fetch(detailUrl);
          if (dRes.ok) {
            const data = await dRes.json();
            const heroImage = data.originalimage?.source || data.thumbnail?.source || null;
            return {
              title: data.title,
              description: data.description || "World Destination",
              extract: data.extract || "",
              heroImage: this.isValidScenicImage(heroImage) ? heroImage : null,
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
   * Filter out non-scenic icons, lock symbols, flags, logos, IPA symbols, etc.
   * Matches against image filename to avoid false positives with hostnames.
   */
  static isValidScenicImage(url) {
    if (!url || typeof url !== "string") return false;
    const lower = url.toLowerCase();
    
    // Disallow SVG or SVG rendered thumbnails, audio, pdf
    if (lower.endsWith(".svg") || lower.includes(".svg.") || lower.endsWith(".ogg") || lower.endsWith(".pdf")) {
      return false;
    }

    // Extract filename portion of the URL
    const fileName = lower.split("/").pop() || "";

    // Strict blacklist of symbols, UI badges, logos, maintenance icons, topographic charts
    const blacklist = [
      "padlock", "lock", "icon", "symbol", "disambig", "logo", "flag",
      "coat_of_arms", "map", "chart", "graph", "diagram", "sign", "button",
      "arrow", "license", "ambox", "portal", "question_book", "ipa",
      "lambda", "greek", "alphabet", "letter", "stub", "pencil", "check",
      "star", "badge", "shield", "seal", "emblem", "circle", "blank",
      "topographic", "aviation", "aeronautical", "onc_", "locator", "boundary",
      "demography", "census", "climate", "hyetograph", "climograph", "satellite",
      "cadastral", "schematic", "plan", "commons-logo", "wikipedia-logo", "wikimedia-button"
    ];

    for (const term of blacklist) {
      if (fileName.includes(term)) return false;
    }

    return true;
  }

  /**
   * Fetches multiple real authentic photography gallery URLs via Wikipedia REST media list & Wikimedia
   * @param {string} placeName
   */
  static async fetchPlaceGallery(placeName) {
    if (!placeName) return [];
    let cleanTitle = placeName.split(",")[0].trim();
    cleanTitle = cleanTitle.replace(/\b(metropolitan area|urban agglomeration|municipality|district|division|taluk|tehsil|mandal)\b/gi, "").trim();

    // 1. Primary fast route: Wikipedia REST media-list API (returns actual embedded article photos in order)
    try {
      const mediaUrl = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(cleanTitle)}`;
      const res = await fetch(mediaUrl);
      if (res.ok) {
        const data = await res.json();
        const photos = (data.items || [])
          .filter(i => i.type === "image" && i.showInGallery && i.srcset && i.srcset.length > 0)
          .map(i => {
            let src = i.srcset[i.srcset.length - 1].src;
            if (src.startsWith("//")) src = "https:" + src;
            return src;
          })
          .filter(u => this.isValidScenicImage(u));

        if (photos.length >= 3) {
          return Array.from(new Set(photos)).slice(0, 12);
        }
      }
    } catch (e) {
      console.warn("[WikipediaService] Primary media-list fetch failed:", e);
    }

    // 2. Secondary fallback: Search tourism/travel article and get its media list
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTitle + " tourism travel")}&utf8=&format=json&origin=*`;
      const sRes = await fetch(searchUrl);
      if (sRes.ok) {
        const sData = await sRes.json();
        const matchTitle = sData.query?.search?.[0]?.title;
        if (matchTitle && matchTitle !== cleanTitle) {
          const mRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(matchTitle)}`);
          if (mRes.ok) {
            const mData = await mRes.json();
            const photos = (mData.items || [])
              .filter(i => i.type === "image" && i.showInGallery && i.srcset && i.srcset.length > 0)
              .map(i => {
                let src = i.srcset[i.srcset.length - 1].src;
                if (src.startsWith("//")) src = "https:" + src;
                return src;
              })
              .filter(u => this.isValidScenicImage(u));

            if (photos.length > 0) {
              return Array.from(new Set(photos)).slice(0, 12);
            }
          }
        }
      }
    } catch (err) {
      console.warn("[WikipediaService] Media search fallback failed:", err);
    }

    // 3. Tertiary fallback: Wikimedia generator query
    try {
      const genUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanTitle)}&generator=images&gimlimit=30&prop=imageinfo&iiprop=url|size&format=json&origin=*`;
      const gRes = await fetch(genUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        const pages = gData.query?.pages || {};
        const images = Object.values(pages)
          .map(p => {
            const info = p.imageinfo?.[0];
            if (!info || !info.url) return null;
            if (info.width && info.width < 350) return null;
            return info.url;
          })
          .filter(u => this.isValidScenicImage(u));

        if (images.length > 0) {
          return Array.from(new Set(images)).slice(0, 8);
        }
      }
    } catch (e) {
      console.warn("[WikipediaService] Generator fallback failed:", e);
    }

    return [];
  }
}
