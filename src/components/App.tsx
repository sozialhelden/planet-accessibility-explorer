import {
  FocusStyleManager,
  HotkeysProvider,
  HotkeysTarget2,
} from "@blueprintjs/core";
import * as React from "react";
import { useHistory, useLocation } from "react-router";
import styled from "styled-components";
import "./App.css";
import BlueprintDarkModeContainer from "./core/BlueprintDarkModeContainer";
import composeContexts, { ContextAndValue } from "./core/composeContexts";
import { useGlobalHotkeys } from "./hooks/useGlobalHotkeys";
import { Legend } from "./Legend";
import MapView from "./map/MapView";
import OverflowScrollContainer from "./OverflowScrollContainer";

FocusStyleManager.onlyShowFocusOnTabs();

const AppBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

function App() {
  // const { viewMenuButton, viewOptions } = useViewOptionsButton();
  // const isDarkMode = useDarkMode();
  // The panel showing the Linked Data vocabulary graph

  const contexts: ContextAndValue<any>[] = [
    // [RDFGraphContext, rdfStore],
  ];
  const history = useHistory();
  const location = useLocation();

  const onSelectFeature = React.useCallback<(_id: string) => void>(
    (_id) => {
      const url = `/features/${_id}`;
      history.push(`${url}${location.search}`);
    },
    [history, location]
  );

  const sidebar = (
    <OverflowScrollContainer
      style={{ width: "400px", padding: "1rem", margin: "0" }}
    >
      <h1>Miki: Erforsche deinen Kiez</h1>
      <Legend />
    </OverflowScrollContainer>
  );

  const mapView = (
    <MapView
      featureId={undefined}
      onSelectFeature={onSelectFeature}
      visible={true}
    />
  );

  const navbarAndBody = (
    <>
      <AppBody>
        {/* {sidebar} */}
        {mapView}
      </AppBody>
    </>
  );

  const hotkeys = useGlobalHotkeys();
  return (
    <HotkeysProvider>
      <HotkeysTarget2 hotkeys={hotkeys}>
        {({ handleKeyDown, handleKeyUp }) => (
          <BlueprintDarkModeContainer
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          >
            {composeContexts(contexts, navbarAndBody)}
          </BlueprintDarkModeContainer>
        )}
      </HotkeysTarget2>
    </HotkeysProvider>
  );
}

export default App;
