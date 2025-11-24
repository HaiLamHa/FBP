'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// FIX: Using relative path instead of alias to resolve the import issue
import CustomModal from '@/components/CustomModal';

// --- Constants ---
const NUM_SLOTS = 6;
const STORAGE_KEY = 'itwasntme_uploaded_images';
const API_BASE_URL = '/api'; // Next.js handles proxy to self

// --- Type Definitions ---
interface ImageState {
  base64: string | null;
  keywords: string[] | null;
}

// --- Persistence Functions ---
const saveImagesToLocalStorage = (images: ImageState[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images.map(img => img.base64)));
  } catch (e) { console.error("Error saving images:", e); }
};

const loadImagesFromLocalStorage = (): ImageState[] => {
  if (typeof window === 'undefined') return Array(NUM_SLOTS).fill({ base64: null, keywords: null });

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const loadedBase64s: (string | null)[] = JSON.parse(storedData);
      return loadedBase64s.map(base64 => ({ base64, keywords: null }));
    }
  } catch (e) {
    console.error("Error loading images:", e);
  }
  return Array(NUM_SLOTS).fill({ base64: null, keywords: null });
};

// --- Main Component ---
export default function GalleryPage() {
  const [images, setImages] = useState<ImageState[]>(() => loadImagesFromLocalStorage());
  const [modal, setModal] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update localStorage whenever the images state changes
  useEffect(() => {
    saveImagesToLocalStorage(images);
  }, [images]);

  // --- Utility Functions ---

  const showModal = (message: string) => setModal({ message, show: true });
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64DataUrl = reader.result as string;

      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[slotIndex] = { base64: base64DataUrl, keywords: null };
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

  // --- API Functions ---

  /**
   * Fetches 4 keywords for a single image from the backend API.
   */
  const fetchKeywords = async (base64DataUrl: string, slotIndex: number): Promise<string[]> => {
    // Show loading indicator in the slot
    const keywordsContainer = document.getElementById(`keywords-${slotIndex + 1}`);
    if (keywordsContainer) keywordsContainer.innerHTML = '<div class="loading-dots"></div>';
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64DataUrl }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }
      
      const keywords = result.keywords as string[] || [];
      
      // Update state with keywords
      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[slotIndex] = { ...newImages[slotIndex], keywords: keywords.slice(0, 4) };
        return newImages;
      });
      
      return keywords;

    } catch (error) {
      console.error(`Error fetching keywords for slot ${slotIndex + 1}:`, error);
      if (keywordsContainer) keywordsContainer.innerHTML = '<span class="error-text">Analysis failed</span>';
      throw new Error(`Analysis failed for slot ${slotIndex + 1}`);
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
    const pendingAnalysis = images.some(img => img.base64 && img.keywords === null);

    if (!pendingAnalysis) {
        showModal("All uploaded images have already been analyzed.");
        return;
    }

    showLoading(true, "Analyzing images...");

    const analysisPromises = images.map((img, index) => {
      if (img.base64 && img.keywords === null) {
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
      const response = await fetch(`${API_BASE_URL}/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence: evidence }),
      });
      const result = await response.json();

      if (result.story) {
        sessionStorage.setItem('generatedStory', result.story);
        window.location.href = '/story'; // Navigate to the story page
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
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">It Wasn&apos;t Me - Gallery</h1>

        {/* Image Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-12">
          {images.map((imgState, index) => (
            <div key={index} className="flex flex-col">
              {/* Image Slot (Rectangular Aspect Ratio) */}
              <div className="image-slot group">
                <span className="absolute top-2 left-2 text-white font-bold bg-black bg-opacity-50 px-2 rounded z-20">
                  {index + 1}.
                </span>
                
                {/* Remove Button */}
                <button 
                  className={`remove-button ${imgState.base64 ? '' : 'hidden'}`}
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                >
                  &times;
                </button>

                {/* Image Preview */}
                {imgState.base64 && (
                  <Image
                    src={imgState.base64}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover z-0"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                )}
                
                {/* Hidden file input */}
                <input
                  type="file" 
                  accept="image/*" 
                  className="file-input" 
                  onChange={(e) => handleFileChange(e, index)}
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                />
                
                {/* Placeholder Text */}
                {!imgState.base64 && (
                    <span className="text-white text-lg z-10 p-4 text-center group-hover:underline">Click to Upload Image</span>
                )}
              </div>

              {/* Keyword Area */}
              <div id={`keywords-${index + 1}`} className="keyword-container min-h-[40px] mt-3 flex flex-wrap justify-center items-center gap-2 py-1">
                {imgState.keywords?.map((keyword, kIndex) => (
                  <span key={kIndex} className="keyword-tag">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* AI Buttons */}
        <div className="flex justify-center space-x-8">
            <button 
              id="analyze-btn" 
              className="py-3 px-8 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-150 ease-in-out font-semibold text-lg disabled:opacity-50"
              onClick={handleAnalysis}
              disabled={loading}
            >
              Analyse pictures
            </button>
            <button 
              id="generate-btn" 
              className="py-3 px-8 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-150 ease-in-out font-semibold text-lg disabled:opacity-50"
              onClick={handleGenerateStory}
              disabled={loading}
            >
              Generate story
            </button>
        </div>

        <p className="text-center mt-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 underline" legacyBehavior>
                &larr; Back to Main Menu
            </Link>
        </p>
      </div>

      {/* Loading Modal */}
      {loading && (
        <div className="loading-modal-overlay">
          <div className="loading-spinner"></div>
          <p id="loading-text">Loading...</p>
        </div>
      )}

      {/* Custom Alert/Error Modal */}
      <CustomModal 
        show={modal.show} 
        message={modal.message} 
        onClose={closeModal} 
      />
    </div>
  );
}
