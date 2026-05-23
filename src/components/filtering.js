import { createComparison, defaultRules } from "../lib/compare.js";

const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    Object.keys(indexes).forEach((elementName) => {
        if (elements[elementName]) {
            elements[elementName].append(
                ...Object.values(indexes[elementName]).map(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    return option;
                })
            );
        }
    });

    return (data, state, action) => {
        if (action && action.name === 'clear') {
            const parent = action.closest('.filter-wrapper');
            if (parent) {
                const input = parent.querySelector('input');
                if (input) {
                    input.value = '';
                    const field = action.dataset?.field;
                    if (field) {
                        state[field] = '';
                    }
                }
            }
        }

        return data.filter(row => {
            const matches = Object.entries(state).every(([key, value]) => {
                if (!value || value === '') return true;
                
                if (key === 'totalFrom') {
                    const total = parseFloat(row.total);
                    const minTotal = parseFloat(value);
                    return !isNaN(total) && !isNaN(minTotal) && total >= minTotal;
                }
                
                if (key === 'totalTo') {
                    const total = parseFloat(row.total);
                    const maxTotal = parseFloat(value);
                    return !isNaN(total) && !isNaN(maxTotal) && total <= maxTotal;
                }
                
                return compare(row, { [key]: value });
            });
            
            return matches;
        });
    };
}