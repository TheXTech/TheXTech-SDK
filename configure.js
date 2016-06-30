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
    
    if(!FileIO.isFileExists(FileIO.scriptPath()+"/main.ini"))
    {
        PGE.msgBoxError( "ERROR OF INI FILE!", 
                               "Configuratiog package seems damaged.\n"+
                               "Impossible to find main.ini!");
        return false;
    }
    
    var ini = INI.open( FileIO.scriptPath()+"/main.ini");

    while(1)
    {
        smbxPath = FileIO.getOpenDirPath("Please select your directory with installed SMBX to set up the SMBX Integration configuration package...", smbxPath );
        if(smbxPath=="")
        {
            PGE.msgBoxWarning("Configuring has been canceled", 
            "You was canceled a configuring of the\n'SMBX Intergation configuration package'!\n"+
            "To take able use it, you should choice the path to your installed SMBX.\n\n"+
            "SMBX Integration config pack was not configured!" );
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
                "smbx.legacy",
                "smbx.exe.legacy",
                "smbx.exe",
                "smbx1301.exe",
                "smbx13.exe",
                "asmbxt.exe",
                "a2mbxt.exe",
                "a2xt.exe"
                ];
            
            for(var i=0; i<smbxEXENames.length; i++)
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
            
            if(FileIO.isDirExists(smbxPath+"/music"))
                ini.setValue("music", "music");
            else if(FileIO.isDirExists(smbxPath+"/music_ogg"))
                ini.setValue("music", "music_ogg");
            
            if(FileIO.isDirExists(smbxPath+"/sound"))
                ini.setValue("sound", "sound");
            else if(FileIO.isDirExists(smbxPath+"/sound_ogg"))
                ini.setValue("sound", "sound_ogg");
            
            ini.close();
            
            //  Generate dummy elements gifs needed for PGE
            
            /*
            Total worldmap tiles usable: "tile-1" to "tile-400" (tile 401 is not usable anymore). There are 72 new tiles.
            Total paths usable: "path-1" to "path-100" (path 101 is not usable anymore). There are 68 new paths, all using a mask/transparency.
            Total levels usable: "level-1" to "level-100" (level 101 is not usable anymore). There are 68 new levels, all using a mask/transparency.
            Total sceneries usable: "scene-1" to "scene-100" (scene 101 is not usable anymore). There are 35 new sceneries, all using a mask/transparency.
            Total blocks usable: "block-1" to "block-700" (block 701 is not usable anymore). There are 62 new blocks which are all using a mask/transparency.
            Total BGOs usable: "background-1" to "background-200" (background 201 is not usable anymore). There are 10 new BGOs which are all using a mask/transparency.
            There are no additional level-backgrounds ("background2-XX") usable, though.
            */
    
            for(var i=292; i<=300; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy-npc.gif";
                var outputfile = smbxPath+"/graphics/npc/npc-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
                
                    inputfile = FileIO.scriptPath()+"/commonGFX/dummy-npcm.gif";
                    outputfile = smbxPath+"/graphics/npc/npc-" + i + "m.gif";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=639; i<=700; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy-block.gif";
                var outputfile = smbxPath+"/graphics/block/block-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=191; i<=200; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_bgo.gif";
                var outputfile = smbxPath+"/graphics/background/background-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=329; i<=400; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_tile.gif";
                var outputfile = smbxPath+"/graphics/tile/tile-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=66; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_scene.gif";
                var outputfile = smbxPath+"/graphics/scene/scene-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=33; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_path.gif";
                var outputfile = smbxPath+"/graphics/path/path-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
            }
            for(var i=33; i<=100; i++)
            {
                var inputfile = FileIO.scriptPath()+"/commonGFX/dummy_wlvl.gif";
                var outputfile = smbxPath+"/graphics/level/level-" + i + ".gif";
                FileIO.copy( inputfile, outputfile, false );
            }

            /* Ingereting of sounds and musics from target SMBX assembly */
            FileIO.copy( FileIO.scriptPath()+"/util/music-vanilla.ini", FileIO.scriptPath()+"/music.ini", true );

            if(FileIO.isFileExists(smbxPath+"/music.ini"))
            {
                var vMusics  = INI.open( FileIO.scriptPath() + "/music.ini" );
                var llMusics = INI.open( smbxPath + "/music.ini" );

                for(var i=1; i<=16; i++)
                {
                    var section = "world-music-" + i;
                    llMusics.beginGroup(section);
                    vMusics.beginGroup(section);
                    var sndname = llMusics.value("file", "");
                    if( sndname != "" )
                    {
                        var last_slash_idx = sndname.lastIndexOf("/");
                        if( last_slash_idx != -1 )
                        {
                            sndname = sndname.substr(last_slash_idx+1, sndname.length-1);
                        }
                        vMusics.setValue("file", sndname );
                    }
                    llMusics.endGroup();
                    vMusics.endGroup();
                }

                for(var i=1; i<=3; i++)
                {
                    var section = "special-music-" + i;
                    llMusics.beginGroup(section);
                    vMusics.beginGroup(section);
                    var sndname = llMusics.value("file", "");
                    if( sndname != "" )
                    {
                        var last_slash_idx = sndname.lastIndexOf("/");
                        if( last_slash_idx != -1 )
                        {
                            sndname = sndname.substr(last_slash_idx+1, sndname.length-1);
                        }
                        vMusics.setValue("file", sndname );
                    }
                    llMusics.endGroup();
                    vMusics.endGroup();
                }

                for(var i=1; i<=56; i++)
                {
                    if(i==24) continue;
                    var section = "level-music-" + i;
                    llMusics.beginGroup(section);
                    vMusics.beginGroup(section);
                    var sndname = llMusics.value("file", "");
                    if( sndname != "" )
                    {
                        var last_slash_idx = sndname.lastIndexOf("/");
                        if( last_slash_idx != -1 )
                        {
                            sndname = sndname.substr(last_slash_idx+1, sndname.length-1);
                        }
                        vMusics.setValue("file", sndname );
                    }
                    llMusics.endGroup();
                    vMusics.endGroup();
                }

                llMusics.close();
                vMusics.close();
            }

            FileIO.copy( FileIO.scriptPath()+"/util/sounds-vanilla.ini", FileIO.scriptPath()+"/sounds.ini", true );

            if(FileIO.isFileExists(smbxPath+"/sounds.ini"))
            {
                var vSounds  = INI.open( FileIO.scriptPath() + "/sounds.ini" );
                var llSounds = INI.open( smbxPath + "/sounds.ini" );

                for(var i=1; i<=91; i++)
                {
                    var section = "sound-" + i;
                    llSounds.beginGroup(section);
                    vSounds.beginGroup(section);
                    var sndname = llSounds.value("file", "");
                    if( sndname != "" )
                    {
                        var last_slash_idx = sndname.lastIndexOf("/");
                        if( last_slash_idx != -1 )
                        {
                            sndname = sndname.substr( last_slash_idx+1, sndname.length-1);
                        }
                        vSounds.setValue("file", sndname );
                    }
                    llSounds.endGroup();
                    vSounds.endGroup();
                }
                llSounds.close();
                vSounds.close();
            }

        }
        catch(e)
        {
            PGE.msgBoxWarning( "SMBX Integration configuration error", 
                               "This is a not SMBX directory!\nPlease try again!\n" + e);
            continue;
        }
        break;
    }
    
    PGE.msgBoxInfo( "SMBX Integration configured", 
                    "Integration configuration pack successfully configured!\n"+
                    "SMBX path is:\n" + smbxPath + "/" + SMBXExeName);

    return true;
}
