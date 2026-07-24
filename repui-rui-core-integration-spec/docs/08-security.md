# 8. Security и maintenance

## 8.1. Permissions

Каждый workflow задаёт явный `permissions`.

Default:

```yaml
permissions:
  contents: read
```

Pages:

```yaml
pages: write
id-token: write
```

PR creation:

```yaml
contents: write
pull-requests: write
```

## 8.2. Actions pinning

Production actions желательно фиксировать по commit SHA с комментарием версии. Dependabot обновляет GitHub Actions.

## 8.3. Forks

- secrets не выдаются;
- delivery/release не запускаются;
- `pull_request_target` не исполняет checkout untrusted code;
- browser tests работают без secrets.

## 8.4. Supply chain

- protected tags;
- SHA256SUMS;
- build-info;
- lockfile;
- artifact attestations/npm provenance при зрелой pipeline;
- no `eval`;
- bundle banner и version;
- RepUI checkout только разрешённого repo и semver tag.

## 8.5. Token policy

PAT MVP:

- fine-grained;
- только нужный repo;
- expiration;
- rotation 90/180 дней;
- documented owner/purpose.

Для долгой эксплуатации перейти на GitHub App.

## 8.6. Branch protection

- PR required;
- required checks;
- conversations resolved;
- force push/delete disabled;
- automation PR допускает auto-merge после checks.

## 8.7. Generated file ownership

Banner:

```text
GENERATED FILE — DO NOT EDIT
Source: https://github.com/vap-tech/rui-core
```

CONTRIBUTING RepUI:

```text
Не редактировать js/vendor/rui-core.min.js вручную.
Исправление делается в rui-core и доставляется automation PR.
```

## 8.8. Incidents

Broken core update: не merge PR, issue, patch release.

Broken after merge: revert bundle PR, Pages redeploy, patch.

Credential compromise: revoke, audit, rotate, проверить commits/protection, перейти на App.

## 8.9. Cadence

Monthly: dependencies, browser matrix, flaky tests, bundle trend.

Before minor: screen reader, docs/demo, migration notes.

Quarterly: permissions audit, legacy cleanup, performance/leaks.
