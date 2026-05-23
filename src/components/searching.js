import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    const compare = createComparison(['skipEmptyTargetValues'], [
        rules.searchMultipleFields(searchField, ['date', 'customer', 'seller', 'total'], false)
    ]);
    
    return (data, state, action) => {
        if (state[searchField]) {
            return data.filter(row => compare(row, state));
        }
        return data;
    };
}