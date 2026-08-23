import Link from "next/link";
import { AgentAnimation } from "@/app/components/agents/AgentAnimation";
import { Header, Footer } from "@/app/components/common/Header";

export default async function PublicLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold">Arbitraje en vivo</h1>
          <Link href={`/deals/${id}`} className="text-sm text-primary">
            Deal
          </Link>
        </div>
        <AgentAnimation dealId={id} />
      </main>
      <Footer />
    </div>
  );
}
