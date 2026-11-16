export function maskDate(raw){
    const digits=raw.replace(/\D/g, '').slice(0,8);

    return [digits.slice(0,2),digits.slice(2,4),digits.slice(4,8)].filter(Boolean).join(' / ');
};

export function toIsoDate(text){
    const digits=text.replace(/\D/g, '');
    if (digits.length!==8) return undefined;

    const day=Number(digits.slice(0,2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));

    const check = new Date(Date.UTC(year, month - 1, day));
    const real =
        check.getUTCFullYear() === year &&
        check.getUTCMonth() === month - 1 &&
        check.getUTCDate() === day;

    if (!real) return undefined;

    return `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

}

export function validateBirthDate(text){
    if(!text) return '';

    if(text.replace(/\D/g,'').length<8){
        return 'Enter your full date of birth as DD / MM / YYYY';
    }

    const iso=toIsoDate(text);
    if(!iso) return 'Enter a valid date';

    const today=new Date().toISOString().slice(0,10);
    if(iso>today) return 'Data of birth cannot be in the future';
    if(iso < '1900-01-01') return 'Enter a valid date';

    return '';
}
