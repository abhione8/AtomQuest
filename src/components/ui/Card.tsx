interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${hoverable ? 'hover:shadow-lg transition' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`border-b pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={`text-lg font-bold text-gray-800 ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`text-gray-700 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={`border-t pt-4 mt-4 flex justify-between ${className}`}>
      {children}
    </div>
  );
}
