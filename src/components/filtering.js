export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            if (!select) return;
            
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            Object.values(indexes[elementName]).forEach(name => {
                const option = document.createElement('option');
                option.textContent = name;
                option.value = name;
                select.appendChild(option);
            });
        });
    };

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const parent = action.closest('.filter-wrapper, .dropdown-select');
            const input = parent?.querySelector('input, select');
            if (input) {
                input.value = '';
            }
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}