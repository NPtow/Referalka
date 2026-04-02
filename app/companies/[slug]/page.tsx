import CompanyClient from "@/app/companies/[slug]/CompanyClient";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <CompanyClient slug={slug} />;
}
