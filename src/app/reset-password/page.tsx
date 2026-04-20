import React, { Suspense } from "react";
import ResetPassword from "@/components/pages/Reset-password";

const resetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPassword />
    </Suspense>
  );
};
export default resetPasswordPage;
