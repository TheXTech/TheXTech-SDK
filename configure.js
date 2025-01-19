/*
 * A configure script required to working of TheXTech SDK configuration package
 */

/**
 * A helper function that checks whatever assets pack is valid or not
 */
function isAssets(dir)
{
    return FileIO.isDirExists(dir + "/graphics") && 
           FileIO.isDirExists(dir + "/graphics/npc") &&
           FileIO.isFileExists(dir + "/gameinfo.ini");
};

function isValidIntegration(path)
{
    return isAssets(path);
}

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
        if(System.osName() == "macos")
        {
            PGE.msgBoxInfo("TheXTech SDK setup",
                           "In order to start using the TheXTech SDK, you should select an " +
                           "application bundle that contains a complete TheXTech-based " +
                           "game that has game assets presented. If you select the applucation bundle " +
                           "that contains no game assets, you will need to select the suitable directory " +
                           "in the second dialogue.");
            smbxPath = FileIO.getOpenFilePath("Select the TheXTech-based application...", smbxPath, "Applications (*.app)");
        }
        else
        {
            PGE.msgBoxInfo("TheXTech SDK setup",
                           "In order to start using the TheXTech SDK, you should select " +
                           "a complete game directory that contains an executable of TheXTech " +
                           "and game assets presented. You also can select the assets directory " +
                           "without an executable. However, you will need to select the executable " +
                           "file path separately at the \"Test\" -> \"TheXTech\" menu.");
            smbxPath = FileIO.getOpenDirPath("Select TheXTech Game directory...", smbxPath);
        }

        if(smbxPath === "")
        {
            PGE.msgBoxWarning("Configuring has been canceled",
            "You was canceled a configuring of the\n'TheXTech SDK configuration package'!\n"+
            "To take able use it, you should choice the path to your installed TheXTech.\n\n"+
            "TheXTech SDK config pack was not configured!");
            return false;
        }

        try
        {
            var executableNames;

            if(System.osName() == "macos")
            {
                executableNames =
                [
                    "Super Mario Bros. X.app",
                    "Adventures of Demo.app",
                    "TheXTech.app",
                ];
            }
            else if(System.osName() == "windows")
            {
                executableNames =
                [
                    "smbx.exe",
                    "smbx-win64.exe",
                    "thextech.exe",
                    "advdemo.exe",
                ];
            }
            else // Any other systems
            {
                executableNames =
                [
                    "smbx",
                    "thextech",
                    "advdemo",
                    "a2xtech",
                    "a2xtech-bin",
                    "debug.sh"      // <- Custom debug runner overlay on Linux
                ];
            }

            if(System.osName() == "macos")
                executableName = smbxPath + "/Contents/MacOS/TheXTech"
            else
            {
                for(var i = 0; i < executableNames.length; i++)
                {
                    if(FileIO.isFileExists(smbxPath + "/" + executableNames[i]))
                    {
                        executableName = executableNames[i];
                        break;
                    }
                }
            }

            //Attempt to detect SMBX directory
            if(System.osName() == "macos")
            {
                var dirFound = false;

                if(!isAssets(smbxPath + "/Contents/Resources/assets"))
                {
                    PGE.msgBoxInfo( "TheXTech SDK is almost configured",
                        "You selected the TheXTech bundle that contains no embedded assets. " +
                        "Now, you should select the directory that contains complete game assets. " +
                        "They should appear somewhere at the TheXTech/assets directory.");

                    if(FileIO.isDirExists("~/TheXTech Games/TheXTech/assets/"))
                        smbxPath = "~/TheXTech Games/TheXTech/assets/";
                    else if(FileIO.isDirExists("~/TheXTech/assets/"))
                        smbxPath = "~/TheXTech/assets/";
                    else
                        smbxPath = "~/";

                    while(1)
                    {
                        smbxPath = FileIO.getOpenDirPath("Select TheXTech Game directory...", smbxPath);

                        if(smbxPath === "")
                        {
                            PGE.msgBoxWarning("Configuring has been canceled",
                            "You was canceled a configuring of the\n'TheXTech SDK configuration package'!\n"+
                            "To take able use it, you should choice the path to your installed TheXTech.\n\n"+
                            "TheXTech SDK config pack was not configured!");
                            return false;
                        }

                        if(isAssets(smbxPath))
                        {
                            dirFound = true;
                            break;
                        }

                        PGE.msgBoxWarning("Selected directory is not a game assets pack",
                        "Selected directory is not a game assets pack. Please try to select a game assets pack directory again.");
                    }
                }
                else
                {
                    smbxPath += "/Contents/Resources/assets";
                    dirFound = true;
                }

                if(!dirFound)
                    throw("The application '" + smbxPath + "' doesn't contain requires resources");
            }
            else
            {
                if(!FileIO.isDirExists(smbxPath + "/graphics"))
                    throw("'" + smbxPath + "/graphics" + "' directory not exists");

                if(!FileIO.isDirExists(smbxPath + "/graphics/npc"))
                    throw("'" + smbxPath + "/graphics/npc" + "' directory not exists");
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
                               "This is a not TheXTech Game directory!\nPlease try again!\n" + e);
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
