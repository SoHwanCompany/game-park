import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ToolStatusItem {
  key: string;
  label: string;
  configured: boolean;
  detail: string;
}

interface OperationsStatusSectionProps {
  tools: ToolStatusItem[];
}

export const OperationsStatusSection = ({ tools }: OperationsStatusSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">성장/운영 도구 상태</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => (
          <div key={tool.key} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">{tool.label}</p>
              <span
                className={
                  tool.configured
                    ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
                    : 'bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium'
                }
              >
                {tool.configured ? '연동됨' : '미설정'}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">{tool.detail}</p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        외부 모니터링은 <code className="bg-muted rounded px-1 py-0.5">/api/health</code>를
        주기적으로 호출해 DB 상태와 필수 도구 설정 여부를 확인할 수 있습니다.
      </p>
    </CardContent>
  </Card>
);
