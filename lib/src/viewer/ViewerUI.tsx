import { FC, useCallback, useEffect, useRef } from "react";
import { TextViewUI } from "./text/TextViewUI";
import { useViewerContext, ViewerView } from "./ViewerHook";
import { InfographicViewUI } from "./infographic/InfographicViewUI";
import { ViewerProvider } from "./ViewerProvider";
import { WelcomeViewUI } from "./WelcomeViewUI";
import { ErrorViewUI } from "./ErrorViewUI";
import { JsonViewUI } from "./json/JsonViewUI";
import { ViewerNavUI } from "./ViewerNavUI";
import { VisualizerViewUI } from "./visualizer/VisualizerViewUI";
import { useFullscreen } from "./FullScreenHook";
import { HomeViewUI } from "./HomeViewUI";
import { LoadingUI } from "./LoadingUI";
import { PrototypeUI } from "./PrototypeUI";

type ResumeViewerUIProps = {
  jsonResumeUrl?: string | null;
};

/**
 * The main component for the Resume Viewer UI.
 * It provides the context and renders the appropriate view based on the current state.
 *
 * @param {string} jsonResumeUrl - The URL of the JSON resume to be displayed.
 * @returns {JSX.Element} The rendered component.
 */
export const ResumeViewerUI: FC<ResumeViewerUIProps> = ({ jsonResumeUrl }) => {
  return (
    <ViewerProvider url={jsonResumeUrl}>
      <div className="fill-screen bg-background items-center justify-center">
        <ViewerUI />
      </div>
    </ViewerProvider>
  );
};

type ViewerUIProps = {};

const ViewerUI: FC<ViewerUIProps> = () => {
  const [state, dispatch] = useViewerContext();
  const { resume, currentView, isFullscreen } = state;
  const { isPending, error, refresh } = resume || {};
  const viewerRef = useRef<HTMLDivElement>(null);
  const showNav =
    currentView !== ViewerView.Welcome && currentView !== ViewerView.Home;

  // Reset scroll position to top of the body when the current view changes
  useEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [currentView]);

  // Custom hook to handle fullscreen functionality
  useFullscreen(
    viewerRef,
    isFullscreen,
    useCallback(
      (change: boolean) => {
        if (change !== isFullscreen) {
          dispatch({ type: "SET_FULLSCREEN", isFullscreen: change });
        }
      },
      // 'dispatch' is stable and does not change, so we omit it intentionally.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isFullscreen]
    )
  );

  if (error) {
    return <ErrorViewUI error={error} onRetry={refresh} />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewerView.Welcome:
        return <WelcomeViewUI />;
      case ViewerView.Home:
        return <HomeViewUI />;
      case ViewerView.Infographic:
        return <InfographicViewUI />;
      case ViewerView.Text:
        return <TextViewUI />;
      case ViewerView.Json:
        return <JsonViewUI />;
      case ViewerView.Visualizer:
        return <VisualizerViewUI />;
      default:
        // Show an error message if the view is not recognized
        return (
          <div className="p-4 text-center text-red-500 border border-red-200 rounded-lg bg-red-50">
            Error: Unknown view type.
          </div>
        );
    }
  };

  return (
    <div ref={viewerRef} className="fill-screen flex flex-col gap-4 relative">
      <PrototypeUI />
      <LoadingUI
        isLoading={isPending}
        minDisplayTime={1000}
        fadeTransitionDuration={800}
        initialEaseInDuration={800}
        exitDuration={800}
      >
        {renderView()}
        {showNav && <ViewerNavUI />}
      </LoadingUI>
    </div>
  );
};
