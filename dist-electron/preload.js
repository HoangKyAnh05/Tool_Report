import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electronAPI", {
	minimize: () => t.invoke("window:minimize"),
	maximize: () => t.invoke("window:maximize"),
	hideToTray: () => t.invoke("window:hide-to-tray"),
	close: () => t.invoke("window:close"),
	quit: () => t.invoke("window:quit"),
	wakeUpAlarm: (e) => t.invoke("alarm:wake-up", e),
	dismissAlarm: () => t.invoke("alarm:dismiss"),
	openVideoDialog: () => t.invoke("dialog:open-video"),
	isPackaged: () => t.invoke("app:is-packaged"),
	onTestTrigger: (e) => {
		let n = () => e();
		return t.on("alarm:test-trigger", n), () => {
			t.removeListener("alarm:test-trigger", n);
		};
	}
});
//#endregion
export {};
