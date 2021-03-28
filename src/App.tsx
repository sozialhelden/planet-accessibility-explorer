import { Alignment, FocusStyleManager, Navbar } from "@blueprintjs/core";
import React from "react";
import styled from "styled-components";
import "./App.css";
import ResultCodeTree from "./code/ResultCodeTree";
import { AppEmptyState } from "./components/AppEmptyState";
import DarkModeContainer from "./components/DarkModeContainer";
import { FileMenuButton } from "./components/FileMenuButton";
import LanguageSelector from "./components/LanguageSelector";
import OverflowScrollContainer from "./components/OverflowScrollContainer";
import useViewOptionsButton from "./components/useViewOptionsButton";
import { ODKSurveyContext } from "./lib/ODKSurveyContext";
import useChangeHooks from "./lib/useChangeHooks";
import EditableSurveyTitle from "./survey/fields/EditableSurveyTitle";
import { ODKNodeDragAndDropContext } from "./survey/useNodeDragAndDrop";
import XLSFormSurvey from "./survey/XLSFormSurvey";
import XLSFormWorkbook from "./table/XLSFormWorkbook";
import { createSurveySchemaFromXLSForm } from "./xlsform-simple-schema/functions/schema-creation/createSurveySchemaFromXLSForm";
import { XLSForm } from "./xlsform-simple-schema/index";

FocusStyleManager.onlyShowFocusOnTabs();

const StyledXLSFormSurvey = styled(XLSFormSurvey)`
  max-width: 800px;
  margin: auto;

  font-size: 20px;
  .bp3-small {
    font-size: 16px;
  }

  .bp3-large {
    font-size: 20px;
  }

  .bp3-form-helper-text {
    font-size: 16px;
  }

  .bp3-form-group {
    margin: 0 0 40px;
  }

  .bp3-control {
    margin-bottom: 10px;
  }
`;

const AppBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

function App() {
  const [xlsForm, setXLSForm] = React.useState<XLSForm>();
  const [language, setLanguage] = React.useState<string>("English (en)");

  const resultCodeElement = xlsForm && (
    <OverflowScrollContainer
      className={"bp3-code-block"}
      style={{ padding: "1rem", margin: "0", whiteSpace: "pre" }}
    >
      <ResultCodeTree {...{ xlsForm }} />
    </OverflowScrollContainer>
  );

  const changeHooks = useChangeHooks({
    language,
    xlsForm,
    setXLSForm,
  });

  const { evaluationContext: context } = changeHooks;
  const [, languageName, languageCode] =
    language?.match(/^(.*) \((\w+)\)$/) || [];

  const schema = React.useMemo(() => {
    if (xlsForm && language && context) {
      return createSurveySchemaFromXLSForm(xlsForm, context, language);
    }
    return undefined;
  }, [xlsForm, language, context]);

  const { viewMenuButton, viewOptions } = useViewOptionsButton();

  return (
    <DarkModeContainer
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <ODKNodeDragAndDropContext.Provider
        value={{ onDropNode: changeHooks.onMoveNode }}
      >
        <ODKSurveyContext.Provider
          value={{
            schema,
            language,
            languageCode,
            languageName,
            debug: viewOptions.debug,
            xlsForm,
            ...changeHooks,
          }}
        >
          {xlsForm && (
            <Navbar>
              <Navbar.Group>
                <FileMenuButton {...{ setXLSForm, setLanguage, xlsForm }} />
              </Navbar.Group>
              <Navbar.Group>
                <Navbar.Divider />
                <EditableSurveyTitle />
              </Navbar.Group>
              <Navbar.Group align={Alignment.RIGHT}>
                {viewMenuButton}
                <Navbar.Divider />
                {xlsForm && language && (
                  <LanguageSelector
                    languages={Array.from(xlsForm.languages.values())}
                    language={language}
                    onChange={setLanguage}
                  />
                )}
              </Navbar.Group>
            </Navbar>
          )}

          <AppBody>
            {!xlsForm && (
              <OverflowScrollContainer>
                <AppEmptyState {...{ setXLSForm, setLanguage }} />
              </OverflowScrollContainer>
            )}
            {xlsForm && language && viewOptions.table && (
              <XLSFormWorkbook
                xlsForm={xlsForm}
                language={language}
                debug={viewOptions.debug}
                style={{ flex: 1, display: "flex" }}
              />
            )}
            {xlsForm && language && (
              <OverflowScrollContainer
                style={{ boxShadow: "0 0px 30px #0b161c", zIndex: 1 }}
              >
                <StyledXLSFormSurvey
                  xlsForm={xlsForm}
                  language={language}
                  debug={viewOptions.debug}
                />
              </OverflowScrollContainer>
            )}
            {xlsForm && language && viewOptions.json && resultCodeElement}
          </AppBody>
        </ODKSurveyContext.Provider>
      </ODKNodeDragAndDropContext.Provider>
    </DarkModeContainer>
  );
}

export default App;
