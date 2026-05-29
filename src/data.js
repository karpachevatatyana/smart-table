const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;
let localData = null;

const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

export function initData(sourceData) {
    // Сохраняем локальные данные на случай ошибки API
    if (sourceData) {
        localData = sourceData;
    }
    
    const getIndexes = async () => {
        // Пытаемся получить с сервера
        if (!sellers || !customers) {
            try {
                [sellers, customers] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                    fetch(`${BASE_URL}/customers`).then(res => res.json()),
                ]);
            } catch (error) {
                // Если сервер недоступен, используем локальные данные
                console.warn('API недоступен, использую локальные данные');
                sellers = [...new Set(localData.map(item => item.seller))];
                customers = [...new Set(localData.map(item => item.customer))];
            }
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated && lastResult) {
            return lastResult;
        }

        try {
            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
            const records = await response.json();

            lastQuery = nextQuery;
            lastResult = {
                total: records.total,
                items: mapRecords(records.items)
            };

            return lastResult;
        } catch (error) {
            // Если сервер недоступен, используем локальные данные с фильтрацией
            console.warn('API недоступен, использую локальные данные');
            
            let filtered = [...localData];
            
            // Применяем фильтры из query
            if (query.searchBySeller && query.searchBySeller !== '') {
                filtered = filtered.filter(item => item.seller === query.searchBySeller);
            }
            if (query.search) {
                const searchTerm = query.search.toLowerCase();
                filtered = filtered.filter(item => 
                    item.seller?.toLowerCase().includes(searchTerm) ||
                    item.customer?.toLowerCase().includes(searchTerm) ||
                    item.date?.includes(searchTerm)
                );
            }
            
            // Пагинация
            const limit = parseInt(query.limit) || 10;
            const page = parseInt(query.page) || 1;
            const start = (page - 1) * limit;
            const paginated = filtered.slice(start, start + limit);
            
            return {
                total: filtered.length,
                items: paginated.map(item => ({
                    id: item.id,
                    date: item.date,
                    seller: item.seller,
                    customer: item.customer,
                    total: item.total
                }))
            };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}