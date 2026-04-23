import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import axios from "axios";
import { toast } from "react-toastify";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaUndo,
  FaRedo,
  FaSave,
  FaTimes,
  FaPen,
  FaStickyNote,
} from "react-icons/fa";
import "./KnowledgeBase.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="kb-menu-bar">
      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          <FaStrikethrough />
        </button>
        <input
          type="color"
          onInput={(event) =>
            editor.chain().focus().setColor(event.target.value).run()
          }
          value={editor.getAttributes("textStyle").color || "#000000"}
        />
      </div>
      <div className="menu-group">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
      </div>
      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <FaListOl />
        </button>
      </div>
      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <FaAlignRight />
        </button>
      </div>
      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <FaUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

const KnowledgeBase = ({ onSave }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const priestId = localStorage.getItem("userId");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your sacred notes and mantras...",
      }),
    ],
    content: "",
    editable: false,
  });

  // 1. Initial Fetch from Backend
  useEffect(() => {
    if (!editor || !priestId) return;

    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/knowledgebase/${priestId}`,
        );
        editor.commands.setContent(res.data || "");
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchContent();
  }, [editor, priestId]);

  // 2. Sync Editable State
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditMode);
    }
  }, [isEditMode, editor]);

  const handleSave = async () => {
    const htmlContent = editor.getHTML();
    try {
      await axios.post(`${API_BASE}/api/knowledgebase`, {
        priestId: priestId,
        content: htmlContent,
      });
      setIsEditMode(false);
      if (onSave) onSave(htmlContent);
      toast.success("Divine notes synchronized!");
    } catch (error) {
      toast.error("Failed to save notes.");
    }
  };

  return (
    <div className="kb-view-container">
      <div className="kb-view-header">
        <div className="kb-header-title">
          <FaStickyNote className="txt-orange" />
          <h3>Sacred Notes</h3>
        </div>
        <div className="kb-view-actions">
          {isEditMode ? (
            <>
              <button
                onClick={() => setIsEditMode(false)}
                className="kb-btn secondary"
              >
                <FaTimes /> Cancel
              </button>
              <button onClick={handleSave} className="kb-btn primary">
                <FaSave /> Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="kb-btn primary"
            >
              <FaPen /> Edit Mantras
            </button>
          )}
        </div>
      </div>

      {isEditMode && <MenuBar editor={editor} />}

      <div
        className={`editor-content-wrapper ${isEditMode ? "is-editing" : ""}`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default KnowledgeBase;
