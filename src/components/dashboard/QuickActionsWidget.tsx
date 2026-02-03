"use client";

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Widget } from '../ui/Widget';
import { Button } from '../ui/Button';

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
    <Widget title={t('dashboard.quickActions')} className={className}>
      <div className="flex flex-col gap-2 h-full">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
            >
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </Button>
          </Link>
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
            <span className="ml-auto text-xs text-gray-400">Cmd+K</span>
          </Button>
        )}
      </div>
    </Widget>
  );
}
