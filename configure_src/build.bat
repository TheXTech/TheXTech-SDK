@echo off
rem To build this application you shuld setup a MinGW compiller into the path enveromnet

set LDFlags=-lGDI32 -lUSER32 -lcomctl32 -static-libgcc -static-libstdc++ -mwindows -static -lpthread

echo Running winres to build resources...
windres iconsetup.rc -O coff -o iconsetup.res
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

echo Running g++ to build application...
@echo on
g++ -c configure.cpp -O1 -Os
	@IF ERRORLEVEL 1 goto quit
g++ configure.o iconsetup.res -o configure %LDFlags% -O1 -Os
	@IF ERRORLEVEL 1 goto quit
@echo off
del *.o
del iconsetup.res

:quit
@echo off
pause