import { DeckCreationForm } from "@/components/study/deck-creation-form";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";

export default function StudyCreatePage() {
  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title="Create deck"
        description="Add a new flashcard deck or import from a PDF, DOCX, or PPTX"
      />
      <DeckCreationForm />
    </PageContainer>
  );
}
