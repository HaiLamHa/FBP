'use client';

import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// FIX: Using relative path instead of alias to resolve the import issue
import CustomModal from '@/components/CustomModal';
import { loadStoredImages, saveStoredImages } from '@/lib/galleryStorage';
import analyseBtn from '../../image/buttons/analyse.png';
import generateBtn from '../../image/buttons/generate.png';

// --- Constants ---
const NUM_SLOTS = 6;
const API_BASE_URL = '/api'; // Next.js handles proxy to self
const MAX_IMAGE_SIDE = 1400;
const JPEG_QUALITY = 0.82;

// --- Type Definitions ---
interface ImageState {
  base64: string | null;
  keywords: string[] | null;
}

interface ModalState {
  message: string;
  show: boolean;
  actionLabel?: string;
  onAction?: (() => void) | null;
}

const createEmptyImageSlots = (): ImageState[] =>
  Array.from({ length: NUM_SLOTS }, () => ({ base64: null, keywords: null }));

// --- Helpers ---
const compressDataUrl = async (
  dataUrl: string,
  maxSide: number = MAX_IMAGE_SIDE,
  quality: number = JPEG_QUALITY
): Promise<string> => {
  // If it's already small, skip work
  if (dataUrl.length < 500_000) return dataUrl;

  return new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported for compression.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression.'));
    img.src = dataUrl;
  }).catch(err => {
    console.error('Image compression failed, using original image.', err);
    return dataUrl;
  });
};

// --- Main Component ---
export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageState[]>(() => createEmptyImageSlots());
  const [keywordLoading, setKeywordLoading] = useState<boolean[]>(() => Array(NUM_SLOTS).fill(false));
  const [modal, setModal] = useState<ModalState>({ message: '', show: false });
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const storageHydrated = useRef(false);

  // Load persisted images (IndexedDB) on mount
  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      const storedImages = await loadStoredImages(NUM_SLOTS);
      if (!cancelled) {
        setImages(storedImages);
        storageHydrated.current = true;
      }
    };

    loadImages();

    return () => { cancelled = true; };
  }, []);

  // Persist images to IndexedDB whenever they change (after initial hydration)
  useEffect(() => {
    if (!storageHydrated.current) return;
    saveStoredImages(images);
  }, [images]);

  // --- Utility Functions ---

  const showModal = (message: string, action?: { label: string; handler: () => void }) =>
    setModal({
      message,
      show: true,
      actionLabel: action?.label,
      onAction: action?.handler ?? null,
    });
  const closeModal = () => setModal({ message: '', show: false });
  const showLoading = (show: boolean, text: string = "Loading...") => {
    if (typeof document !== 'undefined') {
      const loadingText = document.getElementById('loading-text');
      if (loadingText) loadingText.textContent = text;
    }
    setLoading(show);
  };

  /**
   * Reads the file input, converts to Base64, and updates state.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64DataUrl = reader.result as string;
      const compressed = await compressDataUrl(base64DataUrl);

      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[slotIndex] = { base64: compressed, keywords: null };
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Removes an image from a slot.
   */
  const removeImage = (slotIndex: number) => {
    setImages(prevImages => {
   const newImages = [...prevImages];
    newImages[slotIndex] = { base64: null, keywords: null };
    return newImages;
  });

    // Reset the file input value so the user can upload the same file again immediately
    if (fileInputRefs.current[slotIndex]) {
        fileInputRefs.current[slotIndex]!.value = '';
    }
  };

  /**
   * Removes a single keyword from a slot (on keyword click).
   */
  const removeKeyword = (slotIndex: number, keywordIndex: number) => {
    setImages(prevImages => {
      const currentSlot = prevImages[slotIndex];
      if (!currentSlot?.keywords) return prevImages;

      const updatedKeywords = currentSlot.keywords.filter((_, idx) => idx !== keywordIndex);
      const newImages = [...prevImages];
      newImages[slotIndex] = { ...currentSlot, keywords: updatedKeywords };
      return newImages;
    });
  };

  // --- API Functions ---

  /**
   * Fetches 5 keywords for a single image from the backend API.
   */
  const fetchKeywords = async (base64DataUrl: string, slotIndex: number): Promise<string[]> => {
    setKeywordLoading(prev => {
      const next = [...prev];
      next[slotIndex] = true;
      return next;
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64DataUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis failed (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }
      
      const keywords = result.keywords as string[] || [];
      
      // Update state with new keywords appended below any existing ones
      setImages(prevImages => {
        const prevSlot = prevImages[slotIndex];
        const prevKeywords = prevSlot?.keywords ?? [];
        const mergedKeywords = [...prevKeywords, ...keywords];

        const newImages = [...prevImages];
        newImages[slotIndex] = { ...prevSlot, keywords: mergedKeywords };
        return newImages;
      });
      
      return keywords;

    } catch (error) {
      console.error(`Error fetching keywords for slot ${slotIndex + 1}:`, error);
      throw new Error(`Analysis failed for slot ${slotIndex + 1}`);
    } finally {
      setKeywordLoading(prev => {
        const next = [...prev];
        next[slotIndex] = false;
        return next;
      });
    }
  };

  /**
   * Main function for the "Analyse pictures" button.
   */
  const handleAnalysis = async () => {
    const imagesToAnalyze = images.filter(img => img.base64);

    if (imagesToAnalyze.length === 0) {
      showModal("Please upload at least one image to analyze.");
      return;
    }

    // Check if analysis is already done for all uploaded images
    const pendingAnalysis = images.some(img => img.base64 && (!img.keywords || img.keywords.length < 5));

    if (!pendingAnalysis) {
        showModal("All uploaded images already have 5 keywords.");
        return;
    }

    showLoading(true, "Analyzing images...");

    const analysisPromises = images.map((img, index) => {
      if (img.base64 && (!img.keywords || img.keywords.length < 5)) {
        return fetchKeywords(img.base64, index);
      }
      return Promise.resolve(null); // Skip slots already analyzed or empty
    }).filter(p => p !== null);

    try {
      await Promise.all(analysisPromises);
    } catch (error) {
      console.error('Error analyzing images:', error);
    } finally {
      showLoading(false);
    }
  };

  /**
   * Main function for the "Generate story" button.
   */
  const handleGenerateStory = async () => {
    const evidence = images.filter(img => img.base64);

    if (evidence.length === 0) {
      showModal("Please upload at least one image first.");
      return;
    }

    if (evidence.some(item => !item.keywords)) {
      showModal("Please 'Analyse pictures' first to generate keywords for all images.");
      return;
    }

    showLoading(true, "Generating story...");

    try {
      const evidencePayload = evidence.map(img => ({
        keywords: img.keywords ?? [],
      }));

      const response = await fetch(`${API_BASE_URL}/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence: evidencePayload }),
      });
      const result = await response.json();

      if (result.story) {
        sessionStorage.setItem('generatedStory', result.story);
        window.location.href = '/verdict';
      } else {
        throw new Error(result.error || "Invalid response structure from backend.");
      }

    } catch (error) {
      console.error("Error generating story:", error);
      showModal(`Could not generate the story. Please ensure the backend is working correctly.`);
    } finally {
      showLoading(false);
    }
  };


  // --- Render Logic ---
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top navigation */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 relative flex items-center">
          <Link href="/" className="relative w-[220px] h-[80px] shrink-0">
            <NextImage
              src="/it-wasnt-me-logo.png"
              alt="It Wasn't Me logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <nav className="nav-spaced text-base md:text-lg font-semibold absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <button onClick={() => router.push('/story')} className="hover:text-black text-gray-600" type="button">STORY</button>
            <span className="px-4 py-2 bg-[#f8e61c] text-black rounded-md shadow-md active">EVIDENCE</span>
            <button onClick={() => router.push('/verdict')} className="hover:text-black text-gray-600" type="button">DEFENSE</button>
            <button onClick={() => router.push('/verdict/result')} className="hover:text-black text-gray-600" type="button">VERDICT</button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 w-full">
        <div
          className="max-w-6xl mx-auto px-4 md:px-8 mt-5 py-10 md:py-14"
          style={{ marginTop: '20px' }}
        >
          <div className="w-full text-center mb-6 text-base font-semibold text-gray-900">
            Click an empty slot to upload your evidence.
          </div>
          <div className="gallery-grid">
            {images.map((imgState, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="image-slot group">
                  {!imgState.base64 && <span className="slot-number">{index + 1}.</span>}

                  {imgState.base64 && (
                    <button
                      className="remove-button"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      &times;
                    </button>
                  )}

                  {imgState.base64 && (
                    <NextImage
                      src={imgState.base64}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-cover z-0"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      unoptimized
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, index)}
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                  />
                </div>

                <div className="keyword-container min-h-[32px] flex flex-wrap justify-center items-center gap-2">
                  {keywordLoading[index] && <div className="loading-dots" aria-label="Analyzing keywords" />}
                  {!keywordLoading[index] && imgState.keywords?.map((keyword, kIndex) => (
                    <span
                      key={kIndex}
                      className="keyword-tag"
                      role="button"
                      tabIndex={0}
                      title="Click to remove keyword"
                      onClick={() => removeKeyword(index, kIndex)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          removeKeyword(index, kIndex);
                        }
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-20 mt-10" style={{ columnGap: '52px' }}>
            <button
              id="analyze-btn"
              className="inline-flex items-center justify-center disabled:opacity-50 bg-transparent border-0 p-0 transition-transform hover:scale-105 focus:scale-105"
              onClick={handleAnalysis}
              disabled={loading}
              aria-label="Analyse"
              style={{ background: 'transparent', border: 'none' }}
            >
              <NextImage
                src={analyseBtn}
                alt="Analyse"
                width={102}
                height={33}
                style={{ width: '102px', height: 'auto' }}
              />
            </button>
            <button
              id="generate-btn"
              className="inline-flex items-center justify-center disabled:opacity-50 bg-transparent border-0 p-0 transition-transform hover:scale-105 focus:scale-105"
              onClick={handleGenerateStory}
              disabled={loading}
              aria-label="Generate"
              style={{ background: 'transparent', border: 'none' }}
            >
              <NextImage
                src={generateBtn}
                alt="Generate"
                width={102}
                height={33}
                style={{ width: '102px', height: 'auto' }}
              />
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="loading-modal-overlay">
          <div className="loading-spinner"></div>
          <p id="loading-text">Loading...</p>
        </div>
      )}

      <CustomModal
        show={modal.show}
        message={modal.message}
        onClose={closeModal}
        primaryLabel={modal.actionLabel}
        onPrimary={modal.onAction ?? undefined}
      />
    </main>
  );
}
