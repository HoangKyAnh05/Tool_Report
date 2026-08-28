' launcher.vbs - Video Reminder
Dim objShell, fso, scriptDir, projectDir, electronExe, strCmd
Set fso = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)
objShell.CurrentDirectory = projectDir

electronExe = projectDir & "\node_modules\electron\dist\electron.exe"

' Kill any previous stuck background electron processes of this app so the window ALWAYS opens fresh
objShell.Run "powershell -NoProfile -Command ""Get-Process electron -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*Tool_Report*' } | Stop-Process -Force -ErrorAction SilentlyContinue""", 0, True

' Run electron directly
strCmd = """" & electronExe & """ """ & projectDir & """"
objShell.Run strCmd, 1, False
Set objShell = Nothing
