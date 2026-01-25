export interface GeoInfo {
    ipAddress?: string;
    location?: string;
}

export async function getGeoInfo(): Promise<GeoInfo | null> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            // Fallback or just return null
            return null;
        }
        const data = await response.json();
        const { ip, city, region, country_name } = data;
        const location = [city, region, country_name].filter(Boolean).join(', ');
        return { ipAddress: ip, location };
    } catch (error) {
        console.warn('Failed to fetch geo info:', error);
        return null;
    }
}
