import NavbarClient from "@/components/NavbarClient";
import { getBetterAuthSession } from "@/lib/auth-session";

export default async function Navbar() {
  const session = await getBetterAuthSession();

  return (
    <NavbarClient
      viewer={session ? { name: session.user.name, email: session.user.email } : null}
    />
  );
}
