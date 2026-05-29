import Link from 'next/link';

import { getAdminCategories } from '@/lib/admin/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">카테고리 관리</h2>
        <Button asChild>
          <Link href="/admin/categories/new">카테고리 등록</Link>
        </Button>
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3">코드</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">설명</th>
              <th className="px-4 py-3 text-right">순서</th>
              <th className="px-4 py-3 text-right">게임 수</th>
              <th className="px-4 py-3">활성</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                    {category.code}
                  </td>
                  <td className="px-4 py-2 font-medium">{category.name}</td>
                  <td className="text-muted-foreground max-w-md px-4 py-2 text-xs">
                    {category.description ?? '-'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{category.sortOrder}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{category.gameCount}</td>
                  <td className="px-4 py-2">
                    {category.isActive ? (
                      <Badge variant="default">활성</Badge>
                    ) : (
                      <Badge variant="secondary">비활성</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/categories/${category.id}`}>편집</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
