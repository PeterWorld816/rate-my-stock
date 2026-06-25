"use client";
import { useRef, useState } from "react";
import { Result } from "@/app/page";

export default function FaceMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const submit = async () => {
    if (!file || !preview) return;
    setLoading(true);
    try {
      const base64 = preview.split(",")[1];
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "face", image: base64 }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      alert("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        ← Back
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md mb-4">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#00D08418", color: "#00D084" }}>
          🤳 Face Read Mode
        </div>

        <h2 className="font-display font-bold text-2xl mb-1">Upload Your Photo</h2>
        <p className="text-sm text-[#6B7280] mb-5">AI reads your vibe. No data stored, just vibes.</p>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative rounded-2xl border-2 border-dashed border-[#E5E5E0] bg-[#F5F5F0] h-52 flex flex-col items-center justify-center cursor-pointer hover:border-[#00D084] hover:bg-[#F0FDF4] transition-all overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-cover rounded-xl" />
          ) : (
            <>
              <span className="text-4xl mb-2">📸</span>
              <p className="text-sm font-medium text-[#374151]">Drop photo here</p>
              <p className="text-xs text-[#9CA3AF]">or tap to browse</p>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {preview && !loading && (
          <button onClick={submit}
            className="w-full mt-4 rounded-2xl touch-target text-sm font-semibold text-white flex items-center justify-center"
            style={{ background: "#00D084" }}>
            Analyze My Stock Match 🔍
          </button>
        )}

        {loading && (
          <div className="mt-4 rounded-2xl shimmer touch-target" />
        )}
      </div>

      <p className="text-[10px] text-[#9CA3AF] text-center leading-relaxed">
        Your photo is analyzed in real-time and never stored. For fun only — not financial advice.
      </p>
    </section>
  );
}
