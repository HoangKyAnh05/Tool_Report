Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = projectDir

electronExe = projectDir & "\node_modules\electron\dist\electron.exe"

If fso.FileExists(electronExe) Then
    ' Run native electron executable (GUI app, no console window at all)
    WshShell.Run """" & electronExe & """ """ & projectDir & """", 1, False
Else
    ' Fallback via npx
    WshShell.Run "cmd /c npx electron .", 0, False
End If
