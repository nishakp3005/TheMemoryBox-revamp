import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import {auth} from "@/lib/auth";

const dashboardPage = async () => {
  const session=await auth.api.getSession({headers: await headers()});
    if(!session){
        redirect("/login");
    }
  const username = session.user?.name ?? null;
  const userEmail = session.user?.email ?? "";

  return (
    <>
      <Dashboard username={username ?? userEmail ?? "Your"} userEmail={userEmail} />
    </>
  );
};
export default dashboardPage;
