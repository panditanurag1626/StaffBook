'use client';

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function JobsContentInner({ children }) {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  
  return (
    <div>
      {/* Optional: Display filter info if needed */}
      {filter && <div>Filter: {filter}</div>}
      {children}
    </div>
  );
}

export default function JobsContent({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsContentInner>{children}</JobsContentInner>
    </Suspense>
  );
}
