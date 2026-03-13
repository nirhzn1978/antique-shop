import UploadFlow from "@/components/admin/upload-flow";

export const metadata = {
  title: "הוספת פריט חדש",
};

export default function AddItemPage() {
  return (
    <div className="py-6">
      <UploadFlow />
    </div>
  );
}
