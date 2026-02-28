import React from "react";
import ResetPassword from "@/components/pages/Reset-password";

const resetPasswordPage = () => {
  return (
    <React.Suspense fallback={<></>}>
      <ResetPassword />
    </React.Suspense>
  );
};

export default resetPasswordPage;
