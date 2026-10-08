type Listener = () => void;

let pendingPrintFile: File | null = null;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function hasPendingConferencePrint(): boolean {
  return pendingPrintFile !== null;
}

export function setPendingConferencePrint(file: File): void {
  pendingPrintFile = file;
  notify();
}

/** Remove e retorna o arquivo pendente (uso único por lote). */
export function takePendingConferencePrint(): File | null {
  const file = pendingPrintFile;
  pendingPrintFile = null;
  notify();
  return file;
}

export function subscribePendingConferencePrint(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
