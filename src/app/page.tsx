import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to the landing/marketing page
  redirect("/landing");
}
