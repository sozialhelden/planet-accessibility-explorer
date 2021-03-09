import { Code } from "@blueprintjs/core";
import produce from "immer";
import * as React from "react";
import { useEffect, useState } from "react";
import { FieldProps } from "../survey/FieldProps";
import { AppToaster } from "../toaster";
import {
  ChoicesWorksheet,
  loadXLSFormFromRows,
  SettingsWorksheet,
  SurveyWorksheet,
  WorksheetName,
  XLSForm,
} from "../xlsform-simple-schema";
import getEvaluatedXLSFormResult from "../xlsform-simple-schema/functions/evaluateNodeAndChildren";
import ODKFormulaEvaluationContext, {
  getEmptyContext,
  knownLiteralsWithoutDollarSign,
} from "../xlsform-simple-schema/functions/odk-formulas/evaluation/ODKFormulaEvaluationContext";
import patchXLSFormCell from "../xlsform-simple-schema/functions/patchXLSFormCell";
import { ODKNode } from "../xlsform-simple-schema/types/ODKNode";

export default function useChangeHooks({
  xlsForm,
  language,
  setXLSForm,
}: {
  xlsForm?: XLSForm;
  language?: string;
  setXLSForm: (value: React.SetStateAction<XLSForm | undefined>) => void;
}) {
  const [context, setContext] = useState<ODKFormulaEvaluationContext>();

  useEffect(() => {
    if (!xlsForm) {
      setContext(undefined);
      return;
    }

    setContext((context) => {
      if (context && context.survey === xlsForm.rootSurveyGroup) {
        console.log(
          "Context exists already and survey is the same, keeping context."
        );
        return context;
      }

      const newContext = getEmptyContext(xlsForm.rootSurveyGroup);
      newContext.nodesToAnswers = new Map();
      newContext.survey = xlsForm.rootSurveyGroup;
      newContext.stackDepth = 0;
      newContext.knownLiteralsWithoutDollarSign = knownLiteralsWithoutDollarSign;
      getEvaluatedXLSFormResult(xlsForm, newContext);
      console.log("Setting up new evaluation context", newContext);
      return newContext;
    });
  }, [xlsForm, xlsForm?.rootSurveyGroup]);

  const onChangeAnswer = React.useCallback(
    (value: unknown, fieldProps: FieldProps) => {
      AppToaster.clear();
      AppToaster.show({
        message: (
          <>
            {fieldProps.schemaKey} → <Code>{JSON.stringify(value)}</Code>
          </>
        ),
      });
      if (xlsForm && context) {
        setContext((context) => {
          if (!context) {
            return;
          }
          const nodesToAnswers = new Map<ODKNode, unknown>(
            context.nodesToAnswers.entries()
          );
          nodesToAnswers.set(fieldProps.node, value);
          const newContext: ODKFormulaEvaluationContext = {
            ...context,
            nodesToAnswers,
          };
          getEvaluatedXLSFormResult(xlsForm, newContext);
          return newContext;
        });
      }
    },
    [context, xlsForm]
  );

  const onChangeCell = React.useCallback(
    (
      worksheetName: WorksheetName,
      rowIndex: number,
      columnName: string,
      value: unknown,
      node?: ODKNode
    ) => {
      if (!xlsForm || !context || !language) {
        return;
      }
      setXLSForm(
        patchXLSFormCell({
          worksheetName,
          xlsForm,
          node,
          rowIndex,
          columnName,
          language,
          value,
          context,
        })
      );
    },
    [xlsForm, context, language, setXLSForm]
  );

  const onSpliceRows = React.useCallback(
    (
      worksheetName: WorksheetName,
      rowIndex: number,
      rowCount: number,
      ...rowsToAdd: any[]
    ) => {
      if (!xlsForm || !context) {
        return;
      }

      setXLSForm((xlsForm: XLSForm | undefined) => {
        const surveyWorksheet = xlsForm?.worksheets.survey;
        if (!surveyWorksheet) {
          throw new Error("No survey worksheet defined.");
        }
        const worksheet = xlsForm?.worksheets[worksheetName];
        if (!worksheet) {
          return xlsForm;
        }
        const newRows = [...worksheet?.rows];
        newRows.splice(rowIndex, rowCount, ...rowsToAdd);
        const newWorksheet = { ...worksheet, rows: newRows };
        return loadXLSFormFromRows(
          worksheetName === "survey"
            ? (newWorksheet as SurveyWorksheet)
            : surveyWorksheet,
          xlsForm?.worksheets.settings?.rows[0]?.default_language ||
            "English (en)",
          worksheetName === "settings"
            ? (newWorksheet as SettingsWorksheet)
            : xlsForm?.worksheets.settings,
          worksheetName === "choices"
            ? (newWorksheet as ChoicesWorksheet)
            : xlsForm?.worksheets.choices
        );
      });

      // setXLSForm(
      //   produce(xlsForm, (draft) => {
      //     const worksheet = draft.worksheets[worksheetName];
      //     worksheet?.rows.splice(rowIndex, rowCount, ...rowsToAdd);
      //     if (worksheetName === "choices") {
      //       draft.choicesByName = draft.worksheets.choices
      //         ? loadChoices(draft.worksheets.choices)
      //         : {};
      //     }
      //     // TODO: Regenerate rowIndex values for all nodes
      //   })
      // );
    },
    [context, setXLSForm, xlsForm]
  );

  // const onRemoveRowAndChildren = React.useCallback((node: ODKNode) => {
  //   if (!xlsForm || !context) {
  //     return;
  //   }
  //   const indexPath = getNodeIndexPath(node, context);
  //   if (!indexPath) {
  //     throw new Error(
  //       "Can’t remove a node that isn’t reachable from survey root. Please ensure the node is actually part of the survey."
  //     );
  //   }
  //   const { rowIndex } = node;

  //   setXLSForm(
  //     produce(xlsForm, (draft) => {
  //       const hasChildren = node.children.length > 0;
  //       // The end_group or end_repeat marker is associated to the node, too.
  //       const indexOfGroupOrRepeatEnd = hasChildren
  //         ? draft.flatNodes.findIndex((n, i) => i > rowIndex && n === node)
  //         : -1;
  //       if (hasChildren && indexOfGroupOrRepeatEnd === -1) {
  //         throw new Error(
  //           "Node has children, but its end marker row could not be found in the ‘survey’ sheet. Please ensure the node is actually part of the survey."
  //         );
  //       }
  //       const numberOfRowsToRemove = hasChildren ? indexOfGroupOrRepeatEnd - node.rowIndex : 1;
  //       debugger;
  //       draft.flatNodes.splice(rowIndex, numberOfRowsToRemove);
  //       draft.worksheets.survey.rows.splice(rowIndex, numberOfRowsToRemove);
  //       const path = indexPath.map((i) => ["children", i]).flat();
  //       const nodeIndexInParentChildren = path.pop();
  //       const parentChildren = get(draft.rootSurveyGroup, path);
  //       parentChildren.splice(nodeIndexInParentChildren, 1);
  //       debugger;
  //       // TODO: Regenerate rowIndex values for all nodes
  //     })
  //   );
  // }, []);

  const onMoveNode = React.useCallback(
    (options: {
      sourcePath: string;
      sourceNode: ODKNode;
      destinationNode: ODKNode;
      position: "before" | "after" | "inside";
    }) => {
      if (!xlsForm || !context || !language) {
        return;
      }
      setXLSForm(
        produce(xlsForm, (draft) => {
          // set(draft, ["flatNodes", rowIndex, "row", ...valuePathInRow], value);
          // set(
          //   draft,
          //   ["worksheets", worksheetName, "rows", rowIndex, ...valuePathInRow],
          //   value
          // );
          // if (indexPath) {
          //   set(
          //     draft,
          //     [
          //       "rootSurveyGroup",
          //       ...indexPath.map((i) => ["children", i]).flat(),
          //       "row",
          //       ...valuePathInRow,
          //     ],
          //     value
          //   );
          // }
        })
      );
    },
    []
  );

  return {
    context,
    setContext,
    onChangeAnswer,
    onChangeCell,
    onMoveNode,
    onSpliceRows,
  };
}
