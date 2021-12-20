import mapboxgl from "mapbox-gl";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import ReactMapGL, {
  Layer,
  MapContext,
  MapEvent,
  MapRef,
  NavigationControl,
  Source,
  ViewportProps,
} from "react-map-gl";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useHistory, useLocation } from "react-router";
import useMeasure from "react-use-measure";
import FeatureListPopup from "../feature/FeatureListPopup";
import getFeatureIdsFromLocation from "../feature/getFeatureIdsFromLocation";
import OverflowScrollContainer from "../OverflowScrollContainer";
import { databaseTableNames, filterLayers } from "./filterLayers";
import useMapStyle from "./useMapStyle";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

interface IProps {
  featureId?: string;
  onSelectFeature: (_id: string) => void;
  className?: string;
  timestamp?: number;
  visible?: boolean;
  children?: React.ReactNode;
}

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

  const history = useHistory();
  const location = useLocation();
  const featureIds = getFeatureIdsFromLocation(location);
  const query = new URLSearchParams(location.search);
  const latitude = query.get("lat");
  const longitude = query.get("lon");
  const zoom = query.get("zoom");

  const [viewport, setViewport] = useState<
    Partial<ViewportProps> & { width: number; height: number }
  >({
    width: 100,
    height: 100,
    latitude: (latitude && parseFloat(latitude)) || 52.5,
    longitude: (longitude && parseFloat(longitude)) || 13.3,
    zoom: (zoom && parseFloat(zoom)) || (latitude && longitude ? 18 : 10),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // const featureLayer = useMemo(() => {
  //   return generateSelectedFeatureLayer(props.featureId);
  // }, [props.featureId]);

  // const featureDetailsLayer = useMemo(() => {
  //   return generateFeatureDetailsLayer(props.featureId);
  // }, [props.featureId]);

  // const unclusteredPointLabelLayer = useMemo(() => {
  //   return generateUnclusteredPointLabelLayer(lastImportType, languageTagsStrings, props.featureId);
  // }, [lastImportType, props.featureId]);

  const handleMapClick = useCallback<(event: MapEvent) => void>(
    (event) => {
      console.log(event);

      const selectedFeatureCount = event?.features?.length;
      if (!selectedFeatureCount) {
        // Clicked outside of a clickable map feature
        history.push("/");
      }

      if (selectedFeatureCount === 1) {
        const feature = event.features?.[0];
        // Show source overview again if user just clicks/taps on the map
        feature &&
          history.push(
            `/${feature.source}/${feature.properties.id}?lon=${event.lngLat[0]}&lat=${event.lngLat[1]}&zoom=${zoom}`
          );
        return;
      }

      history.push(
        `/composite/${event.features
          ?.map((f) => [f.source, f.properties.id].join(":"))
          .join(",")}?lon=${event.lngLat[0]}&lat=${
          event.lngLat[1]
        }&zoom=${zoom}`
      );
      return;
    },
    [history, zoom]
  );

  const updateViewportQuery = useCallback(() => {
    const location = history.location;
    const query = new URLSearchParams(location.search);

    if (viewport.zoom) {
      query.set("zoom", viewport.zoom.toString());
    }

    if (featureIds.length === 0) {
      if (viewport.latitude) {
        query.set("lat", viewport.latitude.toString());
      }

      if (viewport.longitude) {
        query.set("lon", viewport.longitude.toString());
      }
    }

    location.search = query.toString();
    history.replace(location);
  }, [viewport, history, featureIds]);

  const closePopup = useCallback(() => {
    history.push(`/`);
    updateViewportQuery();
  }, [history, updateViewportQuery]);

  const setViewportCallback = useCallback(
    (viewState, interactionState) => {
      // console.log('Setting viewport because of callback:', viewState, interactionState);
      setViewport({ ...viewport, ...viewState });
    },
    [setViewport, viewport]
  );

  // const onLoadCallback = useCallback(() => {
  // const map = mapRef.current?.getMap();
  // }, [mapRef.current]);

  const mapStyle = useMapStyle();
  const layers = React.useMemo(
    () => mapStyle.data?.layers && filterLayers(mapStyle.data?.layers),
    [mapStyle]
  );

  return (
    // Container needs to hide overflow because it's used for measurement.
    // Without hiding overflowing content, it would adapt its own size to its overflowing content
    // size on reducing its size while resizing the viewport, so it would only grow bigger, never
    // shrink.
    <OverflowScrollContainer
      ref={containerRef}
      className={props.className}
      style={{
        flex: 1,
        display: props.visible === false ? "none" : "block",
        position: "relative",
      }}
    >
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        onViewportChange={setViewportCallback}
        onTransitionEnd={updateViewportQuery}
        onTouchEnd={updateViewportQuery}
        onMouseUp={updateViewportQuery}
        interactiveLayerIds={mapStyle.data?.layers
          ?.map((l) => l.id)
          .filter((id) => id.startsWith("osm-"))}
        onClick={handleMapClick}
        // onLoad={onLoadCallback}
        mapStyle="mapbox://styles/mapbox/light-v10"
        // mapStyle={null}
        ref={mapRef}
      >
        {databaseTableNames.map((name) => (
          <Source
            type="vector"
            tiles={[0, 1, 2, 3].map(
              (n) =>
                `${process.env.REACT_APP_OSM_API_TILE_BACKEND_URL?.replace(
                  /{n}/,
                  n.toString()
                )}/${name}.mvt?limit=10000&bbox={bbox-epsg-3857}&epsg=3857`
            )}
            id={name}
            key={name}
          />
        ))}
        {layers?.map((layer) => (
          <Layer key={layer.id} {...(layer as any)} />
        ))}
        {latitude && longitude && featureIds.length > 0 && (
          <FeatureListPopup
            featureIds={featureIds}
            latitude={Number.parseFloat(latitude)}
            longitude={Number.parseFloat(longitude)}
            onClose={closePopup}
          />
        )}
        <ZoomToDataOnLoad />
        <NavigationControl style={{ right: "1rem", top: "1rem" }} />
      </ReactMapGL>
      {props.children}
    </OverflowScrollContainer>
  );
}
