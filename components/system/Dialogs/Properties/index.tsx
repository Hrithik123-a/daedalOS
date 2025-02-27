import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import GeneralTab from "components/system/Dialogs/Properties/GeneralTab";
import StyledProperties from "components/system/Dialogs/Properties/StyledProperties";
import useStats from "components/system/Dialogs/Properties/useStats";
import StyledButton from "components/system/Dialogs/StyledButton";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import useTitle from "components/system/Window/useTitle";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useEffect, useRef } from "react";

const Properties: FC<ComponentProcessProps> = ({ id }) => {
  const { icon: setIcon, processes: { [id]: process } = {} } = useProcesses();
  const { shortcutPath, url } = process || {};
  const generalUrl = shortcutPath || url || "";
  const stats = useStats(generalUrl);
  const [{ getIcon, icon, pid }] = useFileInfo(
    generalUrl,
    stats?.isDirectory()
  );
  const { prependFileToTitle } = useTitle(id);
  const getIconAbortController = useRef<AbortController>();

  useEffect(() => {
    setIcon(id, icon);

    if (typeof getIcon === "function") {
      getIconAbortController.current = new AbortController();
      getIcon(getIconAbortController.current.signal);
    }

    if (generalUrl) {
      prependFileToTitle(
        basename(generalUrl, shortcutPath ? extname(generalUrl) : undefined),
        false,
        true
      );
    }
  }, [
    generalUrl,
    getIcon,
    icon,
    id,
    prependFileToTitle,
    setIcon,
    shortcutPath,
  ]);

  useEffect(
    () => () => {
      try {
        getIconAbortController?.current?.abort?.();
      } catch {
        // Failed to abort getIcon
      }
    },
    []
  );

  return (
    <StyledProperties>
      <nav className="tabs">
        <StyledButton>General</StyledButton>
      </nav>
      <GeneralTab
        icon={icon}
        id={id}
        isShortcut={Boolean(process?.shortcutPath)}
        pid={pid}
        url={generalUrl}
      />
    </StyledProperties>
  );
};

export default Properties;
