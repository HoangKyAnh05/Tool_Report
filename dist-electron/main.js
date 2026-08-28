import _electronPkg from "electron";
const { BrowserWindow: e, Menu: t, Tray: n, app: r, dialog: i, ipcMain: a, nativeImage: o, net: s, protocol: c, shell: l } = (_electronPkg?.default || _electronPkg || {});
if (typeof process !== 'undefined' && !process.versions?.electron) {
  console.log('🌐 Render cloud environment detected: starting web server...');
  await import('../server.js');
  await new Promise(() => {});
}
import u from "node:path";
import d from "node:fs";
import f from "node:crypto";
import p, { fileURLToPath as m } from "node:url";
//#region electron/main.ts
var h = m(import.meta.url), g = u.dirname(h);
r.name = "video-reminder-app";
var _ = "";
try {
	let e = r.getPath("appData"), t = u.join(e, "VideoReminderApp");
	r.setPath("userData", t), d.existsSync(t) || d.mkdirSync(t, { recursive: !0 }), _ = u.join(t, "app.log"), d.appendFileSync(_, `\n[${(/* @__PURE__ */ new Date()).toISOString()}] === Electron Started ===\n`);
} catch (e) {
	console.warn("Set userData path error:", e);
}
process.on("uncaughtException", (e) => {
	_ && d.appendFileSync(_, `[UNCAUGHT EXCEPTION] ${e?.stack || e}\n`);
}), r.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
var v = null, y = null, b = !1;
process.env.NODE_ENV === "development" || r.isPackaged;
function x() {
	c.handle("media", (e) => {
		try {
			let t = decodeURIComponent(e.url.replace("media:///", "").replace("media://", ""));
			return s.fetch(p.pathToFileURL(t).toString());
		} catch (e) {
			return console.error("Failed to handle media protocol request:", e), new Response("File not found", { status: 404 });
		}
	});
}
function S() {
	try {
		let e = u.join(g, "../icon.ico");
		return d.existsSync(e) ? o.createFromPath(e) : o.createFromBuffer(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkoBAwUqifYdQAkGNYmJl/Y5OMxafpPzYDKDYY4gOMjIwM6G4AmwE4DRkAbU0HCEb+7vUAAAAASUVORK5CYII=", "base64"));
	} catch {
		return o.createEmpty();
	}
}
function C() {
	let t = u.join(g, "preload.cjs"), n = u.join(g, "../icon.ico");
	v = new e({
		width: 1050,
		height: 720,
		minWidth: 800,
		minHeight: 580,
		title: "Video Reminder - Nhắc Hẹn & Báo Thức Video",
		backgroundColor: "#030712",
		icon: d.existsSync(n) ? n : void 0,
		frame: !1,
		show: !0,
		center: !0,
		webPreferences: {
			preload: t,
			nodeIntegration: !1,
			contextIsolation: !0,
			webSecurity: !1
		}
	}), v.on("page-title-updated", (e) => e.preventDefault()), v.webContents.session.clearCache().catch(() => {}), process.env.VITE_DEV_SERVER_URL ? v.loadURL(process.env.VITE_DEV_SERVER_URL) : v.loadFile(u.join(g, "../dist/index.html")), v.webContents.on("before-input-event", (e, t) => {
		(t.key === "F5" || t.control && t.key.toLowerCase() === "r") && v?.webContents.reloadIgnoringCache();
	}), v.webContents.on("console-message", (e, t, n, r, i) => {
		_ && d.appendFileSync(_, `[RENDERER CONSOLE ${t}] ${n} (${i}:${r})\n`);
	}), v.webContents.on("did-finish-load", () => {
		_ && d.appendFileSync(_, "[mainWindow did-finish-load] successfully loaded!\n");
	}), v.webContents.setWindowOpenHandler(({ url: e }) => ((e.startsWith("http://") || e.startsWith("https://")) && l.openExternal(e), { action: "deny" })), v.once("ready-to-show", () => {
		v?.show(), v?.focus();
	}), setTimeout(() => {
		v && !v.isVisible() && (v.show(), v.focus());
	}, 500), v.on("close", (e) => {
		b || (e.preventDefault(), v?.hide(), y && y.displayBalloon?.({
			title: "Video Reminder",
			content: "Ứng dụng đang chạy ngầm trong khay hệ thống để tiếp tục theo dõi lịch nhắc hẹn."
		}));
	});
}
function w() {
	try {
		let e = S();
		y = new n(e), y.setToolTip("Video Reminder - Đang chạy ngầm");
		let i = t.buildFromTemplate([
			{
				label: "⏰ Mở Video Reminder",
				click: () => {
					v && (v.show(), v.focus());
				}
			},
			{
				label: "🔄 Tải lại ứng dụng (Reload)",
				click: () => {
					v && v.webContents.reloadIgnoringCache();
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
					v && (v.show(), v.webContents.send("alarm:test-trigger"));
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
					b = !0, r.quit();
				}
			}
		]);
		y.setContextMenu(i), y.on("double-click", () => {
			v && (v.isVisible() ? v.hide() : (v.show(), v.focus()));
		});
	} catch (e) {
		console.warn("System tray setup warning:", e);
	}
}
function T() {
	a.handle("app:restart", () => {
		r.relaunch(), r.exit(0);
	}), a.handle("app:reload", () => (v && v.webContents.reloadIgnoringCache(), !0)), a.handle("window:minimize", () => {
		v?.minimize();
	}), a.handle("window:maximize", () => {
		v?.isMaximized() ? v.unmaximize() : v?.maximize();
	}), a.handle("window:hide-to-tray", () => {
		v?.hide();
	}), a.handle("window:close", () => {
		v?.hide();
	}), a.handle("window:quit", () => {
		b = !0, r.quit();
	}), a.handle("alarm:wake-up", (e, { autoFullscreen: t }) => (v && (v.isMinimized() && v.restore(), v.show(), v.setAlwaysOnTop(!0, "screen-saver"), v.focus(), v.flashFrame(!0), t && !v.isFullScreen() && v.setFullScreen(!0)), !0)), a.handle("alarm:dismiss", () => (v && (v.setAlwaysOnTop(!1), v.flashFrame(!1), v.isFullScreen() && v.setFullScreen(!1)), !0)), a.handle("video:cache-remote", async (e, t) => {
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
		if (!v) return null;
		let e = await i.showOpenDialog(v, {
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
	}), a.handle("shell:open-external", (e, t) => t && (t.startsWith("http://") || t.startsWith("https://")) ? (l.openExternal(t), !0) : !1), a.handle("app:is-packaged", () => r.isPackaged), a.handle("image:search-online", async (e, t) => {
		try {
			let e = (t || "").trim();
			if (!e) return [];
			let n = await (await fetch("https://duckduckgo.com/?q=" + encodeURIComponent(e), { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } })).text(), r = n.match(/vqd=([\'\"]?)([0-9-]+)\1/) || n.match(/vqd=([0-9-]+)/);
			if (!r) return [];
			let i = r[2] || r[1], a = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(e)}&vqd=${i}&f=,,,;&p=1`;
			return ((await (await fetch(a, { headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Referer: "https://duckduckgo.com/"
			} })).json()).results || []).slice(0, 24).map((t) => ({
				title: t.title || e,
				imageUrl: t.image,
				source: "Google / Web"
			}));
		} catch (e) {
			return console.warn("Electron online image search error:", e), [];
		}
	});
}
r.whenReady().then(() => {
	_ && d.appendFileSync(_, "app.whenReady() fired!\n");
	try {
		x(), _ && d.appendFileSync(_, "[1] registerMediaProtocol done\n");
	} catch (e) {
		_ && d.appendFileSync(_, `[ERR 1] ${e?.stack || e}\n`);
	}
	try {
		T(), _ && d.appendFileSync(_, "[2] setupIPC done\n");
	} catch (e) {
		_ && d.appendFileSync(_, `[ERR 2] ${e?.stack || e}\n`);
	}
	try {
		C(), _ && d.appendFileSync(_, "[3] createMainWindow done\n");
	} catch (e) {
		_ && d.appendFileSync(_, `[ERR 3] ${e?.stack || e}\n`);
	}
	try {
		w(), _ && d.appendFileSync(_, "[4] setupSystemTray done\n");
	} catch (e) {
		_ && d.appendFileSync(_, `[ERR 4] ${e?.stack || e}\n`);
	}
	r.on("activate", () => {
		e.getAllWindows().length === 0 && C();
	});
}), r.on("window-all-closed", () => {
	_ && d.appendFileSync(_, `[window-all-closed] isQuitting=${b}\n`), process.platform !== "darwin" && b && r.quit();
}), r.on("before-quit", () => {
	_ && d.appendFileSync(_, "[before-quit] fired\n"), b = !0;
}), r.on("will-quit", () => {
	_ && d.appendFileSync(_, "[will-quit] fired\n");
});
//#endregion
export {};
