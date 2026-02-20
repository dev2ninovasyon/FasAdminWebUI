"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    Menu,
    Popover,
    Tooltip,
    IconButton
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
} from "@mui/icons-material";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
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
    LexicalEditor as EditorType,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    SELECTION_CHANGE_COMMAND
} from "lexical";
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode, INSERT_TABLE_COMMAND } from "@lexical/table";
import { HorizontalRuleNode, $createHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $patchStyleText } from "@lexical/selection";

import "./lexical.css";

interface LexicalEditorProps {
    initialValue?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    mode?: "light" | "dark";
}

// Custom commands for font styling
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
    },
    list: {
        ul: "editor-list-ul",
        ol: "editor-list-ol",
        listitem: "editor-listitem",
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
    link: "editor-link",
    paragraph: "editor-paragraph",
    table: "editor-table",
    tableCell: "editor-table-cell",
    tableRow: "editor-table-row",
};

const COLORS = [
    "#000000", "#ffffff", "#e0e0e0", "#888888",
    "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff",
    "#ff8800", "#8800ff", "#00ff88",
    "#7c4dff", "#ff5252", "#ffd740"
];

const BLOCK_TYPES = [
    { label: "Normal", value: "paragraph" },
    { label: "Başlık 1", value: "h1" },
    { label: "Başlık 2", value: "h2" },
    { label: "Başlık 3", value: "h3" },
    { label: "Başlık 4", value: "h4" },
    { label: "Başlık 5", value: "h5" },
    { label: "Başlık 6", value: "h6" },
    { label: "Alıntı", value: "quote" },
    { label: "Kod", value: "code" },
];

const FONT_FAMILIES = [
    "Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana"
];

const FONT_SIZES = [
    "10px", "12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px"
];

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
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Menu & Popover states
    const [insertAnchorEl, setInsertAnchorEl] = useState<null | HTMLElement>(null);
    const [colorAnchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null);
    const [bgColorAnchorEl, setBgColorAnchorEl] = useState<null | HTMLElement>(null);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsCode(selection.hasFormat("code"));

            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();

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
    }, []);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_EDITOR
            )
        );
    }, [editor, updateToolbar]);

    // Custom commands registration
    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                FORMAT_FONT_FAMILY_COMMAND,
                (family: string) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $patchStyleText(selection, { "font-family": family });
                    }
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                FORMAT_FONT_SIZE_COMMAND,
                (size: string) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $patchStyleText(selection, { "font-size": size });
                    }
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                FORMAT_TEXT_COLOR_COMMAND,
                (color: string) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $patchStyleText(selection, { color });
                    }
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                FORMAT_BG_COLOR_COMMAND,
                (color: string) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $patchStyleText(selection, { "background-color": color });
                    }
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            )
        );
    }, [editor]);

    const handleBlockChange = (e: any) => {
        const type = e.target.value;
        setBlockType(type);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (type === "paragraph") {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else if (type === "quote") {
                    $setBlocksType(selection, () => $createQuoteNode());
                } else if (type === "code") {
                    $setBlocksType(selection, () => $createCodeNode());
                } else if (type.startsWith("h")) {
                    $setBlocksType(selection, () => $createHeadingNode(type as any));
                }
            }
        });
    };

    const handleFontFamilyChange = (e: any) => {
        const family = e.target.value;
        setFontFamily(family);
        editor.dispatchCommand(FORMAT_FONT_FAMILY_COMMAND, family);
    };

    const handleFontSizeChange = (e: any) => {
        const size = e.target.value;
        setFontSize(size);
        editor.dispatchCommand(FORMAT_FONT_SIZE_COMMAND, size);
    };

    return (
        <div className="lexical-toolbar">
            <Tooltip title="Geri Al (Ctrl+Z)">
                <IconButton
                    disabled={!canUndo}
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    size="small"
                >
                    <Undo fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="İleri Al (Ctrl+Y)">
                <IconButton
                    disabled={!canRedo}
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    size="small"
                >
                    <Redo fontSize="small" />
                </IconButton>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={blockType} onChange={handleBlockChange} className="lexical-toolbar-select">
                    {BLOCK_TYPES.map((b) => (
                        <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={fontFamily} onChange={handleFontFamilyChange} className="lexical-toolbar-select">
                    {FONT_FAMILIES.map((f) => (
                        <MenuItem key={f} value={f}>{f}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select value={fontSize} onChange={handleFontSizeChange} className="lexical-toolbar-select">
                    {FONT_SIZES.map((s) => (
                        <MenuItem key={s} value={s}>{s.replace("px", "")}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <div className="lexical-toolbar-divider" />

            <Tooltip title="Kalın (Ctrl+B)">
                <IconButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                    className={isBold ? "active" : ""}
                    size="small"
                >
                    <FormatBold fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="İtalik (Ctrl+I)">
                <IconButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                    className={isItalic ? "active" : ""}
                    size="small"
                >
                    <FormatItalic fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Altı Çizili (Ctrl+U)">
                <IconButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                    className={isUnderline ? "active" : ""}
                    size="small"
                >
                    <FormatUnderlined fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Üstü Çizili">
                <IconButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                    className={isStrikethrough ? "active" : ""}
                    size="small"
                >
                    <FormatStrikethrough fontSize="small" />
                </IconButton>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            <Tooltip title="Metin Rengi">
                <IconButton onClick={(e) => setColorAnchorEl(e.currentTarget)} size="small">
                    <FormatColorText fontSize="small" />
                </IconButton>
            </Tooltip>
            <Popover
                open={Boolean(colorAnchorEl)}
                anchorEl={colorAnchorEl}
                onClose={() => setColorAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
                    {COLORS.map((c) => (
                        <Box
                            key={c}
                            onClick={() => {
                                editor.dispatchCommand(FORMAT_TEXT_COLOR_COMMAND, c);
                                setColorAnchorEl(null);
                            }}
                            sx={{ width: 20, height: 20, bgcolor: c, border: "1px solid #ccc", cursor: "pointer" }}
                        />
                    ))}
                </Box>
            </Popover>

            <Tooltip title="Vurgulama Rengi">
                <IconButton onClick={(e) => setBgColorAnchorEl(e.currentTarget)} size="small">
                    <FormatColorFill fontSize="small" />
                </IconButton>
            </Tooltip>
            <Popover
                open={Boolean(bgColorAnchorEl)}
                anchorEl={bgColorAnchorEl}
                onClose={() => setBgColorAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
                    {COLORS.map((c) => (
                        <Box
                            key={c}
                            onClick={() => {
                                editor.dispatchCommand(FORMAT_BG_COLOR_COMMAND, c);
                                setBgColorAnchorEl(null);
                            }}
                            sx={{ width: 20, height: 20, bgcolor: c, border: "1px solid #ccc", cursor: "pointer" }}
                        />
                    ))}
                </Box>
            </Popover>

            <div className="lexical-toolbar-divider" />

            <Tooltip title="Madde İşaretli Liste">
                <IconButton onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} size="small">
                    <FormatListBulleted fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Numaralı Liste">
                <IconButton onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} size="small">
                    <FormatListNumbered fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Kontrol Listesi">
                <IconButton onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)} size="small">
                    <CheckBox fontSize="small" />
                </IconButton>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            <Tooltip title="Sola Hizala">
                <IconButton onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} size="small">
                    <FormatAlignLeft fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Ortala">
                <IconButton onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} size="small">
                    <FormatAlignCenter fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Sağa Hizala">
                <IconButton onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} size="small">
                    <FormatAlignRight fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="İki Yana Yasla">
                <IconButton onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")} size="small">
                    <FormatAlignJustify fontSize="small" />
                </IconButton>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            <Tooltip title="Girintiyi Artır">
                <IconButton onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} size="small">
                    <FormatIndentIncrease fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Girintiyi Azalt">
                <IconButton onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} size="small">
                    <FormatIndentDecrease fontSize="small" />
                </IconButton>
            </Tooltip>

            <div className="lexical-toolbar-divider" />

            <Tooltip title="Ekle">
                <IconButton onClick={(e) => setInsertAnchorEl(e.currentTarget)} size="small">
                    <Add fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={insertAnchorEl}
                open={Boolean(insertAnchorEl)}
                onClose={() => setInsertAnchorEl(null)}
            >
                <MenuItem onClick={() => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            selection.insertNodes([$createHorizontalRuleNode()]);
                        }
                    });
                    setInsertAnchorEl(null);
                }}>
                    <HorizontalRule fontSize="small" sx={{ mr: 1 }} /> Yatay Çizgi
                </MenuItem>
                <MenuItem onClick={() => {
                    editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: "3", rows: "3" });
                    setInsertAnchorEl(null);
                }}>
                    <TableChart fontSize="small" sx={{ mr: 1 }} /> Tablo (3x3)
                </MenuItem>
                <MenuItem onClick={() => {
                    const url = prompt("URL girin:");
                    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                    setInsertAnchorEl(null);
                }}>
                    <LinkIcon fontSize="small" sx={{ mr: 1 }} /> Bağlantı
                </MenuItem>
            </Menu>

            <Tooltip title="Biçimlendirmeyi Temizle">
                <IconButton
                    onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.getNodes().forEach((node) => {
                                    if ($isTextNode(node)) {
                                        node.setFormat(0);
                                        node.setStyle("");
                                    }
                                });
                            }
                        });
                    }}
                    size="small"
                >
                    <FormatClear fontSize="small" />
                </IconButton>
            </Tooltip>
        </div>
    );
};

const HtmlPlugin = ({ initialValue, onChange }: { initialValue?: string; onChange?: (html: string) => void }) => {
    const [editor] = useLexicalComposerContext();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current && initialValue) {
            editor.update(() => {
                const dom = new DOMParser().parseFromString(initialValue, "text/html");
                const nodes = $generateNodesFromDOM(editor, dom);
                $getRoot().clear().append(...nodes);
            });
            isFirstRender.current = false;
        }
    }, [editor, initialValue]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const html = $generateHtmlFromNodes(editor);
                if (onChange) onChange(html);
            });
        });
    }, [editor, onChange]);

    return null;
};

const LexicalEditor: React.FC<LexicalEditorProps> = ({
    initialValue = "",
    onChange,
    placeholder = "İçeriğinizi buraya yazın...",
    mode = "light",
}) => {
    const initialConfig = {
        namespace: "FasAdminEditor",
        theme,
        onError: (e: Error) => console.error(e),
        nodes: [
            HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode,
            CodeHighlightNode, LinkNode, AutoLinkNode, TableNode,
            TableCellNode, TableRowNode, HorizontalRuleNode,
        ],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <Box className="lexical-editor-container" data-mode={mode}>
                <ToolbarPlugin />
                <Box sx={{ position: "relative" }}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="lexical-editor-input" />}
                        placeholder={<div className="lexical-editor-placeholder">{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </Box>
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin />
                <TablePlugin />
                <HtmlPlugin initialValue={initialValue} onChange={onChange} />
            </Box>
        </LexicalComposer>
    );
};

export default LexicalEditor;

