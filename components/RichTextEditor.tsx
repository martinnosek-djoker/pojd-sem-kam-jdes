"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  uploadedImages?: string[];
  onImageUpload?: (file: File) => Promise<string>;
  onImageUrlAdd?: (url: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Začněte psát...",
  uploadedImages = [],
  onImageUpload,
  onImageUrlAdd,
}: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-purple-400 underline hover:text-purple-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    setUploadingImage(true);
    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
      setShowImageDialog(false);
      event.target.value = ""; // Reset input
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Nepodařilo se nahrát obrázek");
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      // Also add to gallery if callback provided
      if (onImageUrlAdd) {
        onImageUrlAdd(imageUrl);
      }
      setImageUrl("");
      setShowImageDialog(false);
    }
  };

  const insertImageFromList = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowImageDialog(false);
  };

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm font-semibold ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm font-semibold ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-bold ${
            editor.isActive("bold")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm italic ${
            editor.isActive("italic")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 rounded text-sm underline ${
            editor.isActive("underline")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          U
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("bulletList")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("orderedList")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1. List
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("blockquote")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          " Quote
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("link")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          🔗 Link
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={() => setShowImageDialog(true)}
          className="px-3 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100"
        >
          🖼️ Obrázek
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="px-3 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100"
        >
          ✕ Clear
        </button>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            <button
              type="button"
              onClick={addLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Přidat
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkDialog(false);
                setLinkUrl("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Zrušit
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 Nejdřív vyber text v editoru, pak přidej odkaz
          </p>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="bg-green-50 border-b border-green-200 p-4 space-y-4">
          {/* Already uploaded images */}
          {uploadedImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                📸 Nahrané fotky recenze (klikni pro vložení do textu)
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                {uploadedImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertImageFromList(url)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-green-500 transition-all hover:scale-105"
                  >
                    <img
                      src={url}
                      alt={`Obrázek ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload new image */}
          {onImageUpload && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                📤 Nebo nahraj nový obrázek
              </h4>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  disabled={uploadingImage}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
                {uploadingImage && (
                  <span className="px-4 py-2 text-sm text-gray-600">Nahrávám...</span>
                )}
              </div>
            </div>
          )}

          {/* URL input */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              🔗 Nebo vlož URL obrázku
            </h4>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertImageFromUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={insertImageFromUrl}
                disabled={!imageUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Vložit
              </button>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowImageDialog(false);
                setImageUrl("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
