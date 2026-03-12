import { redirect } from "next/navigation";
import EmailAuthForm from "@/components/auth/EmailAuthForm";
import { getBetterAuthSession } from "@/lib/auth-session";

export default async function SignUpPage() {
  const session = await getBetterAuthSession();
  if (session) {
    redirect("/profile");
  }

  return <EmailAuthForm mode="sign-up" />;
}
