interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

export function Alert({ children, variant = 'info', title }: AlertProps) {
  const variantClasses = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <p className="text-sm">{children}</p>
    </div>
  );
}
