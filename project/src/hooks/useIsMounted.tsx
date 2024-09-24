// useIsMounted.ts
import { useEffect, useRef } from "react";

export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isMounted = () => isMountedRef.current;

  return isMounted;
};
