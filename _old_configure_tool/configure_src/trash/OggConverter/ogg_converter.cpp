#include "ogg_converter.h"
#include "resource.h"
#include "progressbox.h"

#include <windows.h>
#include <shlobj.h>
#include <sstream>
#include <vector>

static bool wait=false;

std::string appPath;

//! Checks an existing of a bit in the degit
#define IS_BIT_SET(v, m) (((v) & (m)) == (m))

std::vector<std::string > getFileList(std::string folder)
{
    std::vector<std::string > list;

    WIN32_FIND_DATA ffd;
    HANDLE hFind = FindFirstFileA(std::string(folder+"\\*").c_str(), &ffd);
    if (INVALID_HANDLE_VALUE != hFind)
    {
        do
        {
            //Skip "current" and "parent" directory signs
            if(std::string(ffd.cFileName)==".") continue;
            if(std::string(ffd.cFileName)=="..") continue;
            //Skip directories, look for files only
            if(IS_BIT_SET(ffd.dwFileAttributes, FILE_ATTRIBUTE_DIRECTORY)) continue;
            list.push_back(ffd.cFileName);
        } while(FindNextFile(hFind, &ffd) != 0);
        FindClose(hFind);
    }

    return list;
}

static bool is_file_exists(const std::string& name)
{
	if (FILE *file = fopen(name.c_str(), "r")) {
        fclose(file);
        return true;
    } else {
        return false;
    }  
}

DWORD WINAPI processFTPUploading (LPVOID msgsptr)
{
	FTPUploaderWorker &msgs = *(FTPUploaderWorker*)msgsptr;
    msgs.state = 0;

    std::vector<std::string > fileList = getFileList(msgs.targetFolder);
    msgs.range = fileList.size();
    msgs.progress = 0;
    msgs.upd=true;

	std::string soxExe = appPath+"\\util\\sox.exe";
	
    for(int i=0; i<(signed)fileList.size(); i++)
    {
        std::ostringstream label;
        label << "Converting sound files... " << i+1 << " from " << fileList.size();
        label.flush();
        while(wait);
        wait=true;
        msgs.textLabel= label.str();
        wait=false;
        msgs.upd=true;

		std::string newfile = fileList[i];
		if(newfile.size()>4)
		{
			if(newfile.substr(newfile.size()-4, 4)==".mp3")
			{
				newfile.replace(newfile.size()-4, 4, ".ogg");
				
				if(!is_file_exists(msgs.targetFolder+"\\"+newfile))
				{
					std::string args="\""+msgs.targetFolder+"\\"+fileList[i]+"\" -r 44100 \""+msgs.targetFolder+"\\"+newfile+"\"";
					
					SHELLEXECUTEINFO lpExecInfo;
					  lpExecInfo.cbSize  = sizeof(SHELLEXECUTEINFO);
					  lpExecInfo.lpFile = soxExe.c_str(); // name of file that you want to execute/ print/ or open/ in your case Adobe Acrobat.
					lpExecInfo.fMask=SEE_MASK_DOENVSUBST|SEE_MASK_NOCLOSEPROCESS ;     
					  lpExecInfo.hwnd = NULL;
					  lpExecInfo.lpVerb = "open"; // to open  program
					  lpExecInfo.lpParameters = args.c_str(); //  file name as an argument
					  lpExecInfo.lpDirectory = NULL;   
					  lpExecInfo.nShow = SW_HIDE ;  // show command prompt with normal window size 
					  lpExecInfo.hInstApp = (HINSTANCE) SE_ERR_DDEFAIL ;   //WINSHELLAPI BOOL WINAPI result;
					  ShellExecuteEx(&lpExecInfo);
					
					if(lpExecInfo.hProcess !=NULL)
					{
						WaitForSingleObject(lpExecInfo.hProcess, INFINITE);
						CloseHandle(lpExecInfo.hProcess);
					} else {
						msgs.askQuestion = std::string("Failed to launching of the conversion \""+fileList[i]+"\" via "+soxExe+
													   ". Are you want to continue progress?");
						while(!msgs.askQuestion.empty())
						{
							Sleep(100);
						}
						if(msgs.askQuestion_reply==IDNO)
						{
							msgs.state = -1;
							return -1;
						}
					}
				}
			}
		}		
        msgs.progress=i;
        msgs.upd=true;
    }
    msgs.textLabel="Completed!";
    msgs.progress=msgs.range;
    msgs.upd=true;

    msgs.state = 1;
    return 0;
}


bool ConvertAllMP3sToOgg(std::string folder, HINSTANCE hInstance)
{
    INITCOMMONCONTROLSEX icc;
    icc.dwSize = sizeof(icc);
    icc.dwICC = ICC_WIN95_CLASSES;
    InitCommonControlsEx(&icc);
    HWND progressBox=CreateDialog(hInstance, MAKEINTRESOURCE(IDD_DIALOG1), NULL, &ProgressBoxProc);

    SetWindowTextA(progressBox, "Converting of the sounds...");
    SetDlgItemTextA(progressBox, IDC_XLABEL, "Preparing...");
    ShowWindow(progressBox, SW_SHOW);
    g_doPaint=1;
    UpdateWindow(progressBox);

    MSG msg;

    FTPUploaderWorker msgs;
    msgs.state = 0;
    msgs.askQuestion = "";
    msgs.askQuestion_reply = 0;
    msgs.range = 0;
    msgs.progress = 0;
    msgs.spawnMsg = "";
    msgs.textLabel = "Preparing...";
    msgs.upd=true;
    msgs.targetFolder=folder;

    DWORD dwThreadId;
    HANDLE hThread = CreateThread(NULL, //Choose default security
            0, //Default stack size
            /*(LPTHREAD_START_ROUTINE)*/
            &processFTPUploading,
            //Routine to execute
            (LPVOID)&msgs, //Thread parameter
            0, //Immediately run the thread
            &dwThreadId //Thread Id
            );
    if(!hThread)
    {
        MessageBoxA(progressBox, "Error CreateThread", "Error!", MB_ICONERROR|MB_OK);
        return false;
    }

    while(msgs.state==0)
    {
        if(msgs.upd)
        {
            while(wait);
            wait=true;
            SetDlgItemTextA(progressBox,IDC_XLABEL, msgs.textLabel.c_str());
            wait=false;
            SendDlgItemMessage(progressBox, IDC_PROGRESS1, PBM_SETRANGE, 0, MAKELONG(0, msgs.range));
            SendDlgItemMessage(progressBox, IDC_PROGRESS1, PBM_SETPOS, msgs.progress, 0);
            InvalidateRect(progressBox, NULL, false);
            UpdateWindow(progressBox);
            if(msgs.progress>0) g_doPaint=0;
            msgs.upd=false;
        }

        if(!msgs.spawnMsg.empty())
        {
            g_doPaint=0;
            MessageBoxA(progressBox, msgs.spawnMsg.c_str(), "Warning!", MB_ICONWARNING|MB_OK);
            msgs.spawnMsg.clear();
        }

        if(!msgs.askQuestion.empty())
        {
            g_doPaint=0;
            msgs.askQuestion_reply=MessageBoxA(progressBox,
                                            msgs.askQuestion.c_str(),
                                            "Question!",
                                            MB_ICONWARNING|MB_YESNO);
            msgs.askQuestion.clear();
        }

        if(GetMessage(&msg, NULL, 0, 0) > 0)
        {
            if (! TranslateAccelerator(msg.hwnd, NULL, &msg))
            {
                TranslateMessage(&msg);
                DispatchMessage(&msg);
            }
        }
    }
    UpdateWindow(progressBox);
    DestroyWindow(progressBox);

    return (msgs.state>0);
}

