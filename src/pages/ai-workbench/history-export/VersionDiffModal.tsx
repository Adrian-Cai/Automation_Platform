import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VersionDiffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const diffs = [
  { label: '新增用例', value: '28 条', className: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { label: '删除用例', value: '6 条', className: 'text-red-500 bg-red-50 border-red-100' },
  { label: '变更模块', value: '3 个', className: 'text-orange-500 bg-orange-50 border-orange-100' },
];

export default function VersionDiffModal({ open, onOpenChange }: VersionDiffModalProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>V1.2 与 V1.1 的差异</DialogTitle>
          <DialogDescription>以下为当前版本相对上一版本的测试用例差异摘要。</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {diffs.map((diff) => (
            <div key={diff.label} className={`flex items-center justify-between rounded-xl border p-4 ${diff.className}`}>
              <span className="text-sm font-semibold">{diff.label}</span>
              <span className="text-xl font-bold">{diff.value}</span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 h-10 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => onOpenChange(false)}>
          知道了
        </button>
      </DialogContent>
    </Dialog>
  );
}
