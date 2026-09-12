'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

// Geotag/timestamp attachment and submission handling belong to the core workflow step, once one has been chosen and scoped.
export function PhotoSubmissionArea() {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  function handleClear() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-zinc-100">Submit an image</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Location and timestamp will be attached automatically once submission is wired up.
      </p>

      {preview ? (
        <div className="relative mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a remote image */}
          <img
            src={preview}
            alt="Selected bushfire photo preview"
            className="max-h-64 w-full rounded-md object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            aria-label="Remove selected photo"
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-zinc-700 py-10 text-center hover:border-zinc-500">
          <ImagePlus className="h-8 w-8 text-zinc-400" />
          <span className="text-sm text-zinc-500">Click to attach a photo, or drag one in</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}

      <button
        type="button"
        disabled={!preview}
        className="bg-ink text-surface hover:bg-brand-600 mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit for assessment
      </button>
    </div>
  )
}
