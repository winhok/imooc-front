# Production release protocol

The Vite output uses content-hashed assets, so a production release must publish
`index.html` and its referenced asset set as one version.

Recommended server layout:

```text
/var/www/imooc-front/
├── current -> releases/20260724T120000Z
└── releases/
    ├── 20260724T120000Z/
    ├── 20260723T180000Z/
    └── 20260722T093000Z/
```

Release sequence:

1. Build into a new, uniquely named release directory.
2. Upload the complete `dist/` contents into that directory.
3. Verify that `index.html` and every referenced `/assets/*` file exist.
4. Atomically replace the `current` symlink with the new release.
5. Reload Nginx only when its configuration changed; a frontend release does
   not require a reload.
6. Keep at least the previous two releases during the normal browser-session
   window so already-open tabs can still load their old lazy chunks.
7. Roll back by atomically pointing `current` to a retained release.
8. Delete old releases only after the retention window.

The Nginx document root should resolve through `current`, for example:

```nginx
root /var/www/imooc-front/current;
```

Do not overwrite a live `dist/` directory file by file and do not delete the
previous hashed assets immediately after switching versions. Either action can
produce transient 404 responses for valid HTML or already-open lazy routes.
