/*
 * SMBX Integration Config Pack for PGE Auto-Configure Utility
 * Copyright (c) 2014 Vitaly Novichkov <admin@wohlnet.ru>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#include <windows.h>
#define DELETE_FILE DeleteFileA
#include <string>
#include <shlobj.h>
#include <sstream>
#include <iostream>
#include <fstream>
#include <vector>
#include <stdio.h>

//#include "ogg_converter.h"

#define SI_SUPPORT_IOSTREAMS
#include "SimpleIni.h"

#define BUFSIZE 4096

static int CALLBACK BrowseCallbackProc(HWND hwnd,UINT uMsg, LPARAM lParam, LPARAM lpData)
{

    if(uMsg == BFFM_INITIALIZED)
    {
        std::string tmp = (const char *) lpData;
        //std::cout << "path: " << tmp << std::endl;
        SendMessage(hwnd, BFFM_SETSELECTION, TRUE, lpData);
    }

    return 0;
}

std::string BrowseFolder(std::string saved_path)
{
    TCHAR path[MAX_PATH];

    const char * path_param = saved_path.c_str();

    BROWSEINFO bi = { 0 };
    bi.lpszTitle  = ("Please select your directory with installed SMBX to set up the SMBX Integration configuration package...");
    bi.ulFlags    = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE;
    bi.lpfn       = BrowseCallbackProc;
    bi.lParam     = (LPARAM) path_param;

    LPITEMIDLIST pidl = SHBrowseForFolder ( &bi );

    if ( pidl != 0 )
    {
        //get the name of the folder and put it in path
        SHGetPathFromIDList ( pidl, path );

        //free memory used
        IMalloc * imalloc = 0;
        if ( SUCCEEDED( SHGetMalloc ( &imalloc )) )
        {
            imalloc->Free ( pidl );
            imalloc->Release ( );
        }

        return path;
    }

    return "";
}

bool is_file_exists(const std::string& name)
{
	if (FILE *file = fopen(name.c_str(), "r")) {
        fclose(file);
        return true;
    } else {
        return false;
    }  
}

bool is_dir_exists(LPCTSTR szPath)
{
  DWORD dwAttrib = GetFileAttributes(szPath);

  return (dwAttrib != INVALID_FILE_ATTRIBUTES && 
         (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

void replaceAll(std::string& str, const std::string& from, const std::string& to)
{
	if(from.empty())
	return;
	size_t start_pos = 0;
	while((start_pos = str.find(from, start_pos)) != std::string::npos) {
	str.replace(start_pos, from.length(), to);
	start_pos += to.length(); // In case 'to' contains 'from', like replacing 'x' with 'yx'
	}
}

template<typename T>
std::string num2str(T i)
{
	std::stringstream out;
	out<<i;
	return out.str();
}

//int main(int argc, const char *argv[])
int WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PSTR lpCmdLine, int nCmdShow)
{
    std::string path;
    DWORD  retval=0;
    //BOOL   success; 
    //char  buffer[BUFSIZE]=TEXT(""); 
    //char  buf[BUFSIZE]=TEXT(""); 
    //char** lppPart={NULL};

    //Get application directory
    char szFileName[MAX_PATH];
    retval = GetModuleFileNameA( NULL, szFileName, MAX_PATH );

    std::string filename(szFileName);
    if(filename.size()==0)
    {
	return 0;
    }

    std::string directory;
    const size_t last_slash_idx = filename.rfind('\\');
    if (std::string::npos != last_slash_idx)
    {
        directory = filename.substr(0, last_slash_idx);
    }

    CSimpleIniA ini;
    ini.SetUnicode();
    SI_Error rc = ini.LoadFile(std::string(directory+"\\main.ini").c_str());
    if (rc < 0) { std::cout << "ERROR OF INI FILE!" << std::endl; return 1; }

    //path = argc > 1 ? argv[1] : argv[0];

askDir:
    //Ask path in directory selection dialog
    path = BrowseFolder(path);
    if(path.size()==0)
    {
        MessageBox(
	    NULL,
	    std::string(std::string("You was canceled a configuring of the\n'SMBX Intergation configuration package'!\n"
	    "To take able use it, you should run the configure untility:\n")+directory+"\\configure.exe\nand choice the path to your installed SMBX.\n\n"
	    "SMBX Integration config pack was not configured!").c_str(),
	    "Configuring has been canceled",
	    MB_ICONWARNING | MB_OK
	    );
        return 0;
    }

    if(!is_dir_exists(std::string(path+"\\graphics").c_str()))
        goto noSMBX;
	if(!is_dir_exists(std::string(path+"\\graphics\\npc").c_str()))
        goto noSMBX;
	/*
    if(!is_dir_exists(std::string(path+"\\music").c_str()) && !is_dir_exists(std::string(path+"\\music_ogg").c_str()))
        goto noSMBX;
    if(!is_dir_exists(std::string(path+"\\sound").c_str()))
        goto noSMBX;
	*/
	
    goto setThisDir;
noSMBX:
     MessageBox(
	        NULL,
	        "This is a not SMBX directory!\nPlease try again!",
	        "SMBX Integration configuration error",
	        MB_ICONWARNING | MB_OK
	    );
     goto askDir;





setThisDir:

	std::string SmbxExeName = "smbx.exe";
	
	if(is_file_exists(path+"\\smbx.legacy"))
		SmbxExeName = "smbx.legacy";
	
	else if(is_file_exists(path+"\\smbx.exe.legacy"))
		SmbxExeName = "smbx.exe.legacy";
	
	else if(is_file_exists(path+"\\smbx.exe"))
		SmbxExeName = "smbx.exe";

	else if(is_file_exists(path+"\\smbx1301.exe"))
		SmbxExeName = "smbx1301.exe";
	
	else if(is_file_exists(path+"\\smbx13.exe"))
		SmbxExeName = "smbx13.exe";
	
	else if(is_file_exists(path+"\\asmbxt.exe"))
		SmbxExeName = "asmbxt.exe";
	
	else if(is_file_exists(path+"\\a2mbxt.exe"))
		SmbxExeName = "a2mbxt.exe";
	
	else if(is_file_exists(path+"\\a2xt.exe"))
		SmbxExeName = "a2xt.exe";

	SmbxExeName = "\""+SmbxExeName+"\"";
	
    replaceAll(path, "\\", "/");//Replace splashes to UNIX style
   
    rc = ini.SetValue("main", "application-path", path.c_str());
    if (rc < 0) { 
	MessageBox(
	        NULL,
	        "ERROR OF WRITING INTO INI FILE!",
	        "SMBX Integration configuration error",
	        MB_ICONERROR | MB_OK
	    );
	return 1;
	}
	
	ini.SetValue("main", "smbx-exe-name", SmbxExeName.c_str());
	ini.SetValue("main", "application-dir", "1");
	
	ini.SetValue("main", "graphics-level", "\"graphics\"");
	ini.SetValue("main", "graphics-worldmap", "\"graphics\"");
	ini.SetValue("main", "graphics-characters", "\"graphics\"");
    
    //Mark configuration package is configured
    ini.SetValue("main", "application-path-configured", "true");
	
	//Automatically apply right musics foldernames
	if(is_dir_exists(std::string(path+"\\music").c_str()))
		ini.SetValue("main", "music", "\"music\"");
	else
	if(is_dir_exists(std::string(path+"\\music_ogg").c_str()))
		ini.SetValue("main", "music", "\"music_ogg\"");
	
	//Automatically apply right sounds foldernames
	if(is_dir_exists(std::string(path+"\\sound").c_str()))
		ini.SetValue("main", "sound", "\"sound\"");
	else
	if(is_dir_exists(std::string(path+"\\sound_ogg").c_str()))
		ini.SetValue("main", "sound", "\"sound_ogg\"");
    
    // save the data to a string
    std::string strData;
    rc = ini.Save(strData);
    if (rc < 0) { 
	MessageBox(
	        NULL,
	        "ERROR OF GENERATING DATA!",
	        "SMBX Integration configuration error",
	        MB_ICONERROR | MB_OK
	    );
	return 1;
	}
    
    rc = ini.SaveFile(std::string(directory+"\\main.ini").c_str(), false);
    if (rc < 0) { 
	MessageBox(
	        NULL,
	        "ERROR WRITING FILE!",
	        "SMBX Integration configuration error",
	        MB_ICONERROR | MB_OK
	    );
	return 1;
	}
    
    std::cout << path << std::endl;
    std::cout << directory+"\\main.ini" << std::endl;
	
	//generate dummy elements gifs needed for PGE
	std::string inputfile;
	std::string outputfile;
    /*
    Total worldmap tiles usable: "tile-1" to "tile-400" (tile 401 is not usable anymore). There are 72 new tiles.
    Total paths usable: "path-1" to "path-100" (path 101 is not usable anymore). There are 68 new paths, all using a mask/transparency.
    Total levels usable: "level-1" to "level-100" (level 101 is not usable anymore). There are 68 new levels, all using a mask/transparency.
    Total sceneries usable: "scene-1" to "scene-100" (scene 101 is not usable anymore). There are 35 new sceneries, all using a mask/transparency.
    Total blocks usable: "block-1" to "block-700" (block 701 is not usable anymore). There are 62 new blocks which are all using a mask/transparency.
    Total BGOs usable: "background-1" to "background-200" (background 201 is not usable anymore). There are 10 new BGOs which are all using a mask/transparency.
    There are no additional level-backgrounds ("background2-XX") usable, though.
    */
	for(int i=292; i<=300; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy-npc.gif";
		outputfile=path+"\\graphics\\npc\\npc-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);
		
		inputfile=directory+"\\commonGFX\\dummy-npcm.gif";
		outputfile=path+"\\graphics\\npc\\npc-"+num2str(i)+"m.gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);	
	}
	for(int i=639; i<=700; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy-block.gif";
		outputfile=path+"\\graphics\\block\\block-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);
	}
    for(int i=191; i<=200; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy_bgo.gif";
		outputfile=path+"\\graphics\\background\\background-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);	
	}

    for(int i=329; i<=400; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy_tile.gif";
		outputfile=path+"\\graphics\\tile\\tile-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);	
	}
    for(int i=66; i<=100; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy_scene.gif";
		outputfile=path+"\\graphics\\scene\\scene-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);	
	}
    for(int i=33; i<=100; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy_path.gif";
		outputfile=path+"\\graphics\\path\\path-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);	
	}
    for(int i=33; i<=100; i++)
	{
		inputfile=directory+"\\commonGFX\\dummy_wlvl.gif";
		outputfile=path+"\\graphics\\level\\level-"+num2str(i)+".gif";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), true);	
	}
	
	//Updated musics and soundsINI if there are exists (take actual sound.ini and musics.ini from LunaLUA build)
	if(is_file_exists(path+"\\music.ini"))
	{
		//Use templated music.ini file
		inputfile=directory+"\\util\\music-vanilla.ini";
		outputfile=directory+"\\music.ini";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), false);		
		
		//Import music.ini from LunaLUA
		CSimpleIniA vMusics;
		CSimpleIniA llMusics;
		vMusics.SetUnicode();
		llMusics.SetUnicode();
		SI_Error rc1 = llMusics.LoadFile(std::string(path+"\\music.ini").c_str());
		SI_Error rc2 = vMusics.LoadFile(std::string(directory+"\\music.ini").c_str());
		if ((rc1 >= 0) && (rc2 >= 0))
		{
			for(int i=1; i<=16; i++)
			{
				std::string section="world-music-"+num2str(i);
				std::string sndname = llMusics.GetValue(section.c_str(), "file", "");
				if(sndname.size()>0)
				{
					const size_t last_slash_idx = sndname.find_last_of("/");
					if (std::string::npos != last_slash_idx)
					{
						sndname.erase(0, last_slash_idx + 1);
					}
					vMusics.SetValue(section.c_str(), "file", std::string("\""+sndname).c_str());
				}
			}
			
			for(int i=1; i<=3; i++)
			{
				std::string section="special-music-"+num2str(i);
				std::string sndname = llMusics.GetValue(section.c_str(), "file", "");
				if(sndname.size()>0)
				{
					const size_t last_slash_idx = sndname.find_last_of("/");
					if (std::string::npos != last_slash_idx)
					{
						sndname.erase(0, last_slash_idx + 1);
					}
					vMusics.SetValue(section.c_str(), "file", std::string("\""+sndname).c_str());
				}
			}
			
			for(int i=1; i<=56; i++)
			{
				if(i==24) continue;
				std::string section="level-music-"+num2str(i);
				std::string sndname = llMusics.GetValue(section.c_str(), "file", "");
				if(sndname.size()>0)
				{
					const size_t last_slash_idx = sndname.find_last_of("/");
					if (std::string::npos != last_slash_idx)
					{
						sndname.erase(0, last_slash_idx + 1);
					}
					vMusics.SetValue(section.c_str(), "file", std::string("\""+sndname).c_str());
				}
			}
			
			rc = vMusics.SaveFile(std::string(directory+"\\music.ini").c_str(), false);
		}
	} else {
                inputfile=directory+"\\util\\music-vanilla.ini";
		outputfile=directory+"\\music.ini";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), false);		
	}

	if(is_file_exists(path+"\\sounds.ini"))
	{
		//Use templated sounds.ini file
                inputfile=directory+"\\util\\sounds-vanilla.ini";
		outputfile=directory+"\\sounds.ini";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), false);
		
		//Import sounds.ini from LunaLUA
		CSimpleIniA vSounds;
		CSimpleIniA llSounds;
		vSounds.SetUnicode();
		llSounds.SetUnicode();
		SI_Error rc1 = llSounds.LoadFile(std::string(path+"\\sounds.ini").c_str());
		SI_Error rc2 = vSounds.LoadFile(std::string(directory+"\\sounds.ini").c_str());
		if ((rc1 >= 0) && (rc2 >= 0))
		{
			for(int i=1; i<=91; i++)
			{
				std::string section="sound-"+num2str(i);
				std::string sndname = llSounds.GetValue(section.c_str(), "file", "");
				if(sndname.size()>0)
				{
					const size_t last_slash_idx = sndname.find_last_of("/");
					if (std::string::npos != last_slash_idx)
					{
						sndname.erase(0, last_slash_idx + 1);
					}
					vSounds.SetValue(section.c_str(), "file", std::string("\""+sndname).c_str());
				}
			}
			rc = vSounds.SaveFile(std::string(directory+"\\sounds.ini").c_str(), false);
		}
		
	} else {
        inputfile=directory+"\\util\\sounds-vanilla.ini";
		outputfile=directory+"\\sounds.ini";
		CopyFileA(inputfile.c_str(), outputfile.c_str(), false);
		/*
		appPath=directory;
		
		if(is_dir_exists(std::string(path+"\\sound").c_str()))
			ConvertAllMP3sToOgg(path+"\\sound", NULL);
		
		CSimpleIniA vSounds;
		vSounds.SetUnicode();
		SI_Error rc = vSounds.LoadFile(std::string(directory+"\\sounds.ini").c_str());
		if (rc >= 0) 
		{
			for(int i=1; i<=91; i++)
			{
				std::string section="sound-"+num2str(i);
				std::string sndname = vSounds.GetValue(section.c_str(), "file", "");
				if(sndname.size()>4)
				{
					if(sndname.substr(sndname.size()-5, 4)==".mp3")
					{
						sndname.replace(sndname.size()-5, 4, ".ogg");
						vSounds.SetValue(section.c_str(), "file", sndname.c_str());
					}
				}
			}
			rc = vSounds.SaveFile(std::string(directory+"\\sounds.ini").c_str(), false);
		}
		*/
	}

    MessageBox(
        NULL,
        std::string("Integration configuration pack successfully configured!\nSMBX path is: "+path).c_str(),
        "SMBX Integration configured",
        MB_ICONASTERISK | MB_OK
    );

    return 0;
}
