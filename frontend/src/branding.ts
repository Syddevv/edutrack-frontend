import defaultSchoolLogoAsset from "./assets/bpc-logo-removebg-preview.png";

const BACKEND_BASE_URL = "http://localhost/edutrack-backend";

export function getSchoolLogoUrl(schoolLogoPath?: string | null): string {
  if (!schoolLogoPath) {
    return new URL(defaultSchoolLogoAsset, window.location.origin).href;
  }

  if (/^https?:\/\//i.test(schoolLogoPath)) {
    return schoolLogoPath;
  }

  const normalizedPath = schoolLogoPath.startsWith("/")
    ? schoolLogoPath
    : `/${schoolLogoPath}`;

  return `${BACKEND_BASE_URL}${normalizedPath}`;
}
