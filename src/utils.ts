export function getTotalArrayLength<T extends Record<string, any[]>>(obj: T): number {
    return Object.values(obj).reduce((total, value) => {
        return total + value.length;
    }, 0);
}