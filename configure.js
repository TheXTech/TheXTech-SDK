/*
 * A configure script required to working of TheXTech SDK configuration package
 */

/**
 * A helper function that checks whatever assets pack is valid or not
 */
function isAssets(dir)
{
    return FileIO.isDirExists(dir + "/graphics") && 
           FileIO.isDirExists(dir + "/graphics/block") &&
           FileIO.isDirExists(dir + "/graphics/background") &&
           FileIO.isDirExists(dir + "/graphics/npc") &&
           FileIO.isDirExists(dir + "/graphics/ui") &&
           FileIO.isFileExists(dir + "/gameinfo.ini");
};

/**
 * A function called from Moondust Editor to verify validness of the configured Integration
 */
function isValidIntegration(path)
{
    return isAssets(path);
}


function findExecutablePath(executableName, assetsPath)
{
    var executableNames;
    var systemExecPaths;

    if(System.osName() == "macos")
    {
        executableNames =
        [
            "TheXTech.app/Contents/MacOS/TheXTech",
            "Super Mario Bros. X.app/Contents/MacOS/TheXTech",
            "Adventures of Demo.app/Contents/MacOS/TheXTech",
        ];

        systemExecPaths = ["/Applications"];
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

        systemExecPaths =
        [
            "C:/Games/thextech",
            "C:/Program Files/TheXTech",
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

        systemExecPaths =
        [
            "/usr/bin",
            "/usr/local/bin",
        ];
    }

    // On macOS, the app bundle itself might serve as a game pack
    if(System.osName() == "macos")
        executableName = assetsPath + "/Contents/MacOS/TheXTech"
    else
    {
        for(var i = 0; i < executableNames.length; i++)
        {
            if(FileIO.isFileExists(assetsPath + "/" + executableNames[i]))
            {
                executableName = executableNames[i];
                break;
            }
        }
    }

    // If auto-selected executable does not exists, try to find system-wide one
    if(!FileIO.isFileExists(executableName))
    {
        for(var i = 0; i < systemExecPaths.length; i++)
        {
            for(var j = 0; j < executableNames.length; j++)
            {
                if(FileIO.isFileExists(systemExecPaths[i] + "/" + executableNames[j]))
                {
                    executableName = systemExecPaths[i] + "/" + executableNames[j];
                    break;
                }
            }
        }
    }

    return executableName;
}


function writeProfile(ini, assetsPath, executableName)
{
    var gameInfoIni = INI.open(assetsPath + "/gameinfo.ini");
    gameInfoIni.beginGroup("game");
    var gameTitle = gameInfoIni.value("title", "");
    gameInfoIni.endGroup();
    gameInfoIni.close();

    ini.beginGroup("main");
    ini.setValue("application-path", assetsPath);
    ini.setValue("application-title", gameTitle);
    ini.setValue("application-icon", assetsPath + "/graphics/ui/icon/thextech_16.png");
    ini.setValue("executable-name", executableName);
    ini.setValue("application-dir", 1);

    ini.setValue("graphics-level", "graphics");
    ini.setValue("graphics-worldmap", "graphics");
    ini.setValue("graphics-characters", "graphics");
    ini.setValue("application-path-configured", true);
    ini.close();
}

function nameGameProfile(assetsPath, isLegacy)
{
    var profile = new Object();
    var executableName = "thextech";

    if(System.osName() == "windows")
        executableName = "thextech.exe";

    executableName = findExecutablePath(executableName, assetsPath);

    var gameInfoIni = INI.open(assetsPath + "/gameinfo.ini");
    gameInfoIni.beginGroup("game");
    var gameTitle = gameInfoIni.value("title", "");
    gameInfoIni.endGroup();
    gameInfoIni.close();

    profile["application-path"] = assetsPath;
    profile["application-title"] = gameTitle + (isLegacy ? " [LEGACY]" : "");
    profile["application-icon"] = assetsPath + "/graphics/ui/icon/thextech_16.png";
    profile["executable-name"] = executableName;
    profile["application-dir"] = 1;

    profile["graphics-level"] = "graphics";
    profile["graphics-worldmap"] = "graphics";
    profile["graphics-characters"] = "graphics";
    profile["application-path-configured"] = true;

    return profile;
}

/**
 * Optional function called from Moondust Editor to query for automatic profiles
 * created from standardised installation paths. It must return an array of objects.
 */
function findAutoProfiles()
{
    var profiles = new Array();

    var standardGamePaths;
    var legacyAssetsPaths;

    if(System.osName() == "windows")
    {
        standardGamePaths =
        [
            "C:/Program Files/TheXTech/assets",
            System.homeDir() + "/.PGE_Project/thextech/assets",
            System.appData() + "/TheXTech/assets",
        ];

        legacyAssetsPaths = [System.homeDir() + "/.PGE_Project/thextech"];
    }
    else if(System.osName() == "macos")
    {
        standardGamePaths =
        [
            "/Applications/Super Mario Bros. X.app/Contents/Resources/assets",
            "/Applications/Adventures of Demo.app/Contents/Resources/assets",
            System.homeDir() + "/TheXTech/",
        ];

        var gamesDir = System.homeDir() + "/TheXTech Games";

        if(FileIO.isDirExists(gamesDir))
        {
            var dirs = FileIO.getDirDirs(gamesDir);

            for(var i = 0; i < dirs.length; i++)
                standardGamePaths.push(gamesDir + "/" + dirs[i] + "/assets");
        }
    }
    else
    {
        standardGamePaths =
        [
            "/usr/local/share/games/TheXTech",
            "/usr/share/games/TheXTech",
            System.homeDir() + "/.local/share/TheXTech/assets",
            System.homeDir() + "/.PGE_Project/thextech/assets",
        ];

        legacyAssetsPaths = [System.homeDir() + "/.PGE_Project/thextech"];
    }


    for(var i = 0; i < standardGamePaths.length; ++i)
    {
        var gamesRoot = standardGamePaths[i];
        var dirs = FileIO.getDirDirs(gamesRoot);

        for(var j = 0; j < dirs.length; ++j)
        {
            var assetsPath = gamesRoot + "/" + dirs[j];

            if(isAssets(assetsPath))
                profiles.push(nameGameProfile(assetsPath, false));
        }
    }

    for(var j = 0; j < legacyAssetsPaths.length; ++j)
    {
        var assetsPath = legacyAssetsPaths[j];

        if(isAssets(assetsPath))
            profiles.push(nameGameProfile(assetsPath, true));
    }

    return profiles;
}

/**
 * A main function called by Moondust Editor to request configuring process
 */
function onConfigure()
{
    var assetsPath = FileIO.scriptPath();
    var executableName = "thextech";

    if(System.osName() == "windows")
        executableName = "thextech.exe";

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
        // Read old path
        ini.beginGroup("main");
        assetsPath = ini.value("application-path", FileIO.scriptPath());
        ini.endGroup();

        if(System.osName() == "macos")
        {
            PGE.msgBoxInfo("TheXTech SDK setup",
                           "In order to start using the TheXTech SDK, you should select an " +
                           "application bundle that contains a complete TheXTech-based " +
                           "game that has game assets presented. If you select the applucation bundle " +
                           "that contains no game assets, you will need to select the suitable directory " +
                           "in the second dialogue.");
            assetsPath = FileIO.getOpenFilePath("Select the TheXTech-based application...", assetsPath, "Applications (*.app)");
        }
        else
        {
            PGE.msgBoxInfo("TheXTech SDK setup",
                           "In order to start using the TheXTech SDK, you should select " +
                           "a complete game directory that contains an executable of TheXTech " +
                           "and game assets presented. You also can select the assets directory " +
                           "without an executable. However, you will need to select the executable " +
                           "file path separately at the \"Test\" -> \"TheXTech\" menu.");
            assetsPath = FileIO.getOpenDirPath("Select TheXTech Game directory...", assetsPath);
        }

        if(assetsPath === "")
        {
            PGE.msgBoxWarning("Configuring has been canceled",
            "You was canceled a configuring of the\n'TheXTech SDK configuration package'!\n"+
            "To take able use it, you should choice the path to your installed TheXTech.\n\n"+
            "TheXTech SDK config pack was not configured!");
            return false;
        }

        try
        {
            executableName = findExecutablePath(executableName, assetsPath);

            //Attempt to detect SMBX directory
            if(System.osName() == "macos")
            {
                var dirFound = false;

                if(!isAssets(assetsPath + "/Contents/Resources/assets"))
                {
                    PGE.msgBoxInfo( "TheXTech SDK is almost configured",
                        "You selected the TheXTech bundle that contains no embedded assets. " +
                        "Now, you should select the directory that contains complete game assets. " +
                        "They should appear somewhere at the TheXTech/assets directory.");

                    if(FileIO.isDirExists("~/TheXTech Games/TheXTech/assets/"))
                        assetsPath = "~/TheXTech Games/TheXTech/assets/";
                    else if(FileIO.isDirExists("~/TheXTech/assets/"))
                        assetsPath = "~/TheXTech/assets/";
                    else
                        assetsPath = "~/";

                    while(1)
                    {
                        assetsPath = FileIO.getOpenDirPath("Select TheXTech Game directory...", assetsPath);

                        if(assetsPath === "")
                        {
                            PGE.msgBoxWarning("Configuring has been canceled",
                            "You was canceled a configuring of the\n'TheXTech SDK configuration package'!\n"+
                            "To take able use it, you should choice the path to your installed TheXTech.\n\n"+
                            "TheXTech SDK config pack was not configured!");
                            return false;
                        }

                        if(isAssets(assetsPath))
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
                    assetsPath += "/Contents/Resources/assets";
                    dirFound = true;
                }

                if(!dirFound)
                    throw("The application '" + assetsPath + "' doesn't contain requires resources");
            }
            else
            {
                if(!FileIO.isDirExists(assetsPath + "/graphics"))
                    throw("'" + assetsPath + "/graphics" + "' directory not exists");

                if(!FileIO.isDirExists(assetsPath + "/graphics/npc"))
                    throw("'" + assetsPath + "/graphics/npc" + "' directory not exists");
            }


            writeProfile(ini, assetsPath, executableName);


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
                var outputfile = assetsPath+"/graphics/npc/npc-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=639; i<=700; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy-block.png";
                var outputfile = assetsPath+"/graphics/block/block-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=191; i<=200; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_bgo.png";
                var outputfile = assetsPath+"/graphics/background/background-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=329; i<=400; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_tile.png";
                var outputfile = assetsPath+"/graphics/tile/tile-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=66; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_scene.png";
                var outputfile = assetsPath+"/graphics/scene/scene-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=33; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_path.png";
                var outputfile = assetsPath+"/graphics/path/path-" + i + ".png";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=33; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_wlvl.png";
                var outputfile = assetsPath+"/graphics/level/level-" + i + ".png";
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
                    "TheXTech assets path is: " + assetsPath + "\n" +
                    "Default executable name (can be changed at test settings): " + executableName);

    return true;
}
