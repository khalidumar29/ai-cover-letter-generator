import { requirePageUser } from "@/lib/auth/guard";
import { PageHeader } from "@/app/shared/ui";
import GenerateForm from "./generate-form";

export const metadata = { title: "New cover letter" };

export default async function NewLetterPage() {
  const user = await requirePageUser();

  return (
    <>
      <PageHeader
        title="New cover letter"
        description="Paste the job description and describe your background. Generating costs one credit."
      />
      <GenerateForm credits={user.credits} />
    </>
  );
}
