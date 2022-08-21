/*
 * A configure script required to working of TheXTech SDK configuration package
 */

/**
 * A main function called by Moondust Editor to request configuring process
 */
function onConfigure()
{
    var smbxPath = FileIO.scriptPath();
    var executableName = "smbx.exe";

    if(!FileIO.isFileExists(FileIO.scriptPath() + "/main.ini"))
    {
        PGE.msgBoxError( "ERROR OF INI FILE!",
                               "Configuratiog package seems damaged.\n"+
                               "Impossible to find main.ini!");
        return false;
    }

    var ini = INI.open(FileIO.configSettingFile());

    while(1)
    {
        smbxPath = FileIO.getOpenDirPath("Select TheXTech-compatible assets directory...", smbxPath);
        if(smbxPath === "")
        {
            PGE.msgBoxWarning("Configuring has been canceled",
            "You was canceled a configuring of the\n'TheXTech SDK configuration package'!\n"+
            "To take able use it, you should choice the path to your installed TheXTech.\n\n"+
            "TheXTech SDK config pack was not configured!" );
            return false;
        }

        try
        {
            //Attempt to detect SMBX directory
            if(!FileIO.isDirExists(smbxPath + "/graphics"))
                throw("'" + smbxPath + "/graphics" + "' directory not exists");

            if(!FileIO.isDirExists(smbxPath + "/graphics/npc"))
                throw("'" + smbxPath + "/graphics/npc" + "' directory not exists");

            var executableNames = [
                "smbx",
                "thextech",
                "advdemo",
                "a2xtech",
                "a2xtech-bin",
                "smbx.exe",
                "smbx-win64.exe",
                "thextech.exe",
                "advdemo.exe",
                "debug.sh"          // <- Custom debug runner overlay on Linux
            ];

            for(var i = 0; i < executableNames.length; i++)
            {
                if(FileIO.isFileExists(smbxPath + "/" + executableNames[i]))
                {
                    executableName = executableNames[i];
                    break;
                }
            }

            ini.beginGroup("main");
            ini.setValue("application-path", smbxPath);
            ini.setValue("executable-name", executableName);
            ini.setValue("application-dir", 1);

            ini.setValue("graphics-level", "graphics");
            ini.setValue("graphics-worldmap", "graphics");
            ini.setValue("graphics-characters", "graphics");
            ini.setValue("application-path-configured", true);
            ini.close();

            //  Generate dummy elements gifs needed for Moondust

            /*
            Total worldmap tiles usable: "tile-1" to "tile-400" (tile 401 is not usable anymore). There are 72 new tiles.
            Total paths usable: "path-1" to "path-100" (path 101 is not usable anymore). There are 68 new paths, all using a mask/transparency.
            Total levels usable: "level-1" to "level-100" (level 101 is not usable anymore). There are 68 new levels, all using a mask/transparency.
            Total sceneries usable: "scene-1" to "scene-100" (scene 101 is not usable anymore). There are 35 new sceneries, all using a mask/transparency.
            Total blocks usable: "block-1" to "block-700" (block 701 is not usable anymore). There are 62 new blocks which are all using a mask/transparency.
            Total BGOs usable: "background-1" to "background-200" (background 201 is not usable anymore). There are 10 new BGOs which are all using a mask/transparency.
            There are no additional level-backgrounds ("background2-XX") usable, though.
            */

            /*
            for(var i=292; i<=300; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy-npc.png";
                var outputfile = smbxPath+"/graphics/npc/npc-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=639; i<=700; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy-block.png";
                var outputfile = smbxPath+"/graphics/block/block-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=191; i<=200; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_bgo.png";
                var outputfile = smbxPath+"/graphics/background/background-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=329; i<=400; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_tile.png";
                var outputfile = smbxPath+"/graphics/tile/tile-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=66; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_scene.png";
                var outputfile = smbxPath+"/graphics/scene/scene-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=33; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_path.png";
                var outputfile = smbxPath+"/graphics/path/path-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=33; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_wlvl.png";
                var outputfile = smbxPath+"/graphics/level/level-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }*/
        }
        catch(e)
        {
            PGE.msgBoxWarning( "TheXTech SDK configuration error",
                               "This is a not TheXTech directory!\nPlease try again!\n" + e);
            continue;
        }
        break;
    }

    PGE.msgBoxInfo( "TheXTech SDK configured",
                    "Integration configuration pack successfully configured!\n\n"+
                    "TheXTech assets path is: " + smbxPath + "\n" +
                    "Default executable name (can be changed at test settings): " + executableName);

    return true;
}
