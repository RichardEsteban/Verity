import Link from "next/link";
import { notFound } from "next/navigation";
import { DealDetail } from "@/app/components/deals/DealDetail";
import { Header, Footer } from "@/app/components/common/Header";
import { fetchDeal } from "@/app/lib/verify/api";

export default async function PublicDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await fetchDeal(id);
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
