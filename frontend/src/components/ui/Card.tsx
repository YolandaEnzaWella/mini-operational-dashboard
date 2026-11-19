import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, description, action, className = '', children }: CardProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>}
            {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
