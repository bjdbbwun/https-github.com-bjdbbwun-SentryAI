/**
 * Google Safe Browsing Service
 * Production-ready, strictly-typed integration for Google Safe Browsing Lookup API (v4).
 */

export interface GoogleSafeBrowsingResult {
  success: boolean;
  isMalicious: boolean;
  threatCategories: string[];
  message: string;
  source: "Google Safe Browsing";
  status: "malicious" | "clean" | "error" | "no_data";
  errorDetails?: string;
}

/**
 * Checks URL reputation against the Google Safe Browsing API.
 * 
 * If running in the browser, it routes via the local Express proxy to avoid CORS 
 * issues and keep the API key fully secure on the server side.
 * If running in a Node.js/server context, it queries the Google API directly.
 */
export async function checkUrlReputation(url: string): Promise<GoogleSafeBrowsingResult> {
  const defaultResult: GoogleSafeBrowsingResult = {
    success: false,
    isMalicious: false,
    threatCategories: [],
    message: "No reputation data returned by Google Safe Browsing.",
    source: "Google Safe Browsing",
    status: "no_data"
  };

  if (!url || typeof url !== "string" || !url.trim()) {
    return defaultResult;
  }

  const cleanUrl = url.trim();

  // Determine environment: browser vs server-side Node.js
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    // Client-side execution: Call our Express API Proxy
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout

    try {
      const response = await fetch("/api/v1/safe-browsing/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: cleanUrl }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        return {
          ...defaultResult,
          message: "No reputation data returned by Google Safe Browsing.",
          status: "error",
          errorDetails: `Authorization or key issue: HTTP ${response.status}`
        };
      }

      if (response.status === 429) {
        return {
          ...defaultResult,
          message: "No reputation data returned by Google Safe Browsing.",
          status: "error",
          errorDetails: "Google Safe Browsing API rate limits exceeded."
        };
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          ...defaultResult,
          message: "No reputation data returned by Google Safe Browsing.",
          status: "error",
          errorDetails: `Server proxy returned error code: ${response.status} - ${errorText}`
        };
      }

      let data: any = null;
      const rawText = await response.text();
      if (rawText && rawText.trim()) {
        try {
          data = JSON.parse(rawText);
        } catch (_) {
          return {
            ...defaultResult,
            message: "No reputation data returned by Google Safe Browsing.",
            status: "error",
            errorDetails: "Invalid JSON response from server proxy."
          };
        }
      }
      return data || defaultResult;
    } catch (error: any) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === "AbortError";
      return {
        ...defaultResult,
        message: "No reputation data returned by Google Safe Browsing.",
        status: "error",
        errorDetails: isTimeout ? "API timeout: Safe Browsing check timed out." : `Network failure: ${error.message || error}`
      };
    }
  } else {
    // Server-side Node.js execution: Query Google Safe Browsing Lookup API directly
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GOOGLE_SAFE_BROWSING_API_KEY") {
      return {
        ...defaultResult,
        message: "No reputation data returned by Google Safe Browsing.",
        status: "error",
        errorDetails: "Invalid API key: GOOGLE_SAFE_BROWSING_API_KEY is not configured or invalid."
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const apiEndpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    const payload = {
      client: {
        clientId: "sentryai-cyber-defense",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: cleanUrl }]
      }
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 400 || response.status === 403) {
        return {
          ...defaultResult,
          message: "No reputation data returned by Google Safe Browsing.",
          status: "error",
          errorDetails: `Invalid API key or bad request parameters: HTTP ${response.status}`
        };
      }

      if (response.status === 429) {
        return {
          ...defaultResult,
          message: "No reputation data returned by Google Safe Browsing.",
          status: "error",
          errorDetails: "Google Safe Browsing API rate limits exceeded."
        };
      }

      if (!response.ok) {
        return {
          ...defaultResult,
          message: "No reputation data returned by Google Safe Browsing.",
          status: "error",
          errorDetails: `Google Safe Browsing API returned error code: ${response.status}`
        };
      }

      let data: any = null;
      const rawText = await response.text();
      if (rawText && rawText.trim()) {
        try {
          data = JSON.parse(rawText);
        } catch (_) {
          return {
            ...defaultResult,
            message: "No reputation data returned by Google Safe Browsing.",
            status: "error",
            errorDetails: "Invalid JSON response from Safe Browsing API."
          };
        }
      }

      if (data && data.matches && data.matches.length > 0) {
        // Extract threat categories from matches
        const categories: string[] = Array.from(
          new Set(data.matches.map((match: any) => match.threatType).filter(Boolean))
        ) as string[];

        return {
          success: true,
          isMalicious: true,
          threatCategories: categories,
          message: "Verified by Google Safe Browsing",
          source: "Google Safe Browsing",
          status: "malicious"
        };
      }

      // No matches means URL is clean according to Safe Browsing database
      return {
        success: true,
        isMalicious: false,
        threatCategories: [],
        message: "Google Safe Browsing: No known malicious reputation.",
        source: "Google Safe Browsing",
        status: "clean"
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === "AbortError";
      return {
        ...defaultResult,
        message: "No reputation data returned by Google Safe Browsing.",
        status: "error",
        errorDetails: isTimeout ? "API timeout: Safe Browsing check timed out." : `Network failure: ${error.message || error}`
      };
    }
  }
}
