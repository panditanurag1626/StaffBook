'use client';

import React, { Suspense } from 'react';
import Services from '../../components/Services/Services';

export default function PremiumServicesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Services />
        </Suspense>
    );
}
