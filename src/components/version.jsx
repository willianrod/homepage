import { useTranslation } from "next-i18next";
import useSWR from "swr";
import { compareVersions } from "compare-versions";
import { MdNewReleases } from "react-icons/md";

import cachedFetch from "utils/proxy/cached-fetch";

export default function Version() {
  const { t, i18n } = useTranslation();

  const buildTime = process.env.NEXT_PUBLIC_BUILDTIME ?? new Date().toISOString();
  const revision = process.env.NEXT_PUBLIC_REVISION ?? "dev";
  const version = process.env.NEXT_PUBLIC_VERSION ?? "dev";

  const cachedFetcher = (resource) => cachedFetch(resource, 5).then((res) => res.json());

  const { data: releaseData } = useSWR("https://api.github.com/repos/benphelps/homepage/releases", cachedFetcher);

  // use Intl.DateTimeFormat to format the date
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Intl.DateTimeFormat(i18n.language, options).format(new Date(date));
  };

  const latestRelease = releaseData?.[0];

  return (
    <div className="flex flex-row items-center">
      <span className="text-xs text-theme-500 dark:text-theme-400">
        {version} ({revision.substring(0, 7)}, {formatDate(buildTime)})
      </span>
      {version === "main" || version === "dev" || version === "nightly"
        ? null
        : releaseData &&
          compareVersions(latestRelease.tag_name, version) > 0 && (
            <a
              href={latestRelease.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-xs text-theme-500 dark:text-theme-400 flex flex-row items-center"
            >
              <MdNewReleases className="mr-1" /> {t("Update Available")}
            </a>
          )}
    </div>
  );
}
