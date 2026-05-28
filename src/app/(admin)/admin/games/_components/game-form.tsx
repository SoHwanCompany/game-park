'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { gameFormSchema, type GameFormValues } from '../_schemas/game-form';

interface CategoryOption {
  id: string;
  name: string;
}

interface GameFormProps {
  mode: 'create' | 'edit';
  gameId?: string;
  categories: CategoryOption[];
  defaultValues?: GameFormValues;
}

export const GameForm = ({ mode, gameId, categories, defaultValues }: GameFormProps) => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultValues ?? {
      code: '',
      title: '',
      description: '',
      categoryId: '',
      thumbnailUrl: '',
      gameUrl: '',
      status: 'DRAFT',
    },
  });

  const onSubmit = async (data: GameFormValues): Promise<void> => {
    setServerError(null);

    const url = mode === 'create' ? '/api/admin/games' : `/api/admin/games/${gameId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';
    const body = mode === 'create' ? data : { ...data, code: undefined };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setServerError(payload?.message ?? '요청에 실패했습니다.');

        return;
      }

      router.push('/admin/games');
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
        <Input
          id="code"
          {...register('code')}
          disabled={mode === 'edit'}
          placeholder="game-code (소문자/숫자/-)"
        />
        {errors.code && <p className="text-destructive text-sm">{errors.code.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" rows={5} {...register('description')} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">카테고리</Label>
        <select
          id="categoryId"
          {...register('categoryId')}
          className="bg-background h-9 w-full rounded-md border px-3 text-sm"
        >
          <option value="">선택해주세요</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-destructive text-sm">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">썸네일 URL</Label>
        <Input id="thumbnailUrl" {...register('thumbnailUrl')} placeholder="https://..." />
        {errors.thumbnailUrl && (
          <p className="text-destructive text-sm">{errors.thumbnailUrl.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gameUrl">게임 URL</Label>
        <Input id="gameUrl" {...register('gameUrl')} placeholder="https://..." />
        {errors.gameUrl && <p className="text-destructive text-sm">{errors.gameUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <select
          id="status"
          {...register('status')}
          className="bg-background h-9 w-full rounded-md border px-3 text-sm"
        >
          <option value="DRAFT">초안</option>
          <option value="PUBLISHED">공개</option>
          <option value="SUSPENDED">중단</option>
          <option value="ARCHIVED">보관</option>
        </select>
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
