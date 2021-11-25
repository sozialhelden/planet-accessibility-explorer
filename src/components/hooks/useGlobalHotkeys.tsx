import React from "react";

export function useGlobalHotkeys() {
  return React.useMemo(
    () => [
      {
        combo: "mod+z",
        global: true,
        label: "Undo",
        onKeyDown: () => {
          alert("!!");
        },
        allowInInput: false,
        preventDefault: true,
      },
      {
        global: true,
        combo: "mod+shift+z",
        label: "Redo",
        onKeyDown: () => {
          alert("!!");
        },
        allowInInput: false,
        preventDefault: true,
      },
    ],
    []
  );
}
