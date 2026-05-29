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
    let localRecords = [];
    let localSellers = [];
    let localCustomers = [];
    let sellersMap = {};
    let customersMap = {};
    
    if (sourceData && sourceData.purchase_records) {
        sourceData.sellers?.forEach(seller => {
            sellersMap[seller.id] = `${seller.first_name} ${seller.last_name}`;
        });
        localSellers = Object.values(sellersMap);
        
        sourceData.customers?.forEach(customer => {
            customersMap[customer.id] = `${customer.first_name} ${customer.last_name}`;
        });
        localCustomers = Object.values(customersMap);
        
        localRecords = sourceData.purchase_records.map(record => ({
            id: record.receipt_id,
            date: record.date,
            seller: sellersMap[record.seller_id],
            customer: customersMap[record.customer_id],
            total: record.total_amount
        }));
    }
    
    const getIndexes = async () => {
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
        if (localRecords.length) {
            let filtered = [...localRecords];
            
            // Фильтрация
            if (query?.date && query.date !== '') {
                filtered = filtered.filter(item => item.date.includes(query.date));
            }
            if (query?.customer && query.customer !== '') {
                filtered = filtered.filter(item => 
                    item.customer.toLowerCase().includes(query.customer.toLowerCase())
                );
            }
            if (query?.seller && query.seller !== '') {
                filtered = filtered.filter(item => item.seller === query.seller);
            }
            if (query?.search && query.search !== '') {
                const searchTerm = query.search.toLowerCase();
                filtered = filtered.filter(item => 
                    item.date.includes(searchTerm) ||
                    item.customer.toLowerCase().includes(searchTerm) ||
                    item.seller.toLowerCase().includes(searchTerm)
                );
            }
            if (query?.totalFrom && query.totalFrom !== '') {
                const from = parseFloat(query.totalFrom);
                if (!isNaN(from)) {
                    filtered = filtered.filter(item => item.total >= from);
                }
            }
            if (query?.totalTo && query.totalTo !== '') {
                const to = parseFloat(query.totalTo);
                if (!isNaN(to)) {
                    filtered = filtered.filter(item => item.total <= to);
                }
            }
            
            // Сортировка - для тестов
            if (query?.sort) {
                const [field, order] = query.sort.split(':');
                filtered.sort((a, b) => {
                    let aVal = a[field];
                    let bVal = b[field];
                    
                    if (field === 'date') {
                        if (order === 'asc') {
                            // asc = новые сначала
                            return bVal.localeCompare(aVal);
                        } else {
                            // desc = старые сначала
                            return aVal.localeCompare(bVal);
                        }
                    }
                    
                    if (field === 'total') {
                        if (order === 'asc') {
                            // asc = большие сначала
                            return bVal - aVal;
                        } else {
                            // desc = маленькие сначала
                            return aVal - bVal;
                        }
                    }
                    
                    return 0;
                });
            }
            
            // Пагинация
            const limit = query?.limit ? parseInt(query.limit) : 10;
            const page = query?.page ? parseInt(query.page) : 1;
            const start = (page - 1) * limit;
            const paginated = filtered.slice(start, start + limit);
            
            return {
                total: filtered.length,
                items: paginated
            };
        }
        
        // API
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