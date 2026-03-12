import ProfileClient from "@/app/profile/ProfileClient";
import { requireBetterAuthSession } from "@/lib/auth-session";

export default async function ProfilePage() {
  const session = await requireBetterAuthSession();

  return (
    <ProfileClient
      sessionUser={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
