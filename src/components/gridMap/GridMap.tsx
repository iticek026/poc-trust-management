import { useEffect, useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  setIsMounted: (isMounted: boolean) => void;
};
export const GridMap: React.FC<Props> = ({ setIsMounted }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setIsMounted(true);
    }

    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <Card className="mt-2 flex items-center justify-center">
      <CardContent id="grid-map" className="p-1 flex justify-center items-center w-[240px] h-[240px]" ref={ref}>
        <div id="canvas-wrapper">
          <canvas id="environmentCanvas"></canvas>
        </div>
      </CardContent>
    </Card>
  );
};
