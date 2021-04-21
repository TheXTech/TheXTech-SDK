/*
A configure script required to working of SMBX Integration configuration package
*/

/**
 * A main function called by PGE Editor to request configuring process
 */
function onConfigure()
{
    var smbxPath = FileIO.scriptPath();
    var SMBXExeName = "smbx.exe";

    if(!FileIO.isFileExists(FileIO.scriptPath() + "/main.ini"))
    {
        PGE.msgBoxError( "ERROR OF INI FILE!",
                               "Configuratiog package seems damaged.\n"+
                               "Impossible to find main.ini!");
        return false;
    }

    var ini = INI.open(FileIO.scriptPath() + "/main.ini");

    while(1)
    {
        smbxPath = FileIO.getOpenDirPath("Please select your directory with installed SMBX/TheXTech to set up the XTech SDK configuration package...", smbxPath );
        if(smbxPath=="")
        {
            PGE.msgBoxWarning("Configuring has been canceled",
            "You was canceled a configuring of the\n'TheXTech SDK configuration package'!\n"+
            "To take able use it, you should choice the path to your installed SMBX/TheXTech.\n\n"+
            "TheXTech SDK config pack was not configured!" );
            return false;
        }

        try
        {
            //Attempt to detect SMBX directory
            if(!FileIO.isDirExists(smbxPath+"/graphics"))
                throw("'"+smbxPath+"/graphics"+"' directory not exists");
            if(!FileIO.isDirExists(smbxPath+"/graphics/npc"))
                throw("'"+smbxPath+"/graphics/npc"+"' directory not exists");

            var smbxEXENames = [
                "smbx.exe",
                "smbx-win64.exe",
                "thextech.exe",
                "advdemo.exe",
                "smbx",
                "thextech",
                "advdemo"
            ];

            for(var i=0; i < smbxEXENames.length; i++)
            {
                if(FileIO.isFileExists(smbxPath+"/"+smbxEXENames[i]))
                {
                    SMBXExeName = smbxEXENames[i];
                    break;
                }
            }

            ini.beginGroup("main");
            ini.setValue("application-path", smbxPath);
            ini.setValue("smbx-exe-name", SMBXExeName);
            ini.setValue("application-dir", 1);

            ini.setValue("graphics-level", "graphics");
            ini.setValue("graphics-worldmap", "graphics");
            ini.setValue("graphics-characters", "graphics");

            ini.setValue("application-path-configured", true);

            ini.close();
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
                    "Integration configuration pack successfully configured!\n"+
                    "TheXTech path is:\n" + smbxPath + "/" + SMBXExeName);

    return true;
}
