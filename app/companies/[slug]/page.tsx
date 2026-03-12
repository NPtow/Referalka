import CompanyClient from "@/app/companies/[slug]/CompanyClient";
import { getBetterAuthSession } from "@/lib/auth-session";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, getBetterAuthSession()]);

  return (
    <CompanyClient
      slug={slug}
      viewer={session ? { name: session.user.name, email: session.user.email } : null}
    />
  );
}
