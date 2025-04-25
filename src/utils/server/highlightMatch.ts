// * Highlights the matching string for showing in UI
export default function highlightMatch<T>(doc: T, query: string, fields: (keyof T)[]): string {
    const lowered = query.toLowerCase();
    for (const field of fields) {
        const value = doc[field];
        if (typeof value === 'string' && value.toLowerCase().includes(lowered)) {
            return value;
        }
        if (Array.isArray(value)) {
            const found = value.find((v: string) => v.toLowerCase().includes(lowered));
            if (found) return found;
        }
    }
    return '';
}