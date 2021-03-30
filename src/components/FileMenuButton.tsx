import { Button, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import React from "react";
import { Patch } from "../lib/undo/useUndoHistory";
import { saveXLSForm } from "../xlsform-simple-schema/functions/editing/saveXLSForm";
import { XLSForm } from "../xlsform-simple-schema/index";
import { useWorkbookFromFile } from "./ExcelFileInput";

/** Button showing a 'File' menu */
export function FileMenuButton({
  xlsForm,
  setXLSFormWithPatches,
  setLanguage,
}: {
  xlsForm: XLSForm | undefined;
  setXLSFormWithPatches: (
    description: string,
    value: XLSForm | undefined,
    patches: Patch[],
    inversePatches: Patch[]
  ) => void;
  setLanguage: (language: string) => void;
}) {
  const inputFieldRef = React.createRef<HTMLInputElement>();
  const { onFileChange } = useWorkbookFromFile({
    setXLSFormWithPatches,
    setLanguage,
  });

  const closeFile = React.useCallback(() => {
    setXLSFormWithPatches("Close current workbook", undefined, [], []);
  }, [setXLSFormWithPatches]);

  const saveFileAs = React.useCallback(async () => {
    if (xlsForm) {
      await saveXLSForm(xlsForm);
    }
  }, [xlsForm]);

  const menu = (
    <Menu>
      <label htmlFor="open-file-input">
        <MenuItem icon="import" text="Import file…" />
      </label>
      <MenuItem text="Export" icon="export">
        <MenuItem
          text="Microsoft Excel (.xlsx)"
          onClick={saveFileAs}
          disabled={!xlsForm}
        />
      </MenuItem>
      <MenuDivider />
      <MenuItem text="Close" onClick={closeFile} />
    </Menu>
  );

  const button = (
    <Button className="bp3-minimal" rightIcon="caret-down" text="File" />
  );

  return (
    <>
      <input
        id="open-file-input"
        type="file"
        onChange={onFileChange}
        ref={inputFieldRef}
        style={{ display: "none" }}
      />
      <Popover2
        content={menu}
        lazy={true}
        placement={"bottom-end"}
        minimal={true}
      >
        {button}
      </Popover2>
    </>
  );
}
