@echo off
for /f "usebackq tokens=1,* delims==" %%i in ("d:\Project\.env") do (
    echo %%i | findstr /r "^#" >nul
    if errorlevel 1 (
        if not "%%i"=="" (
            set "%%i=%%j"
        )
    )
)
java -jar target/opsmind-backend-0.0.1-SNAPSHOT.jar
