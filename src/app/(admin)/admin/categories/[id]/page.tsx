import { notFound } from 'next/navigation';

import { getAdminCategoryById } from '@/lib/admin/categories';

import { CategoryForm } from '../_components/category-form';
import { DeleteCategoryButton } from '../_components/delete-category-button';

interface AdminEditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCategoryPage({ params }: AdminEditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">카테고리 편집</h2>

      <CategoryForm
        mode="edit"
        categoryId={category.id}
        defaultValues={{
          code: category.code,
          name: category.name,
          description: category.description ?? '',
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
      />

      <div className="border-destructive/30 rounded-lg border p-4">
        <h3 className="text-destructive mb-2 text-sm font-semibold">위험 영역</h3>
        <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
      </div>
    </div>
  );
}
