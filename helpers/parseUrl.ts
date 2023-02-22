export const parseURL = (url: string) => {
  if (!url) return "";
  const str = url.substring(0, 4);

  if (str === "http") {
    return url;
  } else {
    return `https://cyberconnect.mypinata.cloud/ipfs/${url}`;
  }
};
