Set WshShell = CreateObject("WScript.Shell")
' Get the directory of this script
strCurDir = WshShell.CurrentDirectory
' Run npm run dev or electron without showing any command prompt window (0 = hidden)
WshShell.Run "cmd /c npm run dev", 0, False
