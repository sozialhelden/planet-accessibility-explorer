import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import ReactMapGL, { MapContext, MapRef, ViewportProps } from "react-map-gl";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useHistory } from "react-router";
import useMeasure from "react-use-measure";
import styled from "styled-components";
import OverflowScrollContainer from "./OverflowScrollContainer";

// if (Meteor.isClient) {
//   const { setRTLTextPlugin } = require('mapbox-gl');
//   setRTLTextPlugin(
//     // find out the latest version at https://www.npmjs.com/package/@mapbox/mapbox-gl-rtl-text
//     'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
//     (error: Error) => { console.log('Could not load RTL text plugin:', error); },
//     // lazy: only load when the map first encounters Hebrew or Arabic text
//     true
//   );
// }

interface IProps {
  featureId?: string;
  onSelectFeature: (_id: string) => void;
  className?: string;
  timestamp?: number;
  visible?: boolean;
  children?: React.ReactNode;
}

const HiddenOverflowDiv = styled.div`
  overflow: hidden;
`;

function ZoomToDataOnLoad() {
  const mapContext = React.useContext(MapContext);

  if (mapContext.map) {
    // do something
  }
  return null;
}

export default function MapView(props: IProps) {
  const [containerRef, { width, height }] = useMeasure();
  const mapRef = useRef<MapRef>(null);

  // const { model: feature } = useMeteorData(
  //   () => ({
  //     subscriptions:
  //       lastImportType && props.featureId
  //         ? [[`${collectionName}.private`, '_id', props.featureId]]
  //         : [],
  //     fetchFunction: () => {
  //       if (!lastImportType) {
  //         return;
  //       }
  //       return collection?.findOne(props.featureId);
  //     },
  //   }),
  //   [lastImportType, props.featureId]
  // );

  const [viewport, setViewport] = useState<
    Partial<ViewportProps> & { width: number; height: number }
  >({
    width: 100,
    height: 100,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 1,
  });

  // Pan to feature boundary if no single feature is selected and the source is loaded for the first time
  // useEffect(() => {
  //   if (feature) {
  //     return;
  //   }

  //   const map = mapRef.current?.getMap() as Map;
  //   if (!map) {
  //     return;
  //   }

  //   map.once('idle', () => {
  //     const features = map.querySourceFeatures('features');
  //     const bounds = new LngLatBounds();
  //     features
  //       .filter(f => f.geometry?.coordinates)
  //       .forEach(feature => bounds.extend(feature.geometry.coordinates));
  //     if (bounds.isEmpty()) {
  //       return;
  //     }
  //     const northWest = bounds.getNorthWest();
  //     const southEast = bounds.getSouthEast();
  //     if (!northWest || !southEast) {
  //       return;
  //     }
  //     if (northWest.distanceTo(southEast) === 0) {
  //       map.setCenter(bounds.getNorthEast());
  //     } else {
  //       map.fitBounds(bounds.toArray() as LngLatBoundsLike, { padding: 100, maxDuration: 0 });
  //     }
  //     map.once('idle', () => {
  //       const newMapCenter = map.getCenter();
  //       setViewport({ ...viewport, zoom: map.getZoom(), latitude: newMapCenter.lat, longitude: newMapCenter.lng });
  //     });
  //   });

  //   // const newViewport = {
  //   //   ...viewport,
  //   //   latitude: feature?.geometry.coordinates?.[1],
  //   //   longitude: feature?.geometry.coordinates?.[0],
  //   //   zoom: Math.max(10, viewport.zoom || 10),
  //   // };

  //   // setViewport(newViewport);
  // }, [mapRef.current]);

  // Pan to single selected map feature, if it exists or changes
  // useEffect(() => {
  //   if (!feature || !feature.geometry) {
  //     return;
  //   }

  //   const map = mapRef.current?.getMap() as Map;
  //   if (!map) {
  //     return;
  //   }
  //   const bounds = map.getBounds();
  //   if (
  //     viewport?.zoom &&
  //     viewport?.zoom >= 10 &&
  //     bounds &&
  //     bounds.contains(feature.geometry.coordinates)
  //   ) {
  //     return;
  //   }

  //   const newViewport = {
  //     ...viewport,
  //     latitude: feature?.geometry.coordinates?.[1],
  //     longitude: feature?.geometry.coordinates?.[0],
  //     zoom: Math.max(10, viewport.zoom || 10),
  //     pitch: 50,
  //   };

  //   setViewport(newViewport);
  // }, [mapRef.current, feature?.geometry?.coordinates[0], feature?.geometry?.coordinates[1]]);

  // Reset viewport when map size changes
  useLayoutEffect(() => {
    const newViewport = { ...viewport, width, height };
    setViewport(newViewport);
  }, [width, height]);

  const history = useHistory();

  // const featureLayer = useMemo(() => {
  //   return generateSelectedFeatureLayer(props.featureId);
  // }, [props.featureId]);

  // const featureDetailsLayer = useMemo(() => {
  //   return generateFeatureDetailsLayer(props.featureId);
  // }, [props.featureId]);

  // const unclusteredPointLabelLayer = useMemo(() => {
  //   return generateUnclusteredPointLabelLayer(lastImportType, languageTagsStrings, props.featureId);
  // }, [lastImportType, props.featureId]);

  const handleMapClick = useCallback<(event: any) => void>(
    (event) => {
      const feature = event.features[0];
      if (!feature) {
        // Show source overview again if user just clicks/taps on the map
        history.push(`/`);
        return;
      }
      // if (feature?.layer.id === featureLayer.id) {
      //   // Selected a single point
      //   props.onSelectFeature(feature.properties._id || feature._id);
      // }
    },
    [viewport]
  );

  const setViewportCallback = useCallback(
    (viewState, interactionState) => {
      // console.log('Setting viewport because of callback:', viewState, interactionState);
      setViewport({ ...viewport, ...viewState });
    },
    [setViewport]
  );

  const onLoadCallback = useCallback(() => {
    // const map = mapRef.current?.getMap();
  }, [mapRef.current]);

  return (
    // Container needs to hide overflow because it's used for measurement.
    // Without hiding overflowing content, it would adapt its own size to its overflowing content
    // size on reducing its size while resizing the viewport, so it would only grow bigger, never
    // shrink.
    <OverflowScrollContainer
      ref={containerRef}
      className={props.className}
      style={{
        display: props.visible === false ? "none" : "block",
        position: "relative",
      }}
    >
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        onViewportChange={setViewportCallback}
        // interactiveLayerIds={[featureLayer?.id]}
        onClick={handleMapClick}
        onLoad={onLoadCallback}
        mapStyle="mapbox://styles/mapbox/light-v10"
        ref={mapRef}
      >
        {/* <Source
          type="geojson"
          data={`/${lastImportTypeWithDashes}.json?includeSourceIds=${props.sourceIds.join(
            ","
          )}&limit=20000&surrogateKeys=false&userToken=${
            userToken.token
          }&timestamp=${props.timestamp}&includePlacesWithoutAccessibility=1`}
          cluster={true}
          clusterMaxZoom={9}
          clusterRadius={50}
          id="features"
        >
          <Layer {...featureLayer} />
          <Layer {...featureDetailsLayer} />
        </Source> */}
        <ZoomToDataOnLoad />
      </ReactMapGL>
      {props.children}
    </OverflowScrollContainer>
  );
}
