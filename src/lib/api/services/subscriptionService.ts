import apiClient from '../config';

export interface SubscriptionFeature {
    id: number;
    feature_name: string;
    feature_key: string;
    feature_value: string;
    feature_type: string;
    display_name: string;
    icon: string;
    display_order: number;
}

export interface SubscriptionPlanSection {
    id: number;
    section_type: string;
    section_name: string;
    display_order: number;
    features: SubscriptionFeature[];
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    type: string;
    badge_text: string;
    badge_color: string;
    currency: string;
    discount_price: string;
    display_order: number;
    effective_price: string;
    is_free: boolean;
    is_popular: boolean;
    plan_image: string;
    popular_text: string;
    sections: SubscriptionPlanSection[];
    subscription_charges: string;
    user_type: string;
}

export interface SubscriptionListResponse {
    status: number;
    message: string;
    data: {
        status: number;
        statusText: string;
        data: SubscriptionPlan[];
        pagination: {
            totalCount: number;
            pageCount: number;
            currentPage: number;
            pageSize: number;
        };
    };
}

export const getSubscriptionList = async (userType?: 'employer' | 'job_seeker') => {
    return apiClient.get<SubscriptionListResponse>(`subscription/subscription-list?user_type=${userType}&_t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
};

export const getPlanDetails = async (planId: number | string) => {
    return apiClient.get<any>(`payments/plan-details?plan_id=${planId}&_t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
};

export interface BuySubscriptionPayload {
    plan_id: number | string;
    payment_id: string;
    payment_method: string;
    transaction_id: string;
    payment_details: string; // The backend requires a JSON string now
    user_type: string;
}

export const buySubscription = async (payload: BuySubscriptionPayload) => {
    return apiClient.post<any>(`payments/buy-subscription`, payload);
};

export const getPaymentHistory = async () => {
    return apiClient.get<any>(`payments/history`);
};

export const subscriptionService = {
    getSubscriptionList,
    getPlanDetails,
    buySubscription,
    getPaymentHistory,
};

export default subscriptionService;
