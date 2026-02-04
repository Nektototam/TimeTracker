"use client";

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface QuickActionsWidgetProps {
  className?: string;
  onOpenCommandPalette?: () => void;
}

export function QuickActionsWidget({ className, onOpenCommandPalette }: QuickActionsWidgetProps) {
  const { t } = useTranslation();

  const actions = [
    {
      label: t('nav.reports'),
      href: '/reports',
      icon: '\uD83D\uDCCA',
    },
    {
      label: t('nav.statistics'),
      href: '/statistics',
      icon: '\uD83D\uDCC8',
    },
    {
      label: t('nav.settings'),
      href: '/settings',
      icon: '\u2699\uFE0F',
    },
  ];

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start text-left"
          >
            <Link href={action.href}>
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </Link>
          </Button>
        ))}

        {onOpenCommandPalette && (
          <Button
            onClick={onOpenCommandPalette}
            variant="outline"
            size="sm"
            className="mt-auto"
          >
            <span className="mr-2">\u2318</span>
            {t('dashboard.commandPalette')}
            <span className="ml-auto text-xs text-muted-foreground">Cmd+K</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
