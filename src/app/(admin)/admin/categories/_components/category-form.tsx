'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { categoryFormSchema, type CategoryFormValues } from '../_schemas/category-form';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  categoryId?: string;
  defaultValues?: CategoryFormValues;
}

export const CategoryForm = ({ mode, categoryId, defaultValues }: CategoryFormProps) => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValues ?? {
      code: '',
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const onSubmit = async (data: CategoryFormValues): Promise<void> => {
    setServerError(null);

    const url = mode === 'create' ? '/api/admin/categories' : `/api/admin/categories/${categoryId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setServerError(payload?.message ?? '요청에 실패했습니다.');

        return;
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error(error);
      setServerError('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">코드</Label>
        <Input id="code" {...register('code')} placeholder="action / puzzle ..." />
        {errors.code && <p className="text-destructive text-sm">{errors.code.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">정렬 순서</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register('sortOrder', { valueAsNumber: true })}
          />
          {errors.sortOrder && (
            <p className="text-destructive text-sm">{errors.sortOrder.message}</p>
          )}
        </div>

        <div className="flex items-end gap-2">
          <input id="isActive" type="checkbox" className="h-4 w-4" {...register('isActive')} />
          <Label htmlFor="isActive" className="cursor-pointer">
            활성
          </Label>
        </div>
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? '등록' : '저장'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
};
