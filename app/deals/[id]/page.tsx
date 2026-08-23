import Link from "next/link";
import { notFound } from "next/navigation";
import { DealDetail } from "@/app/components/deals/DealDetail";
import { Header, Footer } from "@/app/components/common/Header";
import { MOCK_DEALS } from "@/app/lib/verify/mock-data";

export default async function PublicDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = MOCK_DEALS.find((d) => d.id === id);
  if (!deal) notFound();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="mb-4 text-sm text-muted">
          Vista pública (link del bot) ·{" "}
          <Link href={`/dashboard/deals/${id}`} className="text-primary">
            Abrir en dashboard
          </Link>
        </p>
        <DealDetail deal={deal} />
      </main>
      <Footer />
    </div>
  );
}
