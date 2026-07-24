# 5. Релизы и доставка bundle

## 5.1. Поток

```text
1. Release/tag rui-core vX.Y.Z
2. Core CI собирает и тестирует
3. Core отправляет repository_dispatch
4. RepUI checkout exact tag
5. Проверяет tag SHA
6. Собирает bundle из lockfile
7. Копирует в js/vendor
8. Прогоняет integration suite
9. Создаёт PR
10. Merge публикует demo
```

RepUI собирает сам, потому что получатель должен контролировать toolchain и тесты.

## 5.2. Trigger payload

```json
{
  "event_type": "rui-core-released",
  "client_payload": {
    "repository": "vap-tech/rui-core",
    "tag": "v0.2.0",
    "sha": "..."
  }
}
```

RepUI слушает `repository_dispatch`.

## 5.3. Authentication

Обычный `GITHUB_TOKEN` ограничен текущим repo.

Рекомендуется:

### Production

GitHub App, установленный только на `rui-core` и RepUI:

- короткоживущие installation tokens;
- точечные permissions;
- простой revoke;
- не зависит от срока жизни PAT.

### MVP

Fine-grained PAT:

- доступ только к RepUI;
- минимальное permission для dispatch;
- secret в core: `REPUI_DISPATCH_TOKEN`;
- expiration/rotation;
- не использовать в fork PR.

## 5.4. PR mode

Ветка:

```text
automation/rui-core-0.2.0
```

PR:

```text
chore(deps): update bundled rui-core to v0.2.0
```

Body:

- old/new;
- release URL;
- upstream SHA;
- bundle SHA;
- exports diff;
- size diff;
- test summary.

Auto-merge разрешён для patch, если:

- API diff отсутствует;
- checks зелёные;
- size budget;
- branch protection выполнен.

Minor/major требуют review.

## 5.5. Direct push

Не рекомендуется. Если нужен:

- push только в automation branch;
- затем PR;
- не обходить protected main;
- не давать core workflow постоянный широкий write token.

## 5.6. Verification

- `RUICore.version` равен tag;
- `git rev-list -n 1 tag` равен payload SHA;
- banner присутствует;
- expected exports;
- SHA/size;
- integration tests.

Нельзя silently checkout `main` вместо tag.

## 5.7. Release assets

Core Release может содержать:

```text
rui-core-X.Y.Z.js
rui-core-X.Y.Z.min.js
.map
build-info.json
SHA256SUMS
```

Но RepUI всё равно предпочтительно собирает из source tag.

## 5.8. Reproducibility

Зафиксировать:

- `.node-version`;
- `packageManager`;
- lockfile;
- bundler/minifier;
- line endings;
- timezone/locale.

Не включать build timestamp в JS.

## 5.9. Failure/rollback

Ошибка доставки не меняет RepUI. Доступен manual `workflow_dispatch`.

Rollback:

- revert update PR;
- вернуть старый bundle;
- Pages redeploy;
- выпустить patch core/RepUI.
