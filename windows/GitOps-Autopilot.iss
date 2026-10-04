; ==============================================================================
; Inno Setup 6 Script pour GitOps Autopilot
; Compatible Windows 10 (x64/arm64) et Windows 11 (x64/arm64)
; ==============================================================================

#define MyAppName "GitOps Autopilot"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "GitOps Autopilot Team"
#define MyAppURL "https://github.com/acme-corp/nexus-web-platform"
#define MyAppExeName "GitOps-Autopilot.exe"

[Setup]
AppId={{8B92D1F4-C25E-4D6F-9C14-A5C9B38F7021}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
LicenseFile=..\LICENSE
OutputDir=..\dist_installer
OutputBaseFilename=GitOps-Autopilot-Setup-{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0.17763

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
Source: "..\dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\server.ts"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\package-lock.json"; DestDir: "{app}"; Flags: ignoreversion optional
Source: "..\tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\node_modules\.bin\tsx.cmd"; Parameters: "server.ts"; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\node_modules\.bin\tsx.cmd"; Parameters: "server.ts"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\node_modules\.bin\tsx.cmd"; Parameters: "server.ts"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
