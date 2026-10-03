export default function ModalLoading() {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" aria-hidden="true">
      <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
    </div>
  );
}
