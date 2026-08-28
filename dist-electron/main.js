import { BrowserWindow as e, Menu as t, Tray as n, app as r, dialog as i, ipcMain as a, nativeImage as o, net as s, protocol as c, shell as l } from "electron";
import u from "node:path";
import d from "node:fs";
import f from "node:crypto";
import p, { fileURLToPath as m } from "node:url";
//#region electron/main.ts
var h = m(import.meta.url), g = u.dirname(h);
r.name = "VideoReminderApp";
try {
	let e = r.getPath("appData");
	r.setPath("userData", u.join(e, "VideoReminderApp"));
} catch (e) {
	console.warn("Set userData path error:", e);
}
r.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
var _ = null, v = null, y = !1;
process.env.NODE_ENV === "development" || r.isPackaged;
function b() {
	c.handle("media", (e) => {
		try {
			let t = decodeURIComponent(e.url.replace("media:///", "").replace("media://", ""));
			return s.fetch(p.pathToFileURL(t).toString());
		} catch (e) {
			return console.error("Failed to handle media protocol request:", e), new Response("File not found", { status: 404 });
		}
	});
}
function x() {
	try {
		return o.createFromBuffer(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkoBAwUqifYdQAkGNYmJl/Y5OMxafpPzYDKDYY4gOMjIwM6G4AmwE4DRkAbU0HCEb+7vUAAAAASUVORK5CYII=", "base64"));
	} catch {
		return o.createEmpty();
	}
}
function S() {
	let t = u.join(g, "preload.cjs");
	_ = new e({
		width: 1050,
		height: 720,
		minWidth: 800,
		minHeight: 580,
		title: "Video Reminder - Nhắc Hẹn & Báo Thức Video",
		backgroundColor: "#030712",
		frame: !1,
		show: !0,
		center: !0,
		webPreferences: {
			preload: t,
			nodeIntegration: !1,
			contextIsolation: !0,
			webSecurity: !1
		}
	}), _.on("page-title-updated", (e) => e.preventDefault()), _.webContents.session.clearCache().catch(() => {}), process.env.VITE_DEV_SERVER_URL ? _.loadURL(process.env.VITE_DEV_SERVER_URL) : _.loadFile(u.join(g, "../dist/index.html")), _.webContents.on("before-input-event", (e, t) => {
		(t.key === "F5" || t.control && t.key.toLowerCase() === "r") && _?.webContents.reloadIgnoringCache();
	}), _.webContents.setWindowOpenHandler(({ url: e }) => ((e.startsWith("http://") || e.startsWith("https://")) && l.openExternal(e), { action: "deny" })), _.once("ready-to-show", () => {
		_?.show(), _?.focus();
	}), setTimeout(() => {
		_ && !_.isVisible() && (_.show(), _.focus());
	}, 500), _.on("close", (e) => {
		y || (e.preventDefault(), _?.hide(), v && v.displayBalloon?.({
			title: "Video Reminder",
			content: "Ứng dụng đang chạy ngầm trong khay hệ thống để tiếp tục theo dõi lịch nhắc hẹn."
		}));
	});
}
function C() {
	try {
		let e = x();
		v = new n(e), v.setToolTip("Video Reminder - Đang chạy ngầm");
		let i = t.buildFromTemplate([
			{
				label: "⏰ Mở Video Reminder",
				click: () => {
					_ && (_.show(), _.focus());
				}
			},
			{
				label: "🔄 Tải lại ứng dụng (Reload)",
				click: () => {
					_ && _.webContents.reloadIgnoringCache();
				}
			},
			{
				label: "⚡ Khởi động lại (Restart App)",
				click: () => {
					r.relaunch(), r.exit(0);
				}
			},
			{ type: "separator" },
			{
				label: "🔔 Kích hoạt thử chuông báo",
				click: () => {
					_ && (_.show(), _.webContents.send("alarm:test-trigger"));
				}
			},
			{
				label: "🌐 Mở GitHub Page (Chạy App trên Web)",
				click: () => {
					l.openExternal("https://hoangkyanh05.github.io/Tool_Report/");
				}
			},
			{ type: "separator" },
			{
				label: "❌ Thoát ứng dụng hoàn toàn",
				click: () => {
					y = !0, r.quit();
				}
			}
		]);
		v.setContextMenu(i), v.on("double-click", () => {
			_ && (_.isVisible() ? _.hide() : (_.show(), _.focus()));
		});
	} catch (e) {
		console.warn("System tray setup warning:", e);
	}
}
function w() {
	a.handle("app:restart", () => {
		r.relaunch(), r.exit(0);
	}), a.handle("app:reload", () => (_ && _.webContents.reloadIgnoringCache(), !0)), a.handle("window:minimize", () => {
		_?.minimize();
	}), a.handle("window:maximize", () => {
		_?.isMaximized() ? _.unmaximize() : _?.maximize();
	}), a.handle("window:hide-to-tray", () => {
		_?.hide();
	}), a.handle("window:close", () => {
		_?.hide();
	}), a.handle("window:quit", () => {
		y = !0, r.quit();
	}), a.handle("alarm:wake-up", (e, { autoFullscreen: t }) => (_ && (_.isMinimized() && _.restore(), _.show(), _.setAlwaysOnTop(!0, "screen-saver"), _.focus(), _.flashFrame(!0), t && !_.isFullScreen() && _.setFullScreen(!0)), !0)), a.handle("alarm:dismiss", () => (_ && (_.setAlwaysOnTop(!1), _.flashFrame(!1), _.isFullScreen() && _.setFullScreen(!1)), !0)), a.handle("video:cache-remote", async (e, t) => {
		try {
			if (!t || !t.startsWith("http")) return t;
			let e = u.join(r.getPath("userData"), "cached_videos");
			d.existsSync(e) || d.mkdirSync(e, { recursive: !0 });
			let n = f.createHash("md5").update(t).digest("hex"), i = u.join(e, `${n}.mp4`);
			if (d.existsSync(i) && d.statSync(i).size > 1e3) return i;
			let a = await s.fetch(t, { headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Referer: new URL(t).origin
			} });
			if (!a.ok) throw Error(`Failed to fetch video: ${a.statusText}`);
			let o = await a.arrayBuffer(), c = Buffer.from(o);
			return d.writeFileSync(i, c), i;
		} catch (e) {
			return console.error("Error caching remote video:", e), t;
		}
	}), a.handle("dialog:open-video", async () => {
		if (!_) return null;
		let e = await i.showOpenDialog(_, {
			title: "Chọn file video nhắc hẹn",
			properties: ["openFile"],
			filters: [{
				name: "Video Files",
				extensions: [
					"mp4",
					"webm",
					"ogg",
					"mkv",
					"avi",
					"mov"
				]
			}, {
				name: "All Files",
				extensions: ["*"]
			}]
		});
		if (!e.canceled && e.filePaths.length > 0) {
			let t = e.filePaths[0];
			return {
				path: t,
				name: u.basename(t)
			};
		}
		return null;
	}), a.handle("shell:open-external", (e, t) => t && (t.startsWith("http://") || t.startsWith("https://")) ? (l.openExternal(t), !0) : !1), a.handle("app:is-packaged", () => r.isPackaged);
}
r.requestSingleInstanceLock() ? (r.on("second-instance", () => {
	_ && (_.isMinimized() && _.restore(), _.show(), _.focus());
}), r.whenReady().then(() => {
	b(), w(), S(), C(), r.on("activate", () => {
		e.getAllWindows().length === 0 && S();
	});
}), r.on("window-all-closed", () => {
	process.platform !== "darwin" && y && r.quit();
}), r.on("before-quit", () => {
	y = !0;
})) : r.quit();
//#endregion
export {};
