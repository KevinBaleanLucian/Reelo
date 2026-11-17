import { useMediaQuery } from './useMediaQuery.js';
import { PHONE_QUERY, TABLET_QUERY } from '../utils/breakpoints.js';

export function useGridColumns() {
    const phone = useMediaQuery(PHONE_QUERY);
    const tablet= useMediaQuery(TABLET_QUERY);

    return phone ? 2 : tablet ? 4:5;
}