import ForYouClient from "@/app/for-you/ForYouClient";
import { getBetterAuthSession } from "@/lib/auth-session";

export default async function ForYouPage() {
  const session = await getBetterAuthSession();

  return (
    <ForYouClient
      viewer={session ? { name: session.user.name, email: session.user.email } : null}
    />
  );
}
