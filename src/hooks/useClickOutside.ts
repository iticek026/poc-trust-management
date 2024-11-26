import { DependencyList, RefObject, useEffect } from "react";

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  dependencies: DependencyList = [],
) => {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, ...dependencies]);
};
