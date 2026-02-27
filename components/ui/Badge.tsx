export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#1863e5] border border-blue-100">
      {children}
    </span>
  );
}
