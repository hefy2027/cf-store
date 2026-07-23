// src/location.js
function getCodeSandboxLocation(path) {
  const prefix = "https://codesandbox.io/s/github/";
  const parts = path.substr(1).split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return null;
  if (parts.length === 2) return prefix + parts.join("/");
  if (parts.length === 3) return null;
  if (parts[2] === "tree") return prefix + parts.join("/");
  if (parts[2] === "blob")
    return prefix + [parts[0], parts[1], "tree", parts[3]].join("/") + "?file=/" + parts.slice(4).join("/");
  return null;
}

// src/index.js
async function handleEvent(event) {
  const url = new URL(event.request.url);
  let path = url.pathname;
  if (path === "/" || path === "/index.html")
    return Response.redirect("https://github.com/dferber90/githubbox", 302);
  if (path === "/robots.txt")
    return new Response(
      [
        "# https://www.robotstxt.org/robotstxt.html",
        "User-agent: *",
        "Disallow:"
      ].join("\n"),
      { status: 200 }
    );
  let location = getCodeSandboxLocation(path);
  if (location) {
    return Response.redirect(location, 302);
  }
  return new Response("Not found", { status: 404 });
}
function handleFetch(event) {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    event.respondWith(new Response("Internal Error", { status: 500 }));
  }
}
if (typeof addEventListener === "function")
  addEventListener("fetch", handleFetch);
export {
  handleFetch
};
