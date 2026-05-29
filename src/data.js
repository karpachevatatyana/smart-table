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
    // Преобразуем purchase_records в плоский массив для локального использования
    let localRecords = [];
    let localSellers = [];
    let localCustomers = [];
    
    if (sourceData && sourceData.purchase_records) {
        // Создаем маппинг продавцов
        const sellersMap = {};
        sourceData.sellers?.forEach(seller => {
            sellersMap[seller.id] = `${seller.first_name} ${seller.last_name}`;
        });
        localSellers = Object.values(sellersMap);
        
        // Создаем маппинг покупателей
        const customersMap = {};
        sourceData.customers?.forEach(customer => {
            customersMap[customer.id] = `${customer.first_name} ${customer.last_name}`;
        });
        localCustomers = Object.values(customersMap);
        
        // Преобразуем записи
        localRecords = sourceData.purchase_records.map(record => ({
            id: record.receipt_id,
            date: record.date,
            seller: sellersMap[record.seller_id],
            customer: customersMap[record.customer_id],
            total: record.total_amount
        }));
    }
    
    const getIndexes = async () => {
        // Если есть локальные данные, возвращаем их
        if (localSellers.length && localCustomers.length) {
            return { sellers: localSellers, customers: localCustomers };
        }
        
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        // Для локальных данных
        if (localRecords.length) {
            let filtered = [...localRecords];
            
            // Фильтрация по продавцу
            if (query && query.searchBySeller && query.searchBySeller !== '') {
                filtered = filtered.filter(item => item.seller === query.searchBySeller);
            }
            
            // Поиск
            if (query && query.search && query.search !== '') {
                const searchTerm = query.search.toLowerCase();
                filtered = filtered.filter(item => 
                    item.seller?.toLowerCase().includes(searchTerm) ||
                    item.customer?.toLowerCase().includes(searchTerm) ||
                    item.date?.includes(searchTerm)
                );
            }
            
            // Пагинация
            const limit = query && query.limit ? parseInt(query.limit) : 10;
            const page = query && query.page ? parseInt(query.page) : 1;
            const start = (page - 1) * limit;
            const paginated = filtered.slice(start, start + limit);
            
            return {
                total: filtered.length,
                items: paginated
            };
        }
        
        // Для API
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

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