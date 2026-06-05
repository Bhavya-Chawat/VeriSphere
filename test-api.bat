@echo off
echo ====================================================
echo Running E2E Verification Intake Test
echo ====================================================
echo.

curl.exe -X POST http://localhost:4000/api/verification/intake ^
  -H "x-api-key: my-test-key" ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"test@example.com\",\"resumeFileUrl\":\"http://test.com/resume.pdf\"}"

echo.
echo.
echo ====================================================
echo Test complete! Check the terminal running the API server for the background orchestrator logs.
echo ====================================================
pause
