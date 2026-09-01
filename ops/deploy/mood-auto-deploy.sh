#!/usr/bin/env bash
set -euo pipefail

repository_url="${MOOD_REPOSITORY_URL:-https://github.com/huliye24/MOOD.git}"
branch="${MOOD_DEPLOY_BRANCH:-main}"
deploy_root="${MOOD_DEPLOY_ROOT:-/opt/crestwave}"
repository_dir="${deploy_root}/repository"
releases_dir="${deploy_root}/releases"
current_link="${deploy_root}/current"
deployed_revision_file="${deploy_root}/runtime/deployed-revision"
node_bin="${MOOD_NODE_BIN:-/opt/node22/bin}"
service_name="${MOOD_WEB_SERVICE:-crestwave-web3.service}"
health_port="${MOOD_HEALTH_PORT:-3201}"
keep_releases="${MOOD_KEEP_RELEASES:-8}"

exec 9>"${deploy_root}/runtime/deploy.lock"
flock -n 9 || exit 0

mkdir -p "${repository_dir}" "${releases_dir}" "${deploy_root}/runtime"
chown -R moodify:moodify "${repository_dir}" "${deploy_root}/runtime"

if [[ ! -d "${repository_dir}/.git" ]]; then
  runuser -u moodify -- git clone --filter=blob:none --no-checkout "${repository_url}" "${repository_dir}"
fi

runuser -u moodify -- git -C "${repository_dir}" fetch --prune origin "+refs/heads/${branch}:refs/remotes/origin/${branch}"
revision="$(runuser -u moodify -- git -C "${repository_dir}" rev-parse "refs/remotes/origin/${branch}")"
deployed_revision="$(cat "${deployed_revision_file}" 2>/dev/null || true)"

if [[ "${revision}" == "${deployed_revision}" ]]; then
  exit 0
fi

release_id="$(date -u +%Y%m%dT%H%M%SZ)-${revision:0:8}"
release_dir="${releases_dir}/${release_id}"
app_dir="${release_dir}/apps/web"

mkdir -p "${release_dir}"
runuser -u moodify -- git -C "${repository_dir}" archive "${revision}" | tar -x -C "${release_dir}"
printf '%s\n' "${revision}" > "${release_dir}/DEPLOYED_COMMIT"
chown -R moodify:moodify "${release_dir}"
chmod u+x "${app_dir}"/scripts/*.sh

cleanup_failed_release() {
  if [[ -n "${health_pid:-}" ]]; then
    kill "${health_pid}" 2>/dev/null || true
    wait "${health_pid}" 2>/dev/null || true
  fi
  rm -rf --one-file-system "${release_dir}"
}
trap cleanup_failed_release ERR INT TERM

runuser -u moodify -- env \
  PATH="${node_bin}:/usr/bin:/bin" \
  SITES_INSTALL_TIMEOUT=12m \
  bash -lc "cd '$app_dir' && bash scripts/install-ci.sh && bash scripts/build-self-hosted.sh"

runuser -u moodify -- env \
  PATH="${node_bin}:/usr/bin:/bin" \
  NODE_ENV=production \
  bash -lc "cd '$app_dir' && exec '${node_bin}/node' node_modules/vinext/dist/cli.js start --hostname 127.0.0.1 --port '$health_port'" \
  >"${deploy_root}/runtime/health-check.log" 2>&1 &
health_pid=$!

healthy=0
for _ in $(seq 1 60); do
  if curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:${health_port}/" >/dev/null \
    && curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:${health_port}/canon" >/dev/null \
    && curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:${health_port}/protocol" >/dev/null; then
    healthy=1
    break
  fi
  sleep 2
done

if [[ "${healthy}" != "1" ]]; then
  echo "Health check failed for ${revision}." >&2
  exit 1
fi

kill "${health_pid}" 2>/dev/null || true
wait "${health_pid}" 2>/dev/null || true
unset health_pid

previous_target="$(readlink -f "${current_link}" 2>/dev/null || true)"
ln -sfn "${app_dir}" "${current_link}.next"
mv -Tf "${current_link}.next" "${current_link}"

if ! systemctl restart "${service_name}" \
  || ! curl --fail --silent --show-error --retry 12 --retry-connrefused --retry-delay 2 --max-time 5 "http://127.0.0.1:3200/" >/dev/null; then
  if [[ -n "${previous_target}" && -d "${previous_target}" ]]; then
    ln -sfn "${previous_target}" "${current_link}.rollback"
    mv -Tf "${current_link}.rollback" "${current_link}"
    systemctl restart "${service_name}"
  fi
  echo "Activation failed for ${revision}; restored ${previous_target}." >&2
  exit 1
fi

printf '%s\n' "${revision}" > "${deployed_revision_file}"
chown moodify:moodify "${deployed_revision_file}"
trap - ERR INT TERM

mapfile -t old_releases < <(find "${releases_dir}" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | tail -n "+$((keep_releases + 1))" | cut -d' ' -f2-)
active_target="$(readlink -f "${current_link}")"
active_release="${active_target%/apps/web}"
previous_release="${previous_target%/apps/web}"
for old_release in "${old_releases[@]}"; do
  [[ "${old_release}" != "${active_release}" ]] || continue
  [[ "${old_release}" != "${previous_release}" ]] || continue
  rm -rf --one-file-system "${old_release}"
done

echo "Deployed ${revision} from ${branch}."
