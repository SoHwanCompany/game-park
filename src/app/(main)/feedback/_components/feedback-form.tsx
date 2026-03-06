'use client';

import { useState } from 'react';

import { type FeedbackCategory } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { FEEDBACK_CATEGORIES } from '@/constants/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const TITLE_MAX_LENGTH = 100;

const CATEGORY_EMOJI: Record<string, string> = {
  BUG: '\uD83D\uDC1B',
  FEATURE: '\uD83D\uDCA1',
  GENERAL: '\uD83D\uDCAC',
  GAME_REQUEST: '\uD83C\uDFAE',
  OTHER: '\uD83D\uDD0D',
};

export const FeedbackForm = (): React.ReactNode => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('GENERAL');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const titleRemaining = TITLE_MAX_LENGTH - title.length;

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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">의견 보내기</CardTitle>
        <CardDescription>
          버그 신고, 기능 제안, 게임 요청 등 어떤 의견이든 환영합니다.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="feedback-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value as FeedbackCategory)}
                    className="focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-[3px]"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer gap-1.5 px-3 py-1.5 text-sm transition-all',
                        isSelected ? 'shadow-sm' : 'hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {CATEGORY_EMOJI[cat.value]}
                      {cat.label}
                    </Badge>
                  </button>
                );
              })}
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

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">제목</Label>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  titleRemaining <= 10 ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                {titleRemaining}자 남음
              </span>
            </div>

            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              maxLength={TITLE_MAX_LENGTH}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              required
              rows={8}
              className="min-h-[200px] resize-y"
            />
          </div>

          <Separator />

          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
            <div className="space-y-1">
              <Label htmlFor="isPublic" className="cursor-pointer">
                공개 여부
              </Label>
              <p className="text-muted-foreground text-xs">
                비공개 시 본인과 관리자만 볼 수 있습니다
              </p>
            </div>

            <Button
              id="isPublic"
              type="button"
              variant={isPublic ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPublic((prev) => !prev)}
              className="min-w-[72px]"
            >
              {isPublic ? '공개' : '비공개'}
            </Button>
          </div>
        </form>
      </CardContent>

      <Separator className="mb-0" />

      <CardFooter className="flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.back()}
        >
          취소
        </Button>
        <Button
          type="submit"
          form="feedback-form"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? '등록 중...' : '의견 등록'}
        </Button>
      </CardFooter>
    </Card>
  );
};
