'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  pendingFeedbackCount: number;
  pendingReportCount: number;
}

export const AdminSidebar = ({ pendingFeedbackCount, pendingReportCount }: AdminSidebarProps) => {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    { label: '', items: [{ label: '대시보드', href: '/admin' }] },
    {
      label: '콘텐츠',
      items: [
        { label: '게임', href: '/admin/games' },
        { label: '카테고리', href: '/admin/categories' },
        { label: '랭킹', href: '/admin/rankings' },
      ],
    },
    {
      label: '운영',
      items: [
        { label: '피드백', href: '/admin/feedback', badge: pendingFeedbackCount },
        { label: '신고', href: '/admin/reports', badge: pendingReportCount },
      ],
    },
    { label: '유저', items: [{ label: '유저 관리', href: '/admin/users' }] },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="bg-card w-60 shrink-0 border-r">
      <nav className="space-y-6 p-4">
        {groups.map((group) => (
          <div key={group.label || 'root'}>
            {group.label && (
              <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="secondary">{item.badge}</Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
