export function isValidCpf(cpf: string): boolean {
    if (!cpf) return false;
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const calcDigit = (slice: string, factor: number): number => {
        let sum = 0;
        for (let i = 0; i < slice.length; i++) {
            sum += parseInt(slice[i], 10) * (factor - i);
        }
        const mod = (sum * 10) % 11;
        return mod === 10 ? 0 : mod;
    };

    const d1 = calcDigit(digits.substring(0, 9), 10);
    if (d1 !== parseInt(digits[9], 10)) return false;

    const d2 = calcDigit(digits.substring(0, 10), 11);
    if (d2 !== parseInt(digits[10], 10)) return false;

    return true;
}
