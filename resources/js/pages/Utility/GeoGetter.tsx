export async function geoGetter(code: string, level: "province" | "municipality" | "barangay"): Promise<string> {
    if (!code) return "";
    let targetCode = code;
    const endpoint =
        level === "province"
            ? "provinces"
            : level === "municipality"
                ? "cities-municipalities"
                : "barangays";

    const url = `https://psgc.gitlab.io/api/${endpoint}/${targetCode}.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Invalid PSGC code: ${targetCode}`);
        const data = await response.json();
        return data.name || code;
    } catch (error) {
        console.error(`Failed to fetch PSGC name for ${level}:`, targetCode, error);
        return code;
    }
}