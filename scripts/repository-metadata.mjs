// GitHub's published release is distinct from the tags visible in a default-branch clone.
import assert from "node:assert/strict";

function releaseOf(value, full) {
  if (value === null) return undefined;
  assert(value && typeof value === "object", `Missing latestRelease for ${full}`);
  assert.equal(value.isDraft, false, `Draft returned as latest release for ${full}`);
  assert.equal(value.isPrerelease, false, `Prerelease returned as latest release for ${full}`);
  assert(typeof value.tagName === "string" && value.tagName.trim(), `Missing release tag for ${full}`);
  assert(typeof value.publishedAt === "string" && Number.isFinite(Date.parse(value.publishedAt)), `Missing release publication date for ${full}`);
  assert(typeof value.url === "string" && value.url.startsWith(`https://github.com/${full}/releases/tag/`), `Invalid release URL for ${full}`);
  return { tag: value.tagName, url: value.url, publishedAt: value.publishedAt };
}

/** Reject partial/error responses before writing any generated data or deploying a replacement. */
export function readMetadata(batch, response) {
  assert(!response.errors?.length, `Repository metadata query failed: ${JSON.stringify(response.errors)}`);
  assert(response.data && typeof response.data === "object", "Missing repository metadata response");
  return batch.map((repo, index) => {
    const value = response.data[`r${index}`];
    assert(value && typeof value === "object", `Missing repository metadata for ${repo.full_name}`);
    assert.equal(typeof value.usesCustomOpenGraphImage, "boolean", `Missing preview metadata for ${repo.full_name}`);
    const og = value.usesCustomOpenGraphImage ? value.openGraphImageUrl : undefined;
    assert(!value.usesCustomOpenGraphImage || typeof og === "string", `Missing preview URL for ${repo.full_name}`);
    return [repo.full_name, { og, release: releaseOf(value.latestRelease, repo.full_name) }];
  });
}

/** Batch the release lookup with the social-preview query the refresh already makes. */
export function repositoryMetadata(list, json) {
  const found = new Map();
  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    const fields = batch.map((r, j) => `r${j}: repository(owner: ${JSON.stringify(r.owner.login)}, name: ${JSON.stringify(r.name)}) { usesCustomOpenGraphImage openGraphImageUrl latestRelease { tagName url publishedAt isDraft isPrerelease } }`);
    const response = json(["graphql", "-f", `query={${fields.join(" ")}}`]);
    for (const entry of readMetadata(batch, response)) found.set(...entry);
  }
  return found;
}
