import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shiksha Infotech Ambikapur Result Viewer" },
      { name: "description", content: "View your Shiksha Infotech Ambikapur exam results quickly and easily." },
      { property: "og:title", content: "Shiksha Infotech Ambikapur Result Viewer" },
      { property: "og:description", content: "View your Shiksha Infotech Ambikapur exam results quickly and easily." },
    ],
  }),
  component: AisectResultViewer,
});

function AisectResultViewer() {
  const [regNo, setRegNo] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buildUrl = useCallback((reg: string) => {
    return `https://www.aisectonline.com/StudentRes/PrevPrintResult?REG_NO=${encodeURIComponent(reg)}&SEMNO=0&ServiceID=1`;
  }, []);

  const handleSearch = useCallback(() => {
    setError("");
    setShowFallback(false);

    if (!regNo.trim()) {
      setError("Please enter a registration number.");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    const url = buildUrl(regNo.trim());
    setResultUrl(url);

    // Show fallback option after a few seconds since cross-origin iframe
    // blocking cannot be reliably detected client-side.
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = setTimeout(() => {
      setShowFallback(true);
      setIsLoading(false);
    }, 3500);
  }, [regNo, buildUrl]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  const openResult = useCallback(() => {
    if (!regNo.trim()) return;
    window.open(buildUrl(regNo.trim()), "_self");
  }, [regNo, buildUrl]);

  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Shiksha Infotech Ambikapur Result Viewer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your registration number to view your result
          </p>
        </div>

        {/* Search Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="reg-no" className="sr-only">
                Registration Number
              </label>
              <Input
                id="reg-no"
                ref={inputRef}
                type="text"
                placeholder="Enter Registration Number"
                value={regNo}
                onChange={(e) => {
                  setRegNo(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                className="h-11 text-base"
                autoComplete="off"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-11 gap-2 px-6 text-base shadow-md transition-all hover:shadow-lg"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Area */}
        {resultUrl && (
          <div className="mt-6 space-y-4">
            {/* Loading state */}
            {isLoading && !showFallback && (
              <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-12 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading result...</p>
                </div>
              </div>
            )}

            {/* Iframe */}
            <div
              className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${isLoading && !showFallback ? "hidden" : "block"}`}
            >
              <iframe
                ref={iframeRef}
                src={resultUrl}
                title="Shiksha Infotech Ambikapur Result"
                className="h-[70vh] w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

            {/* Fallback */}
            {showFallback && (
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  If the result doesn&apos;t display above, the website may block embedding.
                </p>
                <Button
                  onClick={openResult}
                  variant="outline"
                  className="mt-3 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Result
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Not affiliated with AISECT University. This is an unofficial result viewer.
        </p>
      </div>
    </div>
  );
}
