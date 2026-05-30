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
            const parent = action.closest('.filter-wrapper');
            if (parent) {
                const input = parent.querySelector('input');
                if (input) {
                    input.value = '';
                }
            }
        }

        const filter = {};
        
        if (elements.searchByDate && elements.searchByDate.value) {
            filter.date = elements.searchByDate.value;
        }
        
        if (elements.searchByCustomer && elements.searchByCustomer.value) {
            filter.customer = elements.searchByCustomer.value;
        }
        
        if (elements.searchBySeller && elements.searchBySeller.value) {
            filter.seller = elements.searchBySeller.value;
        }
        
        if (elements.totalFrom && elements.totalFrom.value) {
            filter.totalFrom = elements.totalFrom.value;
        }
        
        if (elements.totalTo && elements.totalTo.value) {
            filter.totalTo = elements.totalTo.value;
        }

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}