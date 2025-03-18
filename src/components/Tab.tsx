import { useContext } from "react";
import { TeamsFxContext } from "./Context";
import { HelloWorld } from "./HelloWorld";

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);
  return (
    <div
      className={themeString === "default" ? "light" : themeString === "dark" ? "dark" : "contrast"}
    >
      <HelloWorld />
    </div>
  );
}
