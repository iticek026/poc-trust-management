import React, { useRef, useState } from "react";
import { Editor, OnChange } from "@monaco-editor/react";
import ImageButton from "../buttons/ImageButton";
import { validateJsonConfig } from "../../logic/jsonConfig/parser";
import { SimulationConfigState } from "../../context/simulationConfig";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LetterText, Maximize, SaveIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@radix-ui/react-scroll-area";

type Props = {
  jsonConfig: SimulationConfigState;
};
const JsonConfig: React.FC<Props> = ({ jsonConfig: simulationConfig }) => {
  const [formattedConfig, setFormattedConfig] = useState<string>(JSON.stringify(simulationConfig.jsonConfig, null, 2));

  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setIsExpanded(false);
  });

  const handleEditorChange: OnChange = (value: string | undefined, _) => {
    if (value === undefined) return;
    setFormattedConfig(value);
    try {
      simulationConfig.updateSimulationConfig(value);
      validateJsonConfig(value);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  const handleFormat = () => {
    try {
      setFormattedConfig(JSON.stringify(JSON.parse(formattedConfig), null, 2));
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  const handleSave = () => {
    if (!error) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(formattedConfig);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "trust-simulation-config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      alert("JSON content downloaded successfully!");
    } else {
      alert("Please fix JSON errors before saving.");
    }
  };

  const handleExpandCollapse = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Card
      className={`h-full overflow-hidden relative mb-2  ${isExpanded ? "absolute right-0 w-full max-w-[40rem] min-w-[20rem]" : ""}`}
    >
      <CardHeader className="p-3 flex flex-row justify-between items-center bg-gray-100">
        <CardTitle className="flex items-center">Simulation Config</CardTitle>
        <div className="flex gap-2">
          <ImageButton onClick={handleFormat} className="squre-button">
            <LetterText />
          </ImageButton>
          <ImageButton onClick={handleSave} disabled={!!error} className="squre-button">
            <SaveIcon />
          </ImageButton>
          <ImageButton onClick={handleExpandCollapse} className="squre-button">
            <Maximize />
          </ImageButton>
        </div>
      </CardHeader>
      <CardContent className={`p-3 h-full overflow-hidden json-config-container`} ref={containerRef}>
        <Editor
          height="100%"
          language="json"
          theme="light"
          value={formattedConfig}
          onChange={handleEditorChange}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 12,
            wordWrap: "on",
          }}
        />
        {error && (
          <Alert variant="destructive" className="flex absolute bottom-2 w-[90%] bg-red-100">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription className="max-h-24 overflow-y-auto">
              <ScrollArea>JSON Error: {error} </ScrollArea>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default JsonConfig;
