"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    Menu,
    Button,
    Popover,
    TextField,
    Tooltip,
} from "@mui/material";
import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    FormatStrikethrough,
    FormatListBulleted,
    FormatListNumbered,
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatAlignJustify,
    FormatIndentIncrease,
    FormatIndentDecrease,
    Code,
    Link as LinkIcon,
    FormatQuote,
    Undo,
    Redo,
    Subscript,
    Superscript,
    FormatClear,
    CheckBox,
    HorizontalRule,
    TableChart,
    FormatColorText,
    FormatColorFill,
    Add,
    ContentCopy,
    Delete,
    Download,
    Upload,
    Image as ImageIcon,
    DateRange,
    TextFields,
    Psychology,
    Note,
    Apps,
} from "@mui/icons-material";

// Lexical imports
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
    $getRoot,
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    $createParagraphNode,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    EditorState,
} from "lexical";
import {
    HeadingNode,
    QuoteNode,
    $createHeadingNode,
    $createQuoteNode,
} from "@lexical/rich-text";
import {
    ListNode,
    ListItemNode,
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list";
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import {
    TableNode,
    TableCellNode,
    TableRowNode,
    INSERT_TABLE_COMMAND,
} from "@lexical/table";
import {
    HorizontalRuleNode,
    INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $patchStyleText } from "@lexical/selection";

import "./lexical.css";

interface LexicalEditorProps {
    initialValue?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    mode?: "light" | "dark";
    readOnly?: boolean;
}

// Custom commands
const FORMAT_FONT_FAMILY_COMMAND = createCommand<string>();
const FORMAT_FONT_SIZE_COMMAND = createCommand<string>();
const FORMAT_TEXT_COLOR_COMMAND = createCommand<string>();
const FORMAT_BG_COLOR_COMMAND = createCommand<string>();

const theme = {
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        code: "editor-text-code",
        subscript: "editor-text-subscript",
        superscript: "editor-text-superscript",
    },
    list: {
        ul: "editor-list-ul",
        ol: "editor-list-ol",
        listitem: "editor-listitem",
        nested: {
            listitem: "editor-nested-listitem",
        },
        checklist: "editor-checklist",
    },
    heading: {
        h1: "editor-heading-h1",
        h2: "editor-heading-h2",
        h3: "editor-heading-h3",
        h4: "editor-heading-h4",
        h5: "editor-heading-h5",
        h6: "editor-heading-h6",
    },
    quote: "editor-quote",
    code: "editor-code",
    codeHighlight: {
        aml: "editor-code-highlight-aml",
        atom: "editor-code-highlight-atom",
        attribute: "editor-code-highlight-attribute",
        boolean: "editor-code-highlight-boolean",
        builtin: "editor-code-highlight-builtin",
        cdata: "editor-code-highlight-cdata",
        char: "editor-code-highlight-char",
        class: "editor-code-highlight-class",
        cm: "editor-code-highlight-cm",
        comment: "editor-code-highlight-comment",
        constant: "editor-code-highlight-constant",
        deletion: "editor-code-highlight-deletion",
        doctype: "editor-code-highlight-doctype",
        entity: "editor-code-highlight-entity",
        error: "editor-code-highlight-error",
        function: "editor-code-highlight-function",
        important: "editor-code-highlight-important",
        insertion: "editor-code-highlight-insertion",
        keyword: "editor-code-highlight-keyword",
        namespace: "editor-code-highlight-namespace",
        number: "editor-code-highlight-number",
        operator: "editor-code-highlight-operator",
        prolog: "editor-code-highlight-prolog",
        property: "editor-code-highlight-property",
        punctuation: "editor-code-highlight-punctuation",
        regex: "editor-code-highlight-regex",
        selector: "editor-code-highlight-selector",
        string: "editor-code-highlight-string",
        tag: "editor-code-highlight-tag",
        unit: "editor-code-highlight-unit",
        variable: "editor-code-highlight-variable",
    },
    link: "editor-link",
    paragraph: "editor-paragraph",
    table: "editor-table",
    tableCell: "editor-table-cell",
    tableRow: "editor-table-row",
    hr: "editor-hr",
};

// Renk Paleti
const COLORS = [
    "#000000", "#ffffff", "#888888",
    "#ff0000", "#00cc00", "#0066ff",
    "#ffff00", "#ff00ff", "#00ffff",
    "#ff8800", "#8800ff", "#00ff88",
    "#ff4444", "#44ff44", "#4444ff",
];

// ToolbarPlugin Component
const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState("paragraph");
    const [fontSize, setFontSize] = useState("16px");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("transparent");

    // Menu states
    const [insertAnchorEl, setInsertAnchorEl] = useState<null | HTMLElement>(null);
    const [colorAnchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null);
    const [bgColorAnchorEl, setBgColorAnchorEl] = useState<null | HTMLElement>(null);
    const [tableAnchorEl, setTableAnchorEl] = useState<null | HTMLElement>(null);
    const [stylesAnchorEl, setStylesAnchorEl] = useState<null | HTMLElement>(null);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsCode(selection.hasFormat("code"));
            setIsSubscript(selection.hasFormat("subscript"));
            setIsSuperscript(selection.hasFormat("superscript"));

            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === "root"
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();

            if ($getNearestNodeOfType(anchorNode, HeadingNode)) {
                const tag = (element as any).getTag?.();
                setBlockType(tag || "paragraph");
            } else if ($getNearestNodeOfType(anchorNode, QuoteNode)) {
                setBlockType("quote");
            } else if ($getNearestNodeOfType(anchorNode, CodeNode)) {
                setBlockType("code");
            } else {
                setBlockType("paragraph");
            }
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    // Register custom commands
    useEffect(() => {
        return editor.registerCommand(
            FORMAT_FONT_FAMILY_COMMAND,
            (family: string) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { "font-family": family });
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            FORMAT_FONT_SIZE_COMMAND,
            (size: string) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { "font-size": size });
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            FORMAT_TEXT_COLOR_COMMAND,
            (color: string) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { color });
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            FORMAT_BG_COLOR_COMMAND,
            (color: string) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { "background-color": color });
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    // Format functions
    const formatHeading = (headingSize: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const formatCode = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createCodeNode());
            }
        });
    };

    const insertLink = useCallback(() => {
        const url = prompt("URL girin:");
        if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
    }, [editor]);

    const insertHorizontalRule = () => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
        setInsertAnchorEl(null);
    };

    const insertTable = (rows: number, cols: number) => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: String(rows), columns: String(cols) });
        setTableAnchorEl(null);
    };

    const clearEditor = () => {
        if (confirm("Editörün tüm içeriğini silmek istiyor musunuz?")) {
            editor.update(() => {
                $getRoot().clear();
            });
        }
    };

    const handleFontFamilyChange = (e: any) => {
        const family = e.target.value;
        setFontFamily(family);
        editor.update(() => {
            editor.dispatchCommand(FORMAT_FONT_FAMILY_COMMAND, family);
        });
    };

    const handleFontSizeChange = (e: any) => {
        const size = e.target.value;
        setFontSize(size);
        editor.update(() => {
            editor.dispatchCommand(FORMAT_FONT_SIZE_COMMAND, size);
        });
    };

    const handleTextColorChange = (color: string) => {
        setTextColor(color);
        editor.update(() => {
            editor.dispatchCommand(FORMAT_TEXT_COLOR_COMMAND, color);
        });
        setColorAnchorEl(null);
    };

    const handleBgColorChange = (color: string) => {
        setBgColor(color);
        editor.update(() => {
            editor.dispatchCommand(FORMAT_BG_COLOR_COMMAND, color);
        });
        setBgColorAnchorEl(null);
    };

    // Insert Helper Functions
    const insertIframe = (html: string) => {
        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertNodes(nodes);
            }
        });
    };

    const insertElement = (tagName: string, attributes: Record<string, string>, content: string = "") => {
        editor.update(() => {
            const html = `<${tagName} ${Object.entries(attributes).map(([k, v]) => `${k}="${v}"`).join(" ")}>${content}</${tagName}>`;
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertNodes(nodes);
            }
        });
    };

    return (
        <Box className="lexical-toolbar">
            {/* Block Type Selector */}
            <Tooltip title="Blok türü">
                <FormControl size="small" sx={{ minWidth: 130, mr: 0.5 }}>
                    <Select
                        value={blockType}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "paragraph") {
                                formatParagraph();
                            } else if (value === "quote") {
                                formatQuote();
                            } else if (value === "code") {
                                formatCode();
                            } else if (value.startsWith("h")) {
                                formatHeading(value as any);
                            }
                        }}
                        className="lexical-toolbar-select"
                    >
                        <MenuItem value="paragraph">Normal</MenuItem>
                        <MenuItem value="h1">Başlık 1</MenuItem>
                        <MenuItem value="h2">Başlık 2</MenuItem>
                        <MenuItem value="h3">Başlık 3</MenuItem>
                        <MenuItem value="h4">Başlık 4</MenuItem>
                        <MenuItem value="h5">Başlık 5</MenuItem>
                        <MenuItem value="h6">Başlık 6</MenuItem>
                        <MenuItem value="quote">Alıntı</MenuItem>
                        <MenuItem value="code">Kod Bloğu</MenuItem>
                    </Select>
                </FormControl>
            </Tooltip>

            {/* Font Family */}
            <Tooltip title="Font ailesi">
                <FormControl size="small" sx={{ minWidth: 120, mr: 0.5 }}>
                    <Select
                        value={fontFamily}
                        onChange={handleFontFamilyChange}
                        className="lexical-toolbar-select"
                    >
                        <MenuItem value="Arial">Arial</MenuItem>
                        <MenuItem value="Courier New">Courier New</MenuItem>
                        <MenuItem value="Georgia">Georgia</MenuItem>
                        <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                        <MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
                        <MenuItem value="Verdana">Verdana</MenuItem>
                    </Select>
                </FormControl>
            </Tooltip>

            {/* Font Size */}
            <Tooltip title="Font boyutu">
                <FormControl size="small" sx={{ minWidth: 70, mr: 0.5 }}>
                    <Select
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="lexical-toolbar-select"
                    >
                        <MenuItem value="10px">10</MenuItem>
                        <MenuItem value="12px">12</MenuItem>
                        <MenuItem value="14px">14</MenuItem>
                        <MenuItem value="16px">16</MenuItem>
                        <MenuItem value="18px">18</MenuItem>
                        <MenuItem value="20px">20</MenuItem>
                        <MenuItem value="24px">24</MenuItem>
                        <MenuItem value="30px">30</MenuItem>
                        <MenuItem value="36px">36</MenuItem>
                    </Select>
                </FormControl>
            </Tooltip>

            {/* Font Size +/- Buttons */}
            <Tooltip title="Font boyutunu azalt">
                <button
                    onClick={() => {
                        const currentSize = parseInt(fontSize) - 2;
                        if (currentSize >= 8) {
                            const newSize = `${currentSize}px`;
                            setFontSize(newSize);
                            editor.update(() => {
                                editor.dispatchCommand(FORMAT_FONT_SIZE_COMMAND, newSize);
                            });
                        }
                    }}
                    className="lexical-toolbar-button"
                >
                    <FormatIndentDecrease fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Font boyutunu artır">
                <button
                    onClick={() => {
                        const currentSize = parseInt(fontSize) + 2;
                        if (currentSize <= 72) {
                            const newSize = `${currentSize}px`;
                            setFontSize(newSize);
                            editor.update(() => {
                                editor.dispatchCommand(FORMAT_FONT_SIZE_COMMAND, newSize);
                            });
                        }
                    }}
                    className="lexical-toolbar-button"
                >
                    <FormatIndentIncrease fontSize="small" />
                </button>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            {/* History */}
            <Tooltip title="Geri Al (Ctrl+Z)">
                <button
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <Undo fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="İleri Al (Ctrl+Y)">
                <button
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <Redo fontSize="small" />
                </button>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            {/* Text Formatting */}
            <Tooltip title="Kalın (Ctrl+B)">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                    className={`lexical-toolbar-button ${isBold ? "active" : ""}`}
                >
                    <FormatBold fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="İtalik (Ctrl+I)">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                    className={`lexical-toolbar-button ${isItalic ? "active" : ""}`}
                >
                    <FormatItalic fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Altı Çizili (Ctrl+U)">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                    className={`lexical-toolbar-button ${isUnderline ? "active" : ""}`}
                >
                    <FormatUnderlined fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Üstü Çizili">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                    className={`lexical-toolbar-button ${isStrikethrough ? "active" : ""}`}
                >
                    <FormatStrikethrough fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Kod">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                    className={`lexical-toolbar-button ${isCode ? "active" : ""}`}
                >
                    <Code fontSize="small" />
                </button>
            </Tooltip>

            {/* Additional Text Styles Dropdown */}
            <Tooltip title="Diğer metin stilleri">
                <button
                    onClick={(e) => setStylesAnchorEl(e.currentTarget)}
                    className="lexical-toolbar-button"
                >
                    <Psychology fontSize="small" />
                </button>
            </Tooltip>
            <Menu
                anchorEl={stylesAnchorEl}
                open={Boolean(stylesAnchorEl)}
                onClose={() => setStylesAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
                        setStylesAnchorEl(null);
                    }}
                    className={isSubscript ? "active" : ""}
                >
                    <Subscript fontSize="small" sx={{ mr: 1 }} />
                    Alt Simge
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
                        setStylesAnchorEl(null);
                    }}
                    className={isSuperscript ? "active" : ""}
                >
                    <Superscript fontSize="small" sx={{ mr: 1 }} />
                    Üst Simge
                </MenuItem>
            </Menu>
            <Tooltip title="Alt Simge">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
                    className={`lexical-toolbar-button ${isSubscript ? "active" : ""}`}
                >
                    <Subscript fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Üst Simge">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
                    className={`lexical-toolbar-button ${isSuperscript ? "active" : ""}`}
                >
                    <Superscript fontSize="small" />
                </button>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            {/* Text Color */}
            <Tooltip title="Metin rengi">
                <button
                    onClick={(e) => setColorAnchorEl(e.currentTarget)}
                    className="lexical-toolbar-button"
                >
                    <FormatColorText fontSize="small" style={{ color: textColor }} />
                </button>
            </Tooltip>
            <Popover
                open={Boolean(colorAnchorEl)}
                anchorEl={colorAnchorEl}
                onClose={() => setColorAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5 }}>
                    {COLORS.map((color) => (
                        <Box
                            key={color}
                            onClick={() => handleTextColorChange(color)}
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: color,
                                border: "2px solid #ccc",
                                cursor: "pointer",
                                "&:hover": { transform: "scale(1.15)", borderColor: "#000" },
                            }}
                        />
                    ))}
                </Box>
            </Popover>

            {/* Background Color */}
            <Tooltip title="Arka plan rengi">
                <button
                    onClick={(e) => setBgColorAnchorEl(e.currentTarget)}
                    className="lexical-toolbar-button"
                >
                    <FormatColorFill fontSize="small" />
                </button>
            </Tooltip>
            <Popover
                open={Boolean(bgColorAnchorEl)}
                anchorEl={bgColorAnchorEl}
                onClose={() => setBgColorAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5 }}>
                    {COLORS.map((color) => (
                        <Box
                            key={color}
                            onClick={() => handleBgColorChange(color)}
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: color,
                                border: "2px solid #ccc",
                                cursor: "pointer",
                                "&:hover": { transform: "scale(1.15)", borderColor: "#000" },
                            }}
                        />
                    ))}
                </Box>
            </Popover>

            <div className="lexical-toolbar-divider" />

            {/* Alignment */}
            <Tooltip title="Sola hizala">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
                    className="lexical-toolbar-button"
                >
                    <FormatAlignLeft fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Ortala">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
                    className="lexical-toolbar-button"
                >
                    <FormatAlignCenter fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Sağa hizala">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
                    className="lexical-toolbar-button"
                >
                    <FormatAlignRight fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="İki yana yasla">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
                    className="lexical-toolbar-button"
                >
                    <FormatAlignJustify fontSize="small" />
                </button>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            {/* Lists */}
            <Tooltip title="Madde işaretli liste">
                <button
                    onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <FormatListBulleted fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Numaralı liste">
                <button
                    onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <FormatListNumbered fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Kontrol listesi">
                <button
                    onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <CheckBox fontSize="small" />
                </button>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            {/* Indentation */}
            <Tooltip title="Girintiyi artır">
                <button
                    onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <FormatIndentIncrease fontSize="small" />
                </button>
            </Tooltip>
            <Tooltip title="Girintiyi azalt">
                <button
                    onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                    className="lexical-toolbar-button"
                >
                    <FormatIndentDecrease fontSize="small" />
                </button>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            {/* Quote */}
            <Tooltip title="Alıntı">
                <button
                    onClick={formatQuote}
                    className="lexical-toolbar-button"
                >
                    <FormatQuote fontSize="small" />
                </button>
            </Tooltip>

            {/* Link */}
            <Tooltip title="Bağlantı ekle">
                <button
                    onClick={insertLink}
                    className="lexical-toolbar-button"
                >
                    <LinkIcon fontSize="small" />
                </button>
            </Tooltip>

            {/* Insert Menu */}
            <Tooltip title="Ekle">
                <button
                    onClick={(e) => setInsertAnchorEl(e.currentTarget)}
                    className="lexical-toolbar-button"
                >
                    <Add fontSize="small" />
                </button>
            </Tooltip>
            <Menu
                anchorEl={insertAnchorEl}
                open={Boolean(insertAnchorEl)}
                onClose={() => setInsertAnchorEl(null)}
                slotProps={{ paper: { style: { maxHeight: "500px", width: "250px" } } }}
            >
                {/* Basic Elements */}
                <MenuItem onClick={insertHorizontalRule}>
                    <HorizontalRule fontSize="small" sx={{ mr: 1 }} />
                    Yatay Çizgi
                </MenuItem>

                <MenuItem onClick={(e) => setTableAnchorEl(e.currentTarget)}>
                    <TableChart fontSize="small" sx={{ mr: 1 }} />
                    Tablo
                </MenuItem>

                {/* Media */}
                <MenuItem onClick={() => {
                    const url = prompt("Resim URL'sini girin:");
                    if (url) {
                        insertElement("img", { src: url, alt: "Resim", style: "max-width: 100%; height: auto;" });
                    }
                    setInsertAnchorEl(null);
                }}>
                    <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                    Resim
                </MenuItem>

                <MenuItem onClick={() => {
                    const url = prompt("GIF URL'sini girin:");
                    if (url) {
                        insertElement("img", { src: url, alt: "GIF", style: "max-width: 100%; height: auto;" });
                    }
                    setInsertAnchorEl(null);
                }}>
                    <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                    GIF
                </MenuItem>

                <MenuItem onClick={() => {
                    const videoId = prompt("YouTube Video ID girin (örn: dQw4w9WgXcQ):");
                    if (videoId) {
                        const html = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="max-width: 100%;"></iframe>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    YouTube Video
                </MenuItem>

                <MenuItem onClick={() => {
                    const tweetId = prompt("Tweet URL'sini girin:");
                    if (tweetId) {
                        const html = `<blockquote class="twitter-tweet"><a href="${tweetId}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    X/Tweet
                </MenuItem>

                <MenuItem onClick={() => {
                    const url = prompt("Figma File URL'sini girin:");
                    if (url) {
                        const html = `<iframe style="border: 1px solid rgba(0, 0, 0, 0.1); width: 100%; height: 600px;" src="${url}" allowfullscreen></iframe>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    Figma Document
                </MenuItem>

                {/* Page Break */}
                <MenuItem onClick={() => {
                    insertElement("div", { style: "page-break-after: always; height: 10px; background: repeating-linear-gradient(90deg, #ddd, #ddd 2px, transparent 2px, transparent 10px);" });
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    Sayfa Sonu
                </MenuItem>

                {/* Equation */}
                <MenuItem onClick={() => {
                    const equation = prompt("LaTeX denklemi girin (örn: E = mc^2):");
                    if (equation) {
                        const html = `<span style="background: #f0f0f0; padding: 8px; border-radius: 4px; font-family: 'Courier New'; font-size: 14px;" title="Denklem: ${equation}">${equation}</span>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    Denklem
                </MenuItem>

                {/* Sticky Note */}
                <MenuItem onClick={() => {
                    const note = prompt("Not yazınız:");
                    if (note) {
                        const html = `<div style="background: #ffeb3b; padding: 16px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); max-width: 250px; font-family: Arial; font-size: 14px; color: #333;">${note}</div>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Note fontSize="small" sx={{ mr: 1 }} />
                    Yapışkan Not
                </MenuItem>

                {/* Poll */}
                <MenuItem onClick={() => {
                    const question = prompt("Anket sorusunu girin:");
                    if (question) {
                        const html = `<div style="border: 2px solid #2196F3; padding: 16px; border-radius: 8px; background: #f5f5f5;">
              <div style="font-weight: bold; margin-bottom: 12px;">${question}</div>
              <label style="display: block; margin: 8px 0;"><input type="radio" name="poll"> Seçenek 1</label>
              <label style="display: block; margin: 8px 0;"><input type="radio" name="poll"> Seçenek 2</label>
              <label style="display: block; margin: 8px 0;"><input type="radio" name="poll"> Seçenek 3</label>
            </div>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Apps fontSize="small" sx={{ mr: 1 }} />
                    Anket
                </MenuItem>

                {/* Collapsible */}
                <MenuItem onClick={() => {
                    const title = prompt("Başlık girin:");
                    const content = prompt("İçerik girin:");
                    if (title && content) {
                        const html = `<details style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
              <summary style="cursor: pointer; font-weight: bold;">${title}</summary>
              <div style="padding: 10px; margin-top: 10px;">${content}</div>
            </details>`;
                        insertIframe(html);
                    }
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    Katlanan İçerik
                </MenuItem>

                {/* Columns Layout */}
                <MenuItem onClick={() => {
                    const html = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="border: 1px solid #ddd; padding: 16px;"><strong>Sütun 1</strong><br>İçeriğinizi buraya yazın...</div>
            <div style="border: 1px solid #ddd; padding: 16px;"><strong>Sütun 2</strong><br>İçeriğinizi buraya yazın...</div>
          </div>`;
                    insertIframe(html);
                    setInsertAnchorEl(null);
                }}>
                    <Apps fontSize="small" sx={{ mr: 1 }} />
                    İki Sütun Düzeni
                </MenuItem>

                {/* Date */}
                <MenuItem onClick={() => {
                    editor.update(() => {
                        const dateStr = new Date().toLocaleDateString('tr-TR');
                        const timeStr = new Date().toLocaleTimeString('tr-TR');
                        const html = `<span style="color: #666; font-size: 12px;">${dateStr} ${timeStr}</span>`;
                        const parser = new DOMParser();
                        const dom = parser.parseFromString(html, "text/html");
                        const nodes = $generateNodesFromDOM(editor, dom);
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            selection.insertNodes(nodes);
                        }
                    });
                    setInsertAnchorEl(null);
                }}>
                    <DateRange fontSize="small" sx={{ mr: 1 }} />
                    Tarih & Saat
                </MenuItem>

                {/* Excalidraw */}
                <MenuItem onClick={() => {
                    const html = `<div style="border: 2px dashed #ccc; padding: 20px; text-align: center; border-radius: 8px; background: #fafafa; min-height: 300px; display: flex; align-items: center; justify-content: center;">
            <div>
              <div style="font-size: 32px; margin-bottom: 10px;">âœï¸</div>
              <div style="font-weight: bold;">Excalidraw Diyagramı</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">Buraya çizim ekleyebilirsiniz</div>
            </div>
          </div>`;
                    insertIframe(html);
                    setInsertAnchorEl(null);
                }}>
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    Excalidraw Çizimi
                </MenuItem>
            </Menu>

            {/* Table Submenu */}
            <Menu
                anchorEl={tableAnchorEl}
                open={Boolean(tableAnchorEl)}
                onClose={() => setTableAnchorEl(null)}
            >
                <MenuItem onClick={() => insertTable(2, 2)}>2x2</MenuItem>
                <MenuItem onClick={() => insertTable(3, 3)}>3x3</MenuItem>
                <MenuItem onClick={() => insertTable(4, 4)}>4x4</MenuItem>
                <MenuItem onClick={() => insertTable(5, 5)}>5x5</MenuItem>
            </Menu>

            <div className="lexical-toolbar-divider" />

            {/* Clear Formatting */}
            <Tooltip title="Biçimlendirmeyi temizle">
                <button
                    onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.getNodes().forEach((node) => {
                                    if ($isTextNode(node)) {
                                        node.setFormat(0);
                                    }
                                });
                            }
                        });
                    }}
                    className="lexical-toolbar-button"
                >
                    <FormatClear fontSize="small" />
                </button>
            </Tooltip>

            {/* Clear Editor */}
            <Tooltip title="Editörü temizle">
                <button
                    onClick={clearEditor}
                    className="lexical-toolbar-button"
                >
                    <Delete fontSize="small" />
                </button>
            </Tooltip>
        </Box>
    );
};

// HTML Plugin - handles initialization and updates
const HtmlPlugin = ({
    initialValue,
    onChange,
}: {
    initialValue?: string;
    onChange?: (html: string) => void;
}) => {
    const [editor] = useLexicalComposerContext();
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (isFirstRender && initialValue) {
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(initialValue, "text/html");
                const nodes = $generateNodesFromDOM(editor, dom);
                $getRoot().clear();
                $getRoot().append(...nodes);
            });
            setIsFirstRender(false);
        }
    }, [editor, initialValue, isFirstRender]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, undefined);
                if (onChange) {
                    onChange(html);
                }
            });
        });
    }, [editor, onChange]);

    return null;
};

// Main LexicalEditor Component
const LexicalEditor: React.FC<LexicalEditorProps> = ({
    initialValue = "",
    onChange,
    placeholder = "İçeriğinizi buraya yazın...",
    mode = "light",
    readOnly = false,
}) => {
    const initialConfig = {
        namespace: "FasEditor",
        theme,
        onError: (error: Error) => {
            console.error("Lexical Error:", error);
        },
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
            AutoLinkNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            HorizontalRuleNode,
        ],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <Box
                className="lexical-editor-container"
                data-mode={mode}
                sx={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
                }}
            >
                <ToolbarPlugin />
                <Box
                    sx={{
                        borderTop: "1px solid #ddd",
                        minHeight: "300px",
                        padding: "16px",
                        backgroundColor: mode === "dark" ? "#2d2d2d" : "#fafafa",
                    }}
                >
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="lexical-editor-input"
                                style={{
                                    minHeight: "300px",
                                    outline: "none",
                                    padding: "0",
                                    color: mode === "dark" ? "#fff" : "#000",
                                }}
                                readOnly={readOnly}
                            />
                        }
                        placeholder={
                            <div
                                className="lexical-editor-placeholder"
                                style={{
                                    position: "absolute",
                                    color: mode === "dark" ? "#666" : "#999",
                                    fontSize: "14px",
                                    pointerEvents: "none",
                                }}
                            >
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </Box>

                {/* All Plugins */}
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin />
                <TablePlugin />
                <TabIndentationPlugin />
                <MarkdownShortcutPlugin />
                <HtmlPlugin initialValue={initialValue} onChange={onChange} />
            </Box>
        </LexicalComposer>
    );
};

export default LexicalEditor;
