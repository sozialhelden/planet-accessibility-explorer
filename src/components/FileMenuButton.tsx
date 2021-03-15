import { Button, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import React from "react";
import { saveXLSForm } from "../lib/saveXLSForm";
import { XLSForm } from "../xlsform-simple-schema/index";
import { useWorkbookFromFile } from "./ExcelFileInput";

export function FileMenuButton({
  xlsForm,
  setXLSForm,
  setLanguage,
}: {
  xlsForm: XLSForm | undefined;
  setXLSForm: (xlsForm?: XLSForm) => void;
  setLanguage: (language: string) => void;
}) {
  const inputFieldRef = React.createRef<HTMLInputElement>();
  const { onFileChange } = useWorkbookFromFile({ setXLSForm, setLanguage });

  const closeFile = React.useCallback(() => {
    setXLSForm(undefined);
  }, [setXLSForm]);

  const saveFileAs = React.useCallback(async () => {
    if (xlsForm) {
      await saveXLSForm(xlsForm);
    }
  }, [xlsForm]);

  const menu = (
    <Menu>
      <label htmlFor="open-file-input">
        <MenuItem icon="folder-open" text="Open…" />
      </label>
      <MenuItem text="Download" icon="download">
        <MenuItem
          text="Microsoft Excel (.xlsx)"
          onClick={saveFileAs}
          disabled={!xlsForm}
        />
      </MenuItem>
      <MenuItem icon="folder-close" text="Close" onClick={closeFile} />
    </Menu>
  );

  const button = (
    <Button
      className="bp3-minimal"
      icon="folder-close"
      rightIcon="caret-down"
    />
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
