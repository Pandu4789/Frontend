// Filename: KnowledgeBase.js - UPDATED with Backend Integration
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaHeading, FaListUl, FaListOl, FaQuoteLeft, FaAlignLeft, FaAlignCenter, FaAlignRight, FaUndo, FaRedo } from 'react-icons/fa';
import './KnowledgeBase.css';

const API_BASE = "http://localhost:8080";

// --- The Toolbar Component (no changes needed) ---
// --- The Toolbar Component ---
const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="kb-menu-bar">
        <div className="menu-group">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="Bold"><FaBold /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="Italic"><FaItalic /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''} title="Underline"><FaUnderline /></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''} title="Strikethrough"><FaStrikethrough /></button>
            <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} title="Text Color" />
        </div>
        <div className="menu-group">
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} title="Heading"><FaHeading /> H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''} title="Heading"><FaHeading /> H3</button>
        </div>
        <div className="menu-group">
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Bullet List"><FaListUl /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Numbered List"><FaListOl /></button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''} title="Blockquote"><FaQuoteLeft /></button>
        </div>
        <div className="menu-group">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''} title="Align Left"><FaAlignLeft /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''} title="Align Center"><FaAlignCenter /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''} title="Align Right"><FaAlignRight /></button>
        </div>
        <div className="menu-group">
            <button onClick={() => editor.chain().focus().undo().run()} title="Undo"><FaUndo /></button>
            <button onClick={() => editor.chain().focus().redo().run()} title="Redo"><FaRedo /></button>
        </div>
    </div>
  );
};

// --- Main View Component ---
const KnowledgeBase = ({ content, onSave, priestId }) => { // The onSave prop from dashboard is still used for instant UI update
    const [isEditMode, setIsEditMode] = useState(false);
    
    const editor = useEditor({
        extensions: [
            StarterKit, Underline, TextStyle, Color,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Start writing your notes and mantras...' })
        ],
        content: content,
        editable: isEditMode,
    });
    
    // When edit mode changes, update the editor
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditMode);
        }
    }, [isEditMode, editor]);

    // When the parent content changes, update the editor
useEffect(() => {
  if (!editor) return;

  const priestId = localStorage.getItem('userId');
  if (!priestId) {
    toast.error("Could not load notes. Priest ID missing.");
    return;
  }

  const fetchKnowledgeBase = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/knowledgebase/${priestId}`);
      
      // Since the response is just a plain HTML string
      const content = res.data || "";
      editor.commands.setContent(content, false);
    } catch (err) {
      toast.error("Failed to load notes.");
      console.error("Fetch KnowledgeBase Error:", err);
    }
  };

  fetchKnowledgeBase();
}, [editor]);

    const handleSave = async () => {
        const priestId = localStorage.getItem('userId');
        if (!priestId) {
            toast.error("Could not find Priest ID to save notes.");
            return;
        }

        const updatedContent = editor.getHTML();

        try {
            await axios.post(`${API_BASE}/api/knowledgebase`, {
                priestId: priestId,
                content: updatedContent,
            });

            onSave(updatedContent); // Update the parent state for instant refresh
            setIsEditMode(false);
            toast.success("Notes saved successfully!");

        } catch (error) {
            toast.error("Failed to save notes.");
            console.error("Save KnowledgeBase Error:", error);
        }
    };

    return (
        <div className="kb-view-container">
            <div className="kb-view-header">
                <h3 className="pd-section-title">Knowledge Base</h3>
                <div className="kb-view-actions">
                    {isEditMode ? (
                        <>
                            <button onClick={() => setIsEditMode(false)} className="kb-btn secondary">Cancel</button>
                            <button onClick={handleSave} className="kb-btn primary">Save Notes</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="kb-btn primary">Edit</button>
                    )}
                </div>
            </div>
            {isEditMode && <MenuBar editor={editor} />}
            <div className={`editor-content-wrapper ${isEditMode ? 'is-editing' : ''}`}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default KnowledgeBase;