import { JSX, createEffect } from "solid-js";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import ClickOutsideToolbar from "./Directives/ClickOutsideToolbar";

/**
 * Represents a component for handling the search input and its visibility based on search state.
 * @returns {JSX.Element} A JSX element representing the search input component.
 */
export function SearchInput(): JSX.Element {
  const { isSearchOpened, setSearchOpened } = useToolbarStateContext() as any;
  createEffect(() => {
    const searchInput = document.getElementById("SearchInput");
    if (searchInput) {
      if (isSearchOpened()) {
        searchInput.classList.remove("display-none");
      } else {
        searchInput.classList.add("display-none");
      }
    }
  });
  return <div use: ClickOutsideToolbar={()=>setSearchOpened(false)} id="SearchInput" class="cslt-search-input"></div>;
}
