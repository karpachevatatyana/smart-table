const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;

const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

export function initData(sourceData) {
    const getIndexes = async () => {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        // Трансформируем параметры сортировки для API
        const apiQuery = { ...query };
        
        // API ожидает sort в формате "field:direction"
        // direction: 'asc' или 'desc'
        if (apiQuery.sort) {
            const [field, order] = apiQuery.sort.split(':');
            // Для API оставляем как есть, API сам определит порядок
        }
        
        const qs = new URLSearchParams(apiQuery);
        const nextQuery = qs.toString();
        
        console.log('API Query:', nextQuery); // Для отладки

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}