import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ApproveConnectionButton from "./ApproveConnectionButton";

type SearchParams = Promise<{
  token?: string;
}>;

export default async function ApproveReferralConnectionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-black text-[#171923]">Не хватает токена апрува</h1>
          <p className="mt-3 text-sm text-[#4A5568]">
            Открой ссылку из письма целиком или запроси новый мэтч из системы.
          </p>
        </div>
      </div>
    );
  }

  const connection = await prisma.referralConnection.findUnique({
    where: { adminApprovalToken: token },
    include: {
      candidateUser: true,
      candidateProfile: true,
      referrerUser: true,
      referrer: true,
    },
  });

  if (!connection) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-black text-[#171923]">Ссылка апрува недействительна</h1>
          <p className="mt-3 text-sm text-[#4A5568]">
            Возможно, мэтч уже был удалён или токен устарел.
          </p>
        </div>
      </div>
    );
  }

  const candidateRoles = connection.candidateProfile.roles.length
    ? connection.candidateProfile.roles
    : [connection.candidateProfile.role];
  const referrerRoles = connection.referrer.roles.length
    ? connection.referrer.roles
    : connection.referrer.role
      ? [connection.referrer.role]
      : [];

  return (
    <div className="min-h-screen bg-[#F7FAFC] px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-sm text-[#A0AEC0]">
          <Link href="/" className="transition-colors hover:text-[#1863e5]">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-[#718096]">Апрув оплаты</span>
        </div>

        <div className="rounded-3xl border border-[#C3DAFE] bg-[#EBF4FF] p-6">
          <h1 className="text-3xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Апрув мэтча по {connection.companyName}
          </h1>
          <p className="mt-2 text-sm text-[#4A5568]">
            Здесь можно вручную подтвердить оплату и только после этого отправить контакты кандидату и реферу.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">Кандидат</p>
            <h2 className="mt-2 text-xl font-bold text-[#171923]">{connection.candidateUser.firstName}</h2>
            <p className="mt-1 text-sm text-[#4A5568]">{connection.candidateUser.username ?? "Email не указан"}</p>
            <p className="mt-3 text-sm text-[#4A5568]">
              <span className="font-semibold text-[#171923]">Роли:</span> {candidateRoles.join(", ")}
            </p>
            <p className="mt-2 text-sm text-[#4A5568]">
              <span className="font-semibold text-[#171923]">Опыт:</span> {connection.candidateProfile.experience} лет
            </p>
            <p className="mt-2 text-sm text-[#4A5568]">
              <span className="font-semibold text-[#171923]">Компании:</span> {connection.candidateProfile.companies.join(", ")}
            </p>
            {connection.candidateProfile.telegramContact && (
              <p className="mt-2 text-sm text-[#4A5568]">
                <span className="font-semibold text-[#171923]">Telegram:</span> {connection.candidateProfile.telegramContact}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">Рефер</p>
            <h2 className="mt-2 text-xl font-bold text-[#171923]">{connection.referrerUser.firstName}</h2>
            <p className="mt-1 text-sm text-[#4A5568]">{connection.referrerUser.username ?? "Email не указан"}</p>
            {referrerRoles.length > 0 && (
              <p className="mt-3 text-sm text-[#4A5568]">
                <span className="font-semibold text-[#171923]">Роли:</span> {referrerRoles.join(", ")}
              </p>
            )}
            <p className="mt-2 text-sm text-[#4A5568]">
              <span className="font-semibold text-[#171923]">Компании:</span> {connection.referrer.companies.length > 0 ? connection.referrer.companies.join(", ") : connection.referrer.company}
            </p>
            {connection.referrer.telegramContact && (
              <p className="mt-2 text-sm text-[#4A5568]">
                <span className="font-semibold text-[#171923]">Telegram:</span> {connection.referrer.telegramContact}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <ApproveConnectionButton token={token} initialApproved={connection.status === "APPROVED"} />
        </div>
      </div>
    </div>
  );
}
