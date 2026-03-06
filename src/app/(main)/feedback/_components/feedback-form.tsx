'use client';

import { useState } from 'react';

import { type FeedbackCategory } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { FEEDBACK_CATEGORIES } from '@/constants/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const FeedbackForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('GENERAL');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          customCategory: category === 'OTHER' ? customCategory.trim() : undefined,
          isPublic,
        }),
      });

      if (response.ok) {
        router.push('/feedback');
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              type="button"
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.value as FeedbackCategory)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {category === 'OTHER' ? (
        <div className="space-y-2">
          <Label htmlFor="customCategory">직접 입력</Label>
          <Input
            id="customCategory"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="카테고리를 입력해주세요"
            maxLength={50}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력해주세요"
          required
          rows={8}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="size-4 rounded border"
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          공개
        </Label>
        <span className="text-muted-foreground text-xs">
          (비공개 시 본인과 관리자만 볼 수 있습니다)
        </span>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
          {isSubmitting ? '등록 중...' : '등록'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
};
