import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, IconButton, Divider, Tooltip, Paper } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Link as LinkIcon,
  LinkOff,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
  HorizontalRule,
} from '@mui/icons-material';

// Extracted outside of render to avoid "Cannot create components during render"
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <Tooltip title={title} arrow placement="top">
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          borderRadius: 1,
          bgcolor: active ? 'rgba(236, 114, 17, 0.15)' : 'transparent',
          color: active ? '#ec7211' : 'text.secondary',
          '&:hover': { bgcolor: active ? 'rgba(236, 114, 17, 0.25)' : 'action.hover' },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

function MenuBar({ editor }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('הכנס כתובת URL:');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('הכנס כתובת תמונה (URL):');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.25,
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fafafa',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Heading buttons */}
      {[1, 2, 3].map((level) => (
        <ToolbarButton
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          active={editor.isActive('heading', { level })}
          title={`כותרת ${level === 1 ? 'ראשית' : level === 2 ? 'משנית' : 'שלישית'} (H${level})`}
        >
          <Box component="span" sx={{ fontWeight: 700, fontSize: level === 1 ? '0.95rem' : level === 2 ? '0.85rem' : '0.75rem' }}>
            H{level}
          </Box>
        </ToolbarButton>
      ))}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="מודגש (Ctrl+B)">
        <FormatBold fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="נטוי (Ctrl+I)">
        <FormatItalic fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="קו תחתון (Ctrl+U)">
        <FormatUnderlined fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="קו חוצה">
        <FormatStrikethrough fontSize="small" />
      </ToolbarButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="רשימה עם נקודות">
        <FormatListBulleted fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="רשימה ממוספרת">
        <FormatListNumbered fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="ציטוט">
        <FormatQuote fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="בלוק קוד">
        <Code fontSize="small" />
      </ToolbarButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="יישור לימין">
        <FormatAlignRight fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="יישור למרכז">
        <FormatAlignCenter fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="יישור לשמאל">
        <FormatAlignLeft fontSize="small" />
      </ToolbarButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Links & Images */}
      <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="הוסף קישור">
        <LinkIcon fontSize="small" />
      </ToolbarButton>
      {editor.isActive('link') && (
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="הסר קישור">
          <LinkOff fontSize="small" />
        </ToolbarButton>
      )}
      <ToolbarButton onClick={addImage} title="הוסף תמונה (URL)">
        <ImageIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="קו הפרדה">
        <HorizontalRule fontSize="small" />
      </ToolbarButton>

      <Box sx={{ flex: 1 }} />

      {/* Undo / Redo */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="בטל (Ctrl+Z)">
        <Undo fontSize="small" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="חזור (Ctrl+Y)">
        <Redo fontSize="small" />
      </ToolbarButton>
    </Box>
  );
}

function RichTextEditor({ value, onChange, placeholder = 'התחל לכתוב כאן...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        '& .tiptap': {
          p: 2,
          minHeight: 350,
          outline: 'none',
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: "'Heebo', 'Rubik', sans-serif",
          fontSize: '0.95rem',
          lineHeight: 1.8,
          '& h1': { fontSize: '1.8rem', fontWeight: 700, mt: 3, mb: 1 },
          '& h2': { fontSize: '1.4rem', fontWeight: 700, mt: 2.5, mb: 1 },
          '& h3': { fontSize: '1.15rem', fontWeight: 600, mt: 2, mb: 0.5 },
          '& p': { my: 0.5 },
          '& blockquote': {
            borderRight: '4px solid #ec7211',
            borderLeft: 'none',
            pr: 2,
            pl: 0,
            my: 2,
            color: 'text.secondary',
            fontStyle: 'italic',
          },
          '& ul, & ol': { pr: 3 },
          '& a': { color: '#ec7211', textDecoration: 'underline' },
          '& img': { maxWidth: '100%', borderRadius: 2, my: 2 },
          '& code': { bgcolor: '#f5f5f5', px: 0.5, borderRadius: 0.5, fontSize: '0.85em' },
          '& pre': { bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 2, overflow: 'auto' },
          '& hr': { border: 'none', borderTop: '1px solid #e0e0e0', my: 2 },
          '& .is-editor-empty:first-child::before': {
            content: 'attr(data-placeholder)',
            float: 'right',
            color: '#adb5bd',
            pointerEvents: 'none',
            height: 0,
          },
        },
      }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </Paper>
  );
}

export default RichTextEditor;
