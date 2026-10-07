import { ClientsView } from "@/components/loop/clients-view";
import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";

export default async function AdminExperts({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [shops, experts, pins] = await Promise.all([
    apiGet<{
      id: string;
      name: string;
      district: string;
      pincode: string;
      pilot: boolean;
      marginPaise: number;
      owner: { name: string; phone: string };
    }[]>(adminPath("/shops")),
    apiGet<{
      id: string;
      displayName: string;
      district: string;
      status: string;
      credentialType: string;
      credentialNumber: string;
      user: { phone: string };
      pincodes: { pincode: string }[];
    }[]>(adminPath("/experts")),
    apiGet<{ pincode: string; district: string; area: string }[]>("/v1/pincodes"),
  ]);
  return <ClientsView locale={locale} shops={shops || []} experts={experts || []} pins={pins || []} />;
}
