interface TableProps {
  headers: string[];
  data: React.ReactNode[][];
  className?: string;
}

export function Table({ headers, data, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b hover:bg-gray-50 transition">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
