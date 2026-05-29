export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            if (!select) return;
            
            while (select.options.length > 0) {
                select.remove(0);
            }
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Все';
            select.appendChild(defaultOption);
            
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
                    const field = action.dataset?.field;
                    if (field) {
                        state[field] = '';
                    }
                }
            }
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            const el = elements[key];
            if (el && ['INPUT', 'SELECT'].includes(el.tagName) && el.value) {
                filter[el.name] = el.value;
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}