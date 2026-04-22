type Props = {
  message: string;
};

export function FobLoadError({ message }: Props) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Не удалось загрузить данные</h1>
      <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-100">
        {message}
      </p>
      <p className="text-sm leading-relaxed text-slate-400">
        Убедитесь, что файл{" "}
        <span className="font-mono text-slate-300">GEORGIA FOB - NEW FOB from 01_04_2026.csv</span>{" "}
        лежит в корне папки проекта (рядом с <span className="font-mono text-slate-300">package.json</span>
        ), затем перезапустите сервер разработки.
      </p>
    </main>
  );
}
