import { useState } from 'react';

export const PDF_FAILED = "We couldn't prepare the PDF. Check your connection and try again.";

// Resolves true if `run` finished, false if it threw or rejected. Never throws.
export async function succeeded(run) {
  try {
    await run();
    return true;
  } catch {
    return false;
  }
}

// [start, failed] for a download that can fail — the PDF code is loaded on demand, so it
// fails when the network is gone. `failed` drives an inline message.
export function useDownload(download) {
  const [failed, setFailed] = useState(false);
  async function start(...args) {
    setFailed(false);
    setFailed(!(await succeeded(() => download(...args))));
  }
  return [start, failed];
}
