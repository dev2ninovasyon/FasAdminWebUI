import {
  AutocompleteCellType,
  CheckboxCellType,
  DateCellType,
  DropdownCellType,
  HandsontableCellType,
  NumericCellType,
  PasswordCellType,
  SelectCellType,
  TextCellType,
  TimeCellType,
  registerCellType,
} from "handsontable/cellTypes";
import {
  AutoColumnSize,
  AutoRowSize,
  Autofill,
  CollapsibleColumns,
  ColumnSorting,
  ContextMenu,
  CopyPaste,
  DragToScroll,
  DropdownMenu,
  Filters,
  HiddenColumns,
  HiddenRows,
  ManualColumnResize,
  MergeCells,
  MultipleSelectionHandles,
  NestedHeaders,
  Search,
  StretchColumns,
  TouchScroll,
  UndoRedo,
  registerPlugin,
} from "handsontable/plugins";

// Global CSS Imports - Yüklenir bir kez
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-horizon.css";
import "handsontable/styles/ht-icons-main.css";
import "@/app/components/HandsOnTable/HandsOnTableLight.css";
import "@/app/(AdminUI)/components/Veri/HandsOnTable/HandsOnTableLight.css";

declare global {
  var __HOT_SELECTED_MODULES_REGISTERED__: boolean | undefined;
}

if (!globalThis.__HOT_SELECTED_MODULES_REGISTERED__) {
  registerCellType(AutocompleteCellType);
  registerCellType(CheckboxCellType);
  registerCellType(DateCellType);
  registerCellType(DropdownCellType);
  registerCellType(HandsontableCellType);
  registerCellType(NumericCellType);
  registerCellType(PasswordCellType);
  registerCellType(SelectCellType);
  registerCellType(TextCellType);
  registerCellType(TimeCellType);

  registerPlugin(AutoColumnSize);
  registerPlugin(AutoRowSize);
  registerPlugin(Autofill);
  registerPlugin(CollapsibleColumns);
  registerPlugin(ColumnSorting);
  registerPlugin(ContextMenu);
  registerPlugin(CopyPaste);
  registerPlugin(DragToScroll);
  registerPlugin(DropdownMenu);
  registerPlugin(Filters);
  registerPlugin(HiddenColumns);
  registerPlugin(HiddenRows);
  registerPlugin(ManualColumnResize);
  registerPlugin(MergeCells);
  registerPlugin(MultipleSelectionHandles);
  registerPlugin(NestedHeaders);
  registerPlugin(Search);
  registerPlugin(StretchColumns);
  registerPlugin(TouchScroll);
  registerPlugin(UndoRedo);

  globalThis.__HOT_SELECTED_MODULES_REGISTERED__ = true;
}
