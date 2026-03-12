import ReferrerClient from "@/app/referrer/ReferrerClient";
import { getBetterAuthSession } from "@/lib/auth-session";

export default async function ReferrerPage() {
  const session = await getBetterAuthSession();

  return (
    <ReferrerClient
      viewer={session ? { name: session.user.name, email: session.user.email } : null}
    />
  );
}
