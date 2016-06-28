@echo off
rem To build this application you shuld setup a MSVC-2015 compiller into the path enveromnet
call "C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\Tools\VsDevCmd.bat"

echo Running winres to build resources...
rc /nologo iconsetup.rc
IF ERRORLEVEL 1 goto quit

@rem g++ -c configure.cpp
@rem 	@IF ERRORLEVEL 1 goto quit
@rem g++ -c progressbox.cpp
@rem 	@IF ERRORLEVEL 1 goto quit
@rem gcc -c ConvertUTF.c
@rem 	@IF ERRORLEVEL 1 goto quit
@rem g++ -c ogg_converter.cpp
@rem 	@IF ERRORLEVEL 1 goto quit
@rem g++ progressbox.o configure.o ConvertUTF.o ogg_converter.o iconsetup.res -o configure %LDFlags%

echo Running MSVC CL to build application...
@echo on
    @echo ===============================================================================
cl /c /nologo configure.cpp /EHsc /O1 /Os /MT
	@IF ERRORLEVEL 1 goto quit
    @echo.
    @echo ===============================================================================
link /nologo gdi32.lib user32.lib comctl32.lib shell32.lib configure.obj iconsetup.res /RELEASE /SUBSYSTEM:WINDOWS /MACHINE:X86 /OUT:"configure.exe"
	@IF ERRORLEVEL 1 goto quit
    @echo.
@rem iconsetup.res -o configure %LDFlags%
@echo off
del *.obj
del iconsetup.res

:quit
@echo off
pause
