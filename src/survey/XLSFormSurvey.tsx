import * as React from "react";
import SimpleSchema from "simpl-schema";
import PaddedContainer from "../components/PaddedContainer";
import XLSForm from "../xlsform-simple-schema";
import ODKFormulaEvaluationContext, {
  getEmptyContext,
} from "../xlsform-simple-schema/functions/odk-formulas/evaluation/ODKFormulaEvaluationContext";
import { createSurveySchemaFromXLSForm } from "../xlsform-simple-schema/functions/schema-creation/createSurveySchemaFromXLSForm";
import { FieldSetForKey } from "./FieldSetForKey";
import { FieldProps } from "./FieldProps";
import { QuestionRow } from "../xlsform-simple-schema/types/RowTypes";
import { ODKNode } from "../xlsform-simple-schema/types/ODKNode";

interface IODKSurveyContext {
  schema: SimpleSchema;
  context: ODKFormulaEvaluationContext;
  language: string;
  languageName: string;
  languageCode: string;
  debug: boolean;
  xlsForm?: XLSForm;
}

export const ODKSurveyContext = React.createContext<IODKSurveyContext>({
  schema: new SimpleSchema({}),
  context: getEmptyContext(),
  language: "English (en)",
  languageCode: "en",
  languageName: "English",
  debug: true,
  xlsForm: undefined,
});

export default function XLSFormSurvey(props: {
  xlsForm: XLSForm;
  language: string;
  debug: boolean;
  className?: string;
  onChange: (value: unknown, fieldProps: FieldProps) => void;
  onChangeRow: (node: ODKNode, row: QuestionRow) => void;
}) {
  const { language, debug } = props;
  const [, languageName, languageCode] = language.match(/\w+ \((\w+)\)/) || [];

  const { context, schema } = React.useMemo(() => {
    if (props.xlsForm) {
      const result = createSurveySchemaFromXLSForm(
        props.xlsForm,
        props.language
      );
      return result;
    }
    return { context: null, schema: null };
  }, [props.xlsForm, props.language]);

  if (!schema || !context) {
    return null;
  }

  const fieldSets = schema
    .objectKeys()
    .map((k) => (
      <FieldSetForKey
        key={k}
        schemaKey={k}
        onChange={props.onChange}
        onChangeRow={props.onChangeRow}
      />
    ));
  return (
    <ODKSurveyContext.Provider
      value={{
        schema,
        context,
        language,
        languageCode,
        languageName,
        debug,
        xlsForm: props.xlsForm,
      }}
    >
      <PaddedContainer
        horizontal={2}
        vertical={2}
        className={props.className}
        style={{ maxWidth: "50rem", padding: "4rem", margin: "auto" }}
        lang={languageCode}
      >
        <form>{fieldSets}</form>
      </PaddedContainer>
    </ODKSurveyContext.Provider>
  );
}
