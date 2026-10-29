1. Install the SDK
   The SDK includes the compiler, the `dotnet` CLI and the ASP.NET runtime. Install the current **LTS** version (.NET 10 is LTS as of now):

`winget install Microsoft.DotNet.SDK.10`

1.1. winget isn't available in PowerShell either. Windows 10 Home often doesn't ship it, because it comes with the "App Installer" package. You can skip it and install the SDK directly:

Option A: official installer (simplest)

Go to https://dotnet.microsoft.com/download/dotnet/10.0
Download the SDK x64 installer for Windows (not just the Runtime).
Run it, then close and reopen VS Code so PATH refreshes.
Check with dotnet --version.
Option B: install winget first. Install "App Installer" from the Microsoft Store, then rerun the winget command in PowerShell. Option A is less hassle.

Tell me when dotnet --version prints a version, and we'll go to the scaffold commands. Run those in either shell. Once dotnet is on PATH, both work.

Then restart the terminal and VS Code so PATH updates, and check dotnet --version.

Also install the C# Dev Kit extension in VS Code. It gives you IntelliSense, a test explorer and debugging.

2. Scaffold the solution
   The CLI generates projects from templates. From the repo root, run these (they match the layout in the project's CLAUDE.md):

```
  dotnet new sln -n Payments -o backend
  dotnet new webapi -n Payments.Api -o backend/src/Payments.Api
  dotnet new xunit -n Payments.Api.Tests -o backend/tests/Payments.Api.Tests
  dotnet sln backend/Payments.sln add backend/src/Payments.Api backend/tests/Payments.Api.Tests
  dotnet add backend/tests/Payments.Api.Tests reference backend/src/Payments.Api
```

Here's what each part does:

.sln (solution) groups projects so dotnet build backend and dotnet test backend work on all of them.
.csproj is one project, like a package.json plus build config. It lists NuGet packages (the npm equivalent) and the target framework.
Program.cs is the entry point. In modern .NET it uses "minimal hosting": it builds a WebApplication, registers services (dependency injection), maps endpoints, then calls app.Run().
If the webapi template asks about controllers vs minimal APIs, either is fine. Minimal APIs are less boilerplate, and I'd start there.

3. Run it

dotnet run --project backend/src/Payments.Api
It prints a Now listening on: http://localhost:xxxx line. The template ships a sample /weatherforecast endpoint, so hit that to confirm it works. Check Properties/launchSettings.json for the port. Your frontend runs on 3000, so you'll need to allow that origin with CORS later.

4. Next tasks from the milestone
   Once it runs, the spec's remaining backend tasks in order are:

A /health endpoint, replacing the weather sample.
PostgreSQL via docker-compose.yml (I can write that for you, since it's config).
EF Core with the Npgsql provider, a DbContext, and your first migration.
Install the SDK and run the scaffold commands, then tell me what you see. I can also run them for you once dotnet is on PATH. After that, your first coding task is to delete the weather sample and write the /health endpoint in Program.cs. I'll review it when you're done.
