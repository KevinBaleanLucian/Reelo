import { useMediaQuery } from "./useMediaQuery.js";
import { PHONE_QUERY, TABLET_QUERY } from "../utils/breakpoints.js";

export function useRowColumns(variant ='poster') {
    const phone=useMediaQuery(PHONE_QUERY);
    const tablet=useMediaQuery(TABLET_QUERY);
    const wide=variant ==='wide';

    const columns = phone ? (wide ? 1.15 : 2.3): tablet ? (wide ? 2 : 4) : wide ? 3 : 5;

    return {
        columns,
        pageSize: Math.max(1,Math.floor(columns)),
        skeletons: Math.ceil(columns),
    };
}