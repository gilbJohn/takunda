import { DeckCreationForm } from "@/components/study/deck-creation-form";
import { PageHeader } from "@/components/shared/page-header";

export default function StudyCreatePage() {
  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <PageHeader
        title="Create deck"
        description="Add a new flashcard deck or import from a PDF, DOCX, or PPTX"
      />
      <DeckCreationForm />
    </div>
  );
}
