import AdminLoginForm from "@/components/AdminLoginForm";
import { hasAdminSession, isAdminAuthConfigured } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login Admin | Sistema de Votacion Escolar",
};

export default async function AdminLoginPage({ searchParams }) {
  const sessionActive = await hasAdminSession();
  const resolvedParams = await searchParams;
  const nextPath =
    resolvedParams?.next && resolvedParams.next.startsWith("/") ? resolvedParams.next : "/dashboard";

  if (sessionActive) {
    redirect(nextPath);
  }

  return (
    <div className="py-10">
      <AdminLoginForm
        nextPath={nextPath}
        authConfigured={isAdminAuthConfigured()}
      />
    </div>
  );
}
