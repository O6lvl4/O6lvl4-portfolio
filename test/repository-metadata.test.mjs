import assert from "node:assert/strict";
import test from "node:test";
import { readMetadata, repositoryMetadata } from "../scripts/repository-metadata.mjs";

const repo = { full_name: "almide/almide", owner: { login: "almide" }, name: "almide" };
const release = { tagName: "v0.66.0", url: "https://github.com/almide/almide/releases/tag/v0.66.0", publishedAt: "2026-10-03T01:14:41Z", isDraft: false, isPrerelease: false };
const value = { usesCustomOpenGraphImage: true, openGraphImageUrl: "https://repository-images.githubusercontent.com/1/image", latestRelease: release };
const response = (r = value) => ({ data: { r0: r } });

test("published release metadata is independent of local or prerelease tags", () => {
  const [, metadata] = readMetadata([repo], response())[0];
  assert.deepEqual(metadata.release, { tag: "v0.66.0", url: release.url, publishedAt: release.publishedAt });
  assert.equal(metadata.og, value.openGraphImageUrl);
});

test("an explicit null latestRelease permits a tag fallback", () => {
  const [, metadata] = readMetadata([repo], response({ usesCustomOpenGraphImage: false, latestRelease: null }))[0];
  assert.equal(metadata.release, undefined);
  assert.equal(metadata.og, undefined);
});

test("errors and incomplete responses fail rather than masquerading as no release", () => {
  for (const bad of [
    { ...response(), errors: [{ message: "rate limited" }] }, {}, { data: {} }, response(null),
    response({ usesCustomOpenGraphImage: false }),
    response({ ...value, latestRelease: { ...release, tagName: "" } }),
    response({ ...value, latestRelease: { ...release, publishedAt: null } }),
    response({ ...value, latestRelease: { ...release, url: "https://example.com/release" } }),
    response({ ...value, latestRelease: { ...release, isDraft: true } }),
    response({ ...value, latestRelease: { ...release, isPrerelease: true } }),
  ]) assert.throws(() => readMetadata([repo], bad));
});

test("preview and release queries share batches and transport errors propagate", () => {
  const list = Array.from({ length: 51 }, (_, i) => ({ ...repo, name: `repo${i}`, full_name: `almide/repo${i}` }));
  const calls = [];
  const metadata = repositoryMetadata(list, (args) => {
    calls.push(args);
    assert.match(args[2], /latestRelease \{ tagName url publishedAt isDraft isPrerelease \}/);
    const count = calls.length === 1 ? 50 : 1;
    return { data: Object.fromEntries(Array.from({ length: count }, (_, i) => [`r${i}`, { usesCustomOpenGraphImage: false, latestRelease: null }])) };
  });
  assert.equal(calls.length, 2);
  assert.equal(metadata.size, 51);
  assert.throws(() => repositoryMetadata([repo], () => { throw new Error("network unavailable"); }), /network unavailable/);
});
