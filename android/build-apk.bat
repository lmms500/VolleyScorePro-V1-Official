@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot
set PATH=C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot\bin;%PATH%
set GRADLE_USER_HOME=C:\gradle-cache\user-home

echo Java Version: > build-log.txt
java -version 2>> build-log.txt

echo. >> build-log.txt
echo Gradle User Home: %GRADLE_USER_HOME% >> build-log.txt
echo. >> build-log.txt
echo Starting Gradle Build... >> build-log.txt
gradlew.bat assembleDebug >> build-log.txt 2>&1

echo Build complete, check build-log.txt for details
type build-log.txt
