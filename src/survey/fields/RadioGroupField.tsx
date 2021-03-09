import { Callout, Code, Radio, RadioGroup } from "@blueprintjs/core";
import * as React from "react";
import { ODKSurveyContext } from "../../lib/ODKSurveyContext";
import { FieldConfigurationButton } from "../DetailsPopover/FieldConfigurationButton";
import { FieldProps } from "../FieldProps";

type Props = FieldProps & {
  onInputChange: (event: React.FormEvent<HTMLInputElement>) => void;
  value: unknown;
  defaultValue: unknown;
  allowedValues: string[];
};

export default function RadioGroupField(props: Props) {
  const {
    value,
    onInputChange,
    allowedValues,
    node,
    relevant,
    readonly,
  } = props;
  const context = React.useContext(ODKSurveyContext);
  const { language } = context;

  if (value !== undefined && typeof value !== "string") {
    return (
      <Callout intent="warning">
        <h4>
          Value must be a <Code>string</Code> for this field to work
        </h4>
      </Callout>
    );
  }

  if (language === undefined) {
    return null;
  }

  if (context.debug && node.typeParameters.length === 0) {
    return (
      <Callout intent="warning" title="No choice list set.">
        <FieldConfigurationButton node={node} showType={false} />
      </Callout>
    );
  }

  return (
    <RadioGroup
      // label={labelElement}
      onChange={onInputChange}
      selectedValue={value}
      inline={true}
      disabled={relevant === false || readonly}
    >
      {allowedValues.map((value) => {
        const choiceListName = node.typeParameters[0];
        const choiceRow =
          context.xlsForm?.choicesByName[choiceListName]?.[value];
        const definedLabel = choiceRow?.label?.[language];
        const shownLabel =
          definedLabel === "undefined" ? choiceRow?.name : definedLabel;
        return (
          <Radio
            label={shownLabel}
            value={choiceRow?.name}
            inline={true}
            large={true}
          />
        );
      })}
    </RadioGroup>
  );
}
