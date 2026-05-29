import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopListItem {
  key: string;
  primary: string;
  secondary: string;
}

interface TopListSectionProps {
  title: string;
  items: TopListItem[];
  emptyMessage?: string;
}

export const TopListSection = ({
  title,
  items,
  emptyMessage = '데이터 없음',
}: TopListSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-muted-foreground w-4 shrink-0 text-right tabular-nums">
                  {index + 1}
                </span>
                <span className="truncate">{item.primary}</span>
              </span>
              <span className="text-muted-foreground shrink-0 tabular-nums">{item.secondary}</span>
            </li>
          ))}
        </ol>
      )}
    </CardContent>
  </Card>
);
