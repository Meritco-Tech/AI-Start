# 2026-05-28 Add WeCom Request Input Dialog

## Date And Time

2026-05-28 22:47:17 CST

## Request Summary

Added a workbench dialog for entering WeCom `spaceid` and `fatherid` before connecting and displaying the outgoing file-list request body.

## Changed Files

- `server/workbenchWecomMiddleware.js`
- `src/api/workbenchWecom.js`
- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-add-wecom-request-input-dialog.md`

## Implementation Notes

- Clicking the Tencent WeCom data source now opens an input dialog instead of immediately connecting.
- The dialog lets users edit `spaceid` and `fatherid`, previews the JSON request body, and connects only after confirmation.
- The backend returns the actual request body used for `wedrive/file_list`.
- The workbench execution summary displays the request body after a WeCom request.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Could not restart the local Vite service in this environment because the required elevated command was rejected by the current usage/approval limit.
- Pending after manual restart: verify the dialog in the browser and confirm the WeCom file-list endpoint returns `requestBody`.

## Known Risks Or Follow-Up Items

- WeCom may still reject the request if the entered ids are not accessible to the application.
