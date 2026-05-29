import { CategoryForm } from '../_components/category-form';

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">카테고리 등록</h2>
      <CategoryForm mode="create" />
    </div>
  );
}
